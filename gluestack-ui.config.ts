import { config as defaultConfig } from '@gluestack-ui/config';
import { createConfig } from '@gluestack-style/react';

// MyStore AI Merchant - Custom Gluestack UI Configuration
export const config = createConfig({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      // Brand Colors - Professional e-commerce palette
      primary50: '#E5F1FF',
      primary100: '#CCE3FF',
      primary200: '#99C7FF',
      primary300: '#66AAFF',
      primary400: '#338EFF',
      primary500: '#007AFF', // Main brand color (iOS blue)
      primary600: '#0062CC',
      primary700: '#004999',
      primary800: '#003166',
      primary900: '#001933',

      // Success - Sales & Revenue
      success50: '#D1FAE5',
      success100: '#A7F3D0',
      success200: '#6EE7B7',
      success300: '#34D399',
      success400: '#10B981', // Main success color
      success500: '#059669',
      success600: '#047857',
      success700: '#065F46',
      success800: '#064E3B',
      success900: '#022C22',

      // Warning - Pending & Attention
      warning50: '#FEF3C7',
      warning100: '#FDE68A',
      warning200: '#FCD34D',
      warning300: '#FBBF24',
      warning400: '#F59E0B', // Main warning color
      warning500: '#D97706',
      warning600: '#B45309',
      warning700: '#92400E',
      warning800: '#78350F',
      warning900: '#451A03',

      // Error - Failed & Cancelled
      error50: '#FEE2E2',
      error100: '#FECACA',
      error200: '#FCA5A5',
      error300: '#F87171',
      error400: '#EF4444', // Main error color
      error500: '#DC2626',
      error600: '#B91C1C',
      error700: '#991B1B',
      error800: '#7F1D1D',
      error900: '#450A0A',

      // Info - Orders & Analytics
      info50: '#DBEAFE',
      info100: '#BFDBFE',
      info200: '#93C5FD',
      info300: '#60A5FA',
      info400: '#3B82F6', // Main info color
      info500: '#2563EB',
      info600: '#1D4ED8',
      info700: '#1E40AF',
      info800: '#1E3A8A',
      info900: '#172554',

      // Purple - Customers & Users
      purple50: '#F5F3FF',
      purple100: '#EDE9FE',
      purple200: '#DDD6FE',
      purple300: '#C4B5FD',
      purple400: '#A78BFA',
      purple500: '#8B5CF6', // Main purple
      purple600: '#7C3AED',
      purple700: '#6D28D9',
      purple800: '#5B21B6',
      purple900: '#4C1D95',

      // Amber - Products & Inventory
      amber50: '#FFFBEB',
      amber100: '#FEF3C7',
      amber200: '#FDE68A',
      amber300: '#FCD34D',
      amber400: '#FBBF24',
      amber500: '#F59E0B', // Main amber
      amber600: '#D97706',
      amber700: '#B45309',
      amber800: '#92400E',
      amber900: '#78350F',

      // Dark Mode Colors (Merchant-optimized)
      darkPrimary: '#0A84FF', // iOS dark mode blue
      darkSuccess: '#30D158',
      darkWarning: '#FFD60A',
      darkError: '#FF453A',
      darkInfo: '#64D2FF',

      // Background & Surface
      backgroundLight: '#FFFFFF',
      backgroundDark: '#000000',
      surfaceLight: '#F9FAFB',
      surfaceDark: '#1C1C1E',
      cardLight: '#FFFFFF',
      cardDark: '#2C2C2E',

      // Text
      textLight: '#111827',
      textDark: '#F5F5F7',
      textSecondaryLight: '#6B7280',
      textSecondaryDark: '#98989D',
      textTertiaryLight: '#9CA3AF',
      textTertiaryDark: '#636366',

      // Borders
      borderLight: '#E5E7EB',
      borderDark: '#38383A',

      // Chart Colors (Data Visualization)
      chart1: '#007AFF',
      chart2: '#10B981',
      chart3: '#F59E0B',
      chart4: '#8B5CF6',
      chart5: '#EF4444',
      chart6: '#3B82F6',
      chart7: '#EC4899',
      chart8: '#14B8A6',
    },
    fonts: {
      heading: undefined, // Will use SF Pro Display on iOS
      body: undefined, // Will use SF Pro Text on iOS
      mono: undefined, // Will use SF Mono on iOS
    },
    fontSizes: {
      '2xs': 10,
      xs: 12,
      sm: 14,
      md: 15, // Base font size for merchant app
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    },
    fontWeights: {
      hairline: '100',
      thin: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeights: {
      '2xs': 16,
      xs: 18,
      sm: 20,
      md: 22, // Base line height
      lg: 24,
      xl: 28,
      '2xl': 32,
      '3xl': 40,
      '4xl': 48,
      '5xl': 64,
      '6xl': 80,
    },
    letterSpacings: {
      '2xs': -0.8,
      xs: -0.4,
      sm: -0.2,
      md: 0,
      lg: 0.2,
      xl: 0.4,
      '2xl': 0.8,
    },
    space: {
      '0': 0,
      px: 1,
      '0.5': 2,
      '1': 4,
      '1.5': 6,
      '2': 8,
      '2.5': 10,
      '3': 12,
      '3.5': 14,
      '4': 16,
      '5': 20,
      '6': 24,
      '7': 28,
      '8': 32,
      '9': 36,
      '10': 40,
      '11': 44,
      '12': 48,
      '16': 64,
      '20': 80,
      '24': 96,
      '32': 128,
    },
    radii: {
      none: 0,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      full: 9999,
    },
    shadows: {
      // iOS-style subtle shadows
      xs: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      sm: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
      md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      },
      xl: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 5,
      },
    },
  },
});

export type Config = typeof config;
