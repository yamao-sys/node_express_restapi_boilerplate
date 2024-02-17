import express from 'express';
import { format_validation_errors } from '../lib/format_validation_errors';
import { inject, injectable } from 'inversify';
import { TYPES } from '../inject.types';
import ITodoModel from '../models/Todo.interface';

@injectable()
export class TodoController {
	private _todoModel: ITodoModel;

	public constructor(
    @inject(TYPES.ITodoModel)
    todoModel: ITodoModel
  ) {
    this._todoModel = todoModel;
  }

	public async index(req: express.Request, res: express.Response) {
		const todos = await this._todoModel.findByUser(res.locals.authUser);
		res.json({
			result: "SUCCESS",
			data: todos
		});
	}

	public async show(req: express.Request, res: express.Response) {
		const todo = await this._todoModel.findOne(Number(req.params.id), res.locals.authUser);

		if (!todo) {
			return res.status(404).send('このTODOは存在しません');
		}

		res.json({
			result: "SUCCESS",
			data: todo
		});
	}

	public async create(req: express.Request, res: express.Response) {
		const todo = await this._todoModel.buildNewTodo(req.body, res.locals.authUser);
		const validation_errors = await this._todoModel.validate(todo);
		if (validation_errors.length > 0) {
			return res.json({
				result: "FAILED TO CREATE TODO",
				errors: format_validation_errors(validation_errors)
			});
		}

		await this._todoModel.save(todo);
		res.json({
			result: "SUCCESS",
			data: todo
		});
	}

	public async update(req: express.Request, res: express.Response) {
		let todo = await this._todoModel.findOne(Number(req.params.id), res.locals.authUser);
		if (!todo) {
			return res.status(404).send("このTODOは存在しません");
		}

		todo = await this._todoModel.assignParams(todo, req.body);

		const validation_errors = await this._todoModel.validate(todo);
		if (validation_errors.length > 0) {
			return res.json({
				result: "FAILED TO UPDATE TODO",
				errors: format_validation_errors(validation_errors)
			});
		}

		await this._todoModel.save(todo);
		res.json({
			result: "SUCCESS",
			data: todo
		});
	}

	public async delete(req: express.Request, res: express.Response) {
		let todo = await this._todoModel.findOne(Number(req.params.id), res.locals.authUser);
		if (!todo) {
			return res.status(404).send("このTODOは存在しません");
		}

		await this._todoModel.remove(todo);

		res.json({
			result: "SUCCESS"
		});
	}
}
