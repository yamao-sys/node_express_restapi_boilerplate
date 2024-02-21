import 'reflect-metadata'
import { DataSource, DataSourceOptions } from 'typeorm'
import { SeederOptions } from 'typeorm-extension'
import { appConfig } from './app.config'

const options: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: appConfig.app.dbHost,
  port: 3306,
  username: 'root',
  password: 'root',
  database: appConfig.app.dbName,
  synchronize: appConfig.app.synchronize,
  dropSchema: appConfig.app.dropSchema,
  migrationsRun: appConfig.app.migrationsRun,
  logging: false,
  entities: ['src/entities/*.ts'],
  migrations: ['src/db/migrations/*.ts'],
  subscribers: [],
  seeds: ['src/db/seeds/main.seed.ts'],
  factories: ['src/db/factories/**/*{.ts,.js}'],
}

export const AppDataSource = new DataSource(options)
