import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'gradient';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  variant = 'default',
}) => {
  const { colors } = useTheme();

  if (variant === 'gradient') {
    // Gradient style for Dashboard
    return (
      <View style={[styles.gradientHeader, { backgroundColor: colors.primary }]}>
        <Text style={styles.gradientTitle}>{title}</Text>
        {subtitle && <Text style={styles.gradientSubtitle}>{subtitle}</Text>}
      </View>
    );
  }

  // Default style for other pages
  return (
    <View style={[styles.defaultHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <Text style={[styles.defaultTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.defaultSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Gradient Header (Dashboard)
  gradientHeader: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.l,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  gradientTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gradientSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Default Header (Other pages)
  defaultHeader: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
  },
  defaultTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  defaultSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
