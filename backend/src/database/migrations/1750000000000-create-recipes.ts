import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateRecipes1750000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> { await queryRunner.query(`CREATE TABLE "recipes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" varchar(150) NOT NULL, "instructions" text, "contributors" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_recipes_title" UNIQUE ("title"), CONSTRAINT "PK_recipes_id" PRIMARY KEY ("id"))`); }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.query('DROP TABLE "recipes"'); }
}
