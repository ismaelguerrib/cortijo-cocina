import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UpsertRecipeVoteDto } from './dto/upsert-recipe-vote.dto';
import { RecipeVoteEntity } from './entities/recipe-vote.entity';
import { RecipeVotesService } from './recipe-votes.service';
@Controller('recipes/:recipeId/votes') export class RecipeVotesController { constructor(private readonly votes: RecipeVotesService) {} @Get() list(@Param('recipeId') recipeId: string): Promise<RecipeVoteEntity[]> { return this.votes.list(recipeId); } @Put() upsert(@Param('recipeId') recipeId: string, @Body() dto: UpsertRecipeVoteDto): Promise<RecipeVoteEntity> { return this.votes.upsert(recipeId, dto); } }
