import { AppDataSource } from '../src/data-source'
import Todo from '../src/entities/Todo'
import { faker } from '@faker-js/faker'
import { User } from '../src/entities/User'
import { hash } from 'bcrypt'

import request from 'supertest'
import app from '../src/routes/base.route'
import { createAuthRoutes } from '../src/routes/auth.route'
import { createTodoRoutes } from '../src/routes/todo.route'

createAuthRoutes(app)
createTodoRoutes(app)

describe('CRUD', () => {
    beforeAll(async () => {
        await AppDataSource.initialize()
    })

    afterEach(async () => {
        // Fetch all the entities
        const entities = AppDataSource.entityMetadatas
        for (const entity of entities) {
            // Get repository
            const repository = AppDataSource.getRepository(entity.name)
            // Clear each entity table's content
            // 外部キー制約付きのテーブルはtruncate不可のため、一時的に設定を外す
            await AppDataSource.query('set foreign_key_checks = 0')
            await repository.clear()
            await AppDataSource.query('set foreign_key_checks = 1')
        }
    })

    afterAll(async () => {
        await AppDataSource.destroy()
    })

    const userRepository = AppDataSource.getRepository(User)
    const todoRepository = AppDataSource.getRepository(Todo)

    beforeEach(async () => {
        const hashedPassword = await hash('password', 10)
        await userRepository.save([
            { email: 'test@example.com', password: hashedPassword },
            { email: 'test2@example.com', password: hashedPassword },
        ])
    })

    let authUser: User
    let otherUser: User
    let cookie: string[]

    describe('/todos', () => {
        describe('get', () => {
            describe('未ログインの時', () => {
                test('ログイン画面にリダイレクトされること', async () => {
                    const response = await request(app).get('/todos')

                    expect(response.status).toEqual(302)
                    expect(response.headers.location).toEqual('/login')
                })
            })

            describe('ログイン中の時', () => {
                beforeEach(async () => {
                    authUser = (await userRepository.findOneBy({
                        email: 'test@example.com',
                    })) as User
                    otherUser = (await userRepository.findOneBy({
                        email: 'test2@example.com',
                    })) as User
                    await todoRepository.save([
                        {
                            title: 'authUser title 1',
                            content: 'authUser content 1',
                            user: authUser,
                        },
                        {
                            title: 'authUser title 2',
                            content: 'authUser content 2',
                            user: authUser,
                        },
                        {
                            title: 'authUser title 3',
                            content: 'authUser content 3',
                            user: authUser,
                        },
                        { title: 'otherUser title', content: 'otherUser content', user: otherUser },
                    ])

                    const loginResponse = await request(app).post('/login').send({
                        email: authUser.email,
                        password: 'password',
                    })
                    cookie = loginResponse.get('Set-Cookie')
                })

                test('ログインユーザのTODO一覧が取得できること', async () => {
                    const response = await request(app).get('/todos').set('Cookie', cookie)

                    // NOTE: レスポンスが返ってくることの確認
                    expect(response.body.result).toEqual('SUCCESS')

                    expect(
                        response.body.data.every((todo: Todo) =>
                            todo.title.match(/authUser title/),
                        ),
                    ).toEqual(true)
                })
            })
        })

        describe('post', () => {
            describe('未ログインの時', () => {
                test('ログイン画面にリダイレクトされること', async () => {
                    const response = await request(app).post('/todos').send({
                        title: 'title',
                        content: 'content',
                    })

                    expect(response.status).toEqual(302)
                    expect(response.headers.location).toEqual('/login')
                })
            })

            describe('ログイン中の時', () => {
                beforeEach(async () => {
                    authUser = (await userRepository.findOneBy({
                        email: 'test@example.com',
                    })) as User

                    const loginResponse = await request(app).post('/login').send({
                        email: authUser.email,
                        password: 'password',
                    })
                    cookie = loginResponse.get('Set-Cookie')
                })

                test('TODOが作成できること', async () => {
                    // NOTE: タイトルの最大文字数 ※ 最小文字数は必須入力のバリデーションのテスト(titleが空の時)で行う
                    const title = faker.string.alpha({ length: 255 })
                    const response = await request(app).post('/todos').set('Cookie', cookie).send({
                        title: title,
                        content: 'created content',
                    })

                    // NOTE: レスポンスが返ってくることの確認
                    expect(response.body.result).toEqual('SUCCESS')
                    expect(response.body.data.title).toEqual(title)
                    expect(response.body.data.content).toEqual('created content')

                    const createdTodo = await todoRepository.findOne({
                        where: {},
                        order: { id: 'DESC' },
                    })
                    expect(createdTodo?.title).toEqual(title)
                    expect(createdTodo?.content).toEqual('created content')
                })

                describe('titleのバリデーションエラーがある時', () => {
                    describe('titleが空の時', () => {
                        test('TODOの作成に失敗すること', async () => {
                            const response = await request(app)
                                .post('/todos')
                                .set('Cookie', cookie)
                                .send({
                                    title: '',
                                    content: 'created content',
                                })

                            // NOTE: レスポンスが返ってくることの確認
                            expect(response.body.result).toEqual('FAILED TO CREATE TODO')
                            expect(response.body.errors).toMatch('タイトルは必須です。')

                            const createdTodo = await todoRepository.findOne({
                                where: {},
                                order: { id: 'DESC' },
                            })
                            expect(createdTodo).toEqual(null)
                        })
                    })

                    describe('titleが文字数オーバーの時', () => {
                        test('TODOの作成に失敗すること', async () => {
                            const response = await request(app)
                                .post('/todos')
                                .set('Cookie', cookie)
                                .send({
                                    title: faker.string.alpha({ length: 256 }),
                                    content: 'created content',
                                })

                            // NOTE: レスポンスが返ってくることの確認
                            expect(response.body.result).toEqual('FAILED TO CREATE TODO')
                            expect(response.body.errors).toMatch(
                                '1文字以上255文字以下での入力をお願いします。',
                            )

                            const createdTodo = await todoRepository.findOne({
                                where: {},
                                order: { id: 'DESC' },
                            })
                            expect(createdTodo).toEqual(null)
                        })
                    })
                })
            })
        })
    })

    describe('/todos/:id', () => {
        let targetTodo: Todo | null
        let latestTodo: Todo | null

        beforeEach(async () => {
            authUser = (await userRepository.findOneBy({ email: 'test@example.com' })) as User
            otherUser = (await userRepository.findOneBy({ email: 'test2@example.com' })) as User
            await todoRepository.save([
                { title: 'authUser title 1', content: 'authUser content 1', user: authUser },
                { title: 'authUser title 2', content: 'authUser content 2', user: authUser },
                { title: 'authUser title 3', content: 'authUser content 3', user: authUser },
                { title: 'otherUser title', content: 'otherUser content', user: otherUser },
            ])
        })

        describe('get', () => {
            describe('未ログインの時', () => {
                test('ログイン画面にリダイレクトされること', async () => {
                    const response = await request(app).get(`/todos/${targetTodo?.id}`)

                    expect(response.status).toEqual(302)
                    expect(response.headers.location).toEqual('/login')
                })
            })

            describe('ログイン中の時', () => {
                beforeEach(async () => {
                    const loginResponse = await request(app).post('/login').send({
                        email: authUser.email,
                        password: 'password',
                    })
                    cookie = loginResponse.get('Set-Cookie')
                })

                test('ログインユーザの指定したTODOが取得できること', async () => {
                    targetTodo = await todoRepository.findOneBy({ title: 'authUser title 1' })

                    const response = await request(app)
                        .get(`/todos/${targetTodo?.id}`)
                        .set('Cookie', cookie)

                    // NOTE: レスポンスが返ってくることの確認
                    expect(response.body.result).toEqual('SUCCESS')
                    expect(response.body.data.title).toEqual(targetTodo?.title)
                    expect(response.body.data.content).toEqual(targetTodo?.content)
                })

                describe('ログインユーザの指定したTODOが存在しない場合', () => {
                    test('404エラーとなること', async () => {
                        latestTodo = await todoRepository.findOneBy({ title: 'authUser title 3' })

                        const response = await request(app)
                            .get(`/todos/${Number(latestTodo?.id) + 1}`)
                            .set('Cookie', cookie)

                        expect(response.status).toEqual(404)
                    })
                })

                test('ログインユーザ以外のTODOが取得不可であること', async () => {
                    targetTodo = await todoRepository.findOneBy({ user: otherUser })

                    const response = await request(app)
                        .get(`/todos/${targetTodo?.id}`)
                        .set('Cookie', cookie)

                    expect(response.statusCode).toEqual(404)
                })
            })
        })

        describe('put', () => {
            describe('未ログインの時', () => {
                test('ログイン画面にリダイレクトされること', async () => {
                    targetTodo = await todoRepository.findOneBy({ title: 'authUser title 1' })
                    const response = await request(app).put(`/todos/${targetTodo?.id}`).send({
                        title: 'title',
                        content: 'content',
                    })

                    expect(response.status).toEqual(302)
                    expect(response.headers.location).toEqual('/login')
                })
            })

            describe('ログイン中の時', () => {
                beforeEach(async () => {
                    const loginResponse = await request(app).post('/login').send({
                        email: authUser.email,
                        password: 'password',
                    })
                    cookie = loginResponse.get('Set-Cookie')
                })

                test('ログインユーザの指定したTODOを更新できること', async () => {
                    targetTodo = await todoRepository.findOneBy({ title: 'authUser title 1' })

                    const response = await request(app)
                        .put(`/todos/${targetTodo?.id}`)
                        .set('Cookie', cookie)
                        .send({
                            title: 'updated title',
                            content: 'updated content',
                        })

                    // NOTE: レスポンスが返ってくることの確認
                    expect(response.body.result).toEqual('SUCCESS')
                    expect(response.body.data.title).toEqual('updated title')
                    expect(response.body.data.content).toEqual('updated content')

                    // NOTE: 更新されていることの確認
                    const updatedTodo = await todoRepository.findOneBy({ id: targetTodo?.id })
                    expect(updatedTodo?.title).toEqual('updated title')
                    expect(updatedTodo?.content).toEqual('updated content')
                })

                describe('ログインユーザの指定したTODOが存在しない場合', () => {
                    test('404エラーとなること', async () => {
                        latestTodo = await todoRepository.findOneBy({ title: 'authUser title 3' })

                        const response = await request(app)
                            .put(`/todos/${Number(latestTodo?.id) + 1}`)
                            .set('Cookie', cookie)
                            .send({
                                title: 'updated title',
                                content: 'updated content',
                            })

                        expect(response.status).toEqual(404)
                    })
                })

                test('ログインユーザ以外のTODOが更新不可であること', async () => {
                    targetTodo = await todoRepository.findOneBy({ user: otherUser })

                    const response = await request(app)
                        .put(`/todos/${targetTodo?.id}`)
                        .set('Cookie', cookie)
                        .send({
                            title: 'updated title',
                            content: 'updated content',
                        })

                    expect(response.statusCode).toEqual(404)
                })

                describe('titleのバリデーションエラーがある時', () => {
                    describe('titleが空の時', () => {
                        test('TODOの作成に失敗すること', async () => {
                            targetTodo = await todoRepository.findOneBy({
                                title: 'authUser title 1',
                            })

                            const response = await request(app)
                                .put(`/todos/${targetTodo?.id}`)
                                .set('Cookie', cookie)
                                .send({
                                    title: '',
                                    content: 'updated content',
                                })

                            // NOTE: レスポンスが返ってくることの確認
                            expect(response.body.result).toEqual('FAILED TO UPDATE TODO')
                            expect(response.body.errors).toMatch('タイトルは必須です。')

                            // NOTE: 更新されていないことの確認
                            const updatedTodo = await todoRepository.findOneBy({
                                id: targetTodo?.id,
                            })
                            expect(updatedTodo?.title).toEqual('authUser title 1')
                            expect(updatedTodo?.content).toEqual('authUser content 1')
                        })
                    })

                    describe('titleが文字数オーバーの時', () => {
                        test('TODOの作成に失敗すること', async () => {
                            targetTodo = await todoRepository.findOneBy({
                                title: 'authUser title 1',
                            })

                            const response = await request(app)
                                .put(`/todos/${targetTodo?.id}`)
                                .set('Cookie', cookie)
                                .send({
                                    title: faker.string.alpha({ length: 256 }),
                                    content: 'updated content',
                                })

                            // NOTE: レスポンスが返ってくることの確認
                            expect(response.body.result).toEqual('FAILED TO UPDATE TODO')
                            expect(response.body.errors).toMatch(
                                '1文字以上255文字以下での入力をお願いします。',
                            )

                            // NOTE: 更新されていないことの確認
                            const updatedTodo = await todoRepository.findOneBy({
                                id: targetTodo?.id,
                            })
                            expect(updatedTodo?.title).toEqual('authUser title 1')
                            expect(updatedTodo?.content).toEqual('authUser content 1')
                        })
                    })
                })
            })
        })

        describe('delete', () => {
            describe('未ログインの時', () => {
                test('ログイン画面にリダイレクトされること', async () => {
                    targetTodo = await todoRepository.findOneBy({ title: 'authUser title 1' })
                    const response = await request(app).delete(`/todos/${targetTodo?.id}`)

                    expect(response.status).toEqual(302)
                    expect(response.headers.location).toEqual('/login')
                })
            })

            describe('ログイン中の時', () => {
                beforeEach(async () => {
                    const loginResponse = await request(app).post('/login').send({
                        email: authUser.email,
                        password: 'password',
                    })
                    cookie = loginResponse.get('Set-Cookie')
                })

                test('ログインユーザの指定したTODOを削除できること', async () => {
                    targetTodo = await todoRepository.findOneBy({ title: 'authUser title 1' })

                    const response = await request(app)
                        .delete(`/todos/${targetTodo?.id}`)
                        .set('Cookie', cookie)

                    // NOTE: レスポンスが返ってくることの確認
                    expect(response.body.result).toEqual('SUCCESS')

                    // NOTE: 削除できることの確認
                    const deletedTodo = await todoRepository.findOneBy({ id: targetTodo?.id })
                    expect(deletedTodo).toEqual(null)
                })

                describe('ログインユーザの指定したTODOが存在しない場合', () => {
                    test('404エラーとなること', async () => {
                        latestTodo = await todoRepository.findOneBy({ title: 'authUser title 3' })

                        const response = await request(app)
                            .delete(`/todos/${Number(latestTodo?.id) + 1}`)
                            .set('Cookie', cookie)

                        expect(response.status).toEqual(404)
                    })
                })

                test('ログインユーザ以外のTODOが削除不可であること', async () => {
                    targetTodo = await todoRepository.findOneBy({ user: otherUser })

                    const response = await request(app)
                        .delete(`/todos/${targetTodo?.id}`)
                        .set('Cookie', cookie)

                    expect(response.statusCode).toEqual(404)
                })
            })
        })
    })
})
