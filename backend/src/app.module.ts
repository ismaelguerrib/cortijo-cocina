import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDatabaseConfig } from './config/database.config';
import { MealAssignmentsModule } from './meal-assignments/meal-assignments.module';
import { RecipesModule } from './recipes/recipes.module';
import { RecipeVotesModule } from './recipe-votes/recipe-votes.module';
import { RecipePhotosModule } from './recipe-photos/recipe-photos.module';
import { VacationsModule } from './vacations/vacations.module';

@Module({
  imports: [TypeOrmModule.forRoot(buildDatabaseConfig()), MealAssignmentsModule, RecipesModule, RecipeVotesModule, RecipePhotosModule, VacationsModule]
})
export class AppModule {}
