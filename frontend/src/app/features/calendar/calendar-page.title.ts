import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-calendar-page-title',
  template: `
    <section class="hero-card">
      <p class="hero-card__eyebrow">Calendrier familial</p>
      <h1>{{ monthLabel() }}</h1>
      <p class="hero-card__caption">Un repas par jour, des votes cumulés, plusieurs plats documentés.</p>
    </section>
  `,
  styles: `
    .hero-card {
      display: grid;
      gap: 0.55rem;
      padding: 1.4rem 1.15rem 1.2rem;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: var(--app-radius-xl);
      color: var(--app-text-inverse);
      background:
        radial-gradient(circle at top right, rgba(252, 213, 129, 0.22), transparent 26%),
        linear-gradient(145deg, #d52941, #990d35 76%);
      box-shadow: 0 24px 54px rgba(153, 13, 53, 0.25);
    }

    .hero-card h1,
    .hero-card p {
      margin: 0;
    }

    .hero-card h1 {
      font-family: var(--app-display-font);
      font-size: clamp(2rem, 6vw, 3.4rem);
      line-height: 0.96;
      text-shadow: 0 3px 0 rgba(0, 0, 0, 0.12);
    }

    .hero-card__eyebrow {
      font-family: var(--app-ui-font);
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      opacity: 0.88;
    }

    .hero-card__caption {
      max-width: 18rem;
      color: rgba(255, 248, 247, 0.9);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarPageTitleComponent {
  readonly monthLabel = input.required<string>();
}
