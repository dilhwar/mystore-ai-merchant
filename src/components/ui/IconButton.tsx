/**
 * IconButton Component
 * Reusable icon button with badge support
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  badge?: string | number;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  badge,
  disabled,
  style: customStyle,
}: IconButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  const sizeStyles = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const buttonSize = sizeStyles[size];
  const buttonStyle = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: buttonStyle.backgroundColor,
        },
        disabled && styles.disabled,
        customStyle,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}

      {badge !== undefined && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.error,
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
