import {
  getColorThemes,
  getContrastRatio,
  isAccessiblePair,
  pickRandomColorTheme,
} from './color-theme.helper';

describe('color-theme.helper', () => {
  let styles: CSSStyleDeclaration;

  beforeEach(() => {
    document.documentElement.style.setProperty('--color-theme-size', '16');
    [
      ['Atelier d’hiver', '#e7e2d8', '#2c241d', '#5d4d3f', '#42523e', '#4d4338', '#4c5a5f', '#f3ede3', '#704d3a', '#f9e4b7', '#f9e4b7'],
      ['Craie et cuivre', '#ead7cc', '#332821', '#8a5038', '#355d76', '#675247', '#6a4131', '#fbefe3', '#355d76', '#f3c45a', '#f3c45a'],
      ['Bibliothèque moderniste', '#d5cec3', '#2b2620', '#304f73', '#5b4634', '#4b5a63', '#26343c', '#f1ece3', '#704d3a', '#e0c37e', '#e0c37e'],
      ['Jardin suspendu', '#d8e3c4', '#263126', '#3d5a38', '#49666a', '#6a5d44', '#4c6250', '#eff3e8', '#49666a', '#f3d792', '#f3d792'],
      ['Béton et sauge', '#d7d6cf', '#25282a', '#4a5051', '#6b5142', '#475b55', '#53615b', '#f1f0ea', '#375c7b', '#f1e6d0', '#f1e6d0'],
      ['Côte minérale', '#d2dde4', '#21303a', '#2f5d7b', '#42523e', '#5c5148', '#3a5566', '#f2f4f1', '#7a523f', '#f2d48a', '#f2d48a'],
      ['Ocre silencieux', '#e7d1b6', '#2f251d', '#704d3a', '#3d5a42', '#655347', '#7a4d38', '#f9efe0', '#3d5a42', '#f5dd96', '#f5dd96'],
      ['Bleu céramique', '#cfe0ea', '#22303b', '#1f5376', '#5b4336', '#4d5f66', '#3c6277', '#f1f5f6', '#38607b', '#ffd28e', '#ffd28e'],
      ['Argile éditoriale', '#e4cbc6', '#33241f', '#7a473e', '#41586d', '#6a504c', '#654740', '#f9ede7', '#41586d', '#f2c97b', '#f2c97b'],
      ['Galerie nordique', '#dfe4e6', '#2b2f31', '#50646e', '#725443', '#4d5b57', '#5e6970', '#f7f5ef', '#3f5f75', '#f3e7d4', '#f3e7d4'],
      ['Nocturne feutré', '#d7cad7', '#241f23', '#5d4862', '#35556b', '#65504d', '#433742', '#f2ebeb', '#6b4a3a', '#e5c68a', '#e5c68a'],
      ['Verre fumé', '#d3e0d9', '#253033', '#48605b', '#654b3d', '#4b5d59', '#4b625f', '#f2f5f0', '#40657a', '#e6dbc7', '#e6dbc7'],
      ['Terre moderniste', '#e5ccb3', '#2e261f', '#6a4b36', '#3e5a42', '#5d4d3f', '#725847', '#f8eee2', '#6a4b36', '#f5dd98', '#f5dd98'],
      ['Brume d’atelier', '#d9dad6', '#292826', '#58564d', '#405e70', '#4d4338', '#505a59', '#f4f1ea', '#405e70', '#e7ddd1', '#e7ddd1'],
      ['Pins et travertin', '#ddd1b9', '#27241e', '#5d5945', '#3f5a40', '#6a5345', '#55604a', '#f3ede2', '#3f5b6d', '#eed79a', '#eed79a'],
      ['Mer intérieure', '#cddae1', '#203038', '#3e6170', '#5b473d', '#47605f', '#3c5d6c', '#eef3f1', '#36556a', '#f7dfab', '#f7dfab'],
    ].forEach(
      ([
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
      ], index) => {
      const offset = index + 1;
      document.documentElement.style.setProperty(`--color-theme-${offset}-name`, `"${name}"`);
      document.documentElement.style.setProperty(`--color-theme-${offset}-page-background`, pageBackground);
      document.documentElement.style.setProperty(`--color-theme-${offset}-page-text`, pageText);
      document.documentElement.style.setProperty(`--color-theme-${offset}-page-heading`, pageHeading);
      document.documentElement.style.setProperty(`--color-theme-${offset}-page-link`, pageLink);
      document.documentElement.style.setProperty(`--color-theme-${offset}-page-muted`, pageMuted);
      document.documentElement.style.setProperty(`--color-theme-${offset}-surface-background`, surfaceBackground);
      document.documentElement.style.setProperty(`--color-theme-${offset}-surface-text`, surfaceText);
      document.documentElement.style.setProperty(`--color-theme-${offset}-action`, action);
      document.documentElement.style.setProperty(`--color-theme-${offset}-accent-alt`, accentAlt);
      document.documentElement.style.setProperty(
        `--color-theme-${offset}-surface-accent-alt`,
        surfaceAccentAlt,
      );
    });
    styles = getComputedStyle(document.documentElement);
  });

  it('keeps every theme accessible on page and surface roles', () => {
    for (const theme of getColorThemes(styles)) {
      expect(isAccessiblePair(theme.pageText, theme.pageBackground, 4.5)).toBe(true);
      expect(isAccessiblePair(theme.pageHeading, theme.pageBackground, 4.5)).toBe(true);
      expect(isAccessiblePair(theme.pageLink, theme.pageBackground, 4.5)).toBe(true);
      expect(isAccessiblePair(theme.pageMuted, theme.pageBackground, 4.5)).toBe(true);
      expect(isAccessiblePair(theme.surfaceText, theme.surfaceBackground, 4.5)).toBe(true);
      expect(isAccessiblePair(theme.action, theme.pageBackground, 4.5)).toBe(true);
      expect(isAccessiblePair(theme.surfaceAccentAlt, theme.surfaceBackground, 4.5)).toBe(true);
    }
  });

  it('exposes the active theme names', () => {
    const themes = getColorThemes(styles);

    expect(themes[0]?.name).toBe('Atelier d’hiver');
    expect(themes[15]?.name).toBe('Mer intérieure');
  });

  it('computes contrast ratios correctly', () => {
    expect(getContrastRatio('#ffffff', '#010029')).toBeGreaterThan(15);
    expect(getContrastRatio('#010029', '#ffaa00')).toBeGreaterThan(7);
  });

  it('picks a random safe theme', () => {
    const themes = getColorThemes(styles);
    const theme = pickRandomColorTheme(themes, () => 0.2);

    expect(themes).toContain(theme);
  });
});
