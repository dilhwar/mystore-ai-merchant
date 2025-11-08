import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Dimensions, StyleSheet, View as RNView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import { haptics } from '@/utils/haptics';
import { formatCurrency } from '@/utils/currency';
import {
  Box,
  HStack,
  VStack,
  Text,
  Heading,
  Pressable,
  Badge,
  BadgeText,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Divider,
} from '@gluestack-ui/themed';
import {
  Search,
  Filter,
  Package,
  X,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  User,
  Phone,
} from 'lucide-react-native';
import { OrderCardSkeleton } from '@/components/ui/SkeletonLoader';
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

const { width } = Dimensions.get('window');

// Status badge configurations
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
    PENDING: { color: '$warning500', bg: '$warning100', darkBg: '$warning900' },
    PAID: { color: '$success500', bg: '$success100', darkBg: '$success900' },
    FAILED: { color: '$error500', bg: '$error100', darkBg: '$error900' },
    REFUNDED: { color: '$error500', bg: '$error100', darkBg: '$error900' },
  };
  return configs[status] || configs.PENDING;
};

export default function OrdersNewScreen() {
  const { t, i18n } = useTranslation('orders');
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const currentLocale = i18n.language;
  const isRTL = i18n.language === 'ar';

  const loadOrders = async (refresh = false) => {
    try {
      if (refresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params: any = {
        page: 1,
        limit: 20,
      };

      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }

      const data = await getOrders(params);

      setOrders(data.items);
      setStats(data.stats);

      if (refresh) {
        haptics.success();
      }
    } catch (error: any) {
      console.error('Load orders error:', error.message);
      haptics.error();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  // Filter orders based on search
  useEffect(() => {
    let filtered = [...orders];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerPhone?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery]);

  const onRefresh = useCallback(() => {
    loadOrders(true);
  }, [selectedStatus]);

  const getStatCount = (status: OrderStatus): number => {
    const stat = stats.find((s) => s.status === status);
    return stat?._count || 0;
  };

  const orderStatuses: Array<OrderStatus | 'ALL'> = [
    'ALL',
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  if (loading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
        {/* Header */}
        <Box px="$4" pt="$12" pb="$4">
          <Heading size="xl" color="$textLight" $dark-color="$textDark">
            {t('orders')}
          </Heading>
        </Box>

        {/* Skeletons */}
        <Box px="$4">
          {[1, 2, 3].map((i) => (
            <Box key={i} mb="$4">
              <OrderCardSkeleton />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      {/* Header */}
      <Box px="$4" pt="$12" pb="$4">
        <Heading
          size="xl"
          color="$textLight"
          $dark-color="$textDark"
          mb="$4"
          textAlign={isRTL ? 'right' : 'left'}
        >
          {t('orders')}
        </Heading>

        {/* Search Bar */}
        <Input
          variant="outline"
          size="lg"
          bg="$surfaceLight"
          $dark-bg="$surfaceDark"
          borderColor="$borderLight"
          $dark-borderColor="$borderDark"
          borderRadius="$xl"
          $focus-borderColor="$primary500"
        >
          <InputSlot pl="$4">
            <InputIcon as={Search} size="lg" color={colors.textSecondary} />
          </InputSlot>
          <InputField
            placeholder={t('search_orders')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            color="$textLight"
            $dark-color="$textDark"
          />
          {searchQuery.length > 0 && (
            <InputSlot pr="$4">
              <Pressable onPress={() => {
                setSearchQuery('');
                haptics.light();
              }}>
                <InputIcon as={X} size="sm" color={colors.textSecondary} />
              </Pressable>
            </InputSlot>
          )}
        </Input>

        {/* Filter Button */}
        <HStack mt="$4" space="md" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
          <Pressable
            onPress={() => {
              setShowFilterSheet(true);
              haptics.light();
            }}
            flex={1}
            p="$3"
            borderRadius="$lg"
            bg="$primary500"
          >
            <HStack space="sm" alignItems="center" justifyContent="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
              <Filter size={18} color="#FFFFFF" />
              <Text fontSize="$sm" color="$white" fontWeight="$semibold">
                {selectedStatus === 'ALL' ? (isRTL ? 'كل الطلبات' : 'All Orders') : t(`status_${selectedStatus.toLowerCase()}`)}
              </Text>
              {selectedStatus !== 'ALL' && (
                <Badge action="success" variant="solid" size="sm" borderRadius="$full" ml={isRTL ? 0 : '$2'} mr={isRTL ? '$2' : 0}>
                  <BadgeText fontSize="$2xs">1</BadgeText>
                </Badge>
              )}
            </HStack>
          </Pressable>

          {selectedStatus !== 'ALL' && (
            <Pressable
              onPress={() => {
                setSelectedStatus('ALL');
                haptics.medium();
              }}
              p="$3"
              borderRadius="$lg"
              bg="$error500"
            >
              <X size={18} color="#FFFFFF" />
            </Pressable>
          )}
        </HStack>
      </Box>

      {/* Orders List */}
      <ScrollView
        px="$4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
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
          <Box
            mt="$12"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              w={80}
              h={80}
              borderRadius="$full"
              bg="$surfaceLight"
              $dark-bg="$surfaceDark"
              alignItems="center"
              justifyContent="center"
              mb="$4"
            >
              <Package size={40} color={colors.textSecondary} strokeWidth={1.5} />
            </Box>
            <Heading size="lg" color="$textLight" $dark-color="$textDark" mb="$2" textAlign="center">
              {t('no_orders_found')}
            </Heading>
            <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign="center" px="$4">
              {searchQuery || selectedStatus !== 'ALL'
                ? t('no_orders_match_filters')
                : t('start_selling_to_see_orders')}
            </Text>
          </Box>
        ) : (
          <VStack space="md" pb="$24">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const paymentConfig = getPaymentStatusConfig(order.paymentStatus || 'PENDING');
              const StatusIcon = statusConfig.icon;

              return (
                <Pressable
                  key={order.id}
                  onPress={() => {
                    haptics.light();
                    router.push(`/orders/${order.id}`);
                  }}
                >
                  <Box
                    mb="$2"
                    borderRadius="$xl"
                    overflow="hidden"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      borderWidth: 1,
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <VStack space="xs" p="$3.5">
                      {/* Header: Order Number & Amount */}
                      <HStack justifyContent="space-between" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'} mb="$1">
                        <Text
                          fontSize="$sm"
                          fontWeight="$bold"
                          color="$textLight"
                          $dark-color="$textDark"
                        >
                          #{order.orderNumber}
                        </Text>
                        <Heading size="md" color="$success600" $dark-color="$success400">
                          {formatCurrency(order.total, order.currency || 'SAR', currentLocale)}
                        </Heading>
                      </HStack>

                      {/* Customer Info */}
                      <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'} mb="$1">
                        <Box
                          w={28}
                          h={28}
                          borderRadius="$full"
                          bg="$primary100"
                          $dark-bg="$primary950"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <User size={14} color={colors.primary500} strokeWidth={2} />
                        </Box>
                        <VStack flex={1}>
                          <Text
                            fontSize="$xs"
                            fontWeight="$semibold"
                            color="$textLight"
                            $dark-color="$textDark"
                            numberOfLines={1}
                            textAlign={isRTL ? 'right' : 'left'}
                          >
                            {order.customerName}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Status Cards */}
                      <HStack space="xs" flexDirection={isRTL ? 'row-reverse' : 'row'} mb="$1">
                        {/* Order Status */}
                        <Box
                          flex={1}
                          p="$2"
                          borderRadius="$md"
                          bg={statusConfig.color}
                        >
                          <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                            <StatusIcon size={12} color="#FFFFFF" strokeWidth={2.5} />
                            <Text fontSize="$2xs" color="$white" fontWeight="$bold" numberOfLines={1} textAlign={isRTL ? 'right' : 'left'}>
                              {t(`status_${order.status.toLowerCase()}`)}
                            </Text>
                          </HStack>
                        </Box>

                        {/* Payment Status */}
                        <Box
                          flex={1}
                          p="$2"
                          borderRadius="$md"
                          bg={paymentConfig.color}
                        >
                          <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                            <DollarSign size={12} color="#FFFFFF" strokeWidth={2.5} />
                            <Text fontSize="$2xs" color="$white" fontWeight="$bold" numberOfLines={1} textAlign={isRTL ? 'right' : 'left'}>
                              {t(`payment_${(order.paymentStatus || 'PENDING').toLowerCase()}`)}
                            </Text>
                          </HStack>
                        </Box>
                      </HStack>

                      {/* Footer: Date & Items */}
                      <HStack justifyContent="space-between" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                        <HStack space="xs" alignItems="center" flex={1} flexDirection={isRTL ? 'row-reverse' : 'row'}>
                          <Clock size={10} color={colors.textSecondary} />
                          <Text
                            fontSize="$2xs"
                            color="$textSecondaryLight"
                            $dark-color="$textSecondaryDark"
                            numberOfLines={1}
                          >
                            {new Date(order.createdAt).toLocaleDateString(currentLocale, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </HStack>

                        <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                          <Package size={10} color={colors.textSecondary} />
                          <Text
                            fontSize="$2xs"
                            color="$textSecondaryLight"
                            $dark-color="$textSecondaryDark"
                            fontWeight="$medium"
                          >
                            {order.items.length}
                          </Text>
                        </HStack>

                        <ChevronRight
                          size={14}
                          color={colors.primary500}
                          strokeWidth={2.5}
                          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                        />
                      </HStack>
                    </VStack>
                  </Box>
                </Pressable>
              );
            })}
          </VStack>
        )}
      </ScrollView>

      {/* Simple Filter Menu */}
      <Actionsheet isOpen={showFilterSheet} onClose={() => setShowFilterSheet(false)} zIndex={999}>
        <ActionsheetBackdrop />
        <ActionsheetContent zIndex={999} bg="$cardLight" $dark-bg="$cardDark">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack w="$full" py="$2" px="$4" space="md">
            {/* All Orders Option - Full Width */}
            <Pressable
              onPress={() => {
                setSelectedStatus('ALL');
                setShowFilterSheet(false);
                haptics.selection();
              }}
            >
              <HStack
                px="$3"
                py="$3"
                justifyContent="space-between"
                alignItems="center"
                bg={selectedStatus === 'ALL' ? '$primary500' : '$surfaceLight'}
                $dark-bg={selectedStatus === 'ALL' ? '$primary500' : '$surfaceDark'}
                borderRadius="$lg"
                flexDirection={isRTL ? 'row-reverse' : 'row'}
              >
                <HStack space="sm" alignItems="center" flex={1} flexDirection={isRTL ? 'row-reverse' : 'row'}>
                  <Package
                    size={18}
                    color={selectedStatus === 'ALL' ? '#FFFFFF' : colors.text}
                    strokeWidth={2.5}
                  />
                  <Text
                    fontSize="$sm"
                    fontWeight="$bold"
                    color={selectedStatus === 'ALL' ? '$white' : '$textLight'}
                    $dark-color={selectedStatus === 'ALL' ? '$white' : '$textDark'}
                  >
                    {isRTL ? 'كل الطلبات' : 'All Orders'}
                  </Text>
                </HStack>
                <Badge
                  action={selectedStatus === 'ALL' ? 'success' : 'muted'}
                  variant="solid"
                  size="sm"
                  borderRadius="$full"
                >
                  <BadgeText fontSize="$2xs">{orders.length}</BadgeText>
                </Badge>
              </HStack>
            </Pressable>

            {/* Status Options - 2 Columns Grid */}
            <HStack space="sm" flexWrap="wrap" justifyContent="space-between">
              {orderStatuses.filter(s => s !== 'ALL').map((status) => {
                const isSelected = selectedStatus === status;
                const count = getStatCount(status);
                const statusConfig = getStatusConfig(status);
                const StatusIcon = statusConfig.icon;

                return (
                  <Pressable
                    key={status}
                    onPress={() => {
                      setSelectedStatus(status);
                      setShowFilterSheet(false);
                      haptics.selection();
                    }}
                    w="48%"
                    mb="$2"
                  >
                    <Box
                      px="$2.5"
                      py="$2.5"
                      bg={isSelected ? statusConfig.color : '$surfaceLight'}
                      $dark-bg={isSelected ? statusConfig.color : '$surfaceDark'}
                      borderRadius="$lg"
                    >
                      <VStack space="xs">
                        <HStack justifyContent="space-between" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                          <StatusIcon
                            size={18}
                            color={isSelected ? '#FFFFFF' : colors[statusConfig.color.replace('$', '') as keyof typeof colors]}
                            strokeWidth={2.5}
                          />
                          <Badge
                            action={isSelected ? 'success' : 'muted'}
                            variant="solid"
                            size="sm"
                            borderRadius="$full"
                          >
                            <BadgeText fontSize="$2xs">{count}</BadgeText>
                          </Badge>
                        </HStack>
                        <Text
                          fontSize="$xs"
                          fontWeight={isSelected ? '$bold' : '$semibold'}
                          color={isSelected ? '$white' : '$textLight'}
                          $dark-color={isSelected ? '$white' : '$textDark'}
                          numberOfLines={1}
                          textAlign={isRTL ? 'right' : 'left'}
                        >
                          {t(`status_${status.toLowerCase()}`)}
                        </Text>
                      </VStack>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
}
