import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@store/themeStore';
import { spacing, borderRadius } from '@theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading,
  disabled,
  icon,
  style: customStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const heights = { small: 36, medium: 40, large: 44 };
  const fontSize = { small: 13, medium: 15, large: 15 };

  const variants = {
    primary: {
      backgroundColor: colors.primary,
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: colors.surfaceSecondary,
      color: colors.text,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary,
    },
  };

  const style = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          height: heights[size],
          paddingHorizontal: spacing.l,
          borderRadius: borderRadius.m,
          opacity: pressed ? 0.7 : 1,
          backgroundColor: style.backgroundColor,
          borderWidth: style.borderWidth,
          borderColor: style.borderColor,
        },
        (disabled || loading) && { opacity: 0.5 },
        customStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={style.color} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                fontSize: fontSize[size],
                color: style.color,
                marginLeft: icon ? spacing.s : 0,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
