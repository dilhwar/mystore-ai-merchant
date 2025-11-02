import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';

interface DividerProps {
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  spacing: spacingSize = 'md',
  style
}) => {
  const { colors } = useTheme();

  const spacingMap = {
    none: 0,
    sm: spacing.s,
    md: spacing.m,
    lg: spacing.l,
  };

  const marginVertical = spacingMap[spacingSize];

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.border,
          marginVertical,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.5,
  },
});
