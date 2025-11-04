/**
 * EmptyState Component
 * Reusable empty state with icon, title, message, and optional action
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.primary10,
          },
        ]}
      >
        {icon}
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        {title}
      </Text>

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

      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.l,
  },
  action: {
    marginTop: spacing.m,
  },
});
