import express from 'express';
import path from 'path'
import bodyParser from 'body-parser'
import { AppDataSource } from './data-source';

import Todo from './entities/Todo';

const app = express()

app.use(express.json())
app.use(express.urlencoded({
	extended: true
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())

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
	const todos = await AppDataSource.getRepository(Todo).find();
	res.json({
		result: "SUCCESS",
		data: todos
	});
})

app.get('/todos/:id', async function (req, res) {
	const todo = await AppDataSource.getRepository(Todo).findOne({
		where: {
			id: Number(req.params.id)
		}
	});
	res.json({
		result: "SUCCESS",
		data: todo
	});
})

app.get('/todos/:id', async function (req, res) {
	const todo = await AppDataSource.getRepository(Todo).findOne({
		where: {
			id: Number(req.params.id)
		}
	});
	res.json({
		result: "SUCCESS",
		data: todo
	});
})

app.post('/todos', async function (req, res) {
	const todo = new Todo();

	console.log(req.body);
	console.log(req.body.title);
	console.log(req.body.content);

	todo.title = req.body.title;
	todo.content = req.body.content;
	await AppDataSource.manager.save(todo)
	res.json({
		result: "SUCCESS",
		data: todo
	});
})

app.put('/todos/:id', async function (req, res) {
	const todoRepository = AppDataSource.getRepository(Todo);

	const todo = await todoRepository.findOneBy({
		id: Number(req.params.id)
	});

	if (!todo) {
		return res.status(500).send("このTODOは存在しません");
	}

	todo.title = req.body.title;
	todo.content = req.body.content;

	await todoRepository.save(todo);

	res.json({
		result: "SUCCESS",
		data: todo
	});
})

app.delete('/todos/:id', async function (req, res) {
	const todoRepository = AppDataSource.getRepository(Todo);

	const todo = await todoRepository.findOneBy({
		id: Number(req.params.id)
	});

	if (!todo) {
		return res.status(500).send("このTODOは存在しません");
	}

	await todoRepository.remove(todo);

	res.json({
		result: "SUCCESS"
	});
})

app.listen(1234, async function() {
	console.log('server running');

	// データベース接続
	try {
		await AppDataSource.initialize();
		console.log("Data Source has been initialized!");
	} catch (err) {
		console.error("Error during Data Source initialization:", err);
		throw err;
	}
})
