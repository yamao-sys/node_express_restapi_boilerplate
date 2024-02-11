import express, { NextFunction } from 'express';
import path from 'path'
import bodyParser from 'body-parser'
import { AppDataSource } from './data-source';

import Todo from './entities/Todo';
import { validate } from 'class-validator';
import { format_validation_errors } from './lib/format_validation_errors';

import { expressjwt } from 'express-jwt';
import { generateToken, getAuthUser, verifyAuth } from './lib/auth';
import { compare, hash } from 'bcrypt';
import { User } from './entities/User';

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

app.post('/api/v1/quiz', function (req, res) {
	const answer = req.body.answer
	if (answer === '2') {
		res.redirect('/correct.html')
	} else {
		res.redirect('/incorrect.html')
	}
})

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/about', function (req, res) {
  res.send('about page')
})

app.get('/todos', async function (req, res) {
	const todos = await AppDataSource.getRepository(Todo).find({
		where: {
			user: await getAuthUser(req.headers?.authorization ?? '')
		}
	});
	res.json({
		result: "SUCCESS",
		data: todos
	});
})

app.get('/todos/:id', async function (req, res) {
	const todo = await AppDataSource.getRepository(Todo).findOne({
		where: {
			id: Number(req.params.id),
			user: await getAuthUser(req.headers?.authorization ?? '')
		}
	});

	if (!todo) {
		return res.status(404).send('このTODOは存在しません');
	}

	res.json({
		result: "SUCCESS",
		data: todo
	});
})

app.post('/todos', async function (req, res) {
	const todo = new Todo();

	todo.title = req.body.title;
	todo.content = req.body.content;
	todo.user = await getAuthUser(req.headers?.authorization ?? '');

	const validation_errors = await validate(todo);
	if (validation_errors.length > 0) {
		return res.json({
			result: "FAILED TO CREATE TODO",
			errors: format_validation_errors(validation_errors)
		});
	}

	await AppDataSource.manager.save(todo)
	res.json({
		result: "SUCCESS",
		data: todo
	});
})

app.put('/todos/:id', async function (req, res) {
	const todoRepository = AppDataSource.getRepository(Todo);

	const todo = await todoRepository.findOneBy({
		id: Number(req.params.id),
		user: await getAuthUser(req.headers?.authorization ?? ''),
	});

	if (!todo) {
		return res.status(404).send("このTODOは存在しません");
	}

	todo.title = req.body.title;
	todo.content = req.body.content;

	const validation_errors = await validate(todo);
	if (validation_errors.length > 0) {
		return res.json({
			result: "FAILED TO UPDATE TODO",
			errors: format_validation_errors(validation_errors)
		});
	}

	await todoRepository.save(todo);

	res.json({
		result: "SUCCESS",
		data: todo
	});
})

app.delete('/todos/:id', async function (req, res) {
	const todoRepository = AppDataSource.getRepository(Todo);

	const todo = await todoRepository.findOneBy({
		id: Number(req.params.id),
		user: await getAuthUser(req.headers?.authorization ?? ''),
	});

	if (!todo) {
		return res.status(404).send("このTODOは存在しません");
	}

	await todoRepository.remove(todo);

	res.json({
		result: "SUCCESS"
	});
})

module.exports = app;
