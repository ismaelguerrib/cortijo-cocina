import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CalendarDayCellComponent, MealSelection } from './calendar-day-cell.component';
import { CalendarDay, buildCalendarGridCells } from './calendar.models';

@Component({
  selector: 'app-calendar-grid',
  imports: [CalendarDayCellComponent],
  templateUrl: './calendar-grid.component.html',
  styleUrl: './calendar-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarGridComponent {
  readonly days = input.required<CalendarDay[]>();
  readonly weekdayLabels = input.required<readonly string[]>();
  readonly daySelected = output<CalendarDay>();
  readonly mealSelected = output<MealSelection>();
  readonly cells = computed(() => buildCalendarGridCells(this.days()));
}
