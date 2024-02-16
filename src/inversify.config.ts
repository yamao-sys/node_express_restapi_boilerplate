import { Container } from "inversify";
import { TYPES } from "./inject.types";
import { TodoModel } from "./models/Todo.model";
import ITodoModel from "./models/Todo.interface";
import { TodoController } from "./controllers/Todo.controller";
import { IUserModel } from "./models/User.interface";
import { UserModel } from "./models/User.model";
import { AuthController } from "./controllers/Auth.controller";

const container = new Container();

// Todo
container.bind<ITodoModel>(TYPES.ITodoModel).to(TodoModel).inSingletonScope();
container.bind<TodoController>(TYPES.TodoController).to(TodoController).inSingletonScope();

// Auth
container.bind<IUserModel>(TYPES.IUserModel).to(UserModel).inSingletonScope();
container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();

export { container };
