/**
 * Professional Design System
 * Consistent design tokens for the entire app
 */

export const design = {
  // Border Radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Shadows (iOS style)
  shadow: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Icon Sizes
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },

  // Button Sizes
  button: {
    sm: {
      height: 36,
      paddingHorizontal: 12,
      fontSize: 13,
    },
    md: {
      height: 44,
      paddingHorizontal: 16,
      fontSize: 15,
    },
    lg: {
      height: 52,
      paddingHorizontal: 20,
      fontSize: 17,
    },
  },

  // Input Sizes
  input: {
    sm: {
      height: 40,
      paddingHorizontal: 12,
      fontSize: 14,
    },
    md: {
      height: 48,
      paddingHorizontal: 16,
      fontSize: 15,
    },
    lg: {
      height: 56,
      paddingHorizontal: 20,
      fontSize: 16,
    },
  },

  // Card Styles
  card: {
    default: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
    },
    compact: {
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
    },
    spacious: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 0,
    },
  },

  // Badge Sizes
  badge: {
    sm: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      fontSize: 11,
      borderRadius: 4,
    },
    md: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      fontSize: 12,
      borderRadius: 6,
    },
    lg: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 13,
      borderRadius: 8,
    },
  },

  // Avatar Sizes
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    xxl: 96,
  },

  // Typography
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodyBold: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    small: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
};
