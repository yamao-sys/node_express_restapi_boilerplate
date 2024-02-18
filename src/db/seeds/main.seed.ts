import { DataSource } from 'typeorm'
import { Seeder, SeederFactoryManager } from 'typeorm-extension'

import Todo from '../../entities/Todo'

export class MainSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager) {
    const todoFactory = factoryManager.get(Todo)

    await todoFactory.saveMany(10)
  }
}
