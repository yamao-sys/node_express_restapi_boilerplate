if (!process.env.NODE_ENV) {
	console.error('NODE_ENV environment variables is missing')
	process.exit()
}

if (!process.env.DB_HOST) {
	console.error('DB_HOST environment variables is missing')
	process.exit()
}

if (!process.env.DB_NAME) {
	console.error('DB_NAME environment variables is missing')
	process.exit()
}

if (!process.env.DB_DROP_SCHEMA) {
	console.error('DB_DROP_SCHEMA environment variables is missing')
	process.exit()
}

if (!process.env.JWT_SECRET) {
	console.error('JWT_SECRET environment variables is missing')
	process.exit()
}

export const appConfig = {
	app: {
		nodeEnv: process.env.NODE_ENV,
		dbHost: process.env.DB_HOST,
		dbName: process.env.DB_NAME,
		dbDropSchema: Boolean(process.env.DB_DROP_SCHEMA),
		jwtSecret: process.env.JWT_SECRET
	}
}
