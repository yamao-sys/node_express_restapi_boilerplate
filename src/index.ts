import express from 'express';
import path from 'path'

const app = express()

app.use(express.json())
app.use(express.urlencoded({
	extended: true
}))
app.use(express.static(path.join(__dirname, 'public')))

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

app.listen(1234, function() {
	console.log('server running');
})
