import { ValidationError } from "class-validator";
import Todo from "../entities/Todo";
import { User } from "../entities/User";

export default interface ITodoModel {
	findByUser(user: User): Promise<Todo[]>;
	findOne(id: number, user: User): Promise<Todo | null>;
	buildNewTodo(params: todoParams, user: User): Promise<Todo>;
	assignParams(todo: Todo, params: todoParams): Promise<Todo>;
	validate(todo: Todo): Promise<ValidationError[]>;
	save(todo: Todo): Promise<Todo>;
	remove(todo: Todo): Promise<Todo>;
}

export interface todoParams {
	title: string;
	content: string;
}
