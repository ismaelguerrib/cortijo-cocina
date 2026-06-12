import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FAMILY_MEMBERS } from '../../core/constants/family-members';
import { MealAssignment, MealAssignmentPayload, MealDish } from '../../core/models/meal-assignment.model';
import { FamilyMember } from '../../core/models/family-member.model';
import { MealStore } from '../../core/services/meal-store.service';

export interface MealEditorDialogData {
  date: string;
  meal?: MealAssignment;
}

const minArrayLength = (minimum: number): ValidatorFn => (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (Array.isArray(value) && value.length >= minimum) {
    return null;
  }

  return { minArrayLength: true };
};

const nonEmptyLines = (): ValidatorFn => (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (typeof value !== 'string') {
    return { nonEmptyLines: true };
  }

  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 ? null : { nonEmptyLines: true };
};

@Component({
  selector: 'app-meal-editor-modal',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './meal-editor-modal.component.html',
  styleUrl: './meal-editor-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealEditorModalComponent {
  private readonly dialogRef = inject(MatDialogRef<MealEditorModalComponent>);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly mealStore = inject(MealStore);

  readonly data = inject<MealEditorDialogData>(MAT_DIALOG_DATA);
  readonly familyMembers = FAMILY_MEMBERS;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditing = computed(() => Boolean(this.data.meal));

  readonly form = this.formBuilder.group({
    mealDate: this.formBuilder.control(this.data.meal?.mealDate ?? this.data.date, Validators.required),
    title: this.formBuilder.control(this.data.meal?.title ?? '', [
      Validators.required,
      Validators.maxLength(150)
    ]),
    description: this.formBuilder.control(this.data.meal?.description ?? ''),
    assignees: this.formBuilder.control<FamilyMember[]>(this.data.meal?.assignees ?? [], [
      minArrayLength(1)
    ]),
    voteCount: this.formBuilder.control(this.data.meal?.voteCount ?? 0, [
      Validators.required,
      Validators.min(0),
      Validators.max(9999)
    ]),
    dishes: this.formBuilder.array(
      (this.data.meal?.dishes.length ? this.data.meal.dishes : [undefined]).map((dish) =>
        this.createDishGroup(dish)
      ),
      [minArrayLength(1)]
    )
  });

  get dishGroups() {
    return this.form.controls.dishes.controls;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    try {
      const payload: MealAssignmentPayload = {
        mealDate: this.form.controls.mealDate.getRawValue(),
        title: this.form.controls.title.getRawValue().trim(),
        description: this.form.controls.description.getRawValue().trim() || undefined,
        assignees: this.form.controls.assignees.getRawValue(),
        voteCount: this.form.controls.voteCount.getRawValue(),
        dishes: this.form.controls.dishes.getRawValue().map((dish) => ({
          title: dish.title.trim(),
          recipe: dish.recipe.trim(),
          photoUrls: dish.photoUrlsText
            .split('\n')
            .map((photoUrl) => photoUrl.trim())
            .filter(Boolean)
        }))
      };

      if (this.data.meal) {
        await this.mealStore.updateMeal(this.data.meal.id, payload);
      } else {
        await this.mealStore.createMeal(payload);
      }

      this.dialogRef.close(true);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteMeal(): Promise<void> {
    if (!this.data.meal || !window.confirm('Supprimer ce repas ?')) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    try {
      await this.mealStore.deleteMeal(this.data.meal.id);
      this.dialogRef.close(true);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      this.saving.set(false);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  addDish(): void {
    this.form.controls.dishes.push(this.createDishGroup());
  }

  removeDish(index: number): void {
    if (this.form.controls.dishes.length === 1) {
      return;
    }

    this.form.controls.dishes.removeAt(index);
    this.form.controls.dishes.markAsTouched();
  }

  private createDishGroup(dish?: MealDish) {
    return this.formBuilder.group({
      title: this.formBuilder.control(dish?.title ?? '', [
        Validators.required,
        Validators.maxLength(150)
      ]),
      recipe: this.formBuilder.control(dish?.recipe ?? '', [
        Validators.required,
        Validators.maxLength(4000)
      ]),
      photoUrlsText: this.formBuilder.control((dish?.photoUrls ?? []).join('\n'), [
        Validators.required,
        nonEmptyLines()
      ])
    });
  }
}
