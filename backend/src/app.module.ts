import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDatabaseConfig } from './config/database.config';
import { MealAssignmentsModule } from './meal-assignments/meal-assignments.module';

@Module({
  imports: [TypeOrmModule.forRoot(buildDatabaseConfig()), MealAssignmentsModule]
})
export class AppModule {}
