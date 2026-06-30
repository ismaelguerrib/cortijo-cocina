import { DOCUMENT } from '@angular/common';
import { inject, Injectable, NgZone } from '@angular/core';

type ColorRoles = {
  readonly accent: string;
  readonly accentAlt: string;
  readonly heading: string;
  readonly icon: string;
  readonly inverse: string;
  readonly link: string;
  readonly outline: string;
  readonly panel: string;
  readonly section: string;
  readonly strong: string;
  readonly surface: string;
  readonly text: string;
  readonly muted: string;
};

const WHITE = '#ffffff';

@Injectable({ providedIn: 'root' })
export class ColorSystemService {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private initialized = false;
  private palette: string[] = [];
  private seedOffset = 0;

  initialize(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.palette = this.readPalette();

    if (this.palette.length === 0) {
      return;
    }

    this.initialized = true;
    this.seedOffset = Math.floor(Math.random() * this.palette.length);
    this.applyColors(this.getScrollProgress());

    this.zone.runOutsideAngular(() => {
      let ticking = false;

      const update = () => {
        ticking = false;
        this.applyColors(this.getScrollProgress());
      };

      const scheduleUpdate = () => {
        if (ticking) {
          return;
        }

        ticking = true;
        window.requestAnimationFrame(update);
      };

      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      window.addEventListener('resize', scheduleUpdate, { passive: true });
    });
  }

  private applyColors(progress: number): void {
    const root = this.document.documentElement;
    const roles = this.buildRoles(progress);

    this.setColor(root, 'color-white', WHITE);
    this.setColor(root, 'color-cream', WHITE);
    this.setColor(root, 'color-pink', roles.surface);
    this.setColor(root, 'color-red', roles.accent);
    this.setColor(root, 'color-yellow', roles.accentAlt);
    this.setColor(root, 'color-blue', roles.heading);
    this.setColor(root, 'color-green', roles.outline);

    this.setColor(root, 'app-page-bg', WHITE);
    this.setColor(root, 'app-surface-cream', roles.surface);
    this.setColor(root, 'app-surface-white', WHITE);
    this.setColor(root, 'app-surface-yellow', roles.accentAlt);
    this.setColor(root, 'app-surface-blue', roles.panel);
    this.setColor(root, 'app-surface-pink', roles.section);
    this.setColor(root, 'app-surface-green', roles.outline);
    this.setColor(root, 'app-surface-red', roles.accent);
    this.setColor(root, 'app-surface-panel', roles.panel);
    this.setColor(root, 'app-surface-section', roles.section);
    this.setColor(root, 'app-surface-highlight', roles.accentAlt);
    this.setColor(root, 'app-text-color', roles.text);
    this.setColor(root, 'app-text-color-strong', roles.strong);
    this.setColor(root, 'app-text-muted', roles.muted);
    this.setColor(root, 'app-text-inverse', roles.inverse);
    this.setColor(root, 'app-link-color', roles.link);
    this.setColor(root, 'app-heading-color', roles.heading);
    this.setColor(root, 'app-icon-color', roles.icon);
    this.setColor(root, 'app-section-color', roles.section);
    this.setColor(root, 'app-accent-color', roles.accent);
    this.setColor(root, 'app-accent-alt-color', roles.accentAlt);
    this.setColor(root, 'app-outline-color', roles.outline);
    root.style.setProperty('--app-scroll-progress', progress.toFixed(4));
  }

  private buildRoles(progress: number): ColorRoles {
    const phase = Math.round(progress * Math.max(this.palette.length - 1, 0));
    const rotated = this.rotatePalette((this.seedOffset + phase) % this.palette.length);
    const surface = rotated[1];
    const panel = rotated[3];
    const section = rotated[4];
    const accent = rotated[5];
    const accentAlt = rotated[6];
    const outline = rotated[7];
    const text = this.pickAccessibleColor(WHITE, rotated, [], 4.5);
    const strong = this.pickAccessibleColor(WHITE, rotated, [text], 7);
    const muted = this.pickAccessibleColor(WHITE, rotated, [text, strong], 3);
    const heading = this.pickAccessibleColor(WHITE, rotated, [text, strong, muted], 4.5);
    const link = this.pickAccessibleColor(WHITE, rotated, [text, strong, muted, heading], 4.5);
    const icon = this.pickAccessibleColor(
      panel,
      rotated,
      [WHITE, surface, text, strong, muted, heading, link],
      3,
    );
    const inverse = this.pickAccessibleColor(accent, rotated, [accent, heading], 4.5);

    return {
      accent,
      accentAlt,
      heading,
      icon,
      inverse,
      link,
      outline,
      panel,
      section,
      strong,
      surface,
      text,
      muted,
    };
  }

  private readPalette(): string[] {
    const rootStyle = getComputedStyle(this.document.documentElement);
    const size = Number.parseInt(rootStyle.getPropertyValue('--palette-size').trim(), 10);

    if (!Number.isFinite(size) || size <= 0) {
      return [];
    }

    return Array.from({ length: size }, (_, index) =>
      rootStyle.getPropertyValue(`--palette-color-${index + 1}`).trim().toLowerCase(),
    ).filter((value): value is string => /^#[0-9a-f]{6}$/.test(value));
  }

  private getScrollProgress(): number {
    const scrollHeight = Math.max(
      this.document.documentElement.scrollHeight - window.innerHeight,
      0,
    );

    if (scrollHeight === 0) {
      return 0;
    }

    return Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
  }

  private rotatePalette(offset: number): string[] {
    return this.palette.map((_, index) => this.palette[(index + offset) % this.palette.length]);
  }

  private pickAccessibleColor(
    base: string,
    candidates: string[],
    exclude: string[] = [],
    minimumContrast = 4.5,
  ): string {
    const eligible = candidates.filter(
      (color) => !exclude.includes(color) && this.contrastRatio(base, color) >= minimumContrast,
    );

    if (eligible.length > 0) {
      return eligible[0];
    }

    return this.pickBestContrast(base, exclude, candidates);
  }

  private pickBestContrast(base: string, exclude: string[] = [], pool = this.palette): string {
    const candidate = pool
      .filter((color) => !exclude.includes(color))
      .map((color) => ({ color, contrast: this.contrastRatio(base, color) }))
      .sort((left, right) => right.contrast - left.contrast)[0];

    return candidate?.color ?? base;
  }

  private contrastRatio(left: string, right: string): number {
    const leftLuminance = this.relativeLuminance(left);
    const rightLuminance = this.relativeLuminance(right);
    const brightest = Math.max(leftLuminance, rightLuminance);
    const darkest = Math.min(leftLuminance, rightLuminance);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  private relativeLuminance(hex: string): number {
    const { blue, green, red } = this.hexToRgb(hex);
    const [r, g, b] = [red, green, blue].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  }

  private setColor(root: HTMLElement, name: string, hex: string): void {
    const { blue, green, red } = this.hexToRgb(hex);
    root.style.setProperty(`--${name}`, hex);
    root.style.setProperty(`--${name}-rgb`, `${red}, ${green}, ${blue}`);
  }

  private hexToRgb(hex: string): { red: number; green: number; blue: number } {
    return {
      red: Number.parseInt(hex.slice(1, 3), 16),
      green: Number.parseInt(hex.slice(3, 5), 16),
      blue: Number.parseInt(hex.slice(5, 7), 16),
    };
  }
}
