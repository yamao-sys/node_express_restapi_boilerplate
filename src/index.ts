import express, { NextFunction } from 'express';
import path from 'path'
import bodyParser from 'body-parser'
import { expressjwt } from 'express-jwt';
import { verifyAuth } from './lib/auth';
import { container } from './inversify.config';
import { TYPES } from './inject.types';
import { TodoController } from './controllers/Todo.controller';
import { AuthController } from './controllers/Auth.controller';

const app = express()

app.use(express.json())
app.use(express.urlencoded({
	extended: true
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())

// Auth
const authController = container.get<AuthController>(TYPES.AuthController);
app.post('/signup', async (req, res) => await authController.signup(req, res));
app.post('/login', async (req, res) => await authController.login(req, res));

// JWTを使用してルートを保護する
app.use('/todos', expressjwt({
	secret: process.env?.JWT_SECRET ?? 'aaa',
	algorithms: ["HS256"],
	getToken: (req: express.Request) => {
		const token = req.headers.authorization;
		return token?.toString();
	}
}));
// 認証が必要なページはログイン画面へリダイレクト
app.use(function (err: express.ErrorRequestHandler, req: express.Request, res: express.Response, next: NextFunction) {
  if (err.name === "UnauthorizedError") {
    res.redirect('/login');
  } else {
    next(err);
  }
});

app.get('/', function (req, res) {
  res.send('Hello World')
})

// Todo
const todoController = container.get<TodoController>(TYPES.TodoController);
app.use('/todos', verifyAuth);
app.get('/todos', async (req, res) => await todoController.index(req, res));
app.get('/todos/:id', async (req, res) => await todoController.show(req, res));
app.post('/todos', async (req, res) => await todoController.create(req, res));
app.put('/todos/:id', async (req, res) => await todoController.update(req, res));
app.delete('/todos/:id', async (req, res) => await todoController.delete(req, res));

module.exports = app;
