import { lightColors, darkColors, Colors } from './colors';
import { typography, arabicTypography, Typography } from './typography';
import { spacing, borderRadius, iconSizes, Spacing, BorderRadius, IconSizes } from './spacing';
import { shadows, darkShadows, Shadows } from './shadows';

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  iconSizes: IconSizes;
  shadows: Shadows;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  iconSizes,
  shadows,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  iconSizes,
  shadows: darkShadows,
  isDark: true,
};

export { lightColors, darkColors, typography, arabicTypography, spacing, borderRadius, iconSizes, shadows, darkShadows };
