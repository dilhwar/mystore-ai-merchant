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
  CreditCard,
  Edit2,
  Trash2,
  Plus,
  Banknote,
  Shield,
} from 'lucide-react-native';
import {
  getPaymentMethods,
  deletePaymentMethod,
  PaymentMethod,
} from '@/services/payment-methods.service';

export default function PaymentMethodsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const currentLanguage = i18n.language;

  // Load payment methods
  const loadPaymentMethods = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const methods = await getPaymentMethods();
      setPaymentMethods(methods);

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
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // Delete payment method
  const handleDelete = (methodId: string, methodName: string, isBuiltIn: boolean) => {
    if (isBuiltIn) {
      Alert.alert(t('error'), t('built_in_method_notice'));
      return;
    }

    haptics.light();
    Alert.alert(
      t('delete_payment_method'),
      t('delete_payment_method_confirm', { name: methodName }),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete_payment_method'),
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.success();
              await deletePaymentMethod(methodId);
              Alert.alert(t('success'), t('payment_method_deleted'));
              loadPaymentMethods();
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
      ? t('built_in_methods')
      : t('custom_methods');
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(method);
    return acc;
  }, {} as Record<string, PaymentMethod[]>);

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
            onRefresh={() => loadPaymentMethods(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Box px="$4">
          {/* Empty State */}
          {paymentMethods.length === 0 ? (
            <Box alignItems="center" py="$20">
              <Box
                w={80}
                h={80}
                borderRadius="$full"
                bg="$green50"
                $dark-bg="rgba(34, 197, 94, 0.15)"
                alignItems="center"
                justifyContent="center"
                mb="$6"
              >
                <CreditCard size={40} color={colors.green500} strokeWidth={2} />
              </Box>
              <Heading
                size="lg"
                color="$textLight"
                $dark-color="$textDark"
                mb="$2"
                textAlign="center"
              >
                {t('no_payment_methods')}
              </Heading>
              <Text
                fontSize="$sm"
                color="$textSecondaryLight"
                $dark-color="$textSecondaryDark"
                textAlign="center"
                px="$8"
                mb="$6"
              >
                {t('add_payment_methods_hint')}
              </Text>
              <Button
                size="lg"
                bg="$primary500"
                borderRadius="$2xl"
                onPress={() => {
                  haptics.light();
                  router.push('/settings/order-settings/payment-methods/add');
                }}
              >
                <HStack space="sm" alignItems="center">
                  <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <ButtonText fontSize="$md" fontWeight="$bold" color="$white">
                    {t('add_payment_method')}
                  </ButtonText>
                </HStack>
              </Button>
            </Box>
          ) : (
            /* Payment Methods List */
            <VStack space="lg">
              {Object.entries(groupedMethods).map(([groupName, methods]) => (
                <Box key={groupName}>
                  {/* Group Header */}
                  <HStack
                    alignItems="center"
                    space="sm"
                    mb="$3"
                    flexDirection={isRTL ? 'row-reverse' : 'row'}
                  >
                    {groupName === t('built_in_methods') ? (
                      <Shield size={16} color={colors.textSecondary} strokeWidth={2.5} />
                    ) : (
                      <Banknote size={16} color={colors.textSecondary} strokeWidth={2.5} />
                    )}
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color="$textSecondaryLight"
                      $dark-color="$textSecondaryDark"
                      textTransform="uppercase"
                      letterSpacing="$sm"
                    >
                      {groupName}
                    </Text>
                    <Text
                      fontSize="$xs"
                      color="$textSecondaryLight"
                      $dark-color="$textSecondaryDark"
                    >
                      ({methods.length})
                    </Text>
                  </HStack>

                  {/* Methods */}
                  <VStack space="sm">
                    {methods.map((method) => {
                      const methodName = getMethodName(method);
                      return (
                        <Box
                          key={method.id}
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
                              bg={method.isActive ? '$green50' : '$gray100'}
                              $dark-bg={method.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <CreditCard
                                size={24}
                                color={method.isActive ? colors.green500 : colors.textSecondary}
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
                                {method.isBuiltIn && (
                                  <Box
                                    px="$2"
                                    py="$0.5"
                                    borderRadius="$full"
                                    bg="$blue100"
                                    $dark-bg="rgba(59, 130, 246, 0.2)"
                                  >
                                    <Text
                                      fontSize="$xs"
                                      fontWeight="$semibold"
                                      color="$blue700"
                                      $dark-color="$blue400"
                                    >
                                      {t('built_in')}
                                    </Text>
                                  </Box>
                                )}
                                {!method.isActive && (
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
                              {method.processingFee !== undefined && method.processingFee > 0 && (
                                <Text
                                  fontSize="$sm"
                                  color="$textSecondaryLight"
                                  $dark-color="$textSecondaryDark"
                                >
                                  {t('processing_fee')}: {method.processingFee.toFixed(2)}
                                </Text>
                              )}
                            </VStack>

                            {/* Actions */}
                            <HStack space="xs">
                              <Pressable
                                onPress={() => {
                                  haptics.light();
                                  router.push(`/settings/order-settings/payment-methods/edit/${method.id}` as any);
                                }}
                                w={40}
                                h={40}
                                borderRadius="$xl"
                                alignItems="center"
                                justifyContent="center"
                                bg="$green50"
                                $dark-bg="rgba(34, 197, 94, 0.15)"
                              >
                                <Edit2 size={18} color={colors.green500} strokeWidth={2.5} />
                              </Pressable>
                              {!method.isBuiltIn && (
                                <Pressable
                                  onPress={() => handleDelete(method.id, methodName, method.isBuiltIn)}
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
                              )}
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
                  router.push('/settings/order-settings/payment-methods/add');
                }}
                mt="$4"
              >
                <HStack space="sm" alignItems="center">
                  <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <ButtonText fontSize="$md" fontWeight="$bold" color="$white">
                    {t('add_payment_method')}
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
