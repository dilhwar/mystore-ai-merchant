import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@store/themeStore';
import { spacing, borderRadius } from '@theme/spacing';

interface CardProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  onPress?: () => void;
}

export function Card({ children, padding = 'l', onPress }: CardProps) {
  const { colors, isDark } = useTheme();

  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          padding: spacing[padding],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: isDark ? 1 : 2 },
          shadowOpacity: isDark ? 0.15 : 0.04,
          shadowRadius: isDark ? 3 : 6,
          elevation: isDark ? 1 : 2,
        },
      ]}
    >
      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.m,
  },
});
