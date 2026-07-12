import { colors, spacing, breakpoints, radius } from '../design-tokens';

describe('design tokens', () => {
  it('exposes the core brand color palette', () => {
    expect(colors.primaryGreen).toMatch(/^#[0-9a-f]{6}$/i);
    expect(colors.deepForestGreen).toBeDefined();
    expect(colors.earthBrown).toBeDefined();
    expect(colors.pollinatorOrange).toBeDefined();
  });

  it('defines an ordered spacing scale', () => {
    const values = Object.values(spacing);
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  it('defines mobile < tablet < desktop breakpoints', () => {
    expect(breakpoints.mobile).toBeLessThan(breakpoints.tablet);
    expect(breakpoints.tablet).toBeLessThan(breakpoints.desktop);
  });

  it('defines card radius values', () => {
    expect(radius.card).toBeGreaterThan(0);
  });
});
