export const typography = {
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
} as const;

export type ThemeTypography = typeof typography;
