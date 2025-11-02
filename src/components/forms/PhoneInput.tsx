import React, { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';

interface PhoneInputProps extends TextInputProps {
  label?: string;
  error?: string;
  countryCode: string;
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  ({ label, error, countryCode, ...props }, ref) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={styles.container}>
        {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              borderColor: error ? colors.error : isFocused ? colors.primary : 'transparent',
            },
          ]}
        >
          <View style={[styles.countryCodeContainer, { borderRightColor: colors.border }]}>
            <Text style={[styles.countryCodeText, { color: colors.text }]}>{countryCode}</Text>
          </View>
          <TextInput
            ref={ref}
            style={[styles.input, { color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="phone-pad"
            {...props}
          />
        </View>
        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
      </View>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  countryCodeContainer: {
    paddingHorizontal: spacing.m,
    borderRightWidth: 1,
    height: 52,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: spacing.m,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
