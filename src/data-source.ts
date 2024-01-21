import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

const options: DataSourceOptions & SeederOptions = {
  type: "mysql",
  host: "db",
  port: 3306,
  username: "root",
  password: "root",
  database: "simple_todo",
  synchronize: true,
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

export const AppDataSource = new DataSource(options);
