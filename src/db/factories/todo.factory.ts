import { Faker } from '@faker-js/faker'

import Todo from '../../entities/Todo'
import { setSeederFactory } from 'typeorm-extension'

export const TodosFactory = setSeederFactory(Todo, (faker: Faker) => {
    const todo = new Todo()
    todo.title = faker.string.uuid()
    todo.content = faker.string.uuid()
    return todo
})
