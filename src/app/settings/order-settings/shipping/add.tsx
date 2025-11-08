import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter } from 'expo-router';
import { haptics } from '@/utils/haptics';
import { useDynamicForm } from '@/hooks/useDynamicForm';
import { DynamicLanguageFields } from '@/components/forms/DynamicLanguageFields';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Pressable,
  Spinner,
  Input,
  InputField,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import {
  ArrowLeft,
  Truck,
  Save,
  MapPin,
  ChevronDown,
} from 'lucide-react-native';
import {
  createShippingRate,
} from '@/services/shipping.service';

export default function AddShippingMethodScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);

  // Use dynamic form hook for language fields
  const { formData, setFormData, buildPayload, validateRequiredFields } = useDynamicForm(['name']);

  const [cost, setCost] = useState('');
  const [minTime, setMinTime] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [timeUnit, setTimeUnit] = useState<'hours' | 'days'>('days');
  const [isActive, setIsActive] = useState(true);

  const currentLanguage = i18n.language;

  // Validate form
  const validateForm = (): boolean => {
    if (!validateRequiredFields()) {
      Alert.alert(t('error'), t('name_required'));
      return false;
    }

    if (!cost.trim() || isNaN(Number(cost)) || Number(cost) < 0) {
      Alert.alert(t('error'), t('cost_invalid'));
      return false;
    }

    if (minTime && (isNaN(Number(minTime)) || Number(minTime) < 0)) {
      Alert.alert(t('error'), t('time_invalid'));
      return false;
    }

    if (maxTime && (isNaN(Number(maxTime)) || Number(maxTime) < 0)) {
      Alert.alert(t('error'), t('time_invalid'));
      return false;
    }

    if (minTime && maxTime && Number(minTime) > Number(maxTime)) {
      Alert.alert(t('error'), t('min_greater_than_max'));
      return false;
    }

    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      haptics.light();
      setLoading(true);

      // Build estimated time string
      let estimatedTime = '';
      if (minTime && maxTime) {
        estimatedTime = `${minTime}-${maxTime}`;
      } else if (minTime) {
        estimatedTime = minTime;
      } else if (maxTime) {
        estimatedTime = maxTime;
      }

      const data: any = {
        ...buildPayload(),
        type: 'FLAT_RATE', // Default type
        cost: Number(cost),
        estimatedDeliveryTime: estimatedTime || undefined,
        isActive,
      };

      // Add settings with timeUnit (keep translations separate)
      data.settings = {
        timeUnit,
      };

      await createShippingRate(data);

      haptics.success();
      Alert.alert(
        t('success'),
        t('shipping_method_created'),
        [
          {
            text: t('ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      haptics.error();
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 100 }}
      >
        <Box px="$4">
          <VStack space="lg">
            <VStack
                space="md"
                bg="$surfaceLight"
                $dark-bg="$surfaceDark"
                borderRadius="$2xl"
                p="$4"
              >
                {/* Dynamic Name Fields based on Store Languages */}
                <DynamicLanguageFields
                  fieldName="name"
                  formData={formData}
                  setFormData={setFormData}
                  placeholder={t('shipping_method_name_placeholder')}
                />

                {/* Cost */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontWeight="$medium"
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  >
                    {t('cost')} *
                  </Text>
                  <Input
                    borderRadius="$xl"
                    borderColor="$borderLight"
                    $dark-borderColor="$borderDark"
                    bg="$backgroundLight"
                    $dark-bg="$backgroundDark"
                  >
                    <InputField
                      value={cost}
                      onChangeText={setCost}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    />
                  </Input>
                </VStack>

                {/* Time Unit Selection */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontWeight="$medium"
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  >
                    {t('delivery_time_unit')}
                  </Text>
                  <HStack space="sm">
                    <Pressable
                      flex={1}
                      onPress={() => {
                        haptics.light();
                        setTimeUnit('hours');
                      }}
                      borderRadius="$xl"
                      borderWidth={2}
                      borderColor={timeUnit === 'hours' ? '$primary500' : '$borderLight'}
                      $dark-borderColor={timeUnit === 'hours' ? '$primary500' : '$borderDark'}
                      bg={timeUnit === 'hours' ? '$primary50' : '$backgroundLight'}
                      $dark-bg={timeUnit === 'hours' ? 'rgba(59, 130, 246, 0.1)' : '$backgroundDark'}
                      px="$4"
                      py="$3"
                      alignItems="center"
                    >
                      <Text
                        fontSize="$md"
                        fontWeight={timeUnit === 'hours' ? '$semibold' : '$normal'}
                        color={timeUnit === 'hours' ? '$primary500' : '$textLight'}
                        $dark-color={timeUnit === 'hours' ? '$primary400' : '$textDark'}
                      >
                        {t('hours')}
                      </Text>
                    </Pressable>
                    <Pressable
                      flex={1}
                      onPress={() => {
                        haptics.light();
                        setTimeUnit('days');
                      }}
                      borderRadius="$xl"
                      borderWidth={2}
                      borderColor={timeUnit === 'days' ? '$primary500' : '$borderLight'}
                      $dark-borderColor={timeUnit === 'days' ? '$primary500' : '$borderDark'}
                      bg={timeUnit === 'days' ? '$primary50' : '$backgroundLight'}
                      $dark-bg={timeUnit === 'days' ? 'rgba(59, 130, 246, 0.1)' : '$backgroundDark'}
                      px="$4"
                      py="$3"
                      alignItems="center"
                    >
                      <Text
                        fontSize="$md"
                        fontWeight={timeUnit === 'days' ? '$semibold' : '$normal'}
                        color={timeUnit === 'days' ? '$primary500' : '$textLight'}
                        $dark-color={timeUnit === 'days' ? '$primary400' : '$textDark'}
                      >
                        {t('days')}
                      </Text>
                    </Pressable>
                  </HStack>
                </VStack>

                {/* Estimated Delivery Time Range */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontWeight="$medium"
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  >
                    {t('estimated_delivery_time')}
                  </Text>
                  <HStack space="sm" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Input
                      flex={1}
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={minTime}
                        onChangeText={setMinTime}
                        placeholder={timeUnit === 'hours' ? '1' : '1'}
                        keyboardType="number-pad"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign="center"
                      />
                    </Input>
                    <Text
                      fontSize="$md"
                      color="$textSecondaryLight"
                      $dark-color="$textSecondaryDark"
                      px="$2"
                    >
                      -
                    </Text>
                    <Input
                      flex={1}
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={maxTime}
                        onChangeText={setMaxTime}
                        placeholder={timeUnit === 'hours' ? '3' : '2'}
                        keyboardType="number-pad"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign="center"
                      />
                    </Input>
                  </HStack>
                  <Text
                    fontSize="$xs"
                    color="$textSecondaryLight"
                    $dark-color="$textSecondaryDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  >
                    {timeUnit === 'hours' ? t('example_hours') : t('example_days')}
                  </Text>
                </VStack>
              </VStack>

            <Box
                bg="$surfaceLight"
                $dark-bg="$surfaceDark"
                borderRadius="$2xl"
                p="$4"
              >
                <HStack
                  alignItems="center"
                  justifyContent="space-between"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}
                >
                  <VStack flex={1}>
                    <Text
                      fontSize="$md"
                      fontWeight="$semibold"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('active')}
                    </Text>
                    <Text
                      fontSize="$sm"
                      color="$textSecondaryLight"
                      $dark-color="$textSecondaryDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('active_shipping_description')}
                    </Text>
                  </VStack>
                  <Switch
                    value={isActive}
                    onValueChange={(value) => {
                      haptics.light();
                      setIsActive(value);
                    }}
                    trackColor={{
                      false: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
                      true: colors.primary,
                    }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA'}
                  />
                </HStack>
              </Box>

            {/* Save Button */}
            <Button
              size="lg"
              bg="$primary500"
              borderRadius="$2xl"
              onPress={handleSave}
              isDisabled={loading}
              mt="$4"
            >
              {loading ? (
                <Spinner color="#FFFFFF" />
              ) : (
                <HStack space="sm" alignItems="center">
                  <Save size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <ButtonText fontSize="$md" fontWeight="$bold" color="$white">
                    {t('save_changes')}
                  </ButtonText>
                </HStack>
              )}
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
}
