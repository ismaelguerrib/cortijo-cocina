import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FAMILY_MEMBERS, FAMILY_MEMBER_LABELS } from '../../core/constants/family-members';
import { FamilyMember } from '../../core/models/family-member.model';
import {
  MealAssignment,
  MealAssignmentPayload,
  MealDish,
} from '../../core/models/meal-assignment.model';
import { MealStore } from '../../core/services/meal-store.service';

export interface MealEditorDialogData {
  date: string;
  meal?: MealAssignment;
  allowRecipeEditing?: boolean;
  focusDishIndex?: number;
}

const minArrayLength =
  (minimum: number): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (Array.isArray(value) && value.length >= minimum) return null;
    return { minArrayLength: true };
  };

const nonEmptyLines =
  (): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string') return { nonEmptyLines: true };
    const lines = value
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.length > 0 ? null : { nonEmptyLines: true };
  };

type DishGroup = FormGroup<{
  cookers: FormControl<FamilyMember[]>;
  title: FormControl<string>;
  recipe: FormControl<string>;
  photos: FormControl<string[]>;
  votes: FormArray<FormControl<number>>;
}>;

@Component({
  selector: 'app-meal-editor-modal',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './meal-editor-modal.component.html',
  styleUrl: './meal-editor-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  readonly allowRecipeEditing = computed(() => Boolean(this.data.allowRecipeEditing));

  // Accordion state: keep a single dish expanded so the form stays short on a
  // phone even with several dishes. The others collapse to a summary row.
  readonly expandedDishIndex = signal<number | null>(this.data.focusDishIndex ?? 0);

  readonly form = this.formBuilder.group({
    mealDate: this.formBuilder.control(
      this.data.meal?.mealDate ?? this.data.date,
      Validators.required,
    ),
    description: this.formBuilder.control(this.data.meal?.description ?? ''),
    dishes: this.formBuilder.array(
      (this.data.meal?.dishes.length ? this.data.meal.dishes : [undefined]).map((dish) =>
        this.createDishGroup(dish),
      ),
      [minArrayLength(1)],
    ),
  });

  get dishGroups(): DishGroup[] {
    return this.form.controls.dishes.controls as DishGroup[];
  }

  voteControls(dishGroup: DishGroup): FormControl<number>[] {
    return dishGroup.controls.votes.controls;
  }

  isFocusedDish(index: number): boolean {
    return this.allowRecipeEditing() && this.data.focusDishIndex === index;
  }

  isDishExpanded(index: number): boolean {
    return this.expandedDishIndex() === index;
  }

  toggleDish(index: number): void {
    this.expandedDishIndex.set(this.isDishExpanded(index) ? null : index);
  }

  dishSummaryTitle(dishGroup: DishGroup, index: number): string {
    return dishGroup.controls.title.getRawValue().trim() || `Plat ${index + 1}`;
  }

  dishSummaryMeta(dishGroup: DishGroup): string {
    const names = dishGroup.controls.cookers.getRawValue().map((id) => FAMILY_MEMBER_LABELS[id]);
    const voteCount = dishGroup.controls.votes.length;
    const parts = [names.length ? names.join(', ') : 'Aucun·e cuisinier·e'];
    if (voteCount > 0) {
      parts.push(`${voteCount} vote${voteCount > 1 ? 's' : ''}`);
    }
    return parts.join(' · ');
  }

  async handlePhotoFiles(event: Event, dishGroup: DishGroup): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    const base64s = await Promise.all(Array.from(input.files).map(toBase64));
    const current = dishGroup.controls.photos.getRawValue();
    dishGroup.controls.photos.setValue([...current, ...base64s]);
    input.value = '';
  }

  removePhoto(dishGroup: DishGroup, index: number): void {
    const current = dishGroup.controls.photos.getRawValue();
    dishGroup.controls.photos.setValue(current.filter((_, i) => i !== index));
  }

  addVote(dishGroup: DishGroup): void {
    dishGroup.controls.votes.push(
      this.formBuilder.control(0, [Validators.required, Validators.min(0), Validators.max(20)]),
    );
  }

  removeVote(dishGroup: DishGroup, voteIndex: number): void {
    dishGroup.controls.votes.removeAt(voteIndex);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Reveal the first dish with errors so its messages are visible.
      const invalidIndex = this.dishGroups.findIndex((group) => group.invalid);
      if (invalidIndex >= 0) {
        this.expandedDishIndex.set(invalidIndex);
      }
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    try {
      const payload: MealAssignmentPayload = {
        mealDate: this.form.controls.mealDate.getRawValue(),
        description: this.form.controls.description.getRawValue().trim() || undefined,
        dishes: this.dishGroups.map((dishGroup) => ({
          cookers: dishGroup.controls.cookers.getRawValue(),
          title: dishGroup.controls.title.getRawValue().trim(),
          recipe: dishGroup.controls.recipe.getRawValue().trim() || undefined,
          photoUrls: dishGroup.controls.photos.getRawValue(),
          votes: dishGroup.controls.votes.getRawValue(),
        })),
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
    if (!this.data.meal || !window.confirm('Supprimer ce repas ?')) return;

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
    this.expandedDishIndex.set(this.form.controls.dishes.length - 1);
  }

  removeDish(index: number): void {
    if (this.form.controls.dishes.length === 1) return;
    this.form.controls.dishes.removeAt(index);
    this.form.controls.dishes.markAsTouched();

    const expanded = this.expandedDishIndex();
    if (expanded === null) return;
    if (expanded === index) {
      this.expandedDishIndex.set(null);
    } else if (expanded > index) {
      this.expandedDishIndex.set(expanded - 1);
    }
  }

  private createDishGroup(dish?: MealDish): DishGroup {
    return this.formBuilder.group({
      cookers: this.formBuilder.control<FamilyMember[]>(dish?.cookers ?? [], [minArrayLength(1)]),
      title: this.formBuilder.control(dish?.title ?? '', [
        Validators.required,
        Validators.maxLength(150),
      ]),
      recipe: this.formBuilder.control(dish?.recipe ?? '', [Validators.maxLength(4000)]),
      photos: this.formBuilder.control<string[]>(dish?.photoUrls ?? []),
      votes: this.formBuilder.array(
        (dish?.votes ?? []).map((v) =>
          this.formBuilder.control(v, [Validators.required, Validators.min(0), Validators.max(20)]),
        ),
      ),
    }) as DishGroup;
  }
}
