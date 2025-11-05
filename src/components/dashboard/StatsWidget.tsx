import React from 'react';
import { Dimensions } from 'react-native';
import { Box, HStack, VStack, Text, Heading, Pressable } from '@gluestack-ui/themed';
import { LucideIcon } from 'lucide-react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { haptics } from '@/utils/haptics';

const { width } = Dimensions.get('window');

export interface StatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  darkBgColor: string;
  trend?: string;
  trendUp?: boolean;
  onPress?: () => void;
}

interface StatsWidgetProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  animationDelay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StatsWidget({ stats, columns = 2, animationDelay = 100, size = 'md' }: StatsWidgetProps) {
  const { colors, isDark } = useTheme();

  const cardSpacing = 16;
  const totalSpacing = cardSpacing * (columns + 1);
  const cardWidth = (width - totalSpacing) / columns;

  // Helper function to get color values for dark mode
  const getColorForStat = (colorToken: string) => {
    const colorMap: Record<string, { bg: string; border: string; iconBg: string }> = {
      '$success400': {
        bg: 'rgba(16, 185, 129, 0.08)', // success with 8% opacity for bg
        border: 'rgba(16, 185, 129, 0.4)', // success with 40% opacity for border
        iconBg: 'rgba(16, 185, 129, 0.15)', // success with 15% opacity for icon bg
      },
      '$info400': {
        bg: 'rgba(59, 130, 246, 0.08)',
        border: 'rgba(59, 130, 246, 0.4)',
        iconBg: 'rgba(59, 130, 246, 0.15)',
      },
      '$purple500': {
        bg: 'rgba(139, 92, 246, 0.08)',
        border: 'rgba(139, 92, 246, 0.4)',
        iconBg: 'rgba(139, 92, 246, 0.15)',
      },
      '$amber500': {
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.4)',
        iconBg: 'rgba(245, 158, 11, 0.15)',
      },
    };
    return colorMap[colorToken] || colorMap['$success400'];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 18,
          iconContainerSize: 36,
          valueSize: 'md' as const,
          titleSize: '$2xs' as const,
          trendSize: '$2xs' as const,
        };
      case 'lg':
        return {
          iconSize: 26,
          iconContainerSize: 52,
          valueSize: 'xl' as const,
          titleSize: '$sm' as const,
          trendSize: '$xs' as const,
        };
      default: // md
        return {
          iconSize: 22,
          iconContainerSize: 44,
          valueSize: 'lg' as const,
          titleSize: '$xs' as const,
          trendSize: '$2xs' as const,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <HStack space="md" flexWrap="wrap" justifyContent="space-between">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const statColors = getColorForStat(stat.color);

        return (
          <Box key={`${stat.title}-${index}`} w={cardWidth} mb="$4">
            <Pressable
              onPress={() => {
                if (stat.onPress) {
                  haptics.light();
                  stat.onPress();
                }
              }}
              disabled={!stat.onPress}
              bg={isDark ? undefined : '$cardLight'}
              borderRadius="$xl"
              p="$4"
              shadowColor="$black"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.06}
              shadowRadius={4}
              $active-opacity={stat.onPress ? 0.8 : 1}
              borderWidth={2}
              borderColor={isDark ? undefined : 'transparent'}
              style={
                isDark
                  ? {
                      backgroundColor: statColors.bg,
                      borderColor: statColors.border,
                      borderStyle: 'solid',
                    }
                  : undefined
              }
            >
              <VStack space="sm">
                {/* Icon */}
                <Box
                  w={sizeStyles.iconContainerSize}
                  h={sizeStyles.iconContainerSize}
                  borderRadius="$xl"
                  bg={isDark ? undefined : stat.bgColor}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={0}
                  borderColor="transparent"
                  style={isDark ? { backgroundColor: statColors.iconBg } : undefined}
                >
                  <Icon
                    size={sizeStyles.iconSize}
                    color={colors[stat.color.replace('$', '') as keyof typeof colors] || colors.primary}
                    strokeWidth={2.5}
                  />
                </Box>

                {/* Value */}
                <Heading size={sizeStyles.valueSize} color="$textLight" $dark-color="$white" numberOfLines={1}>
                  {stat.value}
                </Heading>

                {/* Title & Trend */}
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={sizeStyles.titleSize} color="$textSecondaryLight" $dark-color="$white" fontWeight="$medium" numberOfLines={1} flex={1}>
                    {stat.title}
                  </Text>

                  {stat.trend && (
                    <HStack space="xs" alignItems="center">
                      {stat.trendUp ? (
                        <TrendingUp size={sizeStyles.iconSize === 18 ? 10 : sizeStyles.iconSize === 26 ? 14 : 12} color={colors.success400} strokeWidth={2.5} />
                      ) : (
                        <TrendingDown size={sizeStyles.iconSize === 18 ? 10 : sizeStyles.iconSize === 26 ? 14 : 12} color={colors.error400} strokeWidth={2.5} />
                      )}
                      <Text fontSize={sizeStyles.trendSize} color={stat.trendUp ? '$success500' : '$error500'} fontWeight="$semibold">
                        {stat.trend}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </VStack>
            </Pressable>
          </Box>
        );
      })}
    </HStack>
  );
}

// Preset stat card for common use cases
interface QuickStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'success' | 'info' | 'warning' | 'error' | 'purple' | 'amber';
  trend?: string;
  trendUp?: boolean;
  onPress?: () => void;
}

export function QuickStatCard({ title, value, icon, variant, trend, trendUp, onPress }: QuickStatCardProps) {
  const variantColors = {
    success: { color: '$success400', bg: '$success50', darkBg: '$success950' },
    info: { color: '$info400', bg: '$info50', darkBg: '$info950' },
    warning: { color: '$warning400', bg: '$warning50', darkBg: '$warning950' },
    error: { color: '$error400', bg: '$error50', darkBg: '$error950' },
    purple: { color: '$purple500', bg: '$purple50', darkBg: '$purple950' },
    amber: { color: '$amber500', bg: '$amber50', darkBg: '$amber950' },
  };

  const config = variantColors[variant];

  return (
    <StatsWidget
      stats={[
        {
          title,
          value,
          icon,
          color: config.color,
          bgColor: config.bg,
          darkBgColor: config.darkBg,
          trend,
          trendUp,
          onPress,
        },
      ]}
      columns={1}
      animationDelay={0}
    />
  );
}
