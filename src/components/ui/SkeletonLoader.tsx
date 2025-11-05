import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/store/themeStore';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  children?: never;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const { colors, isDark } = useTheme();
  const baseColor = isDark ? '#2C2C2E' : '#E5E7EB';

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: baseColor, borderRadius, opacity: 0.5 },
        ]}
      />
    </View>
  );
}

// Pre-built skeleton components for common use cases

export function StatCardSkeleton() {
  return (
    <View style={styles.statCard}>
      <SkeletonLoader width={44} height={44} borderRadius={10} />
      <SkeletonLoader width="60%" height={22} style={{ marginTop: 12 }} />
      <SkeletonLoader width="40%" height={12} style={{ marginTop: 4 }} />
    </View>
  );
}

export function OrderCardSkeleton() {
  return (
    <View style={styles.orderCard}>
      {/* Header */}
      <View style={styles.orderCardHeader}>
        <View>
          <SkeletonLoader width={120} height={16} />
          <SkeletonLoader width={80} height={12} style={{ marginTop: 6 }} />
        </View>
        <SkeletonLoader width={80} height={20} />
      </View>

      {/* Customer */}
      <SkeletonLoader width="70%" height={14} style={{ marginTop: 16 }} />

      {/* Items */}
      <View style={{ marginTop: 12, gap: 6 }}>
        <SkeletonLoader width="90%" height={14} />
        <SkeletonLoader width="80%" height={12} />
      </View>

      {/* Status badges */}
      <View style={styles.orderCardFooter}>
        <SkeletonLoader width={90} height={28} borderRadius={8} />
        <SkeletonLoader width={80} height={28} borderRadius={8} />
      </View>
    </View>
  );
}

export function ChartSkeleton() {
  return (
    <View style={styles.chartContainer}>
      <SkeletonLoader width="100%" height={200} borderRadius={12} />
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <SkeletonLoader width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonLoader width="70%" height={16} />
        <SkeletonLoader width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
      <SkeletonLoader width={60} height={32} borderRadius={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderCardFooter: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  chartContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
});
