import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, RefreshControl, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { haptics } from '@/utils/haptics';
import { apiGet, apiPut } from '@/services/api';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  Spinner,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import {
  Wallet,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react-native';

interface PayPalSettings {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  merchantId?: string;
  sandboxMode: boolean;
}

export default function PayPalSettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // PayPal settings state
  const [enabled, setEnabled] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [sandboxMode, setSandboxMode] = useState(false);

  // Show/hide secret
  const [showClientSecret, setShowClientSecret] = useState(false);

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<PayPalSettings>({
    enabled: false,
    clientId: '',
    clientSecret: '',
    merchantId: '',
    sandboxMode: false,
  });

  useEffect(() => {
    loadPayPalSettings();
  }, []);

  // Check if settings have changed
  useEffect(() => {
    const changed =
      enabled !== originalSettings.enabled ||
      clientId !== originalSettings.clientId ||
      clientSecret !== originalSettings.clientSecret ||
      merchantId !== originalSettings.merchantId ||
      sandboxMode !== originalSettings.sandboxMode;

    setHasChanges(changed);
  }, [enabled, clientId, clientSecret, merchantId, sandboxMode, originalSettings]);

  const loadPayPalSettings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch PayPal settings
      const response = await apiGet<{ success: boolean; data: any }>('/settings/paypal');

      if (response.data.data) {
        const settings = response.data.data;

        setEnabled(settings.enabled || false);
        setClientId(settings.clientId || '');
        setClientSecret(settings.clientSecret || '');
        setMerchantId(settings.merchantId || '');
        setSandboxMode(settings.sandboxMode || false);

        // Store original settings
        setOriginalSettings({
          enabled: settings.enabled || false,
          clientId: settings.clientId || '',
          clientSecret: settings.clientSecret || '',
          merchantId: settings.merchantId || '',
          sandboxMode: settings.sandboxMode || false,
        });
        setHasChanges(false);
      }

      if (isRefresh) haptics.success();
    } catch (error: any) {
      console.error('Error loading PayPal settings:', error);
      if (isRefresh) haptics.error();

      // If 404, it means no settings exist yet - that's okay
      if (error.response?.status !== 404) {
        Alert.alert(
          currentLanguage === 'ar' ? 'خطأ' : 'Error',
          error.message || (currentLanguage === 'ar' ? 'فشل تحميل إعدادات PayPal' : 'Failed to load PayPal settings')
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (enabled) {
        if (!clientId.trim()) {
          haptics.error();
          Alert.alert(
            currentLanguage === 'ar' ? 'خطأ' : 'Error',
            currentLanguage === 'ar' ? 'معرّف العميل مطلوب' : 'Client ID is required'
          );
          return;
        }

        if (!clientSecret.trim()) {
          haptics.error();
          Alert.alert(
            currentLanguage === 'ar' ? 'خطأ' : 'Error',
            currentLanguage === 'ar' ? 'سر العميل مطلوب' : 'Client Secret is required'
          );
          return;
        }
      }

      setSaving(true);
      haptics.light();

      const updates = {
        enabled,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        merchantId: merchantId.trim(),
        sandboxMode,
      };

      // Update PayPal settings
      await apiPut('/settings/paypal', updates);

      haptics.success();
      Alert.alert(
        currentLanguage === 'ar' ? 'نجح' : 'Success',
        currentLanguage === 'ar' ? 'تم حفظ إعدادات PayPal بنجاح' : 'PayPal settings saved successfully'
      );

      // Reload settings to update originalSettings
      await loadPayPalSettings();
    } catch (error: any) {
      haptics.error();
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : 'Error',
        error.message || (currentLanguage === 'ar' ? 'فشل حفظ إعدادات PayPal' : 'Failed to save PayPal settings')
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$primary500" />
        <Text mt="$4" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
          {currentLanguage === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPayPalSettings(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Box px="$4" pt="$4" pb="$4">
          <VStack space="lg">
            {/* Header */}
            <VStack space="sm">
              <HStack alignItems="center" space="md" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                <Box
                  w={56}
                  h={56}
                  borderRadius="$2xl"
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: isDark ? 'rgba(0, 112, 186, 0.2)' : 'rgba(0, 112, 186, 0.1)' }}
                >
                  <Wallet size={28} color="#0070ba" strokeWidth={2.5} />
                </Box>
                <VStack flex={1}>
                  <Heading size="xl" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                    PayPal
                  </Heading>
                  <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'إعدادات بوابة الدفع PayPal' : 'PayPal payment gateway settings'}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Enable PayPal */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <HStack
                alignItems="center"
                justifyContent="space-between"
                flexDirection={isRTL ? 'row-reverse' : 'row'}
              >
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'تفعيل PayPal' : 'Enable PayPal'}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'السماح للعملاء بالدفع عبر PayPal' : 'Allow customers to pay via PayPal'}
                  </Text>
                </VStack>
                <Switch
                  value={enabled}
                  onValueChange={(value) => {
                    haptics.light();
                    setEnabled(value);
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

            {/* Sandbox Mode */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <HStack
                alignItems="center"
                justifyContent="space-between"
                flexDirection={isRTL ? 'row-reverse' : 'row'}
              >
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'وضع Sandbox' : 'Sandbox Mode'}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'استخدام بيئة الاختبار بدلاً من البيئة الفعلية' : 'Use sandbox environment instead of live'}
                  </Text>
                </VStack>
                <Switch
                  value={sandboxMode}
                  onValueChange={(value) => {
                    haptics.light();
                    setSandboxMode(value);
                  }}
                  trackColor={{
                    false: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
                    true: '#f59e0b',
                  }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA'}
                />
              </HStack>
            </Box>

            {/* API Credentials */}
            <VStack space="md" bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <Text fontSize="$lg" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                {currentLanguage === 'ar' ? 'بيانات اعتماد API' : 'API Credentials'}
              </Text>

              {/* Client ID */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontWeight="$medium"
                  color="$textLight"
                  $dark-color="$textDark"
                  textAlign={isRTL ? 'right' : 'left'}
                >
                  {currentLanguage === 'ar' ? 'معرّف العميل' : 'Client ID'} {enabled && '*'}
                </Text>
                <Input
                  borderRadius="$xl"
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                >
                  <InputField
                    value={clientId}
                    onChangeText={setClientId}
                    placeholder={sandboxMode ? "Sandbox Client ID" : "Live Client ID"}
                    autoCapitalize="none"
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </Input>
              </VStack>

              {/* Client Secret */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontWeight="$medium"
                  color="$textLight"
                  $dark-color="$textDark"
                  textAlign={isRTL ? 'right' : 'left'}
                >
                  {currentLanguage === 'ar' ? 'سر العميل' : 'Client Secret'} {enabled && '*'}
                </Text>
                <Input
                  borderRadius="$xl"
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                >
                  <InputField
                    value={clientSecret}
                    onChangeText={setClientSecret}
                    placeholder={sandboxMode ? "Sandbox Client Secret" : "Live Client Secret"}
                    autoCapitalize="none"
                    secureTextEntry={!showClientSecret}
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  <Pressable
                    onPress={() => setShowClientSecret(!showClientSecret)}
                    p="$2"
                  >
                    {showClientSecret ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </Pressable>
                </Input>
              </VStack>

              {/* Merchant ID */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontWeight="$medium"
                  color="$textLight"
                  $dark-color="$textDark"
                  textAlign={isRTL ? 'right' : 'left'}
                >
                  {currentLanguage === 'ar' ? 'معرّف التاجر (اختياري)' : 'Merchant ID (Optional)'}
                </Text>
                <Input
                  borderRadius="$xl"
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                >
                  <InputField
                    value={merchantId}
                    onChangeText={setMerchantId}
                    placeholder="XXXXXXXXXX"
                    autoCapitalize="none"
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </Input>
                <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                  {currentLanguage === 'ar' ? 'مطلوب لبعض الميزات المتقدمة فقط' : 'Required for some advanced features only'}
                </Text>
              </VStack>
            </VStack>

            {/* Save Button */}
            <Button
              size="lg"
              bg="$primary500"
              borderRadius="$2xl"
              onPress={handleSave}
              isDisabled={saving || !hasChanges}
              $active-bg="$primary600"
              mt="$2"
              opacity={!hasChanges && !saving ? 0.5 : 1}
            >
              {saving ? (
                <Spinner color="#FFFFFF" />
              ) : (
                <HStack space="sm" alignItems="center">
                  <Save size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <ButtonText fontSize="$md" fontWeight="$bold" color="$white">
                    {currentLanguage === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
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
