import express, { NextFunction } from 'express';
import { AuthController } from "../controllers/Auth.controller";
import { TYPES } from "../inject.types";
import { container } from "../inversify.config";

import { expressjwt } from 'express-jwt';

const authController = container.get<AuthController>(TYPES.AuthController);
const cookieParser = require('cookie-parser');

export const createAuthRoutes = (app: express.Express) => {
	app.post('/signup', async (req, res) => await authController.signup(req, res));
	app.post('/login', async (req, res) => await authController.login(req, res));

	app.use(cookieParser());
}

export const redirectLoginPageUnlessLoggedIn = (err: express.ErrorRequestHandler, req: express.Request, res: express.Response, next: NextFunction) => {
	if (err.name === "UnauthorizedError") {
		res.redirect('/login');
	} else {
		next(err);
	}
}

// JWTを使用してルートを保護する
export const validateToken = expressjwt({
	secret: process.env?.JWT_SECRET ?? 'aaa',
	algorithms: ["HS256"],
	getToken: req => req.cookies.token
});
