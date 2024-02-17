import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'

const app = express()

app.use(express.json())
app.use(express.urlencoded({
	extended: true
}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())

export default app
