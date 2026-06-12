import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MealAssignment } from '../../core/models/meal-assignment.model';
import { MealStore } from '../../core/services/meal-store.service';
import { CalendarPageComponent } from './calendar-page.component';

class MockMealStore {
  readonly meals = signal<MealAssignment[]>([
    {
      id: 'meal-15',
      mealDate: '2026-08-15',
      title: 'Grand dejeuner du jardin',
      description: 'On rassemble tous les favoris de la semaine.',
      assignees: ['JULIE', 'CLAIRE'],
      voteCount: 9,
      dishes: [
        {
          title: 'Salade composee',
          recipe: 'Assembler tomates, feta et herbes.',
          photoUrls: ['https://images.example.com/salade.jpg']
        },
        {
          title: 'Tortilla',
          recipe: 'Cuire doucement les pommes de terre et les oeufs.',
          photoUrls: ['https://images.example.com/tortilla.jpg']
        }
      ],
      createdAt: '2026-05-29T10:00:00.000Z',
      updatedAt: '2026-05-29T10:00:00.000Z'
    }
  ]);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly mealsByDate = computed(() => new Map(this.meals().map((meal) => [meal.mealDate, meal] as const)));

  readonly loadMeals = jest.fn().mockResolvedValue(undefined);
}

describe('CalendarPageComponent', () => {
  let fixture: ComponentFixture<CalendarPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarPageComponent, NoopAnimationsModule],
      providers: [
        {
          provide: MealStore,
          useClass: MockMealStore
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the 31 days of August 2026', () => {
    const dayCells = fixture.debugElement.queryAll(By.css('[data-testid="day-cell"]'));
    expect(dayCells).toHaveLength(31);
  });

  it('opens the day detail sheet and shows multiple assignees', async () => {
    const dayCells = fixture.debugElement.queryAll(By.css('[data-testid="day-cell"]'));

    dayCells[14].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.body.textContent).toContain('Samedi 15 août 2026');
    expect(document.body.textContent).toContain('Julie, Claire');
    expect(document.body.textContent).toContain('Grand dejeuner du jardin');
  });

  it('opens the editor modal from a detail sheet action', async () => {
    const dayCells = fixture.debugElement.queryAll(By.css('[data-testid="day-cell"]'));

    dayCells[14].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const editButton = Array.from(document.body.querySelectorAll('[data-testid="detail-edit-button"]'))[0];
    (editButton as HTMLButtonElement).click();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.body.textContent).toContain('Modifier un repas');
  });
});
