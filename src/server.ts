import { AppDataSource } from "./data-source";

const app = require('./index')

app.listen(1234, async function() {
	// データベース接続
	try {
		AppDataSource.initialize();
		console.log("Data Source has been initialized!");
	} catch (err) {
		console.error("Error during Data Source initialization:", err);
		throw err;
	}

	console.log('server running');
})
