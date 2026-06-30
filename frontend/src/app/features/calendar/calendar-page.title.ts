import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-calendar-page-title',
  template: `
    <section class="hero-card">
      <h1>{{ monthLabel() }}</h1>
      <p class="hero-card__caption">
        ¿Quién cocina qué? ¿Cuándo? ¡Todos ponemos las manos en la masa!
      </p>
    </section>
  `,
  styles: `
    .hero-card {
      display: grid;
      gap: var(--app-space-sm);
      padding: var(--app-panel-padding) calc(var(--app-panel-padding) * 0.95)
        calc(var(--app-panel-padding) * 0.9);
      color: var(--app-text-color);
      background: transparent;
    }

    .hero-card h1,
    .hero-card p {
      margin: 0;
    }

    .hero-card h1 {
      font-family: var(--app-display-font);
      font-size: var(--app-font-display);
      line-height: 0.96;
      color: var(--app-heading-color);
      text-shadow: 0 var(--app-space-xs) 0 rgba(var(--app-text-color-strong-rgb), 0.12);
    }

    .hero-card__eyebrow {
      font-family: var(--app-subtitle-font);
      font-size: var(--app-font-caption);
      text-transform: uppercase;
      letter-spacing: var(--app-letter-spacing-wider);
      color: var(--color-cream);
    }

    .hero-card__caption {
      max-inline-size: var(--app-caption-max-inline);
      font-family: var(--app-subtitle-font);
      font-size: var(--app-font-label);
      color: var(--app-text-color);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPageTitleComponent {
  readonly monthLabel = input.required<string>();
}
