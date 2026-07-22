import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FamilyMember } from '../../common/constants/family-members';

@Entity('recipes')
export class RecipeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150, unique: true })
  title!: string;

  @Column({ type: 'text', nullable: true })
  instructions!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  contributors!: FamilyMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
