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
		AppDataSource.destroy(); 
	});

	const todoRepository = AppDataSource.getRepository(Todo);

	describe('/todos', () => {
		describe('get', () => {
			beforeEach(async () => {
				await todoRepository.save([
					{ title: faker.string.uuid(), content: faker.string.uuid() },
					{ title: faker.string.uuid(), content: faker.string.uuid() },
					{ title: faker.string.uuid(), content: faker.string.uuid() },
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
				const response = await request(app).post('/todos').send({
					title: 'created title',
					content: 'created content',
				});

				// NOTE: レスポンスが返ってくることの確認
				expect(response.body.result).toEqual('SUCCESS');
				expect(response.body.data.title).toEqual('created title');
				expect(response.body.data.content).toEqual('created content');

				let createdTodo = await todoRepository.findOne({
					where: {},
					order: { id: 'DESC' },
				});
				expect(createdTodo?.title).toEqual('created title');
				expect(createdTodo?.content).toEqual('created content');
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
