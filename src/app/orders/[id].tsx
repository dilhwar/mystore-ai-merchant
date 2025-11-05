import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { TouchableOpacity } from '@/components/ui/TouchableOpacity';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { haptics } from '@/utils/haptics';
import { spacing } from '@/theme/spacing';
import { formatCurrency } from '@/utils/currency';
import {
  Box,
  HStack,
  VStack,
  Text as GText,
  Heading,
  Pressable,
  Badge,
  BadgeText,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@gluestack-ui/themed';
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  AlertCircle,
  Package,
  ArrowLeft,
} from 'lucide-react-native';
import {
  getOrder,
  Order,
  OrderStatus,
  PaymentStatus,
  getOrderStatusInfo,
  getPaymentStatusInfo,
  updateOrderStatus,
  updatePaymentStatus,
} from '@/services/orders.service';

// Helper function to get status config
const getStatusConfig = (status: OrderStatus) => {
  const configs = {
    PENDING: { color: '$warning500', bg: '$warning100', darkBg: '$warning900', icon: Clock },
    CONFIRMED: { color: '$info500', bg: '$info100', darkBg: '$info900', icon: CheckCircle },
    PROCESSING: { color: '$purple500', bg: '$purple100', darkBg: '$purple900', icon: Package },
    SHIPPED: { color: '$primary500', bg: '$primary100', darkBg: '$primary900', icon: Truck },
    DELIVERED: { color: '$success500', bg: '$success100', darkBg: '$success900', icon: CheckCircle },
    CANCELLED: { color: '$error500', bg: '$error100', darkBg: '$error900', icon: XCircle },
    REFUNDED: { color: '$error500', bg: '$error100', darkBg: '$error900', icon: DollarSign },
  };
  return configs[status] || configs.PENDING;
};

