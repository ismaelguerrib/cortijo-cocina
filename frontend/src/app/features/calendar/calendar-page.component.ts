import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CALENDAR_MONTH_LABEL,
  CALENDAR_WEEKDAY_LABELS,
} from '../../core/constants/calendar.constants';
import { MealAssignment } from '../../core/models/meal-assignment.model';
import { MealStore } from '../../core/services/meal-store.service';
import {
  DayDetailModalComponent,
  DayDetailSheetResult,
} from '../day-detail/day-detail-modal.component';
import {
  MealEditorDialogData,
  MealEditorModalComponent,
} from '../meal-editor/meal-editor-modal.component';
import { CalendarLayoutMode, CalendarGridComponent } from './calendar-grid.component';
import { CalendarPageTitleComponent } from './calendar-page.title';
import { buildAugust2026CalendarDays, CalendarDay } from './calendar.models';

@Component({
  selector: 'app-calendar-page',
  imports: [
    CalendarGridComponent,
    CalendarPageTitleComponent,
    MatBottomSheetModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  // Mobile-first default: the 7-column month grid is too cramped to tap on a
  // phone, so start on the "2 jours" (pairs) view below $bp-md (48rem). The
  // view switch remains available for users who want the month grid.
  readonly layoutMode = signal<CalendarLayoutMode>(this.resolveInitialLayoutMode());

  readonly quotes = [
    `Il y a deux choses dont j'ai horreur sur cette terre : l'emmental à la place de la mozza sur une pizza et l'amateurisme !`,
    'Le meilleur moyen de coloniser quotidien des gens par des mécanismes de contrôle renforcé et global consiste à solliciter non pas seulement leur approbation, mais leur contribution active.',
    'Si les animaux avaient instagram Zakaria aurait déjà un compte certifié.',
    'Vous vous la jouez solo ...',
    'La Paques elle est foutue.',
    'Elle vaut rien la copine !',
    `Non Mamooon !`,
    `Aujourd'hui Mickey avonce.`,
    `Je suis Punk !`,
    `Je suis faciné par les histoires de gangs d'Atlanta!`,
    `Séance dikeur à azahara ! `,
    `Le riz se multiplie à la cuisson.`,
    `Moi je ne mange pas sur une aire d'autoroute !`,
    `Ouvre tes yeux Salomon.`,
    `Boulangeeeurie !`,
    `C'est bon je suis là !`,
  ];

  readonly randomQuote: string = this.quotes[Math.floor(Math.random() * this.quotes.length)];
  async ngOnInit(): Promise<void> {
    await this.mealStore.loadMeals();
  }

  setLayoutMode(mode: CalendarLayoutMode): void {
    this.layoutMode.set(mode);
  }

  private resolveInitialLayoutMode(): CalendarLayoutMode {
    const isTabletUp =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 48rem)').matches;
    return isTabletUp ? 'grid' : 'pairs';
  }

  openDayDetail(day: CalendarDay): void {
    const bottomSheetRef = this.bottomSheet.open(DayDetailModalComponent, {
      data: day,
      panelClass: 'day-detail-sheet',
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
      meal,
    };

    this.dialog.open(MealEditorModalComponent, {
      data: dialogData,
      panelClass: 'meal-editor-dialog',
      width: 'min(100vw, var(--app-dialog-inline-max))',
      maxWidth: '100vw',
      height: 'var(--app-shell-min-block)',
    });
  }
}
