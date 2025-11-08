import React, { useState, useEffect, useCallback } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { router } from 'expo-router';
import { haptics } from '@/utils/haptics';
import { getApps, updateApp, App, getAppsByCategory } from '@/services/apps.service';
import {
  Box,
  HStack,
  VStack,
  Text,
  Spinner,
  Switch,
} from '@gluestack-ui/themed';

export default function AppsScreen() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { colors, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apps, setApps] = useState<App[]>([]);

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

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
      haptics.error();
      Alert.alert(t('settings:cannot_disable'), t('settings:essential_app_warning'));
      return;
    }

    haptics.light();

    try {
      await updateApp(app.id, !app.isEnabled);
      haptics.success();
      loadApps(); // Reload to get updated status
      Alert.alert(
        t('common:success'),
        app.isEnabled ? t('settings:app_disabled') : t('settings:app_enabled')
      );
    } catch (error: any) {
      haptics.error();
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
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$primary500" />
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Box px="$4">
          {/* Apps by Category */}
          {categories.map((category) => {
            const categoryApps = getAppsByCategory(apps, category);
            if (categoryApps.length === 0) return null;

            return (
              <Box key={category} mb="$3">
                {/* Apps List */}
                <VStack
                  space="sm"
                  bg="$surfaceLight"
                  $dark-bg="$surfaceDark"
                  borderRadius="$2xl"
                  overflow="hidden"
                >
                  {categoryApps.map((app, index) => {
                    const appName = getAppName(app);
                    const appDescription = getAppDescription(app);

                    return (
                      <Box key={app.id}>
                        <HStack
                          px="$4"
                          py="$3.5"
                          alignItems="center"
                          space="md"
                          flexDirection={isRTL ? 'row-reverse' : 'row'}
                        >
                          {/* App Icon */}
                          <Box
                            w={44}
                            h={44}
                            borderRadius="$xl"
                            bg="$backgroundLight"
                            $dark-bg="$backgroundDark"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize={22}>{app.icon}</Text>
                          </Box>

                          {/* App Info */}
                          <VStack flex={1} space="2xs">
                            <HStack alignItems="center" space="xs" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                              <Text
                                fontSize="$md"
                                fontWeight="$semibold"
                                color="$textLight"
                                $dark-color="$textDark"
                              >
                                {appName}
                              </Text>
                              {app.isEssential && (
                                <Box
                                  px="$2"
                                  py="$0.5"
                                  borderRadius="$md"
                                  bg="$primary100"
                                  $dark-bg="rgba(59, 130, 246, 0.2)"
                                >
                                  <Text
                                    fontSize="$2xs"
                                    fontWeight="$bold"
                                    color="$primary700"
                                    $dark-color="$primary400"
                                    textTransform="uppercase"
                                  >
                                    {t('settings:essential')}
                                  </Text>
                                </Box>
                              )}
                            </HStack>
                            {appDescription && (
                              <Text
                                fontSize="$sm"
                                color="$textSecondaryLight"
                                $dark-color="$textSecondaryDark"
                                numberOfLines={2}
                              >
                                {appDescription}
                              </Text>
                            )}
                          </VStack>

                          {/* Toggle Switch */}
                          <Switch
                            value={app.isEnabled}
                            onValueChange={() => handleToggle(app)}
                            disabled={app.isEssential}
                            size="md"
                            onTrackColor="$primary500"
                            offTrackColor="$backgroundLight300"
                            $dark-offTrackColor="$backgroundDark700"
                            onThumbColor="$white"
                            offThumbColor="$white"
                          />
                        </HStack>

                        {/* Divider */}
                        {index < categoryApps.length - 1 && (
                          <Box
                            h={1}
                            bg="$borderLight"
                            $dark-bg="$borderDark"
                            opacity={0.3}
                            mx="$4"
                          />
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            );
          })}
        </Box>
      </ScrollView>
    </Box>
  );
}
