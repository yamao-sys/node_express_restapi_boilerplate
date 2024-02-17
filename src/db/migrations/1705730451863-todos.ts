import { MigrationInterface, QueryRunner } from 'typeorm'

export class Todos1705730451863 implements MigrationInterface {
	name = 'Todos1705730451863'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('CREATE TABLE `todos` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `content` text NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB')
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DROP TABLE `todos`')
	}

}
