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
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { TouchableOpacity } from '@/components/ui/TouchableOpacity';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { haptics } from '@/utils/haptics';
import { spacing } from '@/theme/spacing';
import { formatCurrency } from '@/utils/currency';
import * as Print from 'expo-print';
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
  ExternalLink,
  Printer,
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
    PENDING: { color: '$warning500', darkColor: '$warning300', bg: '$warning100', darkBg: '$warning900', icon: Clock, iconColor: '#f59e0b', iconColorDark: '#fbbf24' },
    CONFIRMED: { color: '$info500', darkColor: '$info300', bg: '$info100', darkBg: '$info900', icon: CheckCircle, iconColor: '#3b82f6', iconColorDark: '#60a5fa' },
    PROCESSING: { color: '$purple500', darkColor: '$purple300', bg: '$purple100', darkBg: '$purple900', icon: Package, iconColor: '#8b5cf6', iconColorDark: '#a78bfa' },
    SHIPPED: { color: '$primary500', darkColor: '$primary300', bg: '$primary100', darkBg: '$primary900', icon: Truck, iconColor: '#6366f1', iconColorDark: '#818cf8' },
    DELIVERED: { color: '$success500', darkColor: '$success300', bg: '$success100', darkBg: '$success900', icon: CheckCircle, iconColor: '#10b981', iconColorDark: '#34d399' },
    CANCELLED: { color: '$error500', darkColor: '$error300', bg: '$error100', darkBg: '$error900', icon: XCircle, iconColor: '#ef4444', iconColorDark: '#f87171' },
    REFUNDED: { color: '$error500', darkColor: '$error300', bg: '$error100', darkBg: '$error900', icon: DollarSign, iconColor: '#ef4444', iconColorDark: '#f87171' },
  };
  return configs[status] || configs.PENDING;
};

