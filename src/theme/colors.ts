// Light Mode Colors
export const lightColors = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#E5F1FF',
  primaryDark: '#0051D5',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',

  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Card
  card: '#FFFFFF',
  cardBorder: '#F3F4F6',

  // Opacity variants
  inputBackground: 'rgba(0, 0, 0, 0.05)',
  cardBackgroundSecondary: 'rgba(0, 0, 0, 0.03)',
};

// Dark Mode Colors
export const darkColors = {
  // Primary
  primary: '#0A84FF',
  primaryLight: '#1E3A5F',
  primaryDark: '#409CFF',

  // Background
  background: '#0D0D0D',
  backgroundSecondary: '#1A1A1A',
  surface: '#1A1A1A',
  surfaceSecondary: '#252525',

  // Text
  text: '#F5F5F7',
  textSecondary: '#98989D',
  textTertiary: '#636366',

  // Border
  border: '#2C2C2E',
  borderLight: '#1F1F1F',

  // Semantic
  success: '#30D158',
  successLight: '#1E3A2C',
  warning: '#FF9F0A',
  warningLight: '#3A2E1E',
  error: '#FF453A',
  errorLight: '#3A1E1E',
  info: '#5E5CE6',
  infoLight: '#2E2E3A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Card
  card: '#1A1A1A',
  cardBorder: '#252525',

  // Opacity variants
  inputBackground: 'rgba(255, 255, 255, 0.08)',
  cardBackgroundSecondary: 'rgba(255, 255, 255, 0.06)',
};

export type Colors = typeof lightColors;
