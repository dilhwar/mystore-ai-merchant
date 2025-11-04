/**
 * TextArea Component
 * Reusable multiline text input
 */

import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { getTextAlign } from '@/utils/i18n.helper';

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  height?: number;
  maxLength?: number;
  showCount?: boolean;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  (
    {
      label,
      error,
      height = 120,
      maxLength,
      showCount = false,
      value,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const characterCount = value?.length || 0;

    return (
      <View style={styles.container}>
        {/* Label */}
        {label && (
          <View style={styles.labelRow}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  textAlign: getTextAlign(),
                },
              ]}
            >
              {label}
            </Text>

            {showCount && maxLength && (
              <Text
                style={[
                  styles.count,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {characterCount}/{maxLength}
              </Text>
            )}
          </View>
        )}

        {/* TextArea */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: error ? colors.error : colors.border,
              height,
            },
          ]}
        >
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.text,
                textAlign: getTextAlign(),
              },
            ]}
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            maxLength={maxLength}
            value={value}
            {...props}
          />
        </View>

        {/* Error */}
        {error && (
          <Text
            style={[
              styles.error,
              {
                color: colors.error,
                textAlign: getTextAlign(),
              },
            ]}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

TextArea.displayName = 'TextArea';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  count: {
    fontSize: 12,
    fontWeight: '400',
  },
  inputContainer: {
    borderRadius: design.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: spacing.m,
    fontSize: 15,
    fontWeight: '400',
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
