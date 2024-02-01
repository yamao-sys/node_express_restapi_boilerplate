import { IsNotEmpty, Length } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
	id!: number;

  @IsNotEmpty({ message: 'タイトルは必須です。' })
  @Length(1, 255, { message: '$constraint1文字以上$constraint2文字以下での入力をお願いします。' })
  @Column()
  title!: string; 

  @Column({
    type: "text",
    nullable: true,
  })
  content!: string;
}

export default Todo;
