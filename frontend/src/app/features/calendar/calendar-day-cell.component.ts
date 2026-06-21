import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FAMILY_MEMBER_LABELS } from '../../core/constants/family-members';
import { MealAssignment } from '../../core/models/meal-assignment.model';
import { CalendarDay } from './calendar.models';

export interface MealSelection {
  date: string;
  meal?: MealAssignment;
}

@Component({
  selector: 'app-calendar-day-cell',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './calendar-day-cell.component.html',
  styleUrl: './calendar-day-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayCellComponent {
  readonly day = input.required<CalendarDay>();
  readonly daySelected = output<CalendarDay>();
  readonly mealSelected = output<MealSelection>();

  readonly cookers = computed(() => {
    const meal = this.day().meal;

    if (!meal) {
      return [];
    }

    return Array.from(
      new Set(
        meal.dishes.flatMap((dish) =>
          (dish.cookers ?? []).map((cooker) => FAMILY_MEMBER_LABELS[cooker] ?? cooker),
        ),
      ),
    );
  });

  openDayDetail(): void {
    this.daySelected.emit(this.day());
  }

  openMealEditor(event: Event): void {
    event.stopPropagation();

    this.mealSelected.emit({
      date: this.day().isoDate,
      meal: this.day().meal,
    });
  }
}
