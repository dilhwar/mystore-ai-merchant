import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { haptics } from '@/utils/haptics';
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
  Info,
} from 'lucide-react-native';
import {
  getPaymentMethod,
  updatePaymentMethod,
  PaymentMethod,
} from '@/services/payment-methods.service';
import { useDynamicForm } from '@/hooks/useDynamicForm';
import { DynamicLanguageFields } from '@/components/forms/DynamicLanguageFields';

export default function EditPaymentMethodScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  const [processingFee, setProcessingFee] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Additional fields based on payment type
  const [requireReceipt, setRequireReceipt] = useState(false);

  // Dynamic bilingual fields for Bank Transfer and E-Wallet
  const { formData, setFormData, buildPayload, updateFormData } = useDynamicForm([
    'bankName',
    'accountHolderName',
    'branch',
    'walletProvider',
    'walletAccountName',
  ]);

  // Non-bilingual fields
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalMerchantId, setPaypalMerchantId] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');

  // Load payment method
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const methodData = await getPaymentMethod(id as string);
      setMethod(methodData);

      setProcessingFee(methodData.processingFee ? methodData.processingFee.toString() : '');
      setIsActive(methodData.enabled);
      setRequireReceipt(methodData.requireReceipt || false);

      // Initialize dynamic bilingual fields
      const bilingualData: Record<string, string> = {};

      // Bank Transfer bilingual fields
      if (methodData.bankName) bilingualData.bankName = methodData.bankName;
      if (methodData.bankNameAr) bilingualData.bankNameAr = methodData.bankNameAr;
      if (methodData.accountHolderName) bilingualData.accountHolderName = methodData.accountHolderName;
      if (methodData.accountHolderNameAr) bilingualData.accountHolderNameAr = methodData.accountHolderNameAr;
      if (methodData.branch) bilingualData.branch = methodData.branch;
      if (methodData.branchAr) bilingualData.branchAr = methodData.branchAr;

      // E-Wallet bilingual fields
      if (methodData.walletProvider) bilingualData.walletProvider = methodData.walletProvider;
      if (methodData.walletProviderAr) bilingualData.walletProviderAr = methodData.walletProviderAr;
      if (methodData.walletAccountName) bilingualData.walletAccountName = methodData.walletAccountName;
      if (methodData.walletAccountNameAr) bilingualData.walletAccountNameAr = methodData.walletAccountNameAr;

      updateFormData(bilingualData);

      // Non-bilingual fields
      setAccountNumber(methodData.accountNumber || '');
      setIban(methodData.iban || '');
      setSwiftCode(methodData.swiftCode || '');
      setWalletNumber(methodData.walletNumber || '');
      setQrCodeUrl(methodData.qrCodeUrl || '');
      setPaymentLink(methodData.paymentLink || '');
      setPaypalEmail(methodData.paypalEmail || '');
      setPaypalMerchantId(methodData.paypalMerchantId || '');
      setStripePublishableKey(methodData.stripePublishableKey || '');
      setStripeSecretKey(methodData.stripeSecretKey || '');
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('load_error'), [
        {
          text: t('ok'),
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
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

      const data: any = {
        enabled: isActive,
        feeAmount: processingFee ? Number(processingFee) : undefined,
      };

      // Add type-specific fields
      if (method?.type === 'BANK_TRANSFER') {
        // Add bilingual fields from dynamic form
        const bilingualFields = buildPayload();
        Object.assign(data, bilingualFields);

        // Add non-bilingual fields
        data.accountNumber = accountNumber.trim();
        data.iban = iban.trim();
        data.swiftCode = swiftCode.trim();
        data.requireReceipt = requireReceipt;
      } else if (method?.type === 'EWALLET') {
        // Add bilingual fields from dynamic form
        const bilingualFields = buildPayload();
        Object.assign(data, bilingualFields);

        // Add non-bilingual fields
        data.walletNumber = walletNumber.trim();
        data.qrCodeUrl = qrCodeUrl.trim();
        data.paymentLink = paymentLink.trim();
        data.requireReceipt = requireReceipt;
      } else if (method?.type === 'PAYPAL') {
        data.paypalEmail = paypalEmail.trim();
        data.paypalMerchantId = paypalMerchantId.trim();
      } else if (method?.type === 'STRIPE') {
        data.stripePublishableKey = stripePublishableKey.trim();
        data.stripeSecretKey = stripeSecretKey.trim();
      }

      await updatePaymentMethod(id as string, data);

      haptics.success();
      Alert.alert(t('success'), t('payment_method_updated'), [
        {
          text: t('ok'),
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      haptics.error();
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
      >
        <Box px="$4">
          <VStack space="lg">
            {/* Built-in Notice */}
            {method?.isBuiltIn && (
              <Box
                bg="$blue50"
                $dark-bg="rgba(59, 130, 246, 0.1)"
                borderRadius="$2xl"
                p="$4"
              >
                <HStack space="sm" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                  <Info size={20} color={colors.blue500} strokeWidth={2.5} />
                  <Text
                    fontSize="$sm"
                    color="$blue700"
                    $dark-color="$blue400"
                    flex={1}
                    textAlign={isRTL ? 'right' : 'left'}
                  >
                    {t('built_in_method_notice')}
                  </Text>
                </HStack>
              </Box>
            )}

            {/* Bank Transfer Fields */}
            {method?.type === 'BANK_TRANSFER' && (
              <>
                <VStack
                  space="md"
                  bg="$surfaceLight"
                  $dark-bg="$surfaceDark"
                  borderRadius="$2xl"
                  p="$4"
                >
                  {/* Bank Name - Dynamic */}
                  <DynamicLanguageFields
                    fieldName="bankName"
                    formData={formData}
                    setFormData={setFormData}
                    placeholder={isRTL ? "مثال: البنك المركزي" : "e.g., Central Bank"}
                  />

                  {/* Account Holder Name - Dynamic */}
                  <DynamicLanguageFields
                    fieldName="accountHolderName"
                    formData={formData}
                    setFormData={setFormData}
                    placeholder={isRTL ? "مثال: أحمد محمد" : "e.g., Ahmed Mohammed"}
                  />

                  {/* Account Number */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('account_number')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        placeholder="123456789"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* IBAN */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('iban')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={iban}
                        onChangeText={setIban}
                        placeholder="IQ00 XXXX XXXX XXXX XXXX XXXX"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* SWIFT Code */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('swift_code')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={swiftCode}
                        onChangeText={setSwiftCode}
                        placeholder="XXXXXXXX"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Branch - Dynamic */}
                  <DynamicLanguageFields
                    fieldName="branch"
                    formData={formData}
                    setFormData={setFormData}
                    placeholder={isRTL ? "مثال: الفرع الرئيسي" : "e.g., Main Branch"}
                  />

                  {/* Require Receipt */}
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
                        {t('require_receipt')}
                      </Text>
                    </VStack>
                    <Switch
                      value={requireReceipt}
                      onValueChange={(value) => {
                        haptics.light();
                        setRequireReceipt(value);
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
              </>
            )}

            {/* E-Wallet Fields */}
            {method?.type === 'EWALLET' && (
              <>
                <VStack
                  space="md"
                  bg="$surfaceLight"
                  $dark-bg="$surfaceDark"
                  borderRadius="$2xl"
                  p="$4"
                >
                  {/* Wallet Provider - Dynamic */}
                  <DynamicLanguageFields
                    fieldName="walletProvider"
                    formData={formData}
                    setFormData={setFormData}
                    placeholder={isRTL ? "مثال: زين كاش، فاست باي" : "e.g., Zain Cash, Fastpay"}
                  />

                  {/* Wallet Number */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('wallet_number')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={walletNumber}
                        onChangeText={setWalletNumber}
                        placeholder="+964XXXXXXXXX"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Wallet Account Name - Dynamic */}
                  <DynamicLanguageFields
                    fieldName="walletAccountName"
                    formData={formData}
                    setFormData={setFormData}
                    placeholder={isRTL ? "مثال: أحمد محمد" : "e.g., Ahmed Mohammed"}
                  />

                  {/* QR Code URL */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('qr_code_url')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={qrCodeUrl}
                        onChangeText={setQrCodeUrl}
                        placeholder="https://example.com/qr-code.png"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Payment Link */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('payment_link')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={paymentLink}
                        onChangeText={setPaymentLink}
                        placeholder="https://payment.example.com"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Require Receipt */}
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
                        {t('require_receipt')}
                      </Text>
                    </VStack>
                    <Switch
                      value={requireReceipt}
                      onValueChange={(value) => {
                        haptics.light();
                        setRequireReceipt(value);
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
              </>
            )}

            {/* PayPal Fields */}
            {method?.type === 'PAYPAL' && (
              <>
                <VStack
                  space="md"
                  bg="$surfaceLight"
                  $dark-bg="$surfaceDark"
                  borderRadius="$2xl"
                  p="$4"
                >
                  {/* PayPal Email */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('paypal_email')} *
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={paypalEmail}
                        onChangeText={setPaypalEmail}
                        placeholder="merchant@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* PayPal Merchant ID */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('paypal_merchant_id')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={paypalMerchantId}
                        onChangeText={setPaypalMerchantId}
                        placeholder="XXXXXXXXXX"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>
                </VStack>
              </>
            )}

            {/* Stripe Fields */}
            {method?.type === 'STRIPE' && (
              <>
                <VStack
                  space="md"
                  bg="$surfaceLight"
                  $dark-bg="$surfaceDark"
                  borderRadius="$2xl"
                  p="$4"
                >
                  {/* Stripe Publishable Key */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('stripe_publishable_key')} *
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={stripePublishableKey}
                        onChangeText={setStripePublishableKey}
                        placeholder="pk_live_..."
                        autoCapitalize="none"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Stripe Secret Key */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('stripe_secret_key')} *
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={stripeSecretKey}
                        onChangeText={setStripeSecretKey}
                        placeholder="sk_live_..."
                        autoCapitalize="none"
                        secureTextEntry
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>
                </VStack>
              </>
            )}

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
