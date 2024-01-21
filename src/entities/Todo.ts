import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
	id!: number;

  @Column()
  title!: string; 

  @Column({
    type: "text",
    nullable: true,
  })
  content!: string;
}

export default Todo;
