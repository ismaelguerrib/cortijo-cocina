import { FamilyMember } from './family-member.model';

export interface MealDish {
  preparers: FamilyMember[];
  title: string;
  recipe: string;
  photoUrls: string[];
  votes: number[];
}

export interface MealAssignment {
  id: string;
  mealDate: string;
  description: string | null;
  dishes: MealDish[];
  createdAt: string;
  updatedAt: string;
}

export interface MealAssignmentPayload {
  mealDate: string;
  description?: string;
  dishes: MealDish[];
}
