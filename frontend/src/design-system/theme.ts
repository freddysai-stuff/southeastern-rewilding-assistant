import { colors, spacing, radius, breakpoints, typography, shadow } from '@sera/shared';

/**
 * Re-exports the shared design tokens for convenient importing within the
 * frontend app (`import { theme } from './design-system/theme'`).
 * The actual CSS custom properties are defined in `global.css`, generated
 * from these same source values — keep them in sync if you change one.
 */
export const theme = {
  colors,
  spacing,
  radius,
  breakpoints,
  typography,
  shadow,
} as const;

export type Theme = typeof theme;
