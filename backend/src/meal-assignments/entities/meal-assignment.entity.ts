import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';
import { FamilyMember } from '../../common/enums/family-member.enum';

export interface MealDish {
  title: string;
  recipe: string;
  photoUrls: string[];
}

@Entity('meal_assignments')
@Unique(['mealDate'])
export class MealAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date', name: 'meal_date' })
  mealDate!: string;

  @Column({ length: 150 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: FamilyMember,
    array: true
  })
  assignees!: FamilyMember[];

  @Column({ type: 'integer', name: 'vote_count', default: 0 })
  voteCount!: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  dishes!: MealDish[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
