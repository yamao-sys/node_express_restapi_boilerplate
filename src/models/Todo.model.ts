import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import Todo from "../entities/Todo";
import { User } from "../entities/User";
import { validate } from "class-validator";

interface todoParams {
	title: string;
	content: string;
}

export class TodoModel {
	private _todoRepository: Repository<Todo>;

	public constructor() {
		this._todoRepository = AppDataSource.getRepository(Todo);
	}

	public async findByUser(user: User) {
		return this._todoRepository.find({
			where: {
				user: user
			}
		});
	}

	public async findOne(id: number, user: User) {
		return this._todoRepository.findOne({
			where: {
				id: id,
				user: user
			}
		});
	}

	public async buildNewTodo(params: todoParams, user: User) {
		let todo = new Todo();

		todo = await this.assignParams(todo, params);
		todo.user = user;

		return todo;
	}

	public async assignParams(todo: Todo, params: todoParams) {
		todo.title = params.title;
		todo.content = params.content;
		return todo;
	}

	public async validate(todo: Todo) {
		return validate(todo);
	}

	public async save(todo: Todo) {
		return this._todoRepository.save(todo)
	}

	public async remove(todo: Todo) {
		return this._todoRepository.remove(todo);
	}
}
