import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { MealAssignmentEntity } from '../meal-assignments/entities/meal-assignment.entity';
import { RecipeEntity } from '../recipes/entities/recipe.entity';

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const port = Number(value);
  return Number.isFinite(port) ? port : fallback;
};

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parsePort(process.env.DB_PORT, 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'cortijo_cocina',
  entities: [MealAssignmentEntity, RecipeEntity],
  migrations: ['src/database/migrations/*.ts']
});
