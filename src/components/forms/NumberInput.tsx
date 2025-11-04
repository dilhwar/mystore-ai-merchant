/**
 * NumberInput Component
 * Reusable number input with increment/decrement buttons
 */

import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { getTextAlign } from '@/utils/i18n.helper';
import { haptics } from '@/utils/haptics';

interface NumberInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}

export const NumberInput = forwardRef<TextInput, NumberInputProps>(
  (
    {
      label,
      value,
      onChangeValue,
      min = 0,
      max = Infinity,
      step = 1,
      error,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    const handleIncrement = () => {
      const newValue = value + step;
      if (newValue <= max) {
        haptics.light();
        onChangeValue(newValue);
      }
    };

    const handleDecrement = () => {
      const newValue = value - step;
      if (newValue >= min) {
        haptics.light();
        onChangeValue(newValue);
      }
    };

    const handleTextChange = (text: string) => {
      const numValue = parseInt(text, 10);
      if (!isNaN(numValue) && numValue >= min && numValue <= max) {
        onChangeValue(numValue);
      } else if (text === '') {
        onChangeValue(min);
      }
    };

    return (
      <View style={styles.container}>
        {/* Label */}
        {label && (
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
        )}

        {/* Input Container */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
        >
          {/* Decrement Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onPress={handleDecrement}
            disabled={value <= min}
            activeOpacity={0.7}
          >
            <Minus
              size={18}
              color={value <= min ? colors.textTertiary : colors.text}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* Input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.text,
              },
            ]}
            value={value.toString()}
            onChangeText={handleTextChange}
            keyboardType="number-pad"
            textAlign="center"
            {...props}
          />

          {/* Increment Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onPress={handleIncrement}
            disabled={value >= max}
            activeOpacity={0.7}
          >
            <Plus
              size={18}
              color={value >= max ? colors.textTertiary : colors.text}
              strokeWidth={2}
            />
          </TouchableOpacity>
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

NumberInput.displayName = 'NumberInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: design.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  button: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
