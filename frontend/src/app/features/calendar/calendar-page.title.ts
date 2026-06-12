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
      padding: 1.2rem 1rem 1.15rem;
      border-radius: 1.8rem;
      color: #fffaf4;
      background:
        linear-gradient(145deg, rgba(99, 45, 20, 0.9), rgba(165, 79, 33, 0.95)),
        linear-gradient(120deg, #7d3c1b, #b2622f);
      box-shadow: 0 24px 54px rgba(87, 40, 17, 0.18);
    }

    .hero-card h1,
    .hero-card p {
      margin: 0;
    }

    .hero-card h1 {
      font-family: var(--app-display-font);
      font-size: clamp(2rem, 6vw, 3.4rem);
      line-height: 0.92;
      letter-spacing: -0.05em;
    }

    .hero-card__eyebrow {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      opacity: 0.82;
    }

    .hero-card__caption {
      max-width: 18rem;
      color: rgba(255, 247, 238, 0.86);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarPageTitleComponent {
  readonly monthLabel = input.required<string>();
}
