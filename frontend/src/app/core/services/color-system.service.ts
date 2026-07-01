import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import {
  getColorThemes,
  pickRandomColorTheme,
  type ColorTheme,
} from '../utils/color-theme.helper';

@Injectable({ providedIn: 'root' })
export class ColorSystemService {
  private readonly document = inject(DOCUMENT);
  private initialized = false;
  private themes: readonly ColorTheme[] = [];
  private readonly currentThemeNameState = signal('');
  readonly currentThemeName = this.currentThemeNameState.asReadonly();

  initialize(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.loadThemeData();

    if (this.themes.length === 0) {
      return;
    }

    this.initialized = true;
    const initialTheme = pickRandomColorTheme(this.themes);
    this.applyTheme(initialTheme);
  }

  private applyTheme(theme: ColorTheme): void {
    const root = this.document.documentElement;
    const strong = theme.pageHeading === theme.pageText ? theme.action : theme.pageHeading;
    this.currentThemeNameState.set(theme.name);

    this.setColor(root, 'color-white', '#ffffff');
    this.setColor(root, 'color-cream', theme.pageBackground);
    this.setColor(root, 'color-pink', theme.pageBackground);
    this.setColor(root, 'color-red', theme.action);
    this.setColor(root, 'color-yellow', theme.accentAlt);
    this.setColor(root, 'color-blue', theme.pageHeading);
    this.setColor(root, 'color-green', theme.pageLink);

    this.setColor(root, 'app-page-bg', theme.pageBackground);
    this.setColor(root, 'app-surface-cream', theme.pageBackground);
    this.setColor(root, 'app-surface-white', theme.pageBackground);
    this.setColor(root, 'app-surface-yellow', theme.surfaceBackground);
    this.setColor(root, 'app-surface-blue', theme.surfaceBackground);
    this.setColor(root, 'app-surface-pink', theme.pageBackground);
    this.setColor(root, 'app-surface-green', theme.surfaceBackground);
    this.setColor(root, 'app-surface-red', theme.surfaceBackground);
    this.setColor(root, 'app-surface-panel', theme.pageBackground);
    this.setColor(root, 'app-surface-section', theme.pageBackground);
    this.setColor(root, 'app-surface-highlight', theme.pageLink);
    this.setColor(root, 'app-text-color', theme.pageText);
    this.setColor(root, 'app-text-color-strong', strong);
    this.setColor(root, 'app-text-muted', theme.pageMuted);
    this.setColor(root, 'app-text-inverse', theme.surfaceText);
    this.setColor(root, 'app-link-color', theme.pageLink);
    this.setColor(root, 'app-heading-color', theme.pageHeading);
    this.setColor(root, 'app-icon-color', theme.pageLink);
    this.setColor(root, 'app-section-color', theme.surfaceBackground);
    this.setColor(root, 'app-accent-color', theme.action);
    this.setColor(root, 'app-accent-alt-color', theme.accentAlt);
    this.setColor(root, 'app-accent-alt-on-surface', theme.surfaceAccentAlt);
    this.setColor(root, 'app-outline-color', theme.pageLink);
    root.style.setProperty('--app-theme-name', `"${theme.name}"`);
    root.style.setProperty('--app-scroll-progress', '0');
  }

  private loadThemeData(): void {
    if (this.themes.length > 0) {
      return;
    }

    const styles = getComputedStyle(this.document.documentElement);
    this.themes = getColorThemes(styles);
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
