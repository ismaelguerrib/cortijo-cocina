import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertRecipeVoteDto } from './dto/upsert-recipe-vote.dto';
import { RecipeVoteEntity } from './entities/recipe-vote.entity';
@Injectable() export class RecipeVotesService {
  constructor(@InjectRepository(RecipeVoteEntity) private readonly votes: Repository<RecipeVoteEntity>) {}
  list(recipeId: string): Promise<RecipeVoteEntity[]> { return this.votes.find({ where: { recipeId }, order: { createdAt: 'ASC' } }); }
  async upsert(recipeId: string, dto: UpsertRecipeVoteDto): Promise<RecipeVoteEntity> { const existing = await this.votes.findOneBy({ recipeId, member: dto.member }); return this.votes.save(existing ? this.votes.merge(existing, dto) : this.votes.create({ recipeId, ...dto })); }
}
