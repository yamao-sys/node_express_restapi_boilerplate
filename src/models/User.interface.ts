import { ValidationError } from 'class-validator'
import { User } from '../entities/User'

export interface IUserModel {
  buildNewUser(params: userParams): Promise<User>
  validate(user: User): Promise<ValidationError[]>
  save(user: User): Promise<User>
  signin(params: userParams): Promise<User | null>
}

export interface userParams {
  email: string
  password: string
}
