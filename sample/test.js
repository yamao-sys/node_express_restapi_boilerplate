var fs = require('fs');
const { read, write } = require('./helper');

// fs.writeFile('sample.txt', 'hello world', function () {
// 	console.log('書き出し完了！');
// })

// fs.readFile('./sample.txt', 'utf8', (err, data) => {
// 	console.log(data);
// })

console.log(process.argv[2])
const request = process.argv[2]
if (request === 'read') {
	read();
} else if (request === 'write') {
	write();
} else {
	console.error('エラー: readまたはwriteによる指定をお願いします。')
}
