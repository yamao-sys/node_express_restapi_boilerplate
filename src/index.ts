import express, { NextFunction } from 'express';
import path from 'path'
import bodyParser from 'body-parser'
import { AppDataSource } from './data-source';

import { validate } from 'class-validator';
import { format_validation_errors } from './lib/format_validation_errors';

import { expressjwt } from 'express-jwt';
import { generateToken, verifyAuth } from './lib/auth';
import { compare, hash } from 'bcrypt';
import { User } from './entities/User';
import { TodoController } from './controllers/Todo.controller';

const app = express()

app.use(express.json())
app.use(express.urlencoded({
	extended: true
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())

app.post('/signup', async function (req, res) {
	const hashedPassword = req.body.password ? await hash(req.body.password, 10) : '';

	const user = new User();

	user.email = req.body.email;
	user.password = hashedPassword;

	const validation_errors = await validate(user);
	if (validation_errors.length > 0) {
		return res.json({
			result: "FAILED TO SIGNUP",
			errors: format_validation_errors(validation_errors)
		});
	}

	await AppDataSource.getRepository(User).save(user);

	res.json({ result: "SUCCESS" });
})

app.post('/login', async function (req, res) {
	const user = await AppDataSource.getRepository(User).findOneBy({
		email: req.body.email
	});

	if (!user) {
		return res.status(404).send('メールアドレスまたはパスワードが異なります。')
	}

	const isValidPassword = await compare(req.body.password, user.password)
	if (isValidPassword) {
		const token = await generateToken({ id: user.id });
		res.json({ result: 'SUCCESS', token: token });
	} else {
		return res.status(404).send('メールアドレスまたはパスワードが異なります。')
	}
})

// JWTを使用してルートを保護する
app.use('/todos', expressjwt({
	secret: process.env?.JWT_SECRET ?? 'aaa',
	algorithms: ["HS256"],
	getToken: (req: express.Request) => {
		const token = req.headers.authorization;
		return token?.toString();
	}
}));

app.use('/todos', verifyAuth);

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

const todoController = new TodoController();
app.get('/todos', todoController.index);
app.get('/todos/:id', todoController.show);
app.post('/todos', todoController.create);
app.put('/todos/:id', todoController.update);
app.delete('/todos/:id', todoController.delete);

module.exports = app;
