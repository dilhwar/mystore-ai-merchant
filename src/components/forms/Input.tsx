import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { getTextAlign } from '@/utils/i18n.helper';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, secureTextEntry, ...props }, ref) => {
    const { colors, isDark } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, { color: colors.text, textAlign: getTextAlign() }]}>
            {label}
          </Text>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: error
                ? colors.error
                : isFocused
                ? colors.primary
                : 'transparent',
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
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {secureTextEntry && (
            <TouchableOpacity
              style={[
                styles.eyeIcon,
                { [getTextAlign() === 'right' ? 'left' : 'right']: spacing.m },
              ]}
              onPress={togglePasswordVisibility}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isPasswordVisible ? (
                <EyeOff size={22} color={colors.textSecondary} strokeWidth={1.5} />
              ) : (
                <Eye size={22} color={colors.textSecondary} strokeWidth={1.5} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text style={[styles.error, { color: colors.error, textAlign: getTextAlign() }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

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
    position: 'relative',
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  input: {
    height: 48,
    paddingHorizontal: spacing.m,
    fontSize: 16,
    fontWeight: '400',
  },
  eyeIcon: {
    position: 'absolute',
    top: 14,
    zIndex: 1,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '400',
    marginLeft: 4,
  },
});
