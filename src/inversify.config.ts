import { Container } from "inversify";
import { TYPES } from "./inject.types";
import { TodoModel } from "./models/Todo.model";
import ITodoModel from "./models/Todo.interface";
import { TodoController } from "./controllers/Todo.controller";

const container = new Container();

// Todo
container.bind<ITodoModel>(TYPES.ITodoModel).to(TodoModel).inSingletonScope();
container.bind<TodoController>(TYPES.TodoController).to(TodoController).inSingletonScope();

export { container };
