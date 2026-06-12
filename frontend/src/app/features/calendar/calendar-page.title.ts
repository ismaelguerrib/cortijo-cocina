import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-calendar-page-title',
  template: `
    <section class="hero-card">
      <h1>{{ monthLabel() }}</h1>
      <p class="hero-card__caption">¿Quién cocina esta noche?</p>
    </section>
  `,
  styles: `
    .hero-card {
      display: grid;
      gap: 0.55rem;
      padding: 1.4rem 1.15rem 1.2rem;
      border: 1px solid rgba(231, 54, 46, 0.4);
      border-radius: var(--app-radius-xl);
      color: var(--color-sabro-cream);
      background: rgba(43, 107, 77, 0.94);
      box-shadow: 0 24px 54px rgba(43, 107, 77, 0.22);
    }

    .hero-card h1,
    .hero-card p {
      margin: 0;
    }

    .hero-card h1 {
      font-family: var(--app-display-font);
      font-size: clamp(2rem, 6vw, 3.4rem);
      line-height: 0.96;
      color: var(--color-sabro-chili);
      text-shadow: 0 3px 0 rgba(0, 0, 0, 0.12);
    }

    .hero-card__eyebrow {
      font-family: var(--app-subtitle-font);
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--color-sabro-cream);
    }

    .hero-card__caption {
      max-width: 18rem;
      font-family: var(--app-subtitle-font);
      color: var(--color-sabro-cream);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPageTitleComponent {
  readonly monthLabel = input.required<string>();
}
