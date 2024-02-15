import express from 'express';
import { TodoModel } from "../models/Todo.model";
import { getAuthUser } from '../lib/auth';
import { format_validation_errors } from '../lib/format_validation_errors';

export class TodoController {
	public async index(req: express.Request, res: express.Response) {
		const model = new TodoModel();
		const todos = await model.findByUser(await getAuthUser(req.headers?.authorization ?? ''));
		res.json({
			result: "SUCCESS",
			data: todos
		});
	}

	public async show(req: express.Request, res: express.Response) {
		const model = new TodoModel();
		const todo = await model.findOne(Number(req.params.id), await getAuthUser(req.headers?.authorization ?? ''));

		if (!todo) {
			return res.status(404).send('このTODOは存在しません');
		}

		res.json({
			result: "SUCCESS",
			data: todo
		});
	}

	public async create(req: express.Request, res: express.Response) {
		const model = new TodoModel();
		const todo = await model.buildNewTodo(req.body, await getAuthUser(req.headers?.authorization ?? ''));
		const validation_errors = await model.validate(todo);
		if (validation_errors.length > 0) {
			return res.json({
				result: "FAILED TO CREATE TODO",
				errors: format_validation_errors(validation_errors)
			});
		}

		await model.save(todo);
		res.json({
			result: "SUCCESS",
			data: todo
		});
	}

	public async update(req: express.Request, res: express.Response) {
		const model = new TodoModel();

		let todo = await model.findOne(Number(req.params.id), await getAuthUser(req.headers?.authorization ?? ''));
		if (!todo) {
			return res.status(404).send("このTODOは存在しません");
		}

		todo = await model.assignParams(todo, req.body);

		const validation_errors = await model.validate(todo);
		if (validation_errors.length > 0) {
			return res.json({
				result: "FAILED TO UPDATE TODO",
				errors: format_validation_errors(validation_errors)
			});
		}

		await model.save(todo);
		res.json({
			result: "SUCCESS",
			data: todo
		});
	}

	public async delete(req: express.Request, res: express.Response) {
		const model = new TodoModel();

		let todo = await model.findOne(Number(req.params.id), await getAuthUser(req.headers?.authorization ?? ''));
		if (!todo) {
			return res.status(404).send("このTODOは存在しません");
		}

		await model.remove(todo);

		res.json({
			result: "SUCCESS"
		});
	}
}
