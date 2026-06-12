import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CalendarPageTitleComponent } from './calendar-page.title';
import { CALENDAR_MONTH_LABEL, CALENDAR_WEEKDAY_LABELS } from '../../core/constants/calendar.constants';
import { MealAssignment } from '../../core/models/meal-assignment.model';
import { MealStore } from '../../core/services/meal-store.service';
import { DayDetailModalComponent, DayDetailSheetResult } from '../day-detail/day-detail-modal.component';
import { MealEditorDialogData, MealEditorModalComponent } from '../meal-editor/meal-editor-modal.component';
import { buildAugust2026CalendarDays, CalendarDay } from './calendar.models';
import { CalendarGridComponent } from './calendar-grid.component';

@Component({
  selector: 'app-calendar-page',
  imports: [
    CalendarGridComponent,
    CalendarPageTitleComponent,
    MatBottomSheetModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarPageComponent implements OnInit {
  private readonly mealStore = inject(MealStore);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly dialog = inject(MatDialog);

  readonly loading = this.mealStore.loading;
  readonly error = this.mealStore.error;
  readonly monthLabel = CALENDAR_MONTH_LABEL;
  readonly weekdayLabels = CALENDAR_WEEKDAY_LABELS;
  readonly days = computed(() => buildAugust2026CalendarDays(this.mealStore.mealsByDate()));

  async ngOnInit(): Promise<void> {
    await this.mealStore.loadMeals();
  }

  openDayDetail(day: CalendarDay): void {
    const bottomSheetRef = this.bottomSheet.open(DayDetailModalComponent, {
      data: day,
      panelClass: 'day-detail-sheet'
    });

    bottomSheetRef.afterDismissed().subscribe((result: DayDetailSheetResult | undefined) => {
      if (result) {
        this.openMealEditor(result.date, result.meal);
      }
    });
  }

  openMealEditor(date: string, meal?: MealAssignment): void {
    const dialogData: MealEditorDialogData = {
      date,
      meal
    };

    this.dialog.open(MealEditorModalComponent, {
      data: dialogData,
      panelClass: 'meal-editor-dialog',
      width: 'min(100vw, 36rem)',
      maxWidth: '100vw',
      height: '100dvh'
    });
  }
}
