import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FAMILY_MEMBER_LABELS } from '../../core/constants/family-members';
import { FamilyMember } from '../../core/models/family-member.model';
import { MealStore } from '../../core/services/meal-store.service';

type RecipeSortOption = 'recent' | 'popular' | 'alphabetical';

interface RecipeCard {
  id: string;
  mealDate: string;
  mealTitle: string;
  mealVotes: number;
  assignees: FamilyMember[];
  dishTitle: string;
  recipe: string;
  photoUrls: string[];
}

@Component({
  selector: 'app-recipes-page',
  imports: [MatFormFieldModule, MatProgressSpinnerModule, MatSelectModule],
  templateUrl: './recipes-page.component.html',
  styleUrl: './recipes-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipesPageComponent implements OnInit {
  private readonly mealStore = inject(MealStore);

  readonly loading = this.mealStore.loading;
  readonly error = this.mealStore.error;
  readonly sort = signal<RecipeSortOption>('recent');
  readonly sortOptions: Array<{ value: RecipeSortOption; label: string }> = [
    { value: 'recent', label: 'Plus récentes' },
    { value: 'popular', label: 'Plus votées' },
    { value: 'alphabetical', label: 'A à Z' }
  ];
  readonly recipeCards = computed(() => {
    const cards = this.mealStore.meals().flatMap((meal) =>
      meal.dishes.map((dish, index) => ({
        id: `${meal.id}-${index}`,
        mealDate: meal.mealDate,
        mealTitle: meal.title,
        mealVotes: meal.voteCount,
        assignees: meal.assignees,
        dishTitle: dish.title,
        recipe: dish.recipe,
        photoUrls: dish.photoUrls
      }))
    );

    return cards.sort((leftCard, rightCard) => {
      switch (this.sort()) {
        case 'alphabetical':
          return leftCard.dishTitle.localeCompare(rightCard.dishTitle, 'fr');
        case 'popular':
          return (
            rightCard.mealVotes - leftCard.mealVotes ||
            rightCard.mealDate.localeCompare(leftCard.mealDate)
          );
        case 'recent':
        default:
          return (
            rightCard.mealDate.localeCompare(leftCard.mealDate) ||
            leftCard.dishTitle.localeCompare(rightCard.dishTitle, 'fr')
          );
      }
    });
  });

  async ngOnInit(): Promise<void> {
    await this.mealStore.loadMeals();
  }

  assigneeSummary(assignees: FamilyMember[]): string {
    return assignees.map((assignee) => FAMILY_MEMBER_LABELS[assignee]).join(', ');
  }
}
