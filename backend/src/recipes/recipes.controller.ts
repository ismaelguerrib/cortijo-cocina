import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeEntity } from './entities/recipe.entity';
@Controller('recipes') export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}
  @Get() findAll(): Promise<RecipeEntity[]> { return this.recipes.findAll(); }
  @Post() create(@Body() dto: CreateRecipeDto): Promise<RecipeEntity> { return this.recipes.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateRecipeDto): Promise<RecipeEntity> { return this.recipes.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string): Promise<void> { return this.recipes.remove(id); }
}
