import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, Dimensions, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { getDashboardStats, DashboardStats } from '@/services/dashboard.service';
import { getStore, Store as StoreData } from '@/services/store.service';
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

  // Check RTL dynamically based on current language
  const isRTL = i18n.language === 'ar';

  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [store, setStore] = useState<StoreData | null>(null);
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

      // Load both stats and store data in parallel
      const [statsData, storeData] = await Promise.all([
        getDashboardStats(),
        getStore().catch(() => null), // Don't fail if store API fails
      ]);

      setStats(statsData);
      if (storeData) {
        console.log('📊 Store Data:', storeData);
        console.log('🏪 Store Name (EN):', storeData.name);
        console.log('🏪 Store Name (AR):', storeData.nameAr);
        console.log('🏷️ Store StoreName:', storeData.storeName);
        setStore(storeData);
      }

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

  // Function to get store name based on current language
  const getStoreName = () => {
    if (!store) return user?.firstName || 'My Store';

    // Get language code (e.g., 'ar', 'en', 'hi', 'es', 'fr')
    const lang = i18n.language;

    // Try to get localized name using dynamic key
    const langKey = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof StoreData;
    const localizedName = store[langKey] as string | undefined;

    // Fallback: localized name -> storeName -> name -> user first name -> 'My Store'
    return localizedName || store.storeName || store.name || user?.firstName || 'My Store';
  };

  // Function to open store URL
  const handleOpenStore = async () => {
    try {
      haptics.light();
      if (store?.storeUrl) {
        const canOpen = await Linking.canOpenURL(store.storeUrl);
        if (canOpen) {
          await Linking.openURL(store.storeUrl);
        }
      }
    } catch (error) {
      console.error('Error opening store URL:', error);
    }
  };

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
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Header */}
        <Box px="$4" pt="$12" pb="$4">
          <HStack justifyContent="space-between" alignItems="center" mb="$3" flexDirection={isRTL ? 'row-reverse' : 'row'}>
            <Heading
              size="md"
              color="$textLight"
              $dark-color="$textDark"
              textAlign={isRTL ? 'right' : 'left'}
            >
              {getStoreName()}
            </Heading>

            <HStack space="sm" flexDirection={isRTL ? 'row-reverse' : 'row'}>
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
                <Box position="absolute" top={8} right={isRTL ? undefined : 8} left={isRTL ? 8 : undefined} w={8} h={8} borderRadius="$full" bg="$error400" />
              </Pressable>

              <Pressable onPress={handleOpenStore} w={44} h={44} borderRadius="$full" bg="$primary500" alignItems="center" justifyContent="center">
                <Store size={20} color="#FFFFFF" />
              </Pressable>
            </HStack>
          </HStack>

          {/* Today Summary */}
          <HStack
            mt="$4"
            p="$3"
            borderRadius="$lg"
            alignItems="center"
            space="sm"
            flexDirection={isRTL ? 'row-reverse' : 'row'}
            bg={isDark ? undefined : '$primary50'}
            borderWidth={2}
            borderColor={isDark ? undefined : 'transparent'}
            style={
              isDark
                ? {
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderStyle: 'solid',
                  }
                : undefined
            }
          >
            <Box w={36} h={36} borderRadius="$full" bg="$primary500" alignItems="center" justifyContent="center">
              <Activity size={18} color="#FFFFFF" />
            </Box>
            <VStack flex={1}>
              <Text
                fontSize="$xs"
                color="$primary600"
                $dark-color="$primary400"
                fontWeight="$medium"
                textAlign={isRTL ? 'right' : 'left'}
              >
                {t('todays_performance')}
              </Text>
              <Heading
                size="sm"
                color="$primary700"
                $dark-color="$white"
                textAlign={isRTL ? 'right' : 'left'}
              >
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
            <Heading
              size="md"
              color="$textLight"
              $dark-color="$textDark"
              mb="$2"
              textAlign={isRTL ? 'right' : 'left'}
            >
              {t('quick_actions')}
            </Heading>

            <HStack space="md" flexDirection={isRTL ? 'row-reverse' : 'row'}>
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
                  {t('add_product')}
                </Text>
              </Pressable>

              <Pressable onPress={() => haptics.light()} flex={1} p="$4" borderRadius="$xl" bg="$success400" alignItems="center">
                <ShoppingBag size={24} color="#FFFFFF" strokeWidth={2} />
                <Text fontSize="$sm" color="$white" fontWeight="$semibold" mt="$2">
                  {t('new_order')}
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
}
