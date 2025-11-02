import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import {
  getPaymentMethods,
  deletePaymentMethod,
  PaymentMethod,
} from '@/services/payment-methods.service';

export default function PaymentMethodsScreen() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const currentLanguage = i18n.language;

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error: any) {
      Alert.alert(t('common:error'), error.message || t('settings:load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // Delete payment method
  const handleDelete = (methodId: string, methodName: string) => {
    Alert.alert(
      t('settings:delete_payment_method'),
      t('settings:delete_payment_method_confirm', { name: methodName }),
      [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(methodId);
              Alert.alert(t('common:success'), t('settings:payment_method_deleted'));
              loadPaymentMethods();
            } catch (error: any) {
              Alert.alert(t('common:error'), error.message);
            }
          },
        },
      ]
    );
  };

  // Get translated name
  const getMethodName = (method: PaymentMethod): string => {
    if (method.translations && method.translations[currentLanguage]) {
      return method.translations[currentLanguage].name;
    }
    if (currentLanguage === 'ar' && method.nameAr) {
      return method.nameAr;
    }
    return method.name;
  };

  // Group methods by type
  const groupedMethods = paymentMethods.reduce((acc, method) => {
    const groupName = method.isBuiltIn
      ? t('settings:built_in_methods')
      : t('settings:custom_methods');
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PageHeader title={t('settings:payment_methods')} showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={t('settings:payment_methods')} showBack />

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
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '10' }]}>
              <Text style={styles.emptyIconText}>💳</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('settings:no_payment_methods')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('settings:add_payment_methods_hint')}
            </Text>
          </View>
        ) : (
          /* Grouped Payment Methods */
          <>
            {Object.entries(groupedMethods).map(([groupName, methods]) => (
              <View key={groupName} style={styles.groupSection}>
                {/* Group Header */}
                <SectionHeader
                  title={groupName}
                  icon={groupName === t('settings:built_in_methods') ? '🏛️' : '⚡'}
                  subtitle={`${methods.length} ${methods.length === 1 ? t('common:method') : t('common:methods')}`}
                />

                {/* Group Card */}
                <View
                  style={[
                    styles.groupCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      ...design.shadow.sm,
                    },
                  ]}
                >
                  {methods.map((method, methodIndex) => {
                    const methodName = getMethodName(method);

                    return (
                      <React.Fragment key={method.id}>
                        <View style={styles.methodItem}>
                          {/* Method Icon & Info */}
                          <View style={styles.methodMain}>
                            <View
                              style={[
                                styles.methodIcon,
                                { backgroundColor: colors.primary + '10' },
                              ]}
                            >
                              <Text style={styles.methodIconText}>
                                {method.isActive ? '✓' : '○'}
                              </Text>
                            </View>

                            <View style={styles.methodInfo}>
                              <View style={styles.methodHeader}>
                                <Text style={[styles.methodName, { color: colors.text }]}>
                                  {methodName}
                                </Text>
                                {!method.isActive && (
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

                              {/* Method Details */}
                              {method.processingFee && method.processingFee > 0 && (
                                <View style={styles.methodDetails}>
                                  <Text
                                    style={[styles.methodDetailLabel, { color: colors.textSecondary }]}
                                  >
                                    {t('settings:processing_fee')}:
                                  </Text>
                                  <Text style={[styles.methodDetailValue, { color: colors.text }]}>
                                    {method.processingFee}%
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Actions */}
                          <View style={styles.methodActions}>
                            <TouchableOpacity
                              style={styles.actionIcon}
                              onPress={() =>
                                router.push(`/settings/order-settings/payment-methods/edit/${method.id}`)
                              }
                              activeOpacity={0.7}
                            >
                              <Text style={styles.actionIconText}>✏️</Text>
                            </TouchableOpacity>
                            {!method.isBuiltIn && (
                              <TouchableOpacity
                                style={styles.actionIcon}
                                onPress={() => handleDelete(method.id, methodName)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.actionIconText}>🗑️</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>

                        {/* Divider between methods */}
                        {methodIndex < methods.length - 1 && (
                          <Divider spacing="none" style={styles.methodDividerLine} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/settings/order-settings/payment-methods/add')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>{t('settings:add_payment_method')}</Text>
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

  // Group Section
  groupSection: {
    marginBottom: spacing.l,
  },
  groupCard: {
    borderRadius: design.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Method Item
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
  },
  methodMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  methodIconText: {
    fontSize: 18,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: spacing.s,
  },
  methodName: {
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
  methodDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  methodDetailLabel: {
    ...design.typography.caption,
  },
  methodDetailValue: {
    ...design.typography.caption,
    fontWeight: '600',
  },

  // Actions
  methodActions: {
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
  methodDividerLine: {
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
