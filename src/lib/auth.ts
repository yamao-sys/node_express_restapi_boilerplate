import express, { NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export interface authUser {
  id: number
}

export function generateToken(user: authUser) {
  return jwt.sign(user, process.env?.JWT_SECRET || 'aaa', { expiresIn: '1h' });
}

export async function getAuthUser(token: string) {
  const decodedToken = jwt.verify(token, process.env?.JWT_SECRET || 'aaa')

  const user = await AppDataSource.getRepository(User).findOneBy({
    id: Number((decodedToken as any).id)
  })
  
  return user || new User();
}

export async function verifyAuth(req: express.Request, res: express.Response, next: NextFunction) {
  const token = req.headers.authorization ?? '';
  const authUser = await getAuthUser(token);
  if (!authUser?.id) {
    res.status(404).send('認証情報が正しくありません。')
  }

  next();
}