const getPaymentStatusConfig = (status: PaymentStatus) => {
  const configs = {
    PENDING: { color: '$warning500', bg: '$warning100', darkBg: '$warning900', icon: Clock },
    PAID: { color: '$success500', bg: '$success100', darkBg: '$success900', icon: CheckCircle },
    FAILED: { color: '$error500', bg: '$error100', darkBg: '$error900', icon: XCircle },
    REFUNDED: { color: '$error500', bg: '$error100', darkBg: '$error900', icon: DollarSign },
  };
  return configs[status] || configs.PENDING;
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation('orders');
  const { colors, isDark } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);

  const currentLocale = i18n.language;

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrder(id);
      setOrder(data);
    } catch (error: any) {
      console.error('Load order error:', error.message);
      haptics.error();
      Alert.alert(t('error'), t('failed_to_load_order'));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      haptics.medium();
      setUpdating(true);
      setShowOrderStatusModal(false);
      await updateOrderStatus(order.id, newStatus);
      haptics.success();
      Alert.alert(t('success'), t('status_updated'));
      loadOrderDetails();
    } catch (error: any) {
      console.error('Update status error:', error.message);
      haptics.error();
      Alert.alert(t('error'), t('failed_to_update_status'));
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    if (!order) return;

    try {
      haptics.medium();
      setUpdating(true);
      setShowPaymentStatusModal(false);
      await updatePaymentStatus(order.id, newStatus);
      haptics.success();
      Alert.alert(t('success'), t('payment_status_updated'));
      loadOrderDetails();
    } catch (error: any) {
      console.error('Update payment status error:', error.message);
      haptics.error();
      Alert.alert(t('error'), t('failed_to_update_payment_status'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('loading_order_details')}
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {t('order_not_found')}
        </Text>
      </View>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);
  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);

  const renderOrderStatusModal = () => {
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
      <Actionsheet
        isOpen={showOrderStatusModal}
        onClose={() => setShowOrderStatusModal(false)}
        zIndex={999}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent zIndex={999} bg="$cardLight" $dark-bg="$cardDark">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack w="$full" py="$2" px="$4" space="md">
            {/* Header */}
            <Heading size="lg" color="$textLight" $dark-color="$textDark">
              {t('change_order_status')}
            </Heading>

            {/* Status Grid - 2 columns */}
            <HStack space="sm" flexWrap="wrap" justifyContent="space-between" pb="$4">
              {statuses.map((status) => {
                const isSelected = order?.status === status;
                const statusConfig = getStatusConfig(status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Pressable
                    key={status}
                    onPress={() => {
                      handleStatusChange(status);
                      haptics.selection();
                    }}
                    disabled={updating}
                    w="48%"
                    mb="$2"
                  >
                    <Box
                      px="$3"
                      py="$3.5"
                      bg={isSelected ? statusConfig.color : '$surfaceLight'}
                      $dark-bg={isSelected ? statusConfig.color : '$surfaceDark'}
                      borderRadius="$xl"
                      borderWidth={2}
                      borderColor={isSelected ? statusConfig.color : '$borderLight'}
                      $dark-borderColor={isSelected ? statusConfig.color : '$borderDark'}
                    >
                      <VStack space="sm">
                        <HStack justifyContent="space-between" alignItems="center">
                          <Box
                            w={36}
                            h={36}
                            borderRadius="$full"
                            bg={isSelected ? 'rgba(255, 255, 255, 0.25)' : (isDark ? statusConfig.darkBg : statusConfig.bg)}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <StatusIcon
                              size={18}
                              color={isSelected ? '#FFFFFF' : colors[statusConfig.color.replace('$', '') as keyof typeof colors]}
                              strokeWidth={2.5}
                            />
                          </Box>
                          {isSelected && (
                            <CheckCircle size={20} color="#FFFFFF" strokeWidth={3} />
                          )}
                        </HStack>
                        <GText
                          fontSize="$sm"
                          fontWeight={isSelected ? '$bold' : '$semibold'}
                          color={isSelected ? '$white' : '$textLight'}
                          $dark-color={isSelected ? '$white' : '$textDark'}
                          numberOfLines={2}
                        >
                          {t(`status_${status.toLowerCase()}`)}
                        </GText>
                      </VStack>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    );
  };

  const renderPaymentStatusModal = () => {
    const statuses: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

    return (
      <Actionsheet
        isOpen={showPaymentStatusModal}
        onClose={() => setShowPaymentStatusModal(false)}
        zIndex={999}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent zIndex={999} bg="$cardLight" $dark-bg="$cardDark">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack w="$full" py="$2" px="$4" space="md">
            {/* Header */}
            <Heading size="lg" color="$textLight" $dark-color="$textDark">
              {t('change_payment_status')}
            </Heading>

            {/* Payment Status Grid - 2 columns */}
            <HStack space="sm" flexWrap="wrap" justifyContent="space-between" pb="$4">
              {statuses.map((status) => {
                const isSelected = order?.paymentStatus === status;
                const statusConfig = getPaymentStatusConfig(status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Pressable
                    key={status}
                    onPress={() => {
                      handlePaymentStatusChange(status);
                      haptics.selection();
                    }}
                    disabled={updating}
                    w="48%"
                    mb="$2"
                  >
                    <Box
                      px="$3"
                      py="$3.5"
                      bg={isSelected ? statusConfig.color : '$surfaceLight'}
                      $dark-bg={isSelected ? statusConfig.color : '$surfaceDark'}
                      borderRadius="$xl"
                      borderWidth={2}
                      borderColor={isSelected ? statusConfig.color : '$borderLight'}
                      $dark-borderColor={isSelected ? statusConfig.color : '$borderDark'}
                    >
                      <VStack space="sm">
                        <HStack justifyContent="space-between" alignItems="center">
                          <Box
                            w={36}
                            h={36}
                            borderRadius="$full"
                            bg={isSelected ? 'rgba(255, 255, 255, 0.25)' : (isDark ? statusConfig.darkBg : statusConfig.bg)}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <StatusIcon
                              size={18}
                              color={isSelected ? '#FFFFFF' : colors[statusConfig.color.replace('$', '') as keyof typeof colors]}
                              strokeWidth={2.5}
                            />
                          </Box>
                          {isSelected && (
                            <CheckCircle size={20} color="#FFFFFF" strokeWidth={3} />
                          )}
                        </HStack>
                        <GText
                          fontSize="$sm"
                          fontWeight={isSelected ? '$bold' : '$semibold'}
                          color={isSelected ? '$white' : '$textLight'}
                          $dark-color={isSelected ? '$white' : '$textDark'}
                          numberOfLines={2}
                        >
                          {t(`payment_${status.toLowerCase()}`)}
                        </GText>
                      </VStack>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'Order Details',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Modals */}
        {renderOrderStatusModal()}
        {renderPaymentStatusModal()}

        {/* Header */}
        <Box bg="$cardLight" $dark-bg="$cardDark" pt="$12" pb="$4" px="$4">
        <HStack alignItems="center" space="md" mb="$3">
          {/* Back Button */}
          <Pressable
            onPress={() => {
              haptics.light();
              router.back();
            }}
            w={40}
            h={40}
            borderRadius="$full"
            bg="$surfaceLight"
            $dark-bg="$surfaceDark"
            alignItems="center"
            justifyContent="center"
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
          </Pressable>

          {/* Title */}
          <VStack flex={1}>
            <Heading size="lg" color="$textLight" $dark-color="$textDark">
              Order Details
            </Heading>
            <GText fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
              {order.orderNumber}
            </GText>
          </VStack>
        </HStack>

        {/* Date */}
        <GText fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign="center">
          {new Date(order.createdAt).toLocaleDateString(currentLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </GText>
      </Box>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status & Payment Cards */}
        <Box px="$4" mb="$4">
          <HStack space="md">
            {/* Order Status Card */}
            <Box flex={1}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  setShowOrderStatusModal(true);
                }}
              >
                <Box
                  bg="$cardLight"
                  $dark-bg="$cardDark"
                  borderRadius="$xl"
                  p="$4"
                  borderWidth={2}
                  borderColor={getStatusConfig(order.status).color}
                >
                  <VStack space="sm">
                    <GText fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" fontWeight="$medium">
                      {t('order_status')}
                    </GText>

                    <Box
                      bg={getStatusConfig(order.status).color}
                      borderRadius="$lg"
                      p="$2.5"
                    >
                      <HStack space="xs" alignItems="center" justifyContent="center">
                        {React.createElement(getStatusConfig(order.status).icon, {
                          size: 18,
                          color: '#FFFFFF',
                          strokeWidth: 2.5,
                        })}
                        <GText fontSize="$sm" color="$white" fontWeight="$bold" numberOfLines={1}>
                          {t(`status_${order.status?.toLowerCase() || 'pending'}`)}
                        </GText>
                      </HStack>
                    </Box>

                    <GText fontSize="$2xs" color="$textTertiaryLight" $dark-color="$textTertiaryDark" textAlign="center">
                      {t('tap_to_change')}
                    </GText>
                  </VStack>
                </Box>
              </Pressable>
            </Box>

            {/* Payment Status Card */}
            <Box flex={1}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  setShowPaymentStatusModal(true);
                }}
              >
                <Box
                  bg="$cardLight"
                  $dark-bg="$cardDark"
                  borderRadius="$xl"
                  p="$4"
                  borderWidth={2}
                  borderColor={getPaymentStatusConfig(order.paymentStatus).color}
                >
                  <VStack space="sm">
                    <GText fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" fontWeight="$medium">
                      {t('payment_status')}
                    </GText>

                    <Box
                      bg={getPaymentStatusConfig(order.paymentStatus).color}
                      borderRadius="$lg"
                      p="$2.5"
                    >
                      <HStack space="xs" alignItems="center" justifyContent="center">
                        {React.createElement(getPaymentStatusConfig(order.paymentStatus).icon, {
                          size: 18,
                          color: '#FFFFFF',
                          strokeWidth: 2.5,
                        })}
                        <GText fontSize="$sm" color="$white" fontWeight="$bold" numberOfLines={1}>
                          {t(`payment_${order.paymentStatus?.toLowerCase() || 'pending'}`)}
                        </GText>
                      </HStack>
                    </Box>

                    <GText fontSize="$2xs" color="$textTertiaryLight" $dark-color="$textTertiaryDark" textAlign="center">
                      {t('tap_to_change')}
                    </GText>
                  </VStack>
                </Box>
              </Pressable>
            </Box>
          </HStack>
        </Box>

        {/* Customer Info */}
        <AnimatedCard index={2} style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('customer_info')}
          </Text>
          <View style={styles.infoRow}>
            <Text style={{ fontSize: 20 }}>👤</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('customer_name')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {order.customerName}
              </Text>
            </View>
          </View>
          {order.customerPhone && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>📱</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('phone')}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {order.customerPhone}
                </Text>
              </View>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={{ fontSize: 20 }}>📧</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('email')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {order.customerEmail}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Order Items */}
        <AnimatedCard index={3} style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('order_items')}
          </Text>
          {order.items?.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index < order.items.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              {item.productImage ? (
                <Image source={{ uri: item.productImage }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.background }]}>
                  <Text style={{ fontSize: 24 }}>📦</Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.productName || item.name}
                </Text>
                {item.sku && (
                  <Text style={[styles.itemSku, { color: colors.textSecondary }]}>
                    SKU: {item.sku}
                  </Text>
                )}
                <View style={styles.itemPriceRow}>
                  <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                    {t('quantity')}: {item.quantity}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    {formatCurrency(item.price, order.currency || 'SAR', currentLocale)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.itemTotal, { color: colors.text }]}>
                {formatCurrency(item.total, order.currency || 'SAR', currentLocale)}
              </Text>
            </View>
          ))}
        </AnimatedCard>

        {/* Order Summary */}
        <AnimatedCard index={4} style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('order_summary')}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('subtotal')}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(order.subtotal || 0, order.currency || 'SAR', currentLocale)}
            </Text>
          </View>
          {(order.shippingCost || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('shipping')}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(order.shippingCost || 0, order.currency || 'SAR', currentLocale)}
              </Text>
            </View>
          )}
          {(order.tax || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('tax')}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(order.tax || 0, order.currency || 'SAR', currentLocale)}
              </Text>
            </View>
          )}
          {(order.discount || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.error }]}>
                {t('discount')}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>
                -{formatCurrency(order.discount || 0, order.currency || 'SAR', currentLocale)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {t('total')}
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatCurrency(order.total || 0, order.currency || 'SAR', currentLocale)}
            </Text>
          </View>
        </AnimatedCard>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <AnimatedCard index={5} style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('shipping_address')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {order.shippingAddress.address}
                </Text>
                {order.shippingAddress.city && (
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {order.shippingAddress.city}
                    {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                    {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                  </Text>
                )}
                {order.shippingAddress.country && (
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {order.shippingAddress.country}
                  </Text>
                )}
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Notes */}
        {(order.notes || order.customerNotes) && (
          <AnimatedCard index={6} style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('notes')}
            </Text>
            {order.customerNotes && (
              <View style={styles.noteBlock}>
                <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
                  {t('customer_notes')}:
                </Text>
                <Text style={[styles.noteText, { color: colors.text }]}>
                  {order.customerNotes}
                </Text>
              </View>
            )}
            {order.notes && (
              <View style={styles.noteBlock}>
                <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
                  {t('internal_notes')}:
                </Text>
                <Text style={[styles.noteText, { color: colors.text }]}>
                  {order.notes}
                </Text>
              </View>
            )}
          </AnimatedCard>
        )}

        {/* Quick Actions */}
        {order.status === 'PENDING' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleStatusChange('CONFIRMED')}
              disabled={updating}
              hapticType="medium"
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>{t('confirm_order')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={() => handleStatusChange('CANCELLED')}
              disabled={updating}
              hapticType="heavy"
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>{t('cancel_order')}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    paddingTop: spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.m,
  },
  statusCard: {
    flex: 1,
    padding: spacing.m,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: spacing.s,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusHint: {
    fontSize: 10,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
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
  section: {
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
    gap: spacing.s,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: spacing.m,
    gap: spacing.m,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: spacing.s,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  noteBlock: {
    marginBottom: spacing.m,
  },
  noteLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.m,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
