import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorDishesAddPreparersVotesDropMealFields1749000000000 implements MigrationInterface {
  name = 'RefactorDishesAddPreparersVotesDropMealFields1749000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE meal_assignments
      SET dishes = (
        SELECT jsonb_agg(
          dish || jsonb_build_object(
            'preparers', (
              SELECT to_jsonb(ma2.assignees)
              FROM meal_assignments ma2
              WHERE ma2.id = meal_assignments.id
            ),
            'votes', '[]'::jsonb
          )
        )
        FROM jsonb_array_elements(dishes) AS dish
      )
    `);

    await queryRunner.query(`ALTER TABLE meal_assignments DROP COLUMN IF EXISTS title`);
    await queryRunner.query(`ALTER TABLE meal_assignments DROP COLUMN IF EXISTS assignees`);
    await queryRunner.query(`ALTER TABLE meal_assignments DROP COLUMN IF EXISTS vote_count`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE meal_assignments ADD COLUMN IF NOT EXISTS vote_count integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE meal_assignments ADD COLUMN IF NOT EXISTS assignees "public"."family_member_enum"[] NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE meal_assignments ADD COLUMN IF NOT EXISTS title character varying(150) NOT NULL DEFAULT ''`);
  }
}
