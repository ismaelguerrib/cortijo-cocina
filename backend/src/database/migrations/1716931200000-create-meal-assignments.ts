import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMealAssignments1716931200000 implements MigrationInterface {
  name = 'CreateMealAssignments1716931200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TYPE "public"."meal_slot_enum" AS ENUM ('LUNCH', 'DINNER')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."family_member_enum" AS ENUM ('MAMIE', 'PAPI', 'JULIE', 'THOMAS', 'CLAIRE')
    `);
    await queryRunner.query(`
      CREATE TABLE "meal_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meal_date" date NOT NULL,
        "slot" "public"."meal_slot_enum" NOT NULL,
        "title" character varying(150) NOT NULL,
        "description" text,
        "assignees" "public"."family_member_enum" array NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_meal_date_slot" UNIQUE ("meal_date", "slot"),
        CONSTRAINT "PK_meal_assignments_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "meal_assignments"`);
    await queryRunner.query(`DROP TYPE "public"."family_member_enum"`);
    await queryRunner.query(`DROP TYPE "public"."meal_slot_enum"`);
  }
}
