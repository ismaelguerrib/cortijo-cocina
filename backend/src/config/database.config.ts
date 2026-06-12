import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MealAssignmentEntity } from '../meal-assignments/entities/meal-assignment.entity';

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const port = Number(value);
  return Number.isFinite(port) ? port : fallback;
};

export const buildDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parsePort(process.env.DB_PORT, 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'cortijo_cocina',
  entities: [MealAssignmentEntity],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false
});
