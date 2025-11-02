export const typography = {
  // Display (large headers)
  display: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.5,
  },

  // Headers
  h1: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.5,
  },

  h2: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },

  h3: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as const,
    lineHeight: 24,
  },

  // Body
  body: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    fontWeight: '400' as const,
    lineHeight: 22,
  },

  bodyMedium: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    fontWeight: '500' as const,
    lineHeight: 22,
  },

  bodySemiBold: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as const,
    lineHeight: 22,
  },

  // Small
  caption: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    fontWeight: '400' as const,
    lineHeight: 18,
  },

  captionMedium: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    fontWeight: '500' as const,
    lineHeight: 18,
  },

  // Tiny
  label: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    fontWeight: '500' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
};

// Arabic fonts
export const arabicTypography = {
  display: { fontFamily: 'Cairo-Bold' },
  h1: { fontFamily: 'Cairo-Bold' },
  h2: { fontFamily: 'Cairo-Bold' },
  h3: { fontFamily: 'Cairo-SemiBold' },
  body: { fontFamily: 'Cairo-Regular' },
  bodyMedium: { fontFamily: 'Cairo-SemiBold' },
  bodySemiBold: { fontFamily: 'Cairo-Bold' },
  caption: { fontFamily: 'Cairo-Regular' },
  captionMedium: { fontFamily: 'Cairo-SemiBold' },
  label: { fontFamily: 'Cairo-SemiBold' },
};

export type Typography = typeof typography;
