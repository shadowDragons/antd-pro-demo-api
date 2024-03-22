import { MigrationInterface, QueryRunner } from "typeorm";

export class XgihQe1675681092467 implements MigrationInterface {
    name = 'XgihQe1675681092467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD \`tags\` text NULL COMMENT '文章标签'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`tags\``);
    }

}
