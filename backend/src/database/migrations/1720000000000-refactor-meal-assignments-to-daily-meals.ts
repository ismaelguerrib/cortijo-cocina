import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorMealAssignmentsToDailyMeals1720000000000 implements MigrationInterface {
  name = 'RefactorMealAssignmentsToDailyMeals1720000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
