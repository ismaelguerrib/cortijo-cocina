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
  preparers: FamilyMember[];
  title: string;
  recipe: string;
  photoUrls: string[];
  votes: number[];
}

@Entity('meal_assignments')
@Unique(['mealDate'])
export class MealAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date', name: 'meal_date' })
  mealDate!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  dishes!: MealDish[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
