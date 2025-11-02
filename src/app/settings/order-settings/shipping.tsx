import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Divider } from '@/components/ui/Divider';
import { TouchableOpacity } from '@/components/ui/TouchableOpacity';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';
import {
  getShippingRates,
  deleteShippingRate,
  ShippingRate,
} from '@/services/shipping.service';
import { useAuthStore } from '@/store/authStore';

export default function ShippingMethodsScreen() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);

  const currentLanguage = i18n.language;

  // Load shipping rates
  const loadShippingRates = useCallback(async () => {
    try {
      setLoading(true);
      const rates = await getShippingRates();
      setShippingRates(rates);
    } catch (error: any) {
      Alert.alert(t('common:error'), error.message || t('settings:load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadShippingRates();
  }, [loadShippingRates]);

  const onRefresh = useCallback(() => {
    haptics.light();
    setRefreshing(true);
    loadShippingRates();
  }, [loadShippingRates]);

  // Delete shipping rate
  const handleDelete = (rateId: string, rateName: string) => {
    haptics.warning();
    Alert.alert(
      t('settings:delete_shipping_method'),
      t('settings:delete_shipping_method_confirm', { name: rateName }),
      [
        {
          text: t('common:cancel'),
          style: 'cancel',
          onPress: () => haptics.light(),
        },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.medium();
              await deleteShippingRate(rateId);
              haptics.success();
              Alert.alert(t('common:success'), t('settings:shipping_method_deleted'));
              loadShippingRates();
            } catch (error: any) {
              haptics.error();
              Alert.alert(t('common:error'), error.message);
            }
          },
        },
      ]
    );
  };

  // Get translated name
  const getMethodName = (rate: ShippingRate): string => {
    if (rate.translations && rate.translations[currentLanguage]) {
      return rate.translations[currentLanguage].name;
    }
    if (currentLanguage === 'ar' && rate.nameAr) {
      return rate.nameAr;
    }
    return rate.name;
  };

  // Group rates by zone
  const groupedRates = shippingRates.reduce((acc, rate) => {
    const zoneName = rate.zone
      ? currentLanguage === 'ar' && rate.zone.nameAr
        ? rate.zone.nameAr
        : rate.zone.name
      : t('settings:no_zone');

    if (!acc[zoneName]) {
      acc[zoneName] = [];
    }
    acc[zoneName].push(rate);
    return acc;
  }, {} as Record<string, ShippingRate[]>);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PageHeader title={t('settings:shipping_methods')} showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={t('settings:shipping_methods')} showBack />

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
        showsVerticalScrollIndicator={false}
      >
        {/* Empty State */}
        {shippingRates.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '10' }]}>
              <Text style={styles.emptyIconText}>🚚</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('settings:no_shipping_methods')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('settings:add_shipping_methods_hint')}
            </Text>
          </View>
        ) : (
          /* Grouped Shipping Rates */
          <>
            {Object.entries(groupedRates).map(([zoneName, rates], zoneIndex) => (
              <AnimatedCard key={zoneName} index={zoneIndex} style={styles.zoneSection}>
                {/* Zone Header */}
                <SectionHeader
                  title={zoneName}
                  icon="📍"
                  subtitle={`${rates.length} ${rates.length === 1 ? t('common:method') : t('common:methods')}`}
                />

                {/* Zone Card */}
                <View
                  style={[
                    styles.zoneCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      ...design.shadow.sm,
                    },
                  ]}
                >
                  {rates.map((rate, rateIndex) => {
                    const methodName = getMethodName(rate);

                    return (
                      <React.Fragment key={rate.id}>
                        <View style={styles.rateItem}>
                          {/* Rate Icon & Info */}
                          <View style={styles.rateMain}>
                            <View
                              style={[
                                styles.rateIcon,
                                { backgroundColor: colors.primary + '10' },
                              ]}
                            >
                              <Text style={styles.rateIconText}>
                                {rate.isActive ? '✓' : '○'}
                              </Text>
                            </View>

                            <View style={styles.rateInfo}>
                              <View style={styles.rateHeader}>
                                <Text style={[styles.rateName, { color: colors.text }]}>
                                  {methodName}
                                </Text>
                                {!rate.isActive && (
                                  <View
                                    style={[
                                      styles.inactiveBadge,
                                      { backgroundColor: colors.textSecondary + '15' },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.inactiveBadgeText,
                                        { color: colors.textSecondary },
                                      ]}
                                    >
                                      {t('common:inactive')}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {/* Rate Details */}
                              <View style={styles.rateDetails}>
                                <View style={styles.rateDetail}>
                                  <Text
                                    style={[styles.rateDetailLabel, { color: colors.textSecondary }]}
                                  >
                                    {t('settings:cost')}:
                                  </Text>
                                  <Text style={[styles.rateDetailValue, { color: colors.text }]}>
                                    {rate.cost.toFixed(2)}
                                  </Text>
                                </View>
                                {rate.estimatedDays && (
                                  <>
                                    <Text style={[styles.rateDivider, { color: colors.border }]}>
                                      •
                                    </Text>
                                    <View style={styles.rateDetail}>
                                      <Text
                                        style={[
                                          styles.rateDetailLabel,
                                          { color: colors.textSecondary },
                                        ]}
                                      >
                                        {rate.estimatedDays} {t('settings:days')}
                                      </Text>
                                    </View>
                                  </>
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Actions */}
                          <View style={styles.rateActions}>
                            <TouchableOpacity
                              style={styles.actionIcon}
                              onPress={() =>
                                router.push(`/settings/order-settings/shipping/edit/${rate.id}`)
                              }
                              activeOpacity={0.7}
                            >
                              <Text style={styles.actionIconText}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionIcon}
                              onPress={() => handleDelete(rate.id, methodName)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.actionIconText}>🗑️</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Divider between rates */}
                        {rateIndex < rates.length - 1 && (
                          <Divider spacing="none" style={styles.rateDividerLine} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
              </AnimatedCard>
            ))}
          </>
        )}

        {/* Add Button - Fixed at bottom of content */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/settings/order-settings/shipping/add')}
          hapticType="medium"
          scaleValue={0.97}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>{t('settings:add_shipping_method')}</Text>
        </TouchableOpacity>
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
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    ...design.typography.h3,
    marginBottom: spacing.s,
  },
  emptySubtitle: {
    ...design.typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Zone Section
  zoneSection: {
    marginBottom: spacing.l,
  },
  zoneCard: {
    borderRadius: design.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Rate Item
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
  },
  rateMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateIcon: {
    width: 40,
    height: 40,
    borderRadius: design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  rateIconText: {
    fontSize: 18,
  },
  rateInfo: {
    flex: 1,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: spacing.s,
  },
  rateName: {
    ...design.typography.bodyBold,
  },
  inactiveBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: design.radius.sm,
  },
  inactiveBadgeText: {
    ...design.typography.small,
    fontWeight: '600',
  },
  rateDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  rateDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rateDetailLabel: {
    ...design.typography.caption,
  },
  rateDetailValue: {
    ...design.typography.caption,
    fontWeight: '600',
  },
  rateDivider: {
    ...design.typography.caption,
  },

  // Actions
  rateActions: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  actionIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    fontSize: 18,
  },

  // Divider
  rateDividerLine: {
    marginLeft: spacing.m + 40 + spacing.m,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
    borderRadius: design.radius.md,
    marginTop: spacing.l,
    ...design.shadow.md,
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: spacing.s,
  },
  addButtonText: {
    ...design.typography.bodyBold,
    color: '#FFFFFF',
  },
});
