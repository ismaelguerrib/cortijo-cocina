import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { BACKGROUND_ITEMS } from './core/constants/background.constants';
import { ColorSystemService } from './core/services/color-system.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly colorSystem = inject(ColorSystemService);
  protected readonly backgroundItems = BACKGROUND_ITEMS;

  constructor() {
    afterNextRender(() => this.colorSystem.initialize());
  }
}
