import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMealAssignments1716931200000 implements MigrationInterface {
  name = 'CreateMealAssignments1716931200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE "meal_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meal_date" date NOT NULL,
        "description" text,
        "dishes" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_meal_assignments_meal_date" UNIQUE ("meal_date"),
        CONSTRAINT "PK_meal_assignments_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "meal_assignments"`);
  }
}
