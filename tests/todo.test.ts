import { AppDataSource } from "../src/data-source";
import Todo from "../src/entities/Todo";
import { faker } from "@faker-js/faker";

const request = require('supertest');
const app = require('../src/index');

describe('CRUD', () => {
	describe('/todos', () => {
		beforeAll(async () => {
			await AppDataSource.initialize();
		})

		beforeEach(async () => {
			const todoRepository = await AppDataSource.getRepository(Todo);
			await todoRepository.save([
				{ title: faker.string.uuid(), content: faker.string.uuid() },
				{ title: faker.string.uuid(), content: faker.string.uuid() },
				{ title: faker.string.uuid(), content: faker.string.uuid() }
			]);
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

		test('ユーザ一覧が取得できること', async ()=> {
			const response = await request(app).get('/todos');

			expect(response.body.result).toEqual('SUCCESS');
			expect(response.body.data.length).toEqual(3);
		});
	})
})
