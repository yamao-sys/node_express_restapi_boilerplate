// var http = require('http');
// var fs = require('fs');
// const { name, add } = require('./sample');

// var server = http.createServer(function(req, res) {
//     var target = '';
//     switch(req.url) {
//         case '/':
//         case '/index':
//             target = './index.html';
//             break;
//         default:
//             res.writeHead(404, {'Content-Type': 'text/plain'});
//             res.end('Bad request');
//             return;
//     }

//     fs.readFile(target, 'utf-8', function(err, data) {
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.write(data);
//         res.end();
//     });
// });
// server.listen(1234);

// console.log(name);
// console.log(add(2 + 3));
// console.log('サーバを起動しました');

const express = require('express')
const path = require('path')
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

// app.get('/', function (req, res) {
//   res.send('Hello World')
// })

app.get('/about', function (req, res) {
  res.send('about page')
})

app.listen(1234, function() {
	console.log('server running');
})
