import React, { useEffect, useRef } from 'react';
import { ViewProps, Animated } from 'react-native';

export interface AnimatedCardProps extends ViewProps {
  /**
   * Index for staggered animation
   */
  index?: number;
  /**
   * Delay between each card (ms)
   * @default 50
   */
  staggerDelay?: number;
  /**
   * Enable enter animation
   * @default true
   */
  enterAnimation?: boolean;
}

/**
 * Animated card component with staggered fade-in animation
 * Perfect for lists and grids
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  index = 0,
  staggerDelay = 50,
  enterAnimation = true,
  children,
  style,
  ...props
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (enterAnimation) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay: index * staggerDelay,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          delay: index * staggerDelay,
          useNativeDriver: true,
          speed: 12,
          bounciness: 4,
        }),
      ]).start();
    }
  }, [enterAnimation, index, staggerDelay]);

  if (!enterAnimation) {
    return (
      <Animated.View {...props} style={style}>
        {children}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      {...props}
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
