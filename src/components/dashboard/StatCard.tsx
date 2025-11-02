import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
}) => {
  const { colors, isDark } = useTheme();
  const iconColor = color || colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackgroundSecondary,
        },
      ]}
    >
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          {icon}
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {title}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    borderRadius: 12,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
});
