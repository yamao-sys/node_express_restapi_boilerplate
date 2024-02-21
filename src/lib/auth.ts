import express, { NextFunction } from "express"
import * as jwt from "jsonwebtoken"
import { User } from "../entities/User"
import { AppDataSource } from "../data-source"
import { appConfig } from "../app.config"

export interface authUser {
  id: number
}

export function generateToken(user: authUser) {
  return jwt.sign(user, appConfig.app.jwtSecret, { expiresIn: "1h" })
}

export async function getAuthUser(token: string) {
  const decodedToken = jwt.verify(token, appConfig.app.jwtSecret)

  const user = await AppDataSource.getRepository(User).findOneBy({
    id: Number((decodedToken as any).id),
  })

  return user || new User()
}

export async function verifyAuth(req: express.Request, res: express.Response, next: NextFunction) {
  const token = req.cookies.token ?? ""
  const authUser = await getAuthUser(token)
  if (!authUser?.id) {
    res.status(404).send("認証情報が正しくありません。")
  }

  // コントローラで認証ユーザを参照するための設定
  res.locals.authUser = authUser
  next()
}
