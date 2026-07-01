export type ColorTheme = {
  readonly name: string;
  readonly pageBackground: string;
  readonly pageText: string;
  readonly pageHeading: string;
  readonly pageLink: string;
  readonly pageMuted: string;
  readonly surfaceBackground: string;
  readonly surfaceText: string;
  readonly action: string;
  readonly accentAlt: string;
  readonly surfaceAccentAlt: string;
};

const COLOR_THEME_SIZE_VAR = '--color-theme-size';
const COLOR_THEME_PREFIX = '--color-theme-';

const isHexColor = (value: string): boolean => /^#[0-9a-f]{6}$/i.test(value.trim());
const readRawVar = (styles: CSSStyleDeclaration, name: string): string =>
  styles.getPropertyValue(name).trim();
const readVar = (styles: CSSStyleDeclaration, name: string): string => readRawVar(styles, name).toLowerCase();
const readThemeName = (styles: CSSStyleDeclaration, name: string): string =>
  readRawVar(styles, name).replace(/^['"]|['"]$/g, '');
const readSize = (styles: CSSStyleDeclaration, name: string): number => {
  const parsed = Number.parseInt(readVar(styles, name), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const hexToRgb = (hex: string): { red: number; green: number; blue: number } => ({
  red: Number.parseInt(hex.slice(1, 3), 16),
  green: Number.parseInt(hex.slice(3, 5), 16),
  blue: Number.parseInt(hex.slice(5, 7), 16),
});

export const getRelativeLuminance = (hex: string): number => {
  const { red, green, blue } = hexToRgb(hex);
  const [r, g, b] = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
};

export const getContrastRatio = (foreground: string, background: string): number => {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  const brightest = Math.max(foregroundLuminance, backgroundLuminance);
  const darkest = Math.min(foregroundLuminance, backgroundLuminance);

  return (brightest + 0.05) / (darkest + 0.05);
};

export const isAccessiblePair = (
  foreground: string,
  background: string,
  minimumRatio = 4.5,
): boolean => getContrastRatio(foreground, background) >= minimumRatio;

export const getColorThemes = (styles: CSSStyleDeclaration): readonly ColorTheme[] => {
  const size = readSize(styles, COLOR_THEME_SIZE_VAR);

  return Array.from({ length: size }, (_, index) => {
    const offset = index + 1;
    const name = readThemeName(styles, `${COLOR_THEME_PREFIX}${offset}-name`);
    const pageBackground = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-page-background`);
    const pageText = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-page-text`);
    const pageHeading = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-page-heading`) || pageText;
    const pageLink = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-page-link`) || pageHeading;
    const pageMuted = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-page-muted`) || pageText;
    const surfaceBackground = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-surface-background`);
    const surfaceText = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-surface-text`);
    const action = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-action`) || pageHeading;
    const accentAlt = readVar(styles, `${COLOR_THEME_PREFIX}${offset}-accent-alt`) || surfaceText;
    const surfaceAccentAlt =
      readVar(styles, `${COLOR_THEME_PREFIX}${offset}-surface-accent-alt`) || accentAlt;

    return {
      name,
      pageBackground,
      pageText,
      pageHeading,
      pageLink,
      pageMuted,
      surfaceBackground,
      surfaceText,
      action,
      accentAlt,
      surfaceAccentAlt,
    };
  }).filter(
    (theme) =>
      theme.name.length > 0 &&
      isHexColor(theme.pageBackground) &&
      isHexColor(theme.pageText) &&
      isHexColor(theme.pageHeading) &&
      isHexColor(theme.pageLink) &&
      isHexColor(theme.pageMuted) &&
      isHexColor(theme.surfaceBackground) &&
      isHexColor(theme.surfaceText) &&
      isHexColor(theme.action) &&
      isHexColor(theme.accentAlt) &&
      isHexColor(theme.surfaceAccentAlt),
  );
};

export const pickRandomColorTheme = (
  themes: readonly ColorTheme[],
  random = Math.random,
): ColorTheme => themes[Math.floor(random() * themes.length)] ?? themes[0];
