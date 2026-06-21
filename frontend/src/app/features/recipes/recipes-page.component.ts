import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FAMILY_MEMBER_LABELS } from '../../core/constants/family-members';
import { FamilyMember } from '../../core/models/family-member.model';
import { MealAssignment } from '../../core/models/meal-assignment.model';
import { MealStore } from '../../core/services/meal-store.service';
import { MealEditorModalComponent } from '../meal-editor/meal-editor-modal.component';

type RecipeSortOption = 'recent' | 'popular' | 'alphabetical';

interface RecipeCard {
  id: string;
  meal: MealAssignment;
  dishIndex: number;
  mealDate: string;
  dishTitle: string;
  cookers: FamilyMember[];
  recipe?: string;
  photoUrls: string[];
  votes: number[];
}

@Component({
  selector: 'app-recipes-page',
  imports: [MatDialogModule, MatFormFieldModule, MatProgressSpinnerModule, MatSelectModule],
  templateUrl: './recipes-page.component.html',
  styleUrl: './recipes-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipesPageComponent implements OnInit {
  private readonly mealStore = inject(MealStore);
  private readonly dialog = inject(MatDialog);

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
        meal,
        dishIndex: index,
        mealDate: meal.mealDate,
        dishTitle: dish.title,
        cookers: dish.cookers,
        recipe: dish.recipe,
        photoUrls: dish.photoUrls,
        votes: dish.votes
      }))
    );

    return cards.sort((leftCard, rightCard) => {
      switch (this.sort()) {
        case 'alphabetical':
          return leftCard.dishTitle.localeCompare(rightCard.dishTitle, 'fr');
        case 'popular': {
          const leftScore = leftCard.votes.reduce((s, v) => s + v, 0);
          const rightScore = rightCard.votes.reduce((s, v) => s + v, 0);
          return rightScore - leftScore || rightCard.mealDate.localeCompare(leftCard.mealDate);
        }
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

  cookerSummary(cookers: FamilyMember[]): string {
    return cookers.map((c) => FAMILY_MEMBER_LABELS[c]).join(', ');
  }

  voteAverage(votes: number[]): string {
    if (votes.length === 0) return '–';
    const avg = votes.reduce((s, v) => s + v, 0) / votes.length;
    return avg.toFixed(1);
  }

  openRecipeEditor(recipe: RecipeCard): void {
    this.dialog.open(MealEditorModalComponent, {
      data: {
        date: recipe.mealDate,
        meal: recipe.meal,
        allowRecipeEditing: true,
        focusDishIndex: recipe.dishIndex,
      },
      panelClass: 'meal-editor-dialog',
      width: 'min(100vw, var(--app-dialog-inline-max))',
      maxWidth: '100vw',
      height: 'var(--app-shell-min-block)',
    });
  }
}
