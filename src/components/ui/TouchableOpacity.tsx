import React, { useRef } from 'react';
import {
  TouchableOpacity as RNTouchableOpacity,
  TouchableOpacityProps as RNTouchableOpacityProps,
  Animated,
} from 'react-native';
import { haptics } from '@/utils/haptics';

export interface TouchableOpacityProps extends RNTouchableOpacityProps {
  /**
   * Enable haptic feedback on press
   * @default true
   */
  haptic?: boolean;
  /**
   * Type of haptic feedback
   * @default 'light'
   */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  /**
   * Enable scale animation on press
   * @default true
   */
  scaleAnimation?: boolean;
  /**
   * Scale value when pressed
   * @default 0.95
   */
  scaleValue?: number;
}

/**
 * Enhanced TouchableOpacity with haptic feedback and scale animation
 * Provides native-like interaction feedback
 */
export const TouchableOpacity: React.FC<TouchableOpacityProps> = ({
  haptic = true,
  hapticType = 'light',
  scaleAnimation = true,
  scaleValue = 0.95,
  onPressIn,
  onPressOut,
  onPress,
  children,
  disabled,
  style,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn: RNTouchableOpacityProps['onPressIn'] = (e) => {
    if (scaleAnimation && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: scaleValue,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
    onPressIn?.(e);
  };

  const handlePressOut: RNTouchableOpacityProps['onPressOut'] = (e) => {
    if (scaleAnimation && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
    onPressOut?.(e);
  };

  const handlePress: RNTouchableOpacityProps['onPress'] = (e) => {
    if (haptic && !disabled) {
      switch (hapticType) {
        case 'light':
          haptics.light();
          break;
        case 'medium':
          haptics.medium();
          break;
        case 'heavy':
          haptics.heavy();
          break;
        case 'selection':
          haptics.selection();
          break;
      }
    }
    onPress?.(e);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <RNTouchableOpacity
        {...props}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={props.activeOpacity ?? 0.7}
      >
        {children}
      </RNTouchableOpacity>
    </Animated.View>
  );
};
