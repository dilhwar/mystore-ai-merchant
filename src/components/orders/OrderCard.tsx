/**
 * OrderCard Component - iOS Modern Style
 * Professional, clean design inspired by Apple's design language
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, User, Package as PackageIcon, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { Badge } from '@/components/ui/Badge';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';
import { formatCurrency } from '@/utils/currency';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderCardProps {
  orderNumber: string;
  date: string;
  time?: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  currency?: string;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  onPress?: () => void;
  onStatusPress?: () => void;
  onPaymentPress?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  language?: string;
}

export function OrderCard({
  orderNumber,
  date,
  time,
  customerName,
  items,
  total,
  currency = 'SAR',
  orderStatus,
  paymentStatus,
  onPress,
  onStatusPress,
  onPaymentPress,
  onConfirm,
  onCancel,
  showActions = true,
  language = 'en',
}: OrderCardProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    haptics.light();
    onPress?.();
  };

  const handleStatusPress = (e: any) => {
    e?.stopPropagation?.();
    haptics.light();
    onStatusPress?.();
  };

  const handlePaymentPress = (e: any) => {
    e?.stopPropagation?.();
    haptics.light();
    onPaymentPress?.();
  };

  const handleConfirm = (e: any) => {
    e?.stopPropagation?.();
    haptics.medium();
    onConfirm?.();
  };

  const handleCancel = (e: any) => {
    e?.stopPropagation?.();
    haptics.medium();
    onCancel?.();
  };

  const getOrderStatusVariant = () => {
    switch (orderStatus) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'success';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getPaymentStatusVariant = () => {
    switch (paymentStatus) {
      case 'PAID':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'REFUNDED':
        return 'neutral';
      default:
        return 'warning';
    }
  };

  const getOrderStatusIcon = () => {
    switch (orderStatus) {
      case 'CONFIRMED':
        return '✓';
      case 'PROCESSING':
        return '⏳';
      case 'SHIPPED':
        return '🚚';
      case 'DELIVERED':
        return '✅';
      case 'CANCELLED':
        return '✕';
      default:
        return '⏰';
    }
  };

  const getPaymentStatusIcon = () => {
    switch (paymentStatus) {
      case 'PAID':
        return '✓';
      case 'FAILED':
        return '✕';
      case 'REFUNDED':
        return '↩';
      default:
        return '⏰';
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      {/* Top Section: Order Number & Amount */}
      <View style={styles.topSection}>
        <View style={styles.topLeft}>
          <Text style={[styles.orderNumber, { color: colors.text }]}>
            {orderNumber}
          </Text>
          <View style={styles.metaRow}>
            <Calendar size={12} color={colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              {date}
            </Text>
            {time && (
              <>
                <View style={[styles.dotSeparator, { backgroundColor: colors.textTertiary }]} />
                <Clock size={12} color={colors.textTertiary} strokeWidth={2} />
                <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                  {time}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.topRight}>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            {formatCurrency(total, currency, language)}
          </Text>
          {onPress && (
            <ChevronRight size={16} color={colors.textTertiary} strokeWidth={2} />
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Customer Section */}
      <View style={styles.customerSection}>
        <View style={[styles.customerIconWrapper, { backgroundColor: colors.primary10 }]}>
          <User size={14} color={colors.primary} strokeWidth={2.5} />
        </View>
        <Text style={[styles.customerName, { color: colors.text }]}>
          {customerName}
        </Text>
      </View>

      {/* Items Section */}
      <View style={styles.itemsSection}>
        {items.slice(0, 2).map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <PackageIcon size={12} color={colors.textSecondary} strokeWidth={2} />
            <Text
              style={[styles.itemText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.productName}
            </Text>
            <Text style={[styles.qtyText, { color: colors.textTertiary }]}>
              ×{item.quantity}
            </Text>
          </View>
        ))}
        {items.length > 2 && (
          <Text style={[styles.moreItemsText, { color: colors.textTertiary }]}>
            +{items.length - 2} more
          </Text>
        )}
      </View>

      {/* Status Section - Single Row Layout */}
      <View style={styles.statusSection}>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: colors.textTertiary }]}>Status:</Text>
          <TouchableOpacity onPress={handleStatusPress} activeOpacity={0.7}>
            <Badge
              text={orderStatus}
              variant={getOrderStatusVariant()}
              size="sm"
              icon={getOrderStatusIcon()}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: colors.textTertiary }]}>Payment:</Text>
          <TouchableOpacity onPress={handlePaymentPress} activeOpacity={0.7}>
            <Badge
              text={paymentStatus}
              variant={getPaymentStatusVariant()}
              size="sm"
              icon={getPaymentStatusIcon()}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      {showActions && orderStatus === 'PENDING' && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border, marginTop: spacing.m }]} />
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.error }]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: design.radius.lg,
    padding: spacing.l,
    marginBottom: spacing.m,
    ...design.shadow.sm,
  },

  // Top Section
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  topLeft: {
    flex: 1,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '400',
  },
  dotSeparator: {
    width: 2,
    height: 2,
    borderRadius: 1,
    marginHorizontal: spacing.xs,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: spacing.m,
  },

  // Customer Section
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  customerIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: design.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Items Section
  itemsSection: {
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
    marginLeft: spacing.l,
  },

  // Status Section - Single Row Layout
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.m,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'inherit',
  },

  // Actions Section
  actionsSection: {
    flexDirection: 'row',
    gap: spacing.s,
    marginTop: spacing.m,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
