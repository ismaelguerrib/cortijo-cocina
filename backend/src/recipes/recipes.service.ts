import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeEntity } from './entities/recipe.entity';

@Injectable()
export class RecipesService {
  constructor(@InjectRepository(RecipeEntity) private readonly recipes: Repository<RecipeEntity>) {}
  findAll(): Promise<RecipeEntity[]> { return this.recipes.find({ order: { title: 'ASC' } }); }
  create(dto: CreateRecipeDto): Promise<RecipeEntity> { return this.recipes.save(this.recipes.create({ ...dto, title: dto.title.trim(), instructions: dto.instructions?.trim() || null })); }
  async update(id: string, dto: UpdateRecipeDto): Promise<RecipeEntity> { const recipe = await this.findOne(id); return this.recipes.save(this.recipes.merge(recipe, { ...dto, title: dto.title?.trim(), instructions: dto.instructions?.trim() || null })); }
  async remove(id: string): Promise<void> { await this.recipes.remove(await this.findOne(id)); }
  private async findOne(id: string): Promise<RecipeEntity> { const recipe = await this.recipes.findOneBy({ id }); if (!recipe) throw new NotFoundException(`Recipe ${id} was not found.`); return recipe; }
}
