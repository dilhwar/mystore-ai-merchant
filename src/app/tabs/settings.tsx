import React, { useEffect, useState } from 'react';
import { ScrollView, Alert, Dimensions, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { router } from 'expo-router';
import { changeLanguage } from '@/locales/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { haptics } from '@/utils/haptics';
import { getStore, Store as StoreData } from '@/services/store.service';
import {
  Box,
  HStack,
  VStack,
  Text,
  Heading,
  Pressable,
  Spinner,
} from '@gluestack-ui/themed';
import {
  Store,
  ShoppingCart,
  Puzzle,
  Globe,
  Palette,
  HelpCircle,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface SettingItem {
  id: string;
  icon: any;
  label: string;
  route?: string;
  onPress?: () => void;
  badge?: string;
  iconColor?: string;
  iconBg?: string;
  iconBgDark?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();

  // Check RTL dynamically based on current language
  const isRTL = i18n.language === 'ar';

  // State for store data
  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load store data
  const loadStoreData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const storeData = await getStore();
      setStore(storeData);

      if (isRefresh) {
        haptics.success();
      }
    } catch (error) {
      console.error('Error loading store data:', error);
      if (isRefresh) {
        haptics.error();
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  const handleLogout = () => {
    haptics.light();
    Alert.alert(
      t('logout'),
      t('logout_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            haptics.success();
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleLanguageChange = async () => {
    haptics.light();
    Alert.alert(
      tCommon('select_language'),
      tCommon('choose_app_language'),
      [
        {
          text: tCommon('ar'),
          onPress: async () => {
            try {
              await AsyncStorage.setItem('appLanguage', 'ar');
              await changeLanguage('ar');

              Alert.alert(
                tCommon('language_changed'),
                tCommon('reload_app_message'),
                [
                  { text: tCommon('later'), style: 'cancel' },
                  {
                    text: tCommon('reload'),
                    onPress: async () => {
                      if (__DEV__) {
                        Alert.alert(tCommon('reload'), tCommon('reload_manually'));
                      } else {
                        await Updates.reloadAsync();
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error changing language:', error);
            }
          },
        },
        {
          text: tCommon('en'),
          onPress: async () => {
            try {
              await AsyncStorage.setItem('appLanguage', 'en');
              await changeLanguage('en');

              Alert.alert(
                tCommon('language_changed'),
                tCommon('reload_app_message'),
                [
                  { text: tCommon('later'), style: 'cancel' },
                  {
                    text: tCommon('reload'),
                    onPress: async () => {
                      if (__DEV__) {
                        Alert.alert(tCommon('reload'), tCommon('reload_manually'));
                      } else {
                        await Updates.reloadAsync();
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error changing language:', error);
            }
          },
        },
        { text: tCommon('cancel'), style: 'cancel' },
      ]
    );
  };

  const sections: SettingSection[] = [
    {
      title: t('store'),
      items: [
        {
          id: 'store-settings',
          icon: Store,
          label: t('store_settings'),
          route: '/settings/store-settings',
          iconColor: '$blue500',
          iconBg: '$blue50',
          iconBgDark: 'rgba(59, 130, 246, 0.15)',
        },
        {
          id: 'order-settings',
          icon: ShoppingCart,
          label: t('order_settings'),
          route: '/settings/order-settings',
          iconColor: '$purple500',
          iconBg: '$purple50',
          iconBgDark: 'rgba(139, 92, 246, 0.15)',
        },
        {
          id: 'apps',
          icon: Puzzle,
          label: t('apps'),
          route: '/settings/apps',
          iconColor: '$amber500',
          iconBg: '$amber50',
          iconBgDark: 'rgba(245, 158, 11, 0.15)',
        },
      ],
    },
    {
      title: t('preferences'),
      items: [
        {
          id: 'language',
          icon: Globe,
          label: t('language'),
          onPress: handleLanguageChange,
          iconColor: '$green500',
          iconBg: '$green50',
          iconBgDark: 'rgba(34, 197, 94, 0.15)',
        },
        {
          id: 'theme',
          icon: Palette,
          label: t('theme'),
          iconColor: '$pink500',
          iconBg: '$pink50',
          iconBgDark: 'rgba(236, 72, 153, 0.15)',
        },
      ],
    },
    {
      title: t('support'),
      items: [
        {
          id: 'help',
          icon: HelpCircle,
          label: t('help_support'),
          route: '/settings/help-support',
          iconColor: '$cyan500',
          iconBg: '$cyan50',
          iconBgDark: 'rgba(6, 182, 212, 0.15)',
        },
      ],
    },
  ];

  const handleItemPress = (item: SettingItem) => {
    haptics.light();
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  // Function to get store name based on current language
  const getStoreName = () => {
    if (!store) return user?.firstName || t('settings');

    const lang = i18n.language;
    const langKey = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof StoreData;
    const localizedName = store[langKey] as string | undefined;

    return localizedName || store.storeName || store.name || user?.firstName || t('settings');
  };

  // Loading state
  if (isLoading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$primary500" />
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      {/* Header */}
      <Box
        px="$4"
        pt="$12"
        pb="$4"
        bg="$backgroundLight"
        $dark-bg="$backgroundDark"
      >
        <Heading
          size="xl"
          color="$textLight"
          $dark-color="$textDark"
          textAlign={isRTL ? 'right' : 'left'}
        >
          {getStoreName()}
        </Heading>
        {store && (
          <Text
            fontSize="$sm"
            color="$textSecondaryLight"
            $dark-color="$textSecondaryDark"
            mt="$1"
            textAlign={isRTL ? 'right' : 'left'}
          >
            {user?.email || ''}
          </Text>
        )}
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadStoreData(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Box px="$4">
          {/* Store Info Card */}
          {store && (
            <Box
              mb="$6"
              p="$4"
              bg="$surfaceLight"
              $dark-bg="$surfaceDark"
              borderRadius="$2xl"
            >
              <VStack space="sm">
                <HStack
                  alignItems="center"
                  justifyContent="space-between"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}
                >
                  <Text
                    fontSize="$sm"
                    fontWeight="$medium"
                    color="$textSecondaryLight"
                    $dark-color="$textSecondaryDark"
                  >
                    {t('store_url')}
                  </Text>
                  <Text
                    fontSize="$sm"
                    color="$primary500"
                    numberOfLines={1}
                    flex={1}
                    textAlign={isRTL ? 'left' : 'right'}
                    ml={isRTL ? 0 : '$2'}
                    mr={isRTL ? '$2' : 0}
                  >
                    {store.storeUrl?.replace('https://', '') || `shop.my-store.ai/${store.slug}`}
                  </Text>
                </HStack>
                <HStack
                  alignItems="center"
                  justifyContent="space-between"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}
                >
                  <Text
                    fontSize="$sm"
                    fontWeight="$medium"
                    color="$textSecondaryLight"
                    $dark-color="$textSecondaryDark"
                  >
                    {t('store_status')}
                  </Text>
                  <Box
                    px="$3"
                    py="$1"
                    borderRadius="$full"
                    bg={store.isPublished ? '$success100' : '$amber100'}
                    $dark-bg={store.isPublished ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}
                  >
                    <Text
                      fontSize="$xs"
                      fontWeight="$semibold"
                      color={store.isPublished ? '$success700' : '$amber700'}
                      $dark-color={store.isPublished ? '$success400' : '$amber400'}
                    >
                      {store.isPublished ? t('published') : t('draft')}
                    </Text>
                  </Box>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Settings Sections */}
          {sections.map((section, sectionIndex) => (
            <Box key={section.title} mb="$6">
              {/* Section Header */}
              <Heading
                size="sm"
                color="$textSecondaryLight"
                $dark-color="$textSecondaryDark"
                mb="$3"
                textTransform="uppercase"
                letterSpacing="$sm"
                textAlign={isRTL ? 'right' : 'left'}
              >
                {section.title}
              </Heading>

              {/* Section Items */}
              <VStack
                space="sm"
                bg="$surfaceLight"
                $dark-bg="$surfaceDark"
                borderRadius="$2xl"
                overflow="hidden"
              >
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleItemPress(item)}
                      bg="$surfaceLight"
                      $dark-bg="$surfaceDark"
                      $hover-bg="$backgroundHoverLight"
                      $dark-hover-bg="$backgroundHoverDark"
                      $active-opacity={0.8}
                    >
                      <HStack
                        px="$4"
                        py="$3.5"
                        alignItems="center"
                        space="md"
                        flexDirection={isRTL ? 'row-reverse' : 'row'}
                      >
                        {/* Icon */}
                        <Box
                          w={44}
                          h={44}
                          borderRadius="$xl"
                          bg={isDark ? undefined : item.iconBg}
                          alignItems="center"
                          justifyContent="center"
                          style={
                            isDark
                              ? {
                                  backgroundColor: item.iconBgDark,
                                }
                              : undefined
                          }
                        >
                          <Icon
                            size={22}
                            color={colors[item.iconColor?.replace('$', '') as keyof typeof colors] || colors.primary}
                            strokeWidth={2}
                          />
                        </Box>

                        {/* Label */}
                        <Text
                          flex={1}
                          fontSize="$md"
                          fontWeight="$medium"
                          color="$textLight"
                          $dark-color="$textDark"
                          textAlign={isRTL ? 'right' : 'left'}
                        >
                          {item.label}
                        </Text>

                        {/* Badge (if exists) */}
                        {item.badge && (
                          <Box
                            px="$2.5"
                            py="$1"
                            borderRadius="$full"
                            bg="$primary500"
                          >
                            <Text
                              fontSize="$xs"
                              fontWeight="$bold"
                              color="$white"
                            >
                              {item.badge}
                            </Text>
                          </Box>
                        )}

                        {/* Chevron */}
                        <ChevronRight
                          size={20}
                          color={colors.textSecondary}
                          style={{
                            transform: [{ scaleX: isRTL ? -1 : 1 }],
                          }}
                        />
                      </HStack>

                      {/* Divider */}
                      {itemIndex < section.items.length - 1 && (
                        <Box
                          h={1}
                          bg="$borderLight"
                          $dark-bg="$borderDark"
                          opacity={0.3}
                          mx="$4"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </VStack>
            </Box>
          ))}

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            mb="$6"
            borderRadius="$2xl"
            overflow="hidden"
            bg="$error50"
            $dark-bg="rgba(239, 68, 68, 0.1)"
            borderWidth={1}
            borderColor="$error100"
            $dark-borderColor="rgba(239, 68, 68, 0.2)"
            $active-opacity={0.8}
          >
            <HStack
              px="$4"
              py="$4"
              alignItems="center"
              justifyContent="center"
              space="sm"
              flexDirection={isRTL ? 'row-reverse' : 'row'}
            >
              <LogOut size={20} color={colors.error} strokeWidth={2} />
              <Text
                fontSize="$md"
                fontWeight="$semibold"
                color="$error500"
              >
                {t('logout')}
              </Text>
            </HStack>
          </Pressable>

          {/* App Version */}
          <Box alignItems="center" mb="$4">
            <Text
              fontSize="$sm"
              color="$textSecondaryLight"
              $dark-color="$textSecondaryDark"
            >
              {tCommon('version')} 1.0.0
            </Text>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
