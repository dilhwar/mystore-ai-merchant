import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  Info,
} from 'lucide-react-native';
import {
  getPaymentMethod,
  updatePaymentMethod,
  PaymentMethod,
} from '@/services/payment-methods.service';

export default function EditPaymentMethodScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  // Use dynamic form hook for language fields
  const { formData, setFormData, buildPayload, validateRequiredFields } = useDynamicForm([
    'name',
    'description',
    'instructions',
  ]);

  const [processingFee, setProcessingFee] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Additional fields based on payment type
  const [requireReceipt, setRequireReceipt] = useState(false);

  // Bank Transfer fields
  const [bankName, setBankName] = useState('');
  const [bankNameAr, setBankNameAr] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountHolderNameAr, setAccountHolderNameAr] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [branch, setBranch] = useState('');
  const [branchAr, setBranchAr] = useState('');

  // E-Wallet fields
  const [walletProvider, setWalletProvider] = useState('');
  const [walletProviderAr, setWalletProviderAr] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [walletAccountName, setWalletAccountName] = useState('');
  const [walletAccountNameAr, setWalletAccountNameAr] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

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

      // Initialize form data with existing values
      const initialData: Record<string, string> = {};
      Object.keys(methodData).forEach((key) => {
        if (key.startsWith('name') || key.startsWith('description') || key.startsWith('instructions')) {
          initialData[key] = methodData[key] || '';
        }
      });
      setFormData(initialData);

      setProcessingFee(methodData.processingFee ? methodData.processingFee.toString() : '');
      setIsActive(methodData.enabled);
      setRequireReceipt(methodData.requireReceipt || false);

      // Bank Transfer fields
      setBankName(methodData.bankName || '');
      setBankNameAr(methodData.bankNameAr || '');
      setAccountHolderName(methodData.accountHolderName || '');
      setAccountHolderNameAr(methodData.accountHolderNameAr || '');
      setAccountNumber(methodData.accountNumber || '');
      setIban(methodData.iban || '');
      setSwiftCode(methodData.swiftCode || '');
      setBranch(methodData.branch || '');
      setBranchAr(methodData.branchAr || '');

      // E-Wallet fields
      setWalletProvider(methodData.walletProvider || '');
      setWalletProviderAr(methodData.walletProviderAr || '');
      setWalletNumber(methodData.walletNumber || '');
      setWalletAccountName(methodData.walletAccountName || '');
      setWalletAccountNameAr(methodData.walletAccountNameAr || '');
      setQrCodeUrl(methodData.qrCodeUrl || '');
      setPaymentLink(methodData.paymentLink || '');
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

      const data: any = {
        ...buildPayload(),
        enabled: isActive,
        feeAmount: processingFee ? Number(processingFee) : undefined,
      };

      // Add type-specific fields
      if (method?.type === 'BANK_TRANSFER') {
        data.bankName = bankName.trim();
        data.bankNameAr = bankNameAr.trim();
        data.accountHolderName = accountHolderName.trim();
        data.accountHolderNameAr = accountHolderNameAr.trim();
        data.accountNumber = accountNumber.trim();
        data.iban = iban.trim();
        data.swiftCode = swiftCode.trim();
        data.branch = branch.trim();
        data.branchAr = branchAr.trim();
        data.requireReceipt = requireReceipt;
      } else if (method?.type === 'EWALLET') {
        data.walletProvider = walletProvider.trim();
        data.walletProviderAr = walletProviderAr.trim();
        data.walletNumber = walletNumber.trim();
        data.walletAccountName = walletAccountName.trim();
        data.walletAccountNameAr = walletAccountNameAr.trim();
        data.qrCodeUrl = qrCodeUrl.trim();
        data.paymentLink = paymentLink.trim();
        data.requireReceipt = requireReceipt;
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
                  disabled={method?.isBuiltIn}
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

            {!method?.isBuiltIn && (
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
                  {/* Bank Name */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('bank_name')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={bankName}
                        onChangeText={setBankName}
                        placeholder="Bank Name"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Bank Name Arabic */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('bank_name')} (العربية)
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={bankNameAr}
                        onChangeText={setBankNameAr}
                        placeholder="اسم البنك"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign="right"
                      />
                    </Input>
                  </VStack>

                  {/* Account Holder Name */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('account_holder_name')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={accountHolderName}
                        onChangeText={setAccountHolderName}
                        placeholder="Account Holder Name"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Account Holder Name Arabic */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('account_holder_name')} (العربية)
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={accountHolderNameAr}
                        onChangeText={setAccountHolderNameAr}
                        placeholder="اسم صاحب الحساب"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign="right"
                      />
                    </Input>
                  </VStack>

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

                  {/* Branch */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('branch')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={branch}
                        onChangeText={setBranch}
                        placeholder="Branch Name"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Branch Arabic */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('branch')} (العربية)
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={branchAr}
                        onChangeText={setBranchAr}
                        placeholder="اسم الفرع"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign="right"
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
                  {/* Wallet Provider */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('wallet_provider')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={walletProvider}
                        onChangeText={setWalletProvider}
                        placeholder="e.g., Zain Cash, Fastpay"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Wallet Provider Arabic */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('wallet_provider')} (العربية)
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={walletProviderAr}
                        onChangeText={setWalletProviderAr}
                        placeholder="مثال: زين كاش، فاست باي"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign="right"
                      />
                    </Input>
                  </VStack>

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

                  {/* Wallet Account Name */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('wallet_account_name')}
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={walletAccountName}
                        onChangeText={setWalletAccountName}
                        placeholder="Account Name"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      />
                    </Input>
                  </VStack>

                  {/* Wallet Account Name Arabic */}
                  <VStack space="xs">
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('wallet_account_name')} (العربية)
                    </Text>
                    <Input
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                    >
                      <InputField
                        value={walletAccountNameAr}
                        onChangeText={setWalletAccountNameAr}
                        placeholder="اسم الحساب"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign="right"
                      />
                    </Input>
                  </VStack>

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
