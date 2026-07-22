import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { FamilyMember } from '../../common/constants/family-members';
import { RecipeEntity } from '../../recipes/entities/recipe.entity';
@Entity('recipe_votes') @Unique(['recipeId', 'member'])
export class RecipeVoteEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'recipe_id', type: 'uuid' }) recipeId!: string;
  @ManyToOne(() => RecipeEntity, { onDelete: 'CASCADE' }) recipe!: RecipeEntity;
  @Column({ type: 'varchar', length: 40 }) member!: FamilyMember;
  @Column({ type: 'smallint' }) score!: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
