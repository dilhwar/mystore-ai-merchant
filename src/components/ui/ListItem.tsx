/**
 * ListItem Component
 * Reusable list item for settings and navigation
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';
import { Badge } from './Badge';

interface ListItemProps {
  icon?: React.ReactNode | string;
  label: string;
  description?: string;
  badge?: string | number;
  badgeVariant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  chevron?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ListItem({
  icon,
  label,
  description,
  badge,
  badgeVariant = 'primary',
  chevron = true,
  onPress,
  style: customStyle,
}: ListItemProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      haptics.light();
      onPress();
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        customStyle,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.primary10,
            },
          ]}
        >
          {typeof icon === 'string' ? (
            <Text style={styles.iconEmoji}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
            },
          ]}
        >
          {label}
        </Text>

        {description && (
          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Badge */}
      {badge !== undefined && (
        <Badge text={badge} variant={badgeVariant} size="sm" />
      )}

      {/* Chevron */}
      {chevron && onPress && (
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: design.radius.md,
    borderWidth: 1,
    gap: spacing.m,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
