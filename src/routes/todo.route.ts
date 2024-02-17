import express from 'express'
import { TodoController } from '../controllers/Todo.controller'
import { TYPES } from '../inject.types'
import { container } from '../inversify.config'
import { verifyAuth } from '../lib/auth'
import { redirectLoginPageUnlessLoggedIn, validateToken } from './auth.route'

const todoController = container.get<TodoController>(TYPES.TodoController)

export const createTodoRoutes = (app: express.Express) => {
    // 要認証
    app.use('/todos', validateToken)
    app.use(redirectLoginPageUnlessLoggedIn)
    app.use('/todos', verifyAuth)

    app.get('/todos', async (req, res) => await todoController.index(req, res))
    app.get('/todos/:id', async (req, res) => await todoController.show(req, res))
    app.post('/todos', async (req, res) => await todoController.create(req, res))
    app.put('/todos/:id', async (req, res) => await todoController.update(req, res))
    app.delete('/todos/:id', async (req, res) => await todoController.delete(req, res))
}
