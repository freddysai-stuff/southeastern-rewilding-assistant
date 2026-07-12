/**
 * SERA Design Tokens
 * Extracted from the Southeastern Rewilding Assistant logo + mobile/desktop mockups.
 * Framework-agnostic plain values so both the web (React) and mobile (React Native) apps
 * can consume the same source of truth.
 */

export const colors = {
  // Brand / primary
  primaryGreen: '#4A7C3F', // native foliage, primary buttons
  deepForestGreen: '#2E4A2E', // nav bars, module titles, header text
  earthBrown: '#8B5A2B', // soil, grounding elements, trunk tones
  pollinatorOrange: '#E8871E', // butterfly / warm accents
  wildflowerPink: '#D9739F', // coneflower / floral accents
  wildflowerBlue: '#6E7FC9', // lupine accent
  skyBlue: '#BFE0E8', // header background gradient (top)
  sunYellow: '#F4C430', // sun / warm highlights
  cream: '#FBF3DD', // app background / card surface (parchment tone from mockups)
  surface: '#FFFFFF',
  textPrimary: '#2B2B24',
  textSecondary: '#5C5C50',
  border: '#E3D9BE',
  success: '#4A7C3F',
  warning: '#E8871E',
  danger: '#C1442C',
} as const;

export const typography = {
  fontFamily: "'Nunito', 'Inter', system-ui, sans-serif",
  scale: {
    h1: { size: 32, weight: 700, lineHeight: 40 },
    h2: { size: 24, weight: 700, lineHeight: 32 },
    h3: { size: 18, weight: 600, lineHeight: 24 },
    bodyLg: { size: 16, weight: 400, lineHeight: 24 },
    bodyMd: { size: 14, weight: 400, lineHeight: 20 },
    bodySm: { size: 12, weight: 400, lineHeight: 16 },
    labelSm: { size: 11, weight: 600, lineHeight: 14 },
    button: { size: 14, weight: 700, lineHeight: 20 },
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  mobile: 8,
  desktop: 10,
  card: 12,
} as const;

export const shadow = {
  card: '0 2px 8px rgba(43, 43, 36, 0.12)',
  raised: '0 4px 16px rgba(43, 43, 36, 0.16)',
} as const;

export const breakpoints = {
  mobile: 0,
  tablet: 600,
  desktop: 900,
} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
