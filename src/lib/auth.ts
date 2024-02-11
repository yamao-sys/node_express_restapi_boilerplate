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
  const decodedToken = await jwt.verify(token, process.env?.JWT_SECRET || 'aaa')
  
  return AppDataSource.getRepository(User).findOneBy({
    id: Number((decodedToken as any).id)
  });
}

export async function verifyAuth(req: express.Request, res: express.Response, next: NextFunction) {
  const token = req.headers.authorization ?? '';
  if (!token) {
    res.status(401).send('認証情報がありません。')
  }

  const authUser = await getAuthUser(token);
  if (!authUser?.id) {
    res.status(404).send('認証情報が正しくありません。')
  }

  next();
}
