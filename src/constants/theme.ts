/**
 * Luthifer's "Workshop '97" look: dark wood, maple panels with bevelled edges,
 * rust title bars and amber LCD readouts.
 */

export const Palette = {
  // Surfaces
  wood: '#4A2C1A',
  maple: '#E9CFA0',
  paper: '#FBF3E2',
  field: '#FFFBF0',
  fieldFocus: '#FFF3D0',
  panel: '#6E4B2E',
  zebra: '#F6E3C0',
  rowLine: '#E2CDA6',
  chip: '#F2DFB8',
  toggleUp: '#D7B47C',
  brass: '#C8932E',
  brassLight: '#F6DE9C',

  // Bevels
  bevelLight: '#FFF6E2',
  bevelDark: '#6E4B2E',
  bevelShadow: '#24130A',

  // Title bars
  titleFrom: '#5E1F10',
  titleTo: '#A5471E',
  titleText: '#FFF1D6',
  titleWarn: '#FFD58A',

  // Text
  ink: '#2A1A10',
  inkSoft: '#5A3D26',
  inkMuted: '#6E4B2E',
  inkDeep: '#1C0F07',
  cream: '#F6E2B8',
  rust: '#8A3A16',
  bassRed: '#A5361A',

  // LCD
  lcdBg: '#1C120A',
  lcd: '#FFB347',
  lcdBevelDark: '#24130A',
  lcdBevelLight: '#8A6A4A',
} as const;

/** Font family names as registered by the @expo-google-fonts packages (loaded in the root layout). */
export const Fonts = {
  display: 'Silkscreen_400Regular',
  displayBold: 'Silkscreen_700Bold',
  body: 'Bitter_400Regular',
  bodyItalic: 'Bitter_400Regular_Italic',
  bodySemi: 'Bitter_600SemiBold',
  bodyBold: 'Bitter_700Bold',
  lcd: 'VT323_400Regular',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 560;
