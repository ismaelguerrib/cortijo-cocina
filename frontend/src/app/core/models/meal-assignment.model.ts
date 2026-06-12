import { FamilyMember } from './family-member.model';

export interface MealDish {
  title: string;
  recipe: string;
  photoUrls: string[];
}

export interface MealAssignment {
  id: string;
  mealDate: string;
  title: string;
  description: string | null;
  assignees: FamilyMember[];
  voteCount: number;
  dishes: MealDish[];
  createdAt: string;
  updatedAt: string;
}

export interface MealAssignmentPayload {
  mealDate: string;
  title: string;
  description?: string;
  assignees: FamilyMember[];
  voteCount: number;
  dishes: MealDish[];
}
