import { IsNotEmpty, Length } from "class-validator"
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity("todos")
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.todos, {
    createForeignKeyConstraints: true,
    persistence: false,
  })
  @JoinColumn({
    name: "user_id",
    referencedColumnName: "id",
  })
  user: User

  @IsNotEmpty({ message: "タイトルは必須です。" })
  @Length(1, 255, { message: "$constraint1文字以上$constraint2文字以下での入力をお願いします。" })
  @Column()
  title!: string

  @Column({
    type: "text",
    nullable: true,
  })
  content!: string
}

export default Todo
