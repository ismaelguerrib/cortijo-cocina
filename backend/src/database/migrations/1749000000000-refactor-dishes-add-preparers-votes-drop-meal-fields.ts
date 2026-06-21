import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorDishesAddPreparersVotesDropMealFields1749000000000 implements MigrationInterface {
  name = 'RefactorDishesAddPreparersVotesDropMealFields1749000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
