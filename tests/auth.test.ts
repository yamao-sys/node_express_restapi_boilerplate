import { compare, hash } from "bcrypt";
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entities/User";

const request = require('supertest');
const app = require('../src/index');

describe('auth', () => {
	beforeAll(async () => {
		await AppDataSource.initialize();
	});

	afterEach(async () => {
		// Fetch all the entities
		const entities = AppDataSource.entityMetadatas;
		for (const entity of entities) {
			// Get repository
			const repository = AppDataSource.getRepository(entity.name);
			// Clear each entity table's content
			// 外部キー制約付きのテーブルはtruncate不可のため、一時的に設定を外す
			await AppDataSource.query('set foreign_key_checks = 0');
			await repository.clear();
			await AppDataSource.query('set foreign_key_checks = 1');
		}
	})

	afterAll(async () => {
		await AppDataSource.destroy(); 
	});

	const userRepository = AppDataSource.getRepository(User);

	describe('/signup', () => {
		describe('正常系', () => {
			test('会員登録ができること', async () => {
				const response = await request(app).post('/signup').send({
					email: 'test@example.com',
					password: 'password'
				});

				// レスポンスが返ってくること
				expect(response.body.result).toEqual('SUCCESS');

				let createdUser = await userRepository.findOne({
					where: {},
					order: { id: 'DESC' }
				});
				expect(createdUser?.email).toEqual('test@example.com');

				let compared = await compare('password', createdUser?.password ?? '');
				expect(compared).toEqual(true);
			});
		});

		describe('異常系', () => {
			describe('メールアドレスが空の時', () => {
				test('登録に失敗すること', async () => {
					const response = await request(app).post('/signup').send({
						email: '',
						password: 'password'
					});

					expect(response.body.result).toEqual('FAILED TO SIGNUP');
					expect(response.body.errors).toMatch('メールアドレスは必須入力です。');

					let createdUser = await userRepository.findOne({
						where: {},
						order: { id: 'DESC' }
					});
					expect(createdUser).toEqual(null);
				});
			});

			describe('パスワードが空の時', () => {
				test('登録に失敗すること', async () => {
					const response = await request(app).post('/signup').send({
						email: 'test@example.com',
						password: ''
					});

					expect(response.body.result).toEqual('FAILED TO SIGNUP');
					expect(response.body.errors).toMatch('パスワードは必須入力です。');

					let createdUser = await userRepository.findOne({
						where: {},
						order: { id: 'DESC' }
					});
					expect(createdUser).toEqual(null);
				});
			});
		});
	});

	describe('/login', () => {
		beforeEach(async () => {
			const hashedPassword = await hash('password', 10);
			await userRepository.save({ email: 'test@example.com', password: hashedPassword });
		});

		describe('正常系', () => {
			test('ログインできること', async () => {
				const response = await request(app).post('/login').send({
					email: 'test@example.com',
					password: 'password'
				});

				expect(response.status).toEqual(200);
				expect(response.body.result).toEqual('SUCCESS');
			});
		});

		describe('異常系', () => {
			describe('メールアドレスが異なる時', () => {
				test('ログインに失敗すること', async () => {
					const response = await request(app).post('/login').send({
						email: 'fail@example.com',
						password: 'password'
					});

					expect(response.status).toEqual(404);
				});
			});

			describe('パスワードが異なる時', () => {
				test('ログインに失敗すること', async () => {
					const response = await request(app).post('/login').send({
						email: 'test@example.com',
						password: 'fail'
					});

					expect(response.status).toEqual(404);
				});
			});
		});
	});
})
