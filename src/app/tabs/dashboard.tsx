import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { getDashboardStats, DashboardStats } from '@/services/dashboard.service';
import { formatCurrency } from '@/utils/currency';
import { DEFAULT_CURRENCY } from '@/constants/currencies';
import { haptics } from '@/utils/haptics';
import {
  Box,
  HStack,
  VStack,
  Text,
  Heading,
  Pressable,
  Badge,
  BadgeText,
  Card,
  Divider,
} from '@gluestack-ui/themed';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Bell,
  Store,
  Activity,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/SkeletonLoader';
import { StatsWidget, StatItem } from '@/components/dashboard/StatsWidget';

const { width } = Dimensions.get('window');

export default function DashboardV2Screen() {
  const { t, i18n } = useTranslation('dashboard');
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for stats display
  const ordersByStatus = [
    { x: 'Delivered', y: 145, color: '#10B981' },
    { x: 'Shipped', y: 68, color: '#3B82F6' },
    { x: 'Processing', y: 42, color: '#8B5CF6' },
    { x: 'Pending', y: 25, color: '#F59E0B' },
    { x: 'Cancelled', y: 12, color: '#EF4444' },
  ];

  const productsByCategory = [
    { x: 'Electronics', y: 85 },
    { x: 'Clothing', y: 120 },
    { x: 'Food', y: 95 },
    { x: 'Books', y: 60 },
    { x: 'Others', y: 40 },
  ];

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await getDashboardStats();
      setStats(data);

      if (isRefresh) {
        haptics.success();
      }
    } catch (err: any) {
      if (isRefresh) {
        haptics.error();
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const merchantCurrency = stats.currency || DEFAULT_CURRENCY;
  const currentLocale = i18n.language || 'en';

  // Stats configuration
  const mainStats: StatItem[] = [
    {
      title: t('total_sales'),
      value: formatCurrency(stats.totalSales, merchantCurrency, currentLocale),
      icon: DollarSign,
      color: '$success400',
      bgColor: '$success50',
      darkBgColor: '$success950',
      trend: '+12.5%',
      trendUp: true,
      onPress: () => {
        haptics.light();
        // Navigate to sales report
      },
    },
    {
      title: t('total_orders'),
      value: stats.totalOrders.toLocaleString(currentLocale),
      icon: ShoppingBag,
      color: '$info400',
      bgColor: '$info50',
      darkBgColor: '$info950',
      trend: '+8.2%',
      trendUp: true,
      onPress: () => {
        haptics.light();
        router.push('/tabs/orders');
      },
    },
    {
      title: t('total_customers'),
      value: stats.totalCustomers.toLocaleString(currentLocale),
      icon: Users,
      color: '$purple500',
      bgColor: '$purple50',
      darkBgColor: '$purple950',
      trend: '+15.3%',
      trendUp: true,
    },
    {
      title: t('total_products'),
      value: stats.totalProducts.toLocaleString(currentLocale),
      icon: Package,
      color: '$amber500',
      bgColor: '$amber50',
      darkBgColor: '$amber950',
      trend: '-2.1%',
      trendUp: false,
      onPress: () => {
        haptics.light();
        router.push('/tabs/products');
      },
    },
  ];

  if (isLoading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
        <Box px="$4" pt="$6" pb="$4">
          <ChartSkeleton />
        </Box>
        <Box px="$4">
          <HStack space="md" flexWrap="wrap">
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} w={(width - 48) / 2}>
                <StatCardSkeleton />
              </Box>
            ))}
          </HStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadDashboardData(true)} tintColor={colors.primary} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Box px="$4" pt="$12" pb="$4">
          <HStack justifyContent="space-between" alignItems="flex-start" mb="$3">
            <VStack space="xs" flex={1}>
              <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                {t('welcome')}
              </Text>
              <Heading size="xl" color="$textLight" $dark-color="$textDark">
                {(user as any)?.firstName || 'Merchant'}! 👋
              </Heading>
            </VStack>

            <HStack space="sm" mt="$1">
              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push('/notifications');
                }}
                w={44}
                h={44}
                borderRadius="$full"
                bg="$surfaceLight"
                $dark-bg="$surfaceDark"
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                <Bell size={20} color={colors.text} />
                <Box position="absolute" top={8} right={8} w={8} h={8} borderRadius="$full" bg="$error400" />
              </Pressable>

              <Pressable onPress={() => haptics.light()} w={44} h={44} borderRadius="$full" bg="$primary500" alignItems="center" justifyContent="center">
                <Store size={20} color="#FFFFFF" />
              </Pressable>
            </HStack>
          </HStack>

          {/* Today Summary */}
          <HStack mt="$4" p="$3" bg="$primary50" $dark-bg="$primary950" borderRadius="$lg" alignItems="center" space="sm">
            <Box w={36} h={36} borderRadius="$full" bg="$primary500" alignItems="center" justifyContent="center">
              <Activity size={18} color="#FFFFFF" />
            </Box>
            <VStack flex={1}>
              <Text fontSize="$xs" color="$primary600" $dark-color="$primary400" fontWeight="$medium">
                Today's Performance
              </Text>
              <Heading size="sm" color="$primary700" $dark-color="$primary300">
                {formatCurrency(stats.totalSales * 0.15, merchantCurrency, currentLocale)}
              </Heading>
            </VStack>
            <Badge action="success" variant="solid" borderRadius="$full">
              <BadgeText>+12.5%</BadgeText>
            </Badge>
          </HStack>
        </Box>

        {/* Main Stats Grid */}
        <Box px="$4" mt="$2">
          <StatsWidget stats={mainStats} columns={2} animationDelay={80} />
        </Box>

        {/* Quick Actions */}
        <Box px="$4" mb="$6">
          <VStack space="sm">
            <Heading size="md" color="$textLight" $dark-color="$textDark" mb="$2">
              Quick Actions
            </Heading>

            <HStack space="md">
              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push('/products/add');
                }}
                flex={1}
                p="$4"
                borderRadius="$xl"
                bg="$primary500"
                alignItems="center"
              >
                <Package size={24} color="#FFFFFF" strokeWidth={2} />
                <Text fontSize="$sm" color="$white" fontWeight="$semibold" mt="$2">
                  Add Product
                </Text>
              </Pressable>

              <Pressable onPress={() => haptics.light()} flex={1} p="$4" borderRadius="$xl" bg="$success400" alignItems="center">
                <ShoppingBag size={24} color="#FFFFFF" strokeWidth={2} />
                <Text fontSize="$sm" color="$white" fontWeight="$semibold" mt="$2">
                  New Order
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
}
