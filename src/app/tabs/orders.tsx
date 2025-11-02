import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity as RNTouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { TouchableOpacity } from '@/components/ui/TouchableOpacity';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { haptics } from '@/utils/haptics';
import { spacing } from '@/theme/spacing';
import { formatCurrency } from '@/utils/currency';
import {
  getOrders,
  Order,
  OrderStatus,
  PaymentStatus,
  OrderStats,
  getOrderStatusInfo,
  getPaymentStatusInfo,
  updateOrderStatus,
  updatePaymentStatus,
} from '@/services/orders.service';

export default function OrdersScreen() {
  const { t, i18n } = useTranslation('orders');
  const router = useRouter();
  const { colors } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const currentLocale = i18n.language;

  const loadOrders = async (refresh = false) => {
    try {
      if (refresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params: any = {
        page: refresh ? 1 : page,
        limit: 20,
      };

      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }

      const data = await getOrders(params);

      if (refresh) {
        setOrders(data.items);
        setPage(1);
        haptics.success();
      } else {
        setOrders(data.items);
      }

      setStats(data.stats);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      console.error('Load orders error:', error.message);
      haptics.error();
      Alert.alert(
        t('error'),
        t('failed_to_load_orders')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  // Filter orders based on search and payment status
  useEffect(() => {
    let filtered = [...orders];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone?.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.items.some(item =>
          item.productName.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query)
        )
      );
    }

    // Filter by payment status
    if (selectedPaymentStatus !== 'ALL') {
      filtered = filtered.filter((order) => order.paymentStatus === selectedPaymentStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, selectedPaymentStatus]);

  const onRefresh = useCallback(() => {
    loadOrders(true);
  }, [selectedStatus]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      haptics.medium();
      setUpdating(true);
      setShowOrderStatusModal(false);
      await updateOrderStatus(orderId, newStatus);
      haptics.success();
      Alert.alert(t('success'), t('status_updated'));
      loadOrders(true);
    } catch (error: any) {
      console.error('Update status error:', error.message);
      haptics.error();
      Alert.alert(t('error'), t('failed_to_update_status'));
    } finally {
      setUpdating(false);
      setSelectedOrder(null);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: PaymentStatus) => {
    try {
      haptics.medium();
      setUpdating(true);
      setShowPaymentStatusModal(false);
      await updatePaymentStatus(orderId, newStatus);
      haptics.success();
      Alert.alert(t('success'), t('payment_status_updated'));
      loadOrders(true);
    } catch (error: any) {
      console.error('Update payment status error:', error.message);
      haptics.error();
      Alert.alert(t('error'), t('failed_to_update_payment_status'));
    } finally {
      setUpdating(false);
      setSelectedOrder(null);
    }
  };

  const getStatCount = (status: OrderStatus): number => {
    const stat = stats.find(s => s.status === status);
    return stat?._count || 0;
  };

  const renderSearchBar = () => {
    return (
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('search_orders')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.length > 0) {
              haptics.selection();
            }
          }}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              haptics.light();
            }}
            haptic={false}
            style={styles.clearButton}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFilterButton = () => {
    const activeFiltersCount =
      (selectedStatus !== 'ALL' ? 1 : 0) +
      (selectedPaymentStatus !== 'ALL' ? 1 : 0);

    return (
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: colors.card }]}
        onPress={() => {
          haptics.light();
          setShowFilters(!showFilters);
        }}
        hapticType="light"
      >
        <View style={styles.filterButtonLeft}>
          <Text style={styles.filterIcon}>🔽</Text>
          <Text style={[styles.filterButtonText, { color: '#FFFFFF' }]}>
            Filter Orders
          </Text>
        </View>
        {activeFiltersCount > 0 && (
          <View style={[styles.activeFilterBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.activeFilterBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
        <Text style={[styles.filterArrow, { color: colors.textSecondary }]}>
          {showFilters ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    const paymentStatuses: Array<PaymentStatus | 'ALL'> = [
      'ALL',
      'PENDING',
      'PAID',
      'FAILED',
      'REFUNDED',
    ];

    const orderStatuses: Array<OrderStatus | 'ALL'> = [
      'ALL',
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];

    return (
      <AnimatedCard index={0} style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
        {/* Payment Status Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>
            {t('payment_status')}
          </Text>
          <View style={styles.filterChipsContainer}>
            {paymentStatuses.map((status) => {
              const isSelected = selectedPaymentStatus === status;
              const count = status === 'ALL'
                ? orders.length
                : orders.filter(o => o.paymentStatus === status).length;

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChipSimple,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setSelectedPaymentStatus(status);
                  }}
                  haptic={false}
                >
                  <Text
                    style={[
                      styles.filterChipTextSimple,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {status === 'ALL' ? t('all') : t(`payment_${status.toLowerCase()}`)}
                  </Text>
                  {count > 0 && (
                    <Text
                      style={[
                        styles.filterChipCount,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {count}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Order Status Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>
            {t('order_status')}
          </Text>
          <View style={styles.filterChipsContainer}>
            {orderStatuses.map((status) => {
              const isSelected = selectedStatus === status;
              const count = status === 'ALL' ? orders.length : getStatCount(status);

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChipSimple,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    haptics.selection();
                    setSelectedStatus(status);
                  }}
                  haptic={false}
                >
                  <Text
                    style={[
                      styles.filterChipTextSimple,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {t(`status_${status.toLowerCase()}`)}
                  </Text>
                  {count > 0 && (
                    <Text
                      style={[
                        styles.filterChipCount,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {count}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reset Filters Button */}
        {(selectedStatus !== 'ALL' || selectedPaymentStatus !== 'ALL') && (
          <TouchableOpacity
            style={[styles.resetFiltersButton, { backgroundColor: colors.error }]}
            onPress={() => {
              haptics.medium();
              setSelectedStatus('ALL');
              setSelectedPaymentStatus('ALL');
            }}
            hapticType="medium"
          >
            <Text style={styles.resetFiltersText}>{t('reset_filters')}</Text>
          </TouchableOpacity>
        )}
      </AnimatedCard>
    );
  };

  const renderOrderStatusModal = () => {
    if (!selectedOrder) return null;

    const statuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ];

    return (
      <Modal
        visible={showOrderStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowOrderStatusModal(false);
          setSelectedOrder(null);
        }}
      >
        <RNTouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowOrderStatusModal(false);
            setSelectedOrder(null);
          }}
        >
          <RNTouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('change_order_status')}
              </Text>
              <RNTouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowOrderStatusModal(false);
                  setSelectedOrder(null);
                }}
              >
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </RNTouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {statuses.map((status) => {
                const info = getOrderStatusInfo(status);
                const isSelected = selectedOrder.status === status;

                return (
                  <RNTouchableOpacity
                    key={status}
                    style={[
                      styles.modalOption,
                      isSelected && { backgroundColor: `${info.color}15` },
                      { borderBottomColor: colors.border },
                    ]}
                    onPress={() => {
                      haptics.selection();
                      handleStatusChange(selectedOrder.id, status);
                    }}
                    disabled={updating}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>
                      {t(`status_${status.toLowerCase()}`)}
                    </Text>
                    {isSelected && (
                      <Text style={{ fontSize: 20, color: info.color }}>✓</Text>
                    )}
                  </RNTouchableOpacity>
                );
              })}
            </ScrollView>
            </View>
          </RNTouchableOpacity>
        </RNTouchableOpacity>
      </Modal>
    );
  };

  const renderPaymentStatusModal = () => {
    if (!selectedOrder) return null;

    const statuses: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

    return (
      <Modal
        visible={showPaymentStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPaymentStatusModal(false);
          setSelectedOrder(null);
        }}
      >
        <RNTouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowPaymentStatusModal(false);
            setSelectedOrder(null);
          }}
        >
          <RNTouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t('change_payment_status')}
                </Text>
                <RNTouchableOpacity
                  onPress={() => {
                    haptics.light();
                    setShowPaymentStatusModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
                </RNTouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {statuses.map((status) => {
                  const info = getPaymentStatusInfo(status);
                  const isSelected = selectedOrder.paymentStatus === status;

                  return (
                    <RNTouchableOpacity
                      key={status}
                      style={[
                        styles.modalOption,
                        isSelected && { backgroundColor: `${info.color}15` },
                        { borderBottomColor: colors.border },
                      ]}
                      onPress={() => {
                        haptics.selection();
                        handlePaymentStatusChange(selectedOrder.id, status);
                      }}
                      disabled={updating}
                    >
                      <Text style={[styles.modalOptionText, { color: colors.text }]}>
                        {t(`payment_${status.toLowerCase()}`)}
                      </Text>
                      {isSelected && (
                        <Text style={{ fontSize: 20, color: info.color }}>✓</Text>
                      )}
                    </RNTouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </RNTouchableOpacity>
        </RNTouchableOpacity>
      </Modal>
    );
  };

  const renderOrderCard = (order: Order, index: number) => {
    const statusInfo = getOrderStatusInfo(order.status);
    const paymentInfo = getPaymentStatusInfo(order.paymentStatus);

    return (
      <AnimatedCard
        key={order.id}
        index={index}
        staggerDelay={50}
        style={[styles.orderCard, { backgroundColor: colors.surface }]}
      >
        <TouchableOpacity
          onPress={() => {
            haptics.light();
            router.push(`/orders/${order.id}`);
          }}
          activeOpacity={0.7}
          haptic={false}
        >
          {/* Order Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text style={[styles.orderNumber, { color: colors.text }]}>
                {order.orderNumber}
              </Text>
              <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                {new Date(order.createdAt).toLocaleDateString(currentLocale, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.orderHeaderRight}>
              <Text style={[styles.orderTotal, { color: colors.text }]}>
                {formatCurrency(order.total, order.currency || 'SAR', currentLocale)}
              </Text>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.customerInfo}>
            <Text style={{ fontSize: 16 }}>👤</Text>
            <Text style={[styles.customerName, { color: colors.text }]}>
              {order.customerName}
            </Text>
            {order.customerPhone && (
              <Text style={[styles.customerPhone, { color: colors.textSecondary }]}>
                {order.customerPhone}
              </Text>
            )}
          </View>

          {/* Order Items */}
          <View style={styles.orderItems}>
            {order.items.slice(0, 2).map((item, index) => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.productName || item.name}
                </Text>
                <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                  {t('quantity')}: {item.quantity}
                </Text>
              </View>
            ))}
            {order.items.length > 2 && (
              <Text style={[styles.moreItems, { color: colors.textSecondary }]}>
                {t('and_more_items', { count: order.items.length - 2 })}
              </Text>
            )}
          </View>

          {/* Status & Payment */}
          <View style={styles.orderFooter}>
            <TouchableOpacity
              style={[
                styles.statusBadgeContainer,
                { backgroundColor: `${statusInfo.color}20` },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                haptics.light();
                setSelectedOrder(order);
                setShowOrderStatusModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14 }}>{statusInfo.icon}</Text>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {t(`status_${order.status.toLowerCase()}`)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentBadgeContainer,
                { backgroundColor: `${paymentInfo.color}20` },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                haptics.light();
                setSelectedOrder(order);
                setShowPaymentStatusModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14 }}>{paymentInfo.icon}</Text>
              <Text style={[styles.paymentText, { color: paymentInfo.color }]}>
                {t(`payment_${order.paymentStatus?.toLowerCase() || 'pending'}`)}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        {order.status === 'PENDING' && (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleStatusChange(order.id, 'CONFIRMED')}
              hapticType="medium"
              scaleValue={0.97}
            >
              <Text style={styles.actionButtonText}>{t('confirm')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
              onPress={() => handleStatusChange(order.id, 'CANCELLED')}
              hapticType="heavy"
              scaleValue={0.97}
            >
              <Text style={styles.actionButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </AnimatedCard>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('loading_orders')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modals */}
      {renderOrderStatusModal()}
      {renderPaymentStatusModal()}

      {/* Header */}
      <View style={styles.headerContainer}>
        <PageHeader
          title={t('orders')}
        />
      </View>

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Filter Button */}
      {renderFilterButton()}

      {/* Filters (collapsible) */}
      {renderFilters()}

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: `${colors.primary}10` }]}>
            <Text style={{ fontSize: 48 }}>📦</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {searchQuery || selectedPaymentStatus !== 'ALL'
                ? t('no_orders_match_filters')
                : t('no_orders_found')}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order, index) => renderOrderCard(order, index))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginTop: spacing.m,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    fontSize: 24,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    marginBottom: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  // Filter Button
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flex: 1,
  },
  filterIcon: {
    fontSize: 18,
  },
  filterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 0,
    minWidth: 120,
  },
  activeFilterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.s,
  },
  activeFilterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterArrow: {
    fontSize: 14,
    marginLeft: spacing.s,
  },
  // Filters Container
  filtersContainer: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    padding: spacing.m,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterSection: {
    marginBottom: spacing.m,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  filterChipSimple: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterChipTextSimple: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  resetFiltersButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.s,
  },
  resetFiltersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
  },
  orderCard: {
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    gap: spacing.xs,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  customerPhone: {
    fontSize: 12,
  },
  orderItems: {
    marginBottom: spacing.m,
  },
  orderItem: {
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: 14,
  },
  itemQuantity: {
    fontSize: 12,
    marginTop: 2,
  },
  moreItems: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 4,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.s,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: spacing.xxl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: spacing.m,
    textAlign: 'center',
  },
});
