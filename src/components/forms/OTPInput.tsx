import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  error = false,
}) => {
  const { colors, isDark } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Split value into array of digits
  const digits = value.split('');
  while (digits.length < length) {
    digits.push('');
  }

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');

    if (digit.length === 0) {
      // Handle backspace
      const newValue = digits.map((d, i) => (i === index ? '' : d)).join('');
      onChange(newValue);

      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    // Update the digit at current index
    const newDigits = [...digits];
    newDigits[index] = digit[digit.length - 1]; // Take last digit if multiple pasted
    const newValue = newDigits.join('');
    onChange(newValue);

    // Move to next input
    if (index < length - 1 && digit.length > 0) {
      inputRefs.current[index + 1]?.focus();
    } else if (index === length - 1) {
      // Dismiss keyboard when last digit is entered
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && digits[index] === '' && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <View
          key={index}
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.05)',
              borderColor: error
                ? colors.error
                : focusedIndex === index
                ? colors.primary
                : 'transparent',
            },
          ]}
        >
          <TextInput
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[styles.input, { color: colors.text }]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoComplete="off"
            textContentType="oneTimeCode"
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.m,
  },
  inputWrapper: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
});
