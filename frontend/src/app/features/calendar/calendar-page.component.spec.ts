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
      description: 'On rassemble tous les favoris de la semaine.',
      dishes: [
        {
          cookers: ['amel', 'zakaria'],
          title: 'Salade composee',
          recipe: 'Assembler tomates, feta et herbes.',
          photoUrls: ['https://images.example.com/salade.jpg'],
          votes: [16, 18],
        },
        {
          cookers: ['iman'],
          title: 'Tortilla',
          recipe: 'Cuire doucement les pommes de terre et les oeufs.',
          photoUrls: ['https://images.example.com/tortilla.jpg'],
          votes: [14],
        },
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

  // The mobile-first default is the "2 jours" (pairs) view; switch to the
  // month grid explicitly for grid-specific assertions.
  const switchToMonthGrid = (): void => {
    const toggleButtons = fixture.debugElement.queryAll(By.css('.hero__view-switch button'));
    toggleButtons[0].nativeElement.click();
    fixture.detectChanges();
  };

  it('renders the 31 days of August 2026', () => {
    switchToMonthGrid();
    const dayCells = fixture.debugElement.queryAll(By.css('[data-testid="day-cell"]'));
    expect(dayCells).toHaveLength(31);
  });

  it('defaults to the two-days-per-row layout on small screens', () => {
    const pairDays = fixture.debugElement.queryAll(By.css('[data-testid^="pair-day-"]'));
    expect(pairDays).toHaveLength(31);
  });

  it('can switch to the two-days-per-row layout', async () => {
    const toggleButtons = fixture.debugElement.queryAll(By.css('.hero__view-switch button'));

    toggleButtons[1].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const pairDays = fixture.debugElement.queryAll(By.css('[data-testid^="pair-day-"]'));
    expect(pairDays).toHaveLength(31);
    expect(fixture.nativeElement.textContent).toContain('Touchez pour ajouter un repas');
  });

  it('opens the day detail sheet and shows multiple assignees', async () => {
    switchToMonthGrid();
    const dayCells = fixture.debugElement.queryAll(By.css('[data-testid="day-cell"]'));

    dayCells[14].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.body.textContent).toContain('Samedi 15 août 2026');
    expect(document.body.textContent).toContain('Amel, Zakaria');
    expect(document.body.textContent).toContain('Salade composee');
  });

  it('opens the editor modal from a detail sheet action', async () => {
    switchToMonthGrid();
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
