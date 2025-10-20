import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1759996133521 implements MigrationInterface {
    name = 'InitMigration1759996133521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "is_active"`);
    }

}
