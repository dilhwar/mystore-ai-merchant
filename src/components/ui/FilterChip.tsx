/**
 * FilterChip Component
 * Reusable selectable chip for filters
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  count?: number;
  onPress: () => void;
  style?: ViewStyle;
}

export function FilterChip({
  label,
  selected = false,
  count,
  onPress,
  style: customStyle,
}: FilterChipProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        customStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected ? colors.white : colors.text,
          },
        ]}
      >
        {label}
      </Text>

      {count !== undefined && count > 0 && (
        <Text
          style={[
            styles.count,
            {
              color: selected ? colors.white : colors.textSecondary,
            },
          ]}
        >
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: design.radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
  },
});
