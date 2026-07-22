import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from './entities/recipe.entity';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
@Module({ imports: [TypeOrmModule.forFeature([RecipeEntity])], controllers: [RecipesController], providers: [RecipesService] }) export class RecipesModule {}
