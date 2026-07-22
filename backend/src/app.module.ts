import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDatabaseConfig } from './config/database.config';
import { MealAssignmentsModule } from './meal-assignments/meal-assignments.module';
import { RecipesModule } from './recipes/recipes.module';
import { RecipeVotesModule } from './recipe-votes/recipe-votes.module';

@Module({
  imports: [TypeOrmModule.forRoot(buildDatabaseConfig()), MealAssignmentsModule, RecipesModule, RecipeVotesModule]
})
export class AppModule {}
