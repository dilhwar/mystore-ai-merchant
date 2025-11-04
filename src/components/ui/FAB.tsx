/**
 * FAB (Floating Action Button) Component
 * Reusable floating action button
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';

type FABPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';

interface FABProps {
  icon: React.ReactNode;
  onPress: () => void;
  position?: FABPosition;
  backgroundColor?: string;
  style?: ViewStyle;
}

export function FAB({
  icon,
  onPress,
  position = 'bottom-right',
  backgroundColor,
  style: customStyle,
}: FABProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    haptics.medium();
    onPress();
  };

  const positionStyles: Record<FABPosition, ViewStyle> = {
    'bottom-right': {
      bottom: spacing.xl,
      right: spacing.l,
    },
    'bottom-left': {
      bottom: spacing.xl,
      left: spacing.l,
    },
    'bottom-center': {
      bottom: spacing.xl,
      alignSelf: 'center',
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: backgroundColor || colors.primary,
        },
        positionStyles[position],
        customStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...design.shadow.lg,
  },
});
