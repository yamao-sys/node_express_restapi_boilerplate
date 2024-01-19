var fs = require('fs');

const person = {
	name: 'Mike',
	age: 30
}

const read = function () {
	fs.readFile('./sample.json', 'utf8', (err, data) => {
		console.log(JSON.parse(data).name);
	})
}

const write = function () {
	fs.writeFile('sample.json', JSON.stringify(person), function () {
		console.log('書き出し完了！');
	})
}

module.exports = {
	read,
	write,
	person
}
