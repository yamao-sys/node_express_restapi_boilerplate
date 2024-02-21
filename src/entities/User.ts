import { IsNotEmpty } from "class-validator"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import Todo from "./Todo"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @IsNotEmpty({ message: "メールアドレスは必須入力です。" })
  @Column()
  email!: string

  @IsNotEmpty({ message: "パスワードは必須入力です。" })
  @Column({ type: "text" })
  password!: string

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[]
}
