/**
 * SearchBar Component
 * Reusable search input with icon and clear button
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { getTextAlign } from '@/utils/i18n.helper';
import { haptics } from '@/utils/haptics';

interface SearchBarProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  ...props
}: SearchBarProps) {
  const { colors } = useTheme();

  const handleClear = () => {
    haptics.light();
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Search size={20} color={colors.textSecondary} strokeWidth={2} />

      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            textAlign: getTextAlign(),
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={18} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.m,
    borderRadius: design.radius.md,
    borderWidth: 1,
    gap: spacing.s,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
  },
  clearButton: {
    padding: spacing.xs,
  },
});
