import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MealStore } from '../../core/services/meal-store.service';
import { MealEditorDialogData, MealEditorModalComponent } from './meal-editor-modal.component';

describe('MealEditorModalComponent', () => {
  const dialogRef = {
    close: jest.fn()
  };
  const mealStore = {
    createMeal: jest.fn().mockResolvedValue(undefined),
    updateMeal: jest.fn().mockResolvedValue(undefined),
    deleteMeal: jest.fn().mockResolvedValue(undefined)
  };

  const createComponent = async (
    data: MealEditorDialogData
  ): Promise<ComponentFixture<MealEditorModalComponent>> => {
    await TestBed.configureTestingModule({
      imports: [MealEditorModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MealStore, useValue: mealStore }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MealEditorModalComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a meal assignment', async () => {
    const fixture = await createComponent({
      date: '2026-08-15'
    });
    const component = fixture.componentInstance;

    component.form.controls.mealDate.setValue('2026-08-15');
    component.form.controls.title.setValue('Dejeuner du marche');
    component.form.controls.description.setValue('Tomates, feta et herbes du jardin');
    component.form.controls.assignees.setValue(['JULIE', 'CLAIRE']);
    component.form.controls.voteCount.setValue(4);
    component.dishGroups[0].setValue({
      title: 'Salade composee',
      recipe: 'Tomates, feta et basilic.',
      photoUrlsText: 'https://images.example.com/salade-1.jpg\nhttps://images.example.com/salade-2.jpg'
    });

    await component.submit();

    expect(mealStore.createMeal).toHaveBeenCalledWith({
      mealDate: '2026-08-15',
      title: 'Dejeuner du marche',
      description: 'Tomates, feta et herbes du jardin',
      assignees: ['JULIE', 'CLAIRE'],
      voteCount: 4,
      dishes: [
        {
          title: 'Salade composee',
          recipe: 'Tomates, feta et basilic.',
          photoUrls: [
            'https://images.example.com/salade-1.jpg',
            'https://images.example.com/salade-2.jpg'
          ]
        }
      ]
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('updates an existing meal assignment', async () => {
    const fixture = await createComponent({
      date: '2026-08-15',
      meal: {
        id: 'meal-15',
        mealDate: '2026-08-15',
        title: 'Barbecue familial',
        description: 'Prevoir les grillades',
        assignees: ['MAMIE', 'THOMAS'],
        voteCount: 8,
        dishes: [
          {
            title: 'Brochettes',
            recipe: 'Mariner puis griller.',
            photoUrls: ['https://images.example.com/brochettes.jpg']
          }
        ],
        createdAt: '2026-05-29T10:00:00.000Z',
        updatedAt: '2026-05-29T10:00:00.000Z'
      }
    });
    const component = fixture.componentInstance;

    component.form.controls.mealDate.setValue('2026-08-15');
    component.form.controls.title.setValue('Barbecue du dimanche');
    component.form.controls.description.setValue('Ajouter les salades et les sauces');
    component.form.controls.assignees.setValue(['MAMIE', 'THOMAS']);
    component.form.controls.voteCount.setValue(11);
    component.dishGroups[0].setValue({
      title: 'Brochettes',
      recipe: 'Mariner plus longtemps puis griller.',
      photoUrlsText: 'https://images.example.com/brochettes.jpg'
    });

    await component.submit();

    expect(mealStore.updateMeal).toHaveBeenCalledWith('meal-15', {
      mealDate: '2026-08-15',
      title: 'Barbecue du dimanche',
      description: 'Ajouter les salades et les sauces',
      assignees: ['MAMIE', 'THOMAS'],
      voteCount: 11,
      dishes: [
        {
          title: 'Brochettes',
          recipe: 'Mariner plus longtemps puis griller.',
          photoUrls: ['https://images.example.com/brochettes.jpg']
        }
      ]
    });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
