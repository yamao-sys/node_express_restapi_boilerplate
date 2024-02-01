import { AppDataSource } from "../src/data-source";
import Todo from "../src/entities/Todo";
import { faker } from "@faker-js/faker";

const request = require('supertest');
const app = require('../src/index');

describe('CRUD', () => {
	beforeAll(async () => {
		await AppDataSource.initialize();
	})

	afterEach(async () => {
		// Fetch all the entities
		const entities = AppDataSource.entityMetadatas;
		for (const entity of entities) {
			// Get repository
			const repository = AppDataSource.getRepository(entity.name);
			// Clear each entity table's content
			await repository.clear();
		}
	});

	afterAll(async () => {
		await AppDataSource.destroy(); 
	});

	const todoRepository = AppDataSource.getRepository(Todo);

	describe('/todos', () => {
		describe('get', () => {
			beforeEach(async () => {
				await todoRepository.save([
					{ title: faker.string.alpha(), content: faker.string.alpha() },
					{ title: faker.string.alpha(), content: faker.string.alpha() },
					{ title: faker.string.alpha(), content: faker.string.alpha() },
				]);
			});
	
			test('TODO一覧が取得できること', async ()=> {
				const response = await request(app).get('/todos');
	
				// NOTE: レスポンスが返ってくることの確認
				expect(response.body.result).toEqual('SUCCESS');
				expect(response.body.data.length).toEqual(3);
			});
		})

		describe('post', () => {
			test('TODOが作成できること', async () => {
				// NOTE: タイトルの最大文字数 ※ 最小文字数は必須入力のバリデーションのテスト(titleが空の時)で行う
				const title = faker.string.alpha({ length: 255 })
				const response = await request(app).post('/todos').send({
					title: title,
					content: 'created content',
				});

				// NOTE: レスポンスが返ってくることの確認
				expect(response.body.result).toEqual('SUCCESS');
				expect(response.body.data.title).toEqual(title);
				expect(response.body.data.content).toEqual('created content');

				let createdTodo = await todoRepository.findOne({
					where: {},
					order: { id: 'DESC' },
				});
				expect(createdTodo?.title).toEqual(title);
				expect(createdTodo?.content).toEqual('created content');
			})

			describe('titleのバリデーションエラーがある時', () => {
				describe('titleが空の時', () => {
					test('TODOの作成に失敗すること', async () => {
						const response = await request(app).post('/todos').send({
							title: '',
							content: 'created content',
						});
		
						// NOTE: レスポンスが返ってくることの確認
						expect(response.body.result).toEqual('FAILED TO CREATE TODO');
						expect(response.body.errors).toMatch('タイトルは必須です。');
		
						let createdTodo = await todoRepository.findOne({
							where: {},
							order: { id: 'DESC' },
						});
						expect(createdTodo).toEqual(null);
					})
				})

				describe('titleが文字数オーバーの時', () => {
					test('TODOの作成に失敗すること', async () => {
						const response = await request(app).post('/todos').send({
							title: faker.string.alpha({ length: 256 }),
							content: 'created content',
						});
		
						// NOTE: レスポンスが返ってくることの確認
						expect(response.body.result).toEqual('FAILED TO CREATE TODO');
						expect(response.body.errors).toMatch('1文字以上255文字以下での入力をお願いします。');
		
						let createdTodo = await todoRepository.findOne({
							where: {},
							order: { id: 'DESC' },
						});
						expect(createdTodo).toEqual(null);
					})
				})
			})
		})
	});

	describe('/todos/:id', () => {
		let targetTodo: Todo | null;
		let latestTodo: Todo | null;

		beforeEach(async () => {
			await todoRepository.save([
				{ title: '1 title', content: '1 content' },
				{ title: '2 title', content: '2 content' },
				{ title: '3 title', content: '3 content' },
			]);
		});

		describe('get', () => {
			test('指定したTODOが取得できること', async ()=> {
				targetTodo = await todoRepository.findOneBy({ title: '1 title' });

				const response = await request(app).get(`/todos/${targetTodo?.id}`);
	
				// NOTE: レスポンスが返ってくることの確認
				expect(response.body.result).toEqual('SUCCESS');
				expect(response.body.data.title).toEqual(targetTodo?.title);
				expect(response.body.data.content).toEqual(targetTodo?.content);
			});

			describe('指定したTODOが存在しない場合', () => {
				test('404エラーとなること', async ()=> {
					latestTodo = await todoRepository.findOneBy({ title: '3 title' });

					const response = await request(app).get(`/todos/${Number(latestTodo?.id) + 1}`);
		
					expect(response.status).toEqual(404);
				});
			});
		});

		describe('put', () => {
			test('指定したTODOを更新できること', async () => {
				targetTodo = await todoRepository.findOneBy({ title: '1 title' });

				const response = await request(app).put(`/todos/${targetTodo?.id}`).send({
					title: 'updated title',
					content: 'updated content',
				});

				// NOTE: レスポンスが返ってくることの確認
				expect(response.body.result).toEqual('SUCCESS');
				expect(response.body.data.title).toEqual('updated title');
				expect(response.body.data.content).toEqual('updated content');

				// NOTE: 更新されていることの確認
				let updatedTodo = await todoRepository.findOneBy({ id: targetTodo?.id });
				expect(updatedTodo?.title).toEqual('updated title');
				expect(updatedTodo?.content).toEqual('updated content');
			})

			describe('指定したTODOが存在しない場合', () => {
				test('404エラーとなること', async ()=> {
					latestTodo = await todoRepository.findOneBy({ title: '3 title' });

					const response = await request(app).put(`/todos/${Number(latestTodo?.id) + 1}`).send({
						title: 'updated title',
						content: 'updated content',
					});
		
					expect(response.status).toEqual(404);
				});
			});

			describe('titleのバリデーションエラーがある時', () => {
				describe('titleが空の時', () => {
					test('TODOの作成に失敗すること', async () => {
						targetTodo = await todoRepository.findOneBy({ title: '1 title' });

						const response = await request(app).put(`/todos/${targetTodo?.id}`).send({
							title: '',
							content: 'updated content',
						});
		
						// NOTE: レスポンスが返ってくることの確認
						expect(response.body.result).toEqual('FAILED TO UPDATE TODO');
						expect(response.body.errors).toMatch('タイトルは必須です。');
		
						// NOTE: 更新されていないことの確認
						let updatedTodo = await todoRepository.findOneBy({ id: targetTodo?.id });
						expect(updatedTodo?.title).toEqual('1 title');
						expect(updatedTodo?.content).toEqual('1 content');
					})
				})

				describe('titleが文字数オーバーの時', () => {
					test('TODOの作成に失敗すること', async () => {
						targetTodo = await todoRepository.findOneBy({ title: '1 title' });

						const response = await request(app).put(`/todos/${targetTodo?.id}`).send({
							title: faker.string.alpha({ length: 256 }),
							content: 'updated content',
						});
		
						// NOTE: レスポンスが返ってくることの確認
						expect(response.body.result).toEqual('FAILED TO UPDATE TODO');
						expect(response.body.errors).toMatch('1文字以上255文字以下での入力をお願いします。');
		
						// NOTE: 更新されていないことの確認
						let updatedTodo = await todoRepository.findOneBy({ id: targetTodo?.id });
						expect(updatedTodo?.title).toEqual('1 title');
						expect(updatedTodo?.content).toEqual('1 content');
					})
				})
			})
		});

		describe('delete', () => {
			test('指定したTODOを削除できること', async () => {
				targetTodo = await todoRepository.findOneBy({ title: '1 title' });

				const response = await request(app).delete(`/todos/${targetTodo?.id}`)

				// NOTE: レスポンスが返ってくることの確認
				expect(response.body.result).toEqual('SUCCESS');

				// NOTE: 削除できることの確認
				let deletedTodo = await todoRepository.findOneBy({ id: targetTodo?.id });
				expect(deletedTodo).toEqual(null);
			})

			describe('指定したTODOが存在しない場合', () => {
				test('404エラーとなること', async ()=> {
					latestTodo = await todoRepository.findOneBy({ title: '3 title' });

					const response = await request(app).delete(`/todos/${Number(latestTodo?.id) + 1}`);
		
					expect(response.status).toEqual(404);
				});
			});
		});
	});
})
