import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { AppHeader } from '@/components/ui/AppHeader';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { getDashboardStats, DashboardStats } from '@/services/dashboard.service';
import { spacing } from '@/theme/spacing';
import { formatCurrency } from '@/utils/currency';
import { DEFAULT_CURRENCY } from '@/constants/currencies';
import { haptics } from '@/utils/haptics';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.l * 3) / 2;

export default function DashboardScreen() {
  const { t, i18n } = useTranslation('dashboard');
  const { colors } = useTheme();
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
  const [error, setError] = useState('');

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      const data = await getDashboardStats();
      setStats(data);

      if (isRefresh) {
        haptics.success();
      }
    } catch (err: any) {
      setError(err.message || t('error'));
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

  // Get currency from API response (dynamic from store settings)
  const merchantCurrency = stats.currency || DEFAULT_CURRENCY;
  const currentLocale = i18n.language || 'en';

  const renderStatCard = (
    title: string,
    value: string | number,
    Icon: React.ComponentType<any>,
    iconColor: string,
    index: number
  ) => {
    return (
      <AnimatedCard
        index={index}
        staggerDelay={100}
        style={[
          styles.statCard,
          {
            backgroundColor: colors.surface,
            shadowColor: iconColor,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Icon size={22} color={iconColor} strokeWidth={2} />
        </View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </AnimatedCard>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with notifications and store link */}
      <AppHeader
        title={`${t('welcome')}, ${(user as any)?.firstName || 'Merchant'}!`}
        showNotifications={true}
        showStoreLink={true}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDashboardData(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            t('total_sales'),
            formatCurrency(stats.totalSales, merchantCurrency, currentLocale),
            DollarSign,
            '#10B981',
            0
          )}
          {renderStatCard(
            t('total_orders'),
            stats.totalOrders.toLocaleString(currentLocale),
            ShoppingBag,
            '#3B82F6',
            1
          )}
          {renderStatCard(
            t('total_customers'),
            stats.totalCustomers.toLocaleString(currentLocale),
            Users,
            '#8B5CF6',
            2
          )}
          {renderStatCard(
            t('total_products'),
            stats.totalProducts.toLocaleString(currentLocale),
            Package,
            '#F59E0B',
            3
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#EF444420' }]}>
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {error}
            </Text>
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 16,
  },
  content: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  statCard: {
    width: CARD_WIDTH,
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.m,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    padding: spacing.m,
    borderRadius: 12,
    marginTop: spacing.m,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
