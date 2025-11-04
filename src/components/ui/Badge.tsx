/**
 * Badge Component
 * Reusable badge for status indicators, counts, and labels
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { design } from '@/theme/design';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  style?: ViewStyle;
}

export function Badge({
  text,
  variant = 'neutral',
  size = 'md',
  icon,
  style: customStyle,
}: BadgeProps) {
  const { colors } = useTheme();

  const variantColors = {
    success: {
      background: colors.successLight,
      text: colors.success,
    },
    warning: {
      background: colors.warningLight,
      text: colors.warning,
    },
    error: {
      background: colors.errorLight,
      text: colors.error,
    },
    info: {
      background: colors.infoLight,
      text: colors.info,
    },
    neutral: {
      background: colors.surfaceSecondary,
      text: colors.textSecondary,
    },
    primary: {
      background: colors.primary15,
      text: colors.primary,
    },
  };

  const badgeStyle = design.badge[size];
  const colorScheme = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colorScheme.background,
          paddingHorizontal: badgeStyle.paddingHorizontal,
          paddingVertical: badgeStyle.paddingVertical,
          borderRadius: badgeStyle.borderRadius,
        },
        customStyle,
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text
        style={[
          styles.text,
          {
            color: colorScheme.text,
            fontSize: badgeStyle.fontSize,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontWeight: '600',
  },
});
