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
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { spacing } from '@/theme/spacing';
import { getApps, updateApp, App, getAppsByCategory } from '@/services/apps.service';

export default function AppsScreen() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apps, setApps] = useState<App[]>([]);

  const currentLanguage = i18n.language;

  // Load apps
  const loadApps = useCallback(async () => {
    try {
      setLoading(true);
      const appsData = await getApps();
      setApps(appsData);
    } catch (error: any) {
      console.error('Load apps error:', error);
      Alert.alert(t('common:error'), error.message || t('settings:load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadApps();
  }, [loadApps]);

  // Toggle app
  const handleToggle = async (app: App) => {
    // Prevent disabling essential apps
    if (app.isEssential) {
      Alert.alert(t('settings:cannot_disable'), t('settings:essential_app_warning'));
      return;
    }

    try {
      await updateApp(app.id, !app.isEnabled);
      loadApps(); // Reload to get updated status
      Alert.alert(
        t('common:success'),
        app.isEnabled ? t('settings:app_disabled') : t('settings:app_enabled')
      );
    } catch (error: any) {
      Alert.alert(t('common:error'), error.message);
    }
  };

  // Get app name
  const getAppName = (app: App): string => {
    return currentLanguage === 'ar' ? app.nameAr : app.name;
  };

  // Get app description
  const getAppDescription = (app: App): string => {
    return currentLanguage === 'ar' ? app.descriptionAr : app.description;
  };

  // Get category name
  const getCategoryName = (category: App['category']): string => {
    const categoryNames = {
      essential: currentLanguage === 'ar' ? 'التطبيقات الأساسية' : 'Essential Apps',
      integration: currentLanguage === 'ar' ? 'التكاملات' : 'Integrations',
      checkout: currentLanguage === 'ar' ? 'الدفع والشراء' : 'Checkout',
      product: currentLanguage === 'ar' ? 'إدارة المنتجات' : 'Product Management',
      analytics: currentLanguage === 'ar' ? 'التحليلات' : 'Analytics',
    };
    return categoryNames[category];
  };

  // Group apps by category
  const categories: App['category'][] = ['essential', 'integration', 'checkout', 'product'];

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PageHeader title={t('settings:apps')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={t('settings:apps')} />

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
        {/* Apps by Category */}
        {categories.map((category) => {
          const categoryApps = getAppsByCategory(apps, category);
          if (categoryApps.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {getCategoryName(category)}
              </Text>

              {categoryApps.map((app) => {
                const appName = getAppName(app);
                const appDescription = getAppDescription(app);

                return (
                  <View
                    key={app.id}
                    style={[
                      styles.appCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.appIcon}>
                      <Text style={styles.appIconText}>{app.icon}</Text>
                    </View>

                    <View style={styles.appInfo}>
                      <Text style={[styles.appName, { color: colors.text }]}>
                        {appName}
                      </Text>
                      {app.isEssential && (
                        <View
                          style={[
                            styles.essentialBadge,
                            { backgroundColor: colors.primary + '20' },
                          ]}
                        >
                          <Text style={[styles.essentialText, { color: colors.primary }]}>
                            {t('settings:essential')}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Switch
                      value={app.isEnabled}
                      onValueChange={() => handleToggle(app)}
                      disabled={app.isEssential}
                      trackColor={{ false: colors.border, true: colors.primary + '80' }}
                      thumbColor={app.isEnabled ? colors.primary : colors.textSecondary}
                    />
                  </View>
                );
              })}
            </View>
          );
        })}
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
    padding: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySection: {
    marginBottom: spacing.l,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.s,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  appIconText: {
    fontSize: 22,
  },
  appInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
  },
  essentialBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 3,
    borderRadius: 6,
  },
  essentialText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
