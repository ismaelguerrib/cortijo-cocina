import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MealApiService } from '../api/meal-api.service';
import { MealAssignment, MealAssignmentPayload } from '../models/meal-assignment.model';

@Injectable({ providedIn: 'root' })
export class MealStore {
  private readonly api = inject(MealApiService);

  readonly meals = signal<MealAssignment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly mealsByDate = computed(
    () => new Map(this.meals().map((meal) => [meal.mealDate, meal] as const))
  );

  async loadMeals(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const meals = await firstValueFrom(this.api.getAll());
      this.meals.set(meals);
    } catch (error) {
      this.error.set(this.extractErrorMessage(error, 'Impossible de charger les repas.'));
    } finally {
      this.loading.set(false);
    }
  }

  async createMeal(payload: MealAssignmentPayload): Promise<MealAssignment> {
    try {
      const meal = await firstValueFrom(this.api.create(payload));
      this.upsertMeal(meal);
      return meal;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Impossible de créer le repas.'));
    }
  }

  async updateMeal(id: string, payload: MealAssignmentPayload): Promise<MealAssignment> {
    try {
      const meal = await firstValueFrom(this.api.update(id, payload));
      this.upsertMeal(meal);
      return meal;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Impossible de modifier le repas.'));
    }
  }

  async deleteMeal(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.delete(id));
      this.meals.update((meals) => meals.filter((meal) => meal.id !== id));
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Impossible de supprimer le repas.'));
    }
  }

  mealFor(date: string): MealAssignment | undefined {
    return this.mealsByDate().get(date);
  }

  private upsertMeal(meal: MealAssignment): void {
    this.meals.update((meals) => {
      const nextMeals = meals.filter((existingMeal) => existingMeal.id !== meal.id);
      nextMeals.push(meal);

      return nextMeals.sort((leftMeal, rightMeal) => leftMeal.mealDate.localeCompare(rightMeal.mealDate));
    });
  }

  private extractErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return fallbackMessage;
      }

      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }

      if (Array.isArray(error.error?.message)) {
        return error.error.message.join(', ');
      }
    }

    if (error instanceof Error && error.message && error.message !== 'Failed to fetch') {
      return error.message;
    }

    return fallbackMessage;
  }
}