const getPaymentStatusConfig = (status: PaymentStatus) => {
  const configs = {
    PENDING: { color: '$warning500', darkColor: '$warning300', bg: '$warning100', darkBg: '$warning900', icon: Clock, iconColor: '#f59e0b', iconColorDark: '#fbbf24' },
    PAID: { color: '$success500', darkColor: '$success300', bg: '$success100', darkBg: '$success900', icon: CheckCircle, iconColor: '#10b981', iconColorDark: '#34d399' },
    FAILED: { color: '$error500', darkColor: '$error300', bg: '$error100', darkBg: '$error900', icon: XCircle, iconColor: '#ef4444', iconColorDark: '#f87171' },
    REFUNDED: { color: '$error500', darkColor: '$error300', bg: '$error100', darkBg: '$error900', icon: DollarSign, iconColor: '#ef4444', iconColorDark: '#f87171' },
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

  const handlePrintOrder = async () => {
    if (!order) return;

    try {
      haptics.light();

      const merchantCurrency = order.currency || 'SAR';

      // Generate HTML for printing
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body {
                font-family: 'Arial', sans-serif;
                padding: 20px;
                color: #333;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
              }
              .header p {
                margin: 5px 0;
                color: #666;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
              }
              .label {
                font-weight: 600;
                color: #555;
              }
              .value {
                color: #333;
              }
              .status-badge {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 5px;
                font-weight: bold;
                font-size: 12px;
              }
              .status-pending { background-color: #FEF3C7; color: #92400E; }
              .status-confirmed { background-color: #DBEAFE; color: #1E3A8A; }
              .status-processing { background-color: #E9D5FF; color: #5B21B6; }
              .status-shipped { background-color: #DBEAFE; color: #1E40AF; }
              .status-delivered { background-color: #D1FAE5; color: #065F46; }
              .status-cancelled { background-color: #FEE2E2; color: #991B1B; }
              .status-refunded { background-color: #FEE2E2; color: #991B1B; }
              .payment-pending { background-color: #FEF3C7; color: #92400E; }
              .payment-paid { background-color: #D1FAE5; color: #065F46; }
              .payment-failed { background-color: #FEE2E2; color: #991B1B; }
              .payment-refunded { background-color: #FEE2E2; color: #991B1B; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th {
                background-color: #f3f4f6;
                padding: 10px;
                text-align: left;
                font-weight: 600;
                border-bottom: 2px solid #ddd;
              }
              td {
                padding: 10px;
                border-bottom: 1px solid #eee;
              }
              .total-section {
                margin-top: 20px;
                text-align: right;
              }
              .total-row {
                display: flex;
                justify-content: flex-end;
                padding: 5px 0;
              }
              .total-label {
                min-width: 150px;
                text-align: right;
                padding-right: 20px;
                font-weight: 600;
              }
              .total-value {
                min-width: 120px;
                text-align: right;
              }
              .grand-total {
                font-size: 18px;
                font-weight: bold;
                border-top: 2px solid #333;
                padding-top: 10px;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Order Details</h1>
              <p>Order Number: ${order.orderNumber}</p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString(currentLocale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
            </div>

            <div class="section">
              <div class="section-title">Status</div>
              <div class="info-row">
                <span class="label">Order Status:</span>
                <span class="status-badge status-${order.status.toLowerCase()}">${t(`status_${order.status.toLowerCase()}`)}</span>
              </div>
              <div class="info-row">
                <span class="label">Payment Status:</span>
                <span class="status-badge payment-${order.paymentStatus.toLowerCase()}">${t(`payment_${order.paymentStatus.toLowerCase()}`)}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${order.customerName}</span>
              </div>
              ${order.customerEmail ? `
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${order.customerEmail}</span>
              </div>
              ` : ''}
              ${order.customerPhone ? `
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${order.customerPhone}</span>
              </div>
              ` : ''}
              ${(order.customerInfo?.street || order.customerInfo?.city) ? `
              <div class="info-row">
                <span class="label">Address:</span>
                <span class="value">
                  ${order.customerInfo.street || ''}${order.customerInfo.city ? `, ${order.customerInfo.city}` : ''}
                </span>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">Payment Details</div>
              <div class="info-row">
                <span class="label">Payment Method:</span>
                <span class="value">${order.paymentMethod}</span>
              </div>
              ${(order as any).paypalOrderId ? `
              <div class="info-row">
                <span class="label">PayPal Order ID:</span>
                <span class="value">${(order as any).paypalOrderId}</span>
              </div>
              ` : ''}
              ${(order as any).paypalTransactionId ? `
              <div class="info-row">
                <span class="label">PayPal Transaction ID:</span>
                <span class="value">${(order as any).paypalTransactionId}</span>
              </div>
              ` : ''}
              ${(order as any).paypalPayerEmail ? `
              <div class="info-row">
                <span class="label">PayPal Email:</span>
                <span class="value">${(order as any).paypalPayerEmail}</span>
              </div>
              ` : ''}
              ${(order as any).stripePaymentIntentId ? `
              <div class="info-row">
                <span class="label">Stripe Payment Intent:</span>
                <span class="value">${(order as any).stripePaymentIntentId}</span>
              </div>
              ` : ''}
              ${(order as any).stripeChargeId ? `
              <div class="info-row">
                <span class="label">Stripe Charge ID:</span>
                <span class="value">${(order as any).stripeChargeId}</span>
              </div>
              ` : ''}
              ${(order as any).stripeCustomerEmail ? `
              <div class="info-row">
                <span class="label">Stripe Email:</span>
                <span class="value">${(order as any).stripeCustomerEmail}</span>
              </div>
              ` : ''}
              ${(order as any).paymentReceiptUrl ? `
              <div class="info-row">
                <span class="label">Payment Receipt:</span>
                <span class="value">${(order as any).paymentReceiptUrl}</span>
              </div>
              ` : ''}
            </div>

            ${order.shippingAddress ? `
            <div class="section">
              <div class="section-title">Shipping Address</div>
              <div class="info-row">
                <span class="value">
                  ${order.shippingAddress.street || ''}<br/>
                  ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.postalCode || ''}<br/>
                  ${order.shippingAddress.country || ''}
                </span>
              </div>
            </div>
            ` : ''}

            ${(order.trackingNumber || order.trackingToken) ? `
            <div class="section">
              <div class="section-title">Tracking Information</div>
              ${order.trackingNumber ? `
              <div class="info-row">
                <span class="label">Tracking Number:</span>
                <span class="value">${order.trackingNumber}</span>
              </div>
              ` : ''}
              ${order.trackingToken ? `
              <div class="info-row">
                <span class="label">Tracking URL:</span>
                <span class="value">https://shop.my-store.ai/track/${order.trackingToken}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}

            <div class="section">
              <div class="section-title">Order Items</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map((item) => {
                    // Parse productData if it's a string
                    let productData = item.productData;
                    if (typeof productData === 'string') {
                      try {
                        productData = JSON.parse(productData);
                      } catch (e) {
                        productData = null;
                      }
                    }

                    // Get variant name from selectedVariants
                    const variantName = productData?.selectedVariants
                      ? Object.entries(productData.selectedVariants)
                          .map(([key, value]) => `${value}`)
                          .join(' - ')
                      : '';

                    return `
                    <tr>
                      <td>
                        ${item.productName}
                        ${variantName ? `<br/><small style="color: #666; font-style: italic;">${variantName}</small>` : ''}
                        ${item.sku ? `<br/><small style="color: #999;">SKU: ${item.sku}</small>` : ''}
                      </td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.price, merchantCurrency, currentLocale)}</td>
                      <td>${formatCurrency(item.total, merchantCurrency, currentLocale)}</td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">${formatCurrency(order.subtotal, merchantCurrency, currentLocale)}</span>
              </div>
              ${order.shippingCost > 0 ? `
              <div class="total-row">
                <span class="total-label">Shipping:</span>
                <span class="total-value">${formatCurrency(order.shippingCost, merchantCurrency, currentLocale)}</span>
              </div>
              ` : ''}
              ${order.tax && order.tax > 0 ? `
              <div class="total-row">
                <span class="total-label">Tax:</span>
                <span class="total-value">${formatCurrency(order.tax, merchantCurrency, currentLocale)}</span>
              </div>
              ` : ''}
              ${order.discount && order.discount > 0 ? `
              <div class="total-row">
                <span class="total-label">Discount:</span>
                <span class="total-value">-${formatCurrency(order.discount, merchantCurrency, currentLocale)}</span>
              </div>
              ` : ''}
              <div class="total-row grand-total">
                <span class="total-label">Total:</span>
                <span class="total-value">${formatCurrency(order.total, merchantCurrency, currentLocale)}</span>
              </div>
            </div>

            ${order.notes || order.customerNotes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              ${order.notes ? `
              <div class="info-row">
                <span class="label">Merchant Notes:</span>
                <span class="value">${order.notes}</span>
              </div>
              ` : ''}
              ${order.customerNotes ? `
              <div class="info-row">
                <span class="label">Customer Notes:</span>
                <span class="value">${order.customerNotes}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
          </body>
        </html>
      `;

      const result = await Print.printAsync({
        html,
      });

      // Only show success if printing actually completed
      if (result) {
        haptics.success();
      }
    } catch (error: any) {
      // Only show error if it's not a user cancellation
      if (error?.message && !error.message.includes('did not complete')) {
        console.error('Print error:', error);
        haptics.error();
        Alert.alert(t('error'), t('failed_to_print') || 'Failed to print order details');
      }
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
                              color={
                                isSelected
                                  ? '#FFFFFF'
                                  : (isDark ? statusConfig.iconColorDark : statusConfig.iconColor)
                              }
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
                              color={
                                isSelected
                                  ? '#FFFFFF'
                                  : (isDark ? statusConfig.iconColorDark : statusConfig.iconColor)
                              }
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

          {/* Print Button */}
          <Pressable
            onPress={handlePrintOrder}
            w={40}
            h={40}
            borderRadius="$full"
            bg="$primary500"
            alignItems="center"
            justifyContent="center"
          >
            <Printer size={20} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
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
        <Box px="$4" mb="$3">
          <HStack space="sm">
            {/* Order Status Card */}
            <Pressable
              flex={1}
              onPress={() => {
                haptics.light();
                setShowOrderStatusModal(true);
              }}
              $active-opacity={0.85}
              $active-scale={0.97}
            >
              <Box
                borderRadius="$xl"
                p="$3"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
                  borderWidth: 1.5,
                  borderColor: isDark
                    ? 'rgba(99, 102, 241, 0.3)'
                    : 'rgba(99, 102, 241, 0.25)',
                }}
              >
                <HStack space="sm" alignItems="center">
                  <Box
                    w={36}
                    h={36}
                    borderRadius="$lg"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(99, 102, 241, 0.25)'
                        : 'rgba(99, 102, 241, 0.15)',
                    }}
                  >
                    {React.createElement(getStatusConfig(order.status).icon, {
                      size: 18,
                      color: isDark ? '#a5b4fc' : '#6366f1',
                      strokeWidth: 2.5,
                    })}
                  </Box>
                  <VStack flex={1}>
                    <GText
                      fontSize="$2xs"
                      fontWeight="$medium"
                      style={{ color: isDark ? '#a5b4fc' : '#6366f1' }}
                    >
                      {t('order_status')}
                    </GText>
                    <GText
                      fontSize="$xs"
                      fontWeight="$bold"
                      numberOfLines={1}
                      style={{ color: isDark ? '#e0e7ff' : '#4338ca' }}
                    >
                      {t(`status_${order.status?.toLowerCase() || 'pending'}`)}
                    </GText>
                  </VStack>
                </HStack>
              </Box>
            </Pressable>

            {/* Payment Status Card */}
            <Pressable
              flex={1}
              onPress={() => {
                haptics.light();
                setShowPaymentStatusModal(true);
              }}
              $active-opacity={0.85}
              $active-scale={0.97}
            >
              <Box
                borderRadius="$xl"
                p="$3"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
                  borderWidth: 1.5,
                  borderColor: isDark
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(16, 185, 129, 0.25)',
                }}
              >
                <HStack space="sm" alignItems="center">
                  <Box
                    w={36}
                    h={36}
                    borderRadius="$lg"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(16, 185, 129, 0.25)'
                        : 'rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    {React.createElement(getPaymentStatusConfig(order.paymentStatus).icon, {
                      size: 18,
                      color: isDark ? '#6ee7b7' : '#10b981',
                      strokeWidth: 2.5,
                    })}
                  </Box>
                  <VStack flex={1}>
                    <GText
                      fontSize="$2xs"
                      fontWeight="$medium"
                      style={{ color: isDark ? '#6ee7b7' : '#10b981' }}
                    >
                      {t('payment_status')}
                    </GText>
                    <GText
                      fontSize="$xs"
                      fontWeight="$bold"
                      numberOfLines={1}
                      style={{ color: isDark ? '#d1fae5' : '#047857' }}
                    >
                      {t(`payment_${order.paymentStatus?.toLowerCase() || 'pending'}`)}
                    </GText>
                  </VStack>
                </HStack>
              </Box>
            </Pressable>
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
          {(order.customerInfo?.street || order.customerInfo?.city) && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('customer_address')}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {order.customerInfo.street}
                  {order.customerInfo.city && `, ${order.customerInfo.city}`}
                </Text>
              </View>
            </View>
          )}
        </AnimatedCard>

        {/* Payment Details */}
        <AnimatedCard index={3} style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('payment_details')}
          </Text>
          <View style={styles.infoRow}>
            <Text style={{ fontSize: 20 }}>💳</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('payment_method')}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {order.paymentMethod}
              </Text>
            </View>
          </View>

          {/* PayPal Transaction Details */}
          {(order as any).paypalOrderId && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>💰</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  PayPal Order ID
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {(order as any).paypalOrderId}
                </Text>
              </View>
            </View>
          )}
          {(order as any).paypalTransactionId && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>🧾</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  PayPal Transaction ID
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {(order as any).paypalTransactionId}
                </Text>
              </View>
            </View>
          )}
          {(order as any).paypalPayerEmail && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>📧</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  PayPal Email
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {(order as any).paypalPayerEmail}
                </Text>
              </View>
            </View>
          )}

          {/* Stripe Payment Details */}
          {(order as any).stripePaymentIntentId && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>💳</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Stripe Payment Intent
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {(order as any).stripePaymentIntentId}
                </Text>
              </View>
            </View>
          )}
          {(order as any).stripeChargeId && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>🧾</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Stripe Charge ID
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {(order as any).stripeChargeId}
                </Text>
              </View>
            </View>
          )}
          {(order as any).stripeCustomerEmail && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>📧</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Stripe Email
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {(order as any).stripeCustomerEmail}
                </Text>
              </View>
            </View>
          )}

          {/* Payment Receipt Image */}
          {(order as any).paymentReceiptUrl && (
            <View style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>🖼️</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('payment_receipt')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    Linking.openURL((order as any).paymentReceiptUrl).catch((err) => {
                      console.error('Failed to open receipt URL:', err);
                      Alert.alert(t('error'), 'Failed to open receipt');
                    });
                  }}
                  hapticType="light"
                >
                  <Image
                    source={{ uri: (order as any).paymentReceiptUrl }}
                    style={{
                      width: '100%',
                      height: 200,
                      borderRadius: 8,
                      marginTop: 8,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </AnimatedCard>

        {/* Order Items */}
        <AnimatedCard index={4} style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('order_items')}
          </Text>
          {order.items?.map((item, index) => {
            // Parse productData if it's a string
            let productData = item.productData;
            if (typeof productData === 'string') {
              try {
                productData = JSON.parse(productData);
              } catch (e) {
                console.error('Failed to parse productData:', e);
                productData = null;
              }
            }

            // Get variant name from selectedVariants
            const variantName = productData?.selectedVariants
              ? Object.entries(productData.selectedVariants)
                  .map(([key, value]) => `${value}`)
                  .join(' - ')
              : null;

            return (
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
                  {variantName && (
                    <Text style={[styles.itemVariant, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                      {variantName}
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
          );
          })}
        </AnimatedCard>

        {/* Order Summary */}
        <AnimatedCard index={5} style={[styles.section, { backgroundColor: colors.surface }]}>
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

        {/* Tracking Info */}
        {(order.trackingNumber || order.trackingToken) && (
          <AnimatedCard index={6} style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('tracking_info')}
            </Text>
            {order.trackingNumber && (
              <View style={styles.infoRow}>
                <Text style={{ fontSize: 20 }}>📦</Text>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {t('tracking_number')}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {order.trackingNumber}
                  </Text>
                </View>
              </View>
            )}
            {order.trackingToken && (
              <TouchableOpacity
                style={[styles.trackingButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  haptics.light();
                  const trackingUrl = `https://shop.my-store.ai/track/${order.trackingToken}`;
                  Linking.openURL(trackingUrl).catch((err) => {
                    console.error('Failed to open tracking URL:', err);
                    Alert.alert(t('error'), t('failed_to_open_tracking'));
                  });
                }}
                hapticType="light"
              >
                <ExternalLink size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.trackingButtonText}>{t('track_order')}</Text>
              </TouchableOpacity>
            )}
          </AnimatedCard>
        )}

        {/* Notes */}
        {(order.notes || order.customerNotes) && (
          <AnimatedCard index={7} style={[styles.section, { backgroundColor: colors.surface }]}>
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
  itemVariant: {
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
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    gap: spacing.s,
    marginTop: spacing.s,
  },
  trackingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
