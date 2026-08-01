import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FAMILY_MEMBER_LABELS } from '../../core/constants/family-members';
import { CalendarDayCellComponent, MealSelection } from './calendar-day-cell.component';
import {
  CalendarDay,
  CalendarPairRow,
  buildCalendarGridCells,
  buildCalendarPairRows,
} from './calendar.models';

export type CalendarLayoutMode = 'grid' | 'pairs';

@Component({
  selector: 'app-calendar-grid',
  imports: [CalendarDayCellComponent],
  templateUrl: './calendar-grid.component.html',
  styleUrl: './calendar-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarGridComponent {
  readonly days = input.required<CalendarDay[]>();
  readonly weekdayLabels = input.required<readonly string[]>();
  readonly layoutMode = input<CalendarLayoutMode>('grid');
  readonly daySelected = output<CalendarDay>();
  readonly mealSelected = output<MealSelection>();
  readonly cells = computed(() => buildCalendarGridCells(this.days()));
  readonly pairRows = computed(() => buildCalendarPairRows(this.days()));

  trackPairRow(index: number, row: CalendarPairRow): string {
    return `${index}-${row.left?.isoDate ?? 'empty'}-${row.right?.isoDate ?? 'empty'}`;
  }

  openDay(day: CalendarDay): void {
    this.daySelected.emit(day);
  }

  cookerSummary(day: CalendarDay): string {
    if (!day.meal) {
      return 'Aucun plat prevu';
    }

    const cookers = Array.from(
      new Set(
        day.meal.dishes.flatMap((dish) =>
          (dish.cookers ?? []).map((cooker) => FAMILY_MEMBER_LABELS[cooker] ?? cooker),
        ),
      ),
    );

    return cookers.length > 0 ? cookers.join(', ') : 'Aucun cusinier renseigne';
  }

  mealSummary(day: CalendarDay): string {
    if (!day.meal) {
      return 'Ajouter un repas';
    }

    return `${day.meal.dishes.length} plat${day.meal.dishes.length > 1 ? 's' : ''}`;
  }
}
