import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

const options: DataSourceOptions & SeederOptions = {
  type: "mysql",
  host: process.env?.DB_HOST ?? "db",
  port: 3306,
  username: "root",
  password: "root",
  database: process.env.NODE_ENV === 'test' ? "simple_todo_test" : "simple_todo",
  synchronize: true,
  dropSchema: process.env.NODE_ENV === 'test' ? true : false,
  logging: false,
  entities: [
    "src/entities/*.ts",
	],
  migrations: [
    "src/db/migrations/*.ts",
  ],
  subscribers: [],
  seeds: ["src/db/seeds/main.seed.ts"],
  factories: ["src/db/factories/**/*{.ts,.js}"]
};

console.log(options.host);
console.log(options.database);

export const AppDataSource = new DataSource(options);
