import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { FAMILY_MEMBER_LABELS } from '../../core/constants/family-members';
import { MealAssignment } from '../../core/models/meal-assignment.model';
import { CalendarDay } from '../calendar/calendar.models';

export interface DayDetailSheetResult {
  date: string;
  meal?: MealAssignment;
}

@Component({
  selector: 'app-day-detail-modal',
  imports: [MatBottomSheetModule, MatButtonModule],
  templateUrl: './day-detail-modal.component.html',
  styleUrl: './day-detail-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayDetailModalComponent {
  private readonly bottomSheetRef = inject(MatBottomSheetRef<DayDetailModalComponent, DayDetailSheetResult>);

  readonly day = inject<CalendarDay>(MAT_BOTTOM_SHEET_DATA);
  readonly formattedDate = this.formatDate(this.day.isoDate);

  openEditor(): void {
    this.bottomSheetRef.dismiss({
      date: this.day.isoDate,
      meal: this.day.meal
    });
  }

  preparers(dish: { preparers: string[] }): string {
    return dish.preparers.map((p) => FAMILY_MEMBER_LABELS[p as keyof typeof FAMILY_MEMBER_LABELS]).join(', ');
  }

  voteAverage(votes: number[]): string {
    if (votes.length === 0) return '–';
    const avg = votes.reduce((sum, v) => sum + v, 0) / votes.length;
    return avg.toFixed(1);
  }

  photoCount(photoUrls: string[]): string {
    return `${photoUrls.length} photo${photoUrls.length > 1 ? 's' : ''}`;
  }

  private formatDate(isoDate: string): string {
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(`${isoDate}T12:00:00`));

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }
}
