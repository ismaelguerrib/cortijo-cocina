import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarDayCellComponent {
  readonly day = input.required<CalendarDay>();
  readonly daySelected = output<CalendarDay>();
  readonly mealSelected = output<MealSelection>();

  openDayDetail(): void {
    this.daySelected.emit(this.day());
  }

  openMealEditor(event: Event): void {
    event.stopPropagation();

    this.mealSelected.emit({
      date: this.day().isoDate,
      meal: this.day().meal
    });
  }

  assigneeSummary(): string {
    const preparers = this.day().meal?.dishes.flatMap((dish) => dish.preparers) ?? [];
    const unique = [...new Set(preparers)];
    return unique.map((p) => FAMILY_MEMBER_LABELS[p]).join(', ');
  }

  dishPreview(): string {
    return this.day().meal?.dishes.slice(0, 2).map((dish) => dish.title).join(' · ') ?? '';
  }
}
