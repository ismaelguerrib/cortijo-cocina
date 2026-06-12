import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorMealAssignmentsToDailyMeals1720000000000 implements MigrationInterface {
  name = 'RefactorMealAssignmentsToDailyMeals1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "meal_assignments_next" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meal_date" date NOT NULL,
        "title" character varying(150) NOT NULL,
        "description" text,
        "assignees" "public"."family_member_enum" array NOT NULL,
        "vote_count" integer NOT NULL DEFAULT 0,
        "dishes" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_meal_assignments_next_meal_date" UNIQUE ("meal_date"),
        CONSTRAINT "PK_meal_assignments_next_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "meal_assignments_next" (
        "meal_date",
        "title",
        "description",
        "assignees",
        "vote_count",
        "dishes",
        "created_at",
        "updated_at"
      )
      SELECT
        legacy."meal_date",
        CASE
          WHEN COUNT(*) = 1 THEN MAX(legacy."title")
          ELSE 'Repas du ' || TO_CHAR(legacy."meal_date", 'DD/MM/YYYY')
        END,
        NULLIF(
          string_agg(
            NULLIF(trim(COALESCE(legacy."description", '')), ''),
            E'\n\n'
            ORDER BY legacy."slot"
          ),
          ''
        ),
        ARRAY(
          SELECT DISTINCT assignee
          FROM (
            SELECT unnest(day_items."assignees") AS assignee
            FROM "meal_assignments" day_items
            WHERE day_items."meal_date" = legacy."meal_date"
          ) assignees_for_day
          ORDER BY assignee
        )::"public"."family_member_enum"[],
        0,
        jsonb_agg(
          jsonb_build_object(
            'title',
            legacy."title",
            'recipe',
            COALESCE(NULLIF(trim(COALESCE(legacy."description", '')), ''), 'Recette à compléter'),
            'photoUrls',
            '[]'::jsonb
          )
          ORDER BY legacy."slot"
        ),
        MIN(legacy."created_at"),
        MAX(legacy."updated_at")
      FROM "meal_assignments" legacy
      GROUP BY legacy."meal_date"
    `);

    await queryRunner.query(`DROP TABLE "meal_assignments"`);
    await queryRunner.query(`DROP TYPE "public"."meal_slot_enum"`);
    await queryRunner.query(`ALTER TABLE "meal_assignments_next" RENAME TO "meal_assignments"`);
    await queryRunner.query(`
      ALTER TABLE "meal_assignments"
      RENAME CONSTRAINT "UQ_meal_assignments_next_meal_date" TO "UQ_meal_assignments_meal_date"
    `);
    await queryRunner.query(`
      ALTER TABLE "meal_assignments"
      RENAME CONSTRAINT "PK_meal_assignments_next_id" TO "PK_meal_assignments_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."meal_slot_enum" AS ENUM ('LUNCH', 'DINNER')
    `);
    await queryRunner.query(`
      CREATE TABLE "meal_assignments_legacy" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meal_date" date NOT NULL,
        "slot" "public"."meal_slot_enum" NOT NULL,
        "title" character varying(150) NOT NULL,
        "description" text,
        "assignees" "public"."family_member_enum" array NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_meal_date_slot" UNIQUE ("meal_date", "slot"),
        CONSTRAINT "PK_meal_assignments_legacy_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "meal_assignments_legacy" (
        "meal_date",
        "slot",
        "title",
        "description",
        "assignees",
        "created_at",
        "updated_at"
      )
      SELECT
        "meal_date",
        'DINNER'::"public"."meal_slot_enum",
        "title",
        "description",
        "assignees",
        "created_at",
        "updated_at"
      FROM "meal_assignments"
    `);

    await queryRunner.query(`DROP TABLE "meal_assignments"`);
    await queryRunner.query(`ALTER TABLE "meal_assignments_legacy" RENAME TO "meal_assignments"`);
    await queryRunner.query(`
      ALTER TABLE "meal_assignments"
      RENAME CONSTRAINT "PK_meal_assignments_legacy_id" TO "PK_meal_assignments_id"
    `);
  }
}
