import React from 'react';
import { Dimensions, View as RNView } from 'react-native';
import { Box, HStack, VStack, Text, Heading, Card, Pressable } from '@gluestack-ui/themed';
import { VictoryPie, VictoryLabel } from 'victory-native';
import { ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { haptics } from '@/utils/haptics';

const { width } = Dimensions.get('window');

export interface PieChartData {
  x: string; // Label
  y: number; // Value
  color?: string; // Custom color (optional)
}

interface PieChartCardProps {
  title: string;
  subtitle?: string;
  data: PieChartData[];
  showLegend?: boolean;
  innerRadius?: number; // For donut chart (0 = full pie, >0 = donut)
  onViewAll?: () => void;
  animationDelay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PieChartCard({
  title,
  subtitle,
  data,
  showLegend = true,
  innerRadius = 0,
  onViewAll,
  animationDelay = 0,
  size = 'md',
}: PieChartCardProps) {
  const { colors, isDark } = useTheme();

  // Default colors from theme
  const defaultColors = [
    isDark ? '#0A84FF' : '#007AFF', // primary
    '#10B981', // success
    '#F59E0B', // warning
    '#8B5CF6', // purple
    '#EF4444', // error
    '#3B82F6', // info
    '#EC4899', // pink
    '#14B8A6', // teal
  ];

  // Prepare data with colors
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index % defaultColors.length],
  }));

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.y, 0);

  // Calculate percentages
  const dataWithPercentages = chartData.map((item) => ({
    ...item,
    percentage: ((item.y / total) * 100).toFixed(1),
  }));

  const chartSize = {
    sm: 160,
    md: 200,
    lg: 240,
  }[size];

  const legendItemSize = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  }[size];

  return (
    <Card
      size="lg"
      variant="elevated"
      bg="$cardLight"
      $dark-bg="$cardDark"
    >
      <VStack p="$4" space="md">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <VStack flex={1}>
            <Heading size="md" color="$textLight" $dark-color="$textDark">
              {title}
            </Heading>
            {subtitle && (
              <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                {subtitle}
              </Text>
            )}
          </VStack>

          {onViewAll && (
            <Pressable
              onPress={() => {
                haptics.light();
                onViewAll();
              }}
              p="$2"
              borderRadius="$lg"
              bg="$surfaceLight"
              $dark-bg="$surfaceDark"
            >
              <HStack space="xs" alignItems="center">
                <Text fontSize="$xs" color="$textLight" $dark-color="$textDark" fontWeight="$medium">
                  View All
                </Text>
                <ArrowUpRight size={14} color={colors.text} />
              </HStack>
            </Pressable>
          )}
        </HStack>

        {/* Chart & Legend Container */}
        <HStack space="md" alignItems="center" justifyContent="center">
          {/* Pie/Donut Chart */}
          <RNView style={{ width: chartSize, height: chartSize }}>
            <VictoryPie
              data={chartData}
              width={chartSize}
              height={chartSize}
              innerRadius={innerRadius}
              colorScale={chartData.map((d) => d.color)}
              labels={({ datum }) => `${datum.percentage}%`}
              labelComponent={
                <VictoryLabel
                  style={{
                    fill: isDark ? '#F5F5F7' : '#111827',
                    fontSize: size === 'sm' ? 10 : size === 'lg' ? 14 : 12,
                    fontWeight: '600',
                  }}
                />
              }
              padding={size === 'sm' ? 20 : size === 'lg' ? 40 : 30}
              style={{
                data: {
                  fillOpacity: 0.9,
                },
              }}
              animate={{
                duration: 1000,
                easing: 'cubicInOut',
              }}
            />

            {/* Center Label for Donut */}
            {innerRadius > 0 && (
              <Box position="absolute" top={0} left={0} right={0} bottom={0} alignItems="center" justifyContent="center">
                <VStack space="xs" alignItems="center">
                  <Heading size={size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'} color="$textLight" $dark-color="$textDark">
                    {total}
                  </Heading>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" fontWeight="$medium">
                    Total
                  </Text>
                </VStack>
              </Box>
            )}
          </RNView>

          {/* Legend */}
          {showLegend && (
            <VStack space="xs" flex={1}>
              {dataWithPercentages.map((item, index) => (
                <HStack key={index} space="sm" alignItems="center">
                  {/* Color Indicator */}
                  <Box w={12} h={12} borderRadius="$sm" bg={item.color} />

                  {/* Label & Value */}
                  <VStack flex={1}>
                    <Text fontSize={legendItemSize} color="$textLight" $dark-color="$textDark" fontWeight="$medium" numberOfLines={1}>
                      {item.x}
                    </Text>
                    <HStack space="xs" alignItems="baseline">
                      <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                        {item.y}
                      </Text>
                      <Text fontSize="$2xs" color="$textTertiaryLight" $dark-color="$textTertiaryDark">
                        ({item.percentage}%)
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          )}
        </HStack>
      </VStack>
    </Card>
  );
}

// Preset: Donut Chart (just a wrapper with innerRadius set)
interface DonutChartCardProps extends Omit<PieChartCardProps, 'innerRadius'> {
  innerRadiusRatio?: number; // 0.5 = 50% of radius
}

export function DonutChartCard({ innerRadiusRatio = 0.5, ...props }: DonutChartCardProps) {
  const { size = 'md' } = props;
  const chartSize = {
    sm: 160,
    md: 200,
    lg: 240,
  }[size];

  const innerRadius = (chartSize / 2) * innerRadiusRatio;

  return <PieChartCard {...props} innerRadius={innerRadius} />;
}

// Example usage with mock data generator
export function generateMockPieData(count: number = 5): PieChartData[] {
  const labels = ['Orders', 'Products', 'Customers', 'Revenue', 'Refunds', 'Pending', 'Shipped', 'Delivered'];

  return Array.from({ length: count }, (_, i) => ({
    x: labels[i % labels.length],
    y: Math.floor(Math.random() * 100) + 10,
  }));
}
