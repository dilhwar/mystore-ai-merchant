/**
 * LoadingOverlay Component
 * Reusable loading overlay with spinner and optional message
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />

      {message && (
        <Text
          style={[
            styles.message,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    gap: spacing.m,
  },
  message: {
    fontSize: 15,
    marginTop: spacing.s,
  },
});
