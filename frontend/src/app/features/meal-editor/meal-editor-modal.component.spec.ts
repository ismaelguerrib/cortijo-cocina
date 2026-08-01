import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MealStore } from '../../core/services/meal-store.service';
import { MealEditorDialogData, MealEditorModalComponent } from './meal-editor-modal.component';

describe('MealEditorModalComponent', () => {
  const dialogRef = {
    close: jest.fn(),
  };
  const mealStore = {
    createMeal: jest.fn().mockResolvedValue(undefined),
    updateMeal: jest.fn().mockResolvedValue(undefined),
    deleteMeal: jest.fn().mockResolvedValue(undefined),
  };

  const createComponent = async (
    data: MealEditorDialogData,
  ): Promise<ComponentFixture<MealEditorModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [MealEditorModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MealStore, useValue: mealStore },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MealEditorModalComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a meal assignment without recipe', async () => {
    const fixture = await createComponent({
      date: '2026-08-15',
    });
    const component = fixture.componentInstance;

    component.form.controls.mealDate.setValue('2026-08-15');
    component.form.controls.description.setValue('Tomates, feta et herbes du jardin');
    component.dishGroups[0].controls.cookers.setValue(['amel', 'zakaria']);
    component.dishGroups[0].controls.title.setValue('Salade composee');
    component.dishGroups[0].controls.recipe.setValue('');
    component.dishGroups[0].controls.photos.setValue(['https://images.example.com/salade-1.jpg']);
    component.addVote(component.dishGroups[0]);
    component.addVote(component.dishGroups[0]);
    component.voteControls(component.dishGroups[0])[0].setValue(15);
    component.voteControls(component.dishGroups[0])[1].setValue(18);

    await component.submit();

    expect(mealStore.createMeal).toHaveBeenCalledWith({
      mealDate: '2026-08-15',
      description: 'Tomates, feta et herbes du jardin',
      dishes: [
        {
          cookers: ['amel', 'zakaria'],
          title: 'Salade composee',
          recipe: undefined,
          photoUrls: ['https://images.example.com/salade-1.jpg'],
          votes: [15, 18],
        },
      ],
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('preserves an existing recipe when editing outside recipes mode', async () => {
    const fixture = await createComponent({
      date: '2026-08-15',
      meal: {
        id: 'meal-15',
        mealDate: '2026-08-15',
        description: 'Prevoir les grillades',
        dishes: [
          {
            cookers: ['amel', 'zakaria'],
            title: 'Brochettes',
            recipe: 'Mariner puis griller.',
            photoUrls: ['https://images.example.com/brochettes.jpg'],
            votes: [14, 19],
          },
        ],
        createdAt: '2026-05-29T10:00:00.000Z',
        updatedAt: '2026-05-29T10:00:00.000Z',
      },
    });
    const component = fixture.componentInstance;

    component.form.controls.description.setValue('Ajouter les salades et les sauces');
    component.dishGroups[0].controls.title.setValue('Brochettes');
    component.dishGroups[0].controls.photos.setValue([
      'https://images.example.com/brochettes.jpg',
      'https://images.example.com/brochettes-2.jpg',
    ]);
    component.addVote(component.dishGroups[0]);
    component.voteControls(component.dishGroups[0])[0].setValue(14);
    component.voteControls(component.dishGroups[0])[1].setValue(19);
    component.voteControls(component.dishGroups[0])[2].setValue(20);

    await component.submit();

    expect(mealStore.updateMeal).toHaveBeenCalledWith('meal-15', {
      mealDate: '2026-08-15',
      description: 'Ajouter les salades et les sauces',
      dishes: [
        {
          cookers: ['amel', 'zakaria'],
          title: 'Brochettes',
          recipe: 'Mariner puis griller.',
          photoUrls: [
            'https://images.example.com/brochettes.jpg',
            'https://images.example.com/brochettes-2.jpg',
          ],
          votes: [14, 19, 20],
        },
      ],
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('keeps a single dish expanded and opens newly added dishes', async () => {
    const fixture = await createComponent({ date: '2026-08-15' });
    const component = fixture.componentInstance;

    expect(component.isDishExpanded(0)).toBe(true);

    component.addDish();
    expect(component.isDishExpanded(0)).toBe(false);
    expect(component.isDishExpanded(1)).toBe(true);

    component.toggleDish(1);
    expect(component.isDishExpanded(1)).toBe(false);
  });

  it('reveals the first invalid dish when submitting an invalid form', async () => {
    const fixture = await createComponent({ date: '2026-08-15' });
    const component = fixture.componentInstance;

    component.dishGroups[0].controls.cookers.setValue(['amel']);
    component.dishGroups[0].controls.title.setValue('Salade');
    component.addDish(); // dish 1 is empty (invalid) and now expanded
    component.toggleDish(1); // collapse it before submitting

    await component.submit();

    expect(component.isDishExpanded(1)).toBe(true);
    expect(mealStore.createMeal).not.toHaveBeenCalled();
  });

  it('updates the recipe in recipes mode', async () => {
    const fixture = await createComponent({
      date: '2026-08-15',
      allowRecipeEditing: true,
      focusDishIndex: 0,
      meal: {
        id: 'meal-15',
        mealDate: '2026-08-15',
        description: null,
        dishes: [
          {
            cookers: ['amel'],
            title: 'Salade composee',
            photoUrls: [],
            votes: [],
          },
        ],
        createdAt: '2026-05-29T10:00:00.000Z',
        updatedAt: '2026-05-29T10:00:00.000Z',
      },
    });
    const component = fixture.componentInstance;

    component.dishGroups[0].controls.recipe.setValue('Tomates, feta et basilic.');

    await component.submit();

    expect(mealStore.updateMeal).toHaveBeenCalledWith('meal-15', {
      mealDate: '2026-08-15',
      description: undefined,
      dishes: [
        {
          cookers: ['amel'],
          title: 'Salade composee',
          recipe: 'Tomates, feta et basilic.',
          photoUrls: [],
          votes: [],
        },
      ],
    });
  });
});
