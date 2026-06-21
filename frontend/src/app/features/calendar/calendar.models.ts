import { AUGUST_2026_DAYS, CALENDAR_WEEKDAY_LABELS } from '../../core/constants/calendar.constants';
import { MealAssignment } from '../../core/models/meal-assignment.model';

export interface CalendarDay {
  isoDate: string;
  dayNumber: number;
  weekdayLabel: string;
  meal?: MealAssignment;
}

export interface CalendarPairRow {
  left: CalendarDay | null;
  right: CalendarDay | null;
}

const mondayBasedIndex = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
};

export const buildAugust2026CalendarDays = (
  mealsByDate: Map<string, MealAssignment>
): CalendarDay[] =>
  Array.from({ length: AUGUST_2026_DAYS }, (_, index) => {
    const dayNumber = index + 1;
    const isoDate = `2026-08-${String(dayNumber).padStart(2, '0')}`;
    const date = new Date(`${isoDate}T12:00:00`);

    return {
      isoDate,
      dayNumber,
      weekdayLabel: CALENDAR_WEEKDAY_LABELS[mondayBasedIndex(date)],
      meal: mealsByDate.get(isoDate)
    };
  });

export const buildCalendarGridCells = (days: CalendarDay[]): Array<CalendarDay | null> => {
  if (days.length === 0) {
    return [];
  }

  const firstDay = new Date(`${days[0].isoDate}T12:00:00`);
  const startOffset = mondayBasedIndex(firstDay);

  return [...Array.from({ length: startOffset }, () => null), ...days];
};

export const buildCalendarPairRows = (days: CalendarDay[]): CalendarPairRow[] => {
  const rows: CalendarPairRow[] = [];

  for (let index = 0; index < days.length; index += 2) {
    rows.push({
      left: days[index] ?? null,
      right: days[index + 1] ?? null,
    });
  }

  return rows;
};
