import { colors, spacing, radius, typography } from '@sera/shared';

/**
 * Re-exports the shared design tokens for React Native StyleSheet usage.
 * Kept in sync with the web design system (frontend/src/design-system/theme.ts)
 * and the raw values in shared/src/design-tokens.ts.
 */
export const theme = {
  colors,
  spacing,
  radius,
  typography,
} as const;
