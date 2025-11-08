import React, { useState } from 'react';
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
  Textarea,
  TextareaInput,
} from '@gluestack-ui/themed';
import {
  ArrowLeft,
  Save,
} from 'lucide-react-native';
import { createPaymentMethod } from '@/services/payment-methods.service';

export default function AddPaymentMethodScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);

  // Use dynamic form hook for language fields
  const { formData, setFormData, buildPayload, validateRequiredFields } = useDynamicForm([
    'name',
    'description',
    'instructions',
  ]);

  const [processingFee, setProcessingFee] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Validate form
  const validateForm = (): boolean => {
    if (!validateRequiredFields()) {
      Alert.alert(t('error'), t('name_required'));
      return false;
    }

    if (processingFee && (isNaN(Number(processingFee)) || Number(processingFee) < 0)) {
      Alert.alert(t('error'), t('fee_invalid'));
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

      const data = {
        type: 'custom',
        ...buildPayload(),
        isActive,
        feeAmount: processingFee ? Number(processingFee) : undefined,
      };

      await createPaymentMethod(data);

      haptics.success();
      Alert.alert(
        t('success'),
        t('payment_method_created'),
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
                {/* Dynamic Name Fields */}
                <DynamicLanguageFields
                  fieldName="name"
                  formData={formData}
                  setFormData={setFormData}
                  placeholder={t('payment_method_name_placeholder')}
                />

                {/* Dynamic Description Fields */}
                <DynamicLanguageFields
                  fieldName="description"
                  formData={formData}
                  setFormData={setFormData}
                  placeholder={t('payment_method_description_placeholder')}
                  multiline
                  minHeight={80}
                />
              </VStack>

            <VStack
                space="md"
                bg="$surfaceLight"
                $dark-bg="$surfaceDark"
                borderRadius="$2xl"
                p="$4"
              >
                {/* Dynamic Instructions Fields */}
                <DynamicLanguageFields
                  fieldName="instructions"
                  formData={formData}
                  setFormData={setFormData}
                  placeholder={t('payment_instructions_placeholder')}
                  multiline
                  minHeight={100}
                />
              </VStack>

            <VStack
                space="md"
                bg="$surfaceLight"
                $dark-bg="$surfaceDark"
                borderRadius="$2xl"
                p="$4"
              >
                {/* Processing Fee */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontWeight="$medium"
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  >
                    {t('processing_fee')} (%)
                  </Text>
                  <Input
                    borderRadius="$xl"
                    borderColor="$borderLight"
                    $dark-borderColor="$borderDark"
                    bg="$backgroundLight"
                    $dark-bg="$backgroundDark"
                  >
                    <InputField
                      value={processingFee}
                      onChangeText={setProcessingFee}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    />
                  </Input>
                </VStack>

                {/* Active Switch */}
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
                      {t('active_payment_description')}
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
              </VStack>

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
