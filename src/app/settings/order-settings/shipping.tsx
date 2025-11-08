import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Alert, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter } from 'expo-router';
import { haptics } from '@/utils/haptics';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Pressable,
  Spinner,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import {
  ArrowLeft,
  Truck,
  Edit2,
  Trash2,
  Plus,
  MapPin,
} from 'lucide-react-native';
import {
  getShippingRates,
  deleteShippingRate,
  ShippingRate,
} from '@/services/shipping.service';

export default function ShippingMethodsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);

  const currentLanguage = i18n.language;

  // Load shipping rates
  const loadShippingRates = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const rates = await getShippingRates();
      setShippingRates(rates);

      if (isRefresh) {
        haptics.success();
      }
    } catch (error: any) {
      if (isRefresh) {
        haptics.error();
      }
      Alert.alert(t('error'), error.message || t('load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadShippingRates();
  }, [loadShippingRates]);

  // Delete shipping rate
  const handleDelete = (rateId: string, rateName: string) => {
    haptics.light();
    Alert.alert(
      t('delete_shipping_method'),
      t('delete_shipping_method_confirm', { name: rateName }),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete_shipping_method'),
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.success();
              await deleteShippingRate(rateId);
              Alert.alert(t('success'), t('shipping_method_deleted'));
              loadShippingRates();
            } catch (error: any) {
              haptics.error();
              Alert.alert(t('error'), error.message);
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
      : t('no_zone');

    if (!acc[zoneName]) {
      acc[zoneName] = [];
    }
    acc[zoneName].push(rate);
    return acc;
  }, {} as Record<string, ShippingRate[]>);

  if (loading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$primary500" />
        <Text mt="$4" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
          {t('loading')}
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadShippingRates(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Box px="$4">
          {/* Empty State */}
          {shippingRates.length === 0 ? (
            <Box alignItems="center" py="$20">
              <Box
                w={80}
                h={80}
                borderRadius="$full"
                bg="$blue50"
                $dark-bg="rgba(59, 130, 246, 0.15)"
                alignItems="center"
                justifyContent="center"
                mb="$6"
              >
                <Truck size={40} color={colors.blue500} strokeWidth={2} />
              </Box>
              <Heading
                size="lg"
                color="$textLight"
                $dark-color="$textDark"
                mb="$2"
                textAlign="center"
              >
                {t('no_shipping_methods')}
              </Heading>
              <Text
                fontSize="$sm"
                color="$textSecondaryLight"
                $dark-color="$textSecondaryDark"
                textAlign="center"
                px="$8"
                mb="$6"
              >
                {t('add_shipping_methods_hint')}
              </Text>
              <Button
                size="lg"
                bg="$primary500"
                borderRadius="$2xl"
                onPress={() => {
                  haptics.light();
                  router.push('/settings/order-settings/shipping/add');
                }}
              >
                <HStack space="sm" alignItems="center">
                  <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <ButtonText fontSize="$md" fontWeight="$bold" color="$white">
                    {t('add_shipping_method')}
                  </ButtonText>
                </HStack>
              </Button>
            </Box>
          ) : (
            /* Shipping Methods List */
            <VStack space="lg">
              {Object.entries(groupedRates).map(([zoneName, rates]) => (
                <Box key={zoneName}>
                  {/* Zone Header */}
                  <HStack
                    alignItems="center"
                    space="sm"
                    mb="$3"
                    flexDirection={isRTL ? 'row-reverse' : 'row'}
                  >
                    <MapPin size={16} color={colors.textSecondary} strokeWidth={2.5} />
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color="$textSecondaryLight"
                      $dark-color="$textSecondaryDark"
                      textTransform="uppercase"
                      letterSpacing="$sm"
                    >
                      {zoneName}
                    </Text>
                    <Text
                      fontSize="$xs"
                      color="$textSecondaryLight"
                      $dark-color="$textSecondaryDark"
                    >
                      ({rates.length})
                    </Text>
                  </HStack>

                  {/* Rates */}
                  <VStack space="sm">
                    {rates.map((rate) => {
                      const methodName = getMethodName(rate);
                      return (
                        <Box
                          key={rate.id}
                          bg="$surfaceLight"
                          $dark-bg="$surfaceDark"
                          borderRadius="$2xl"
                          overflow="hidden"
                        >
                          <HStack
                            px="$4"
                            py="$4"
                            alignItems="center"
                            space="md"
                            flexDirection={isRTL ? 'row-reverse' : 'row'}
                          >
                            {/* Icon */}
                            <Box
                              w={48}
                              h={48}
                              borderRadius="$xl"
                              bg={rate.isActive ? '$blue50' : '$gray100'}
                              $dark-bg={rate.isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Truck
                                size={24}
                                color={rate.isActive ? colors.blue500 : colors.textSecondary}
                                strokeWidth={2}
                              />
                            </Box>

                            {/* Info */}
                            <VStack flex={1} space="xs">
                              <HStack alignItems="center" space="sm" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                                <Text
                                  fontSize="$md"
                                  fontWeight="$semibold"
                                  color="$textLight"
                                  $dark-color="$textDark"
                                >
                                  {methodName}
                                </Text>
                                {!rate.isActive && (
                                  <Box
                                    px="$2"
                                    py="$0.5"
                                    borderRadius="$full"
                                    bg="$gray100"
                                    $dark-bg="rgba(255, 255, 255, 0.1)"
                                  >
                                    <Text
                                      fontSize="$xs"
                                      fontWeight="$semibold"
                                      color="$textSecondaryLight"
                                      $dark-color="$textSecondaryDark"
                                    >
                                      {t('inactive') || 'Inactive'}
                                    </Text>
                                  </Box>
                                )}
                              </HStack>
                              <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                                <Text
                                  fontSize="$sm"
                                  color="$textSecondaryLight"
                                  $dark-color="$textSecondaryDark"
                                >
                                  {t('cost')}: {rate.cost.toFixed(2)}
                                </Text>
                                {rate.estimatedDeliveryTime && (
                                  <>
                                    <Text color="$borderLight" $dark-color="$borderDark">•</Text>
                                    <Text
                                      fontSize="$sm"
                                      color="$textSecondaryLight"
                                      $dark-color="$textSecondaryDark"
                                    >
                                      {rate.estimatedDeliveryTime} {rate.settings?.timeUnit === 'hours' ? t('hours') : t('days')}
                                    </Text>
                                  </>
                                )}
                              </HStack>
                            </VStack>

                            {/* Actions */}
                            <HStack space="xs">
                              <Pressable
                                onPress={() => {
                                  haptics.light();
                                  router.push(`/settings/order-settings/shipping/edit/${rate.id}` as any);
                                }}
                                w={40}
                                h={40}
                                borderRadius="$xl"
                                alignItems="center"
                                justifyContent="center"
                                bg="$blue50"
                                $dark-bg="rgba(59, 130, 246, 0.15)"
                              >
                                <Edit2 size={18} color={colors.blue500} strokeWidth={2.5} />
                              </Pressable>
                              <Pressable
                                onPress={() => handleDelete(rate.id, methodName)}
                                w={40}
                                h={40}
                                borderRadius="$xl"
                                alignItems="center"
                                justifyContent="center"
                                bg="$error50"
                                $dark-bg="rgba(239, 68, 68, 0.15)"
                              >
                                <Trash2 size={18} color={colors.error} strokeWidth={2.5} />
                              </Pressable>
                            </HStack>
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>
                </Box>
              ))}

              {/* Add Button */}
              <Button
                size="lg"
                bg="$primary500"
                borderRadius="$2xl"
                onPress={() => {
                  haptics.light();
                  router.push('/settings/order-settings/shipping/add');
                }}
                mt="$4"
              >
                <HStack space="sm" alignItems="center">
                  <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <ButtonText fontSize="$md" fontWeight="$bold" color="$white">
                    {t('add_shipping_method')}
                  </ButtonText>
                </HStack>
              </Button>
            </VStack>
          )}
        </Box>
      </ScrollView>
    </Box>
  );
}
