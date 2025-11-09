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
  CreditCard,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react-native';

interface StripeSettings {
  enabled: boolean;
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
  testMode: boolean;
}

export default function StripeSettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Stripe settings state
  const [enabled, setEnabled] = useState(false);
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [testMode, setTestMode] = useState(false);

  // Show/hide secret keys
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<StripeSettings>({
    enabled: false,
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    testMode: false,
  });

  useEffect(() => {
    loadStripeSettings();
  }, []);

  // Check if settings have changed
  useEffect(() => {
    const changed =
      enabled !== originalSettings.enabled ||
      publishableKey !== originalSettings.publishableKey ||
      secretKey !== originalSettings.secretKey ||
      webhookSecret !== originalSettings.webhookSecret ||
      testMode !== originalSettings.testMode;

    setHasChanges(changed);
  }, [enabled, publishableKey, secretKey, webhookSecret, testMode, originalSettings]);

  const loadStripeSettings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch Stripe settings
      const response = await apiGet<{ success: boolean; data: any }>('/settings/stripe');

      if (response.data.data) {
        const settings = response.data.data;

        setEnabled(settings.enabled || false);
        setPublishableKey(settings.publishableKey || '');
        setSecretKey(settings.secretKey || '');
        setWebhookSecret(settings.webhookSecret || '');
        setTestMode(settings.testMode || false);

        // Store original settings
        setOriginalSettings({
          enabled: settings.enabled || false,
          publishableKey: settings.publishableKey || '',
          secretKey: settings.secretKey || '',
          webhookSecret: settings.webhookSecret || '',
          testMode: settings.testMode || false,
        });
        setHasChanges(false);
      }

      if (isRefresh) haptics.success();
    } catch (error: any) {
      console.error('Error loading Stripe settings:', error);
      if (isRefresh) haptics.error();

      // If 404, it means no settings exist yet - that's okay
      if (error.response?.status !== 404) {
        Alert.alert(
          currentLanguage === 'ar' ? 'خطأ' : 'Error',
          error.message || (currentLanguage === 'ar' ? 'فشل تحميل إعدادات Stripe' : 'Failed to load Stripe settings')
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
        if (!publishableKey.trim()) {
          haptics.error();
          Alert.alert(
            currentLanguage === 'ar' ? 'خطأ' : 'Error',
            currentLanguage === 'ar' ? 'مفتاح النشر مطلوب' : 'Publishable key is required'
          );
          return;
        }

        if (!secretKey.trim()) {
          haptics.error();
          Alert.alert(
            currentLanguage === 'ar' ? 'خطأ' : 'Error',
            currentLanguage === 'ar' ? 'المفتاح السري مطلوب' : 'Secret key is required'
          );
          return;
        }

        // Validate key format
        const keyPrefix = testMode ? 'pk_test_' : 'pk_live_';
        if (!publishableKey.startsWith(keyPrefix)) {
          haptics.error();
          Alert.alert(
            currentLanguage === 'ar' ? 'خطأ' : 'Error',
            currentLanguage === 'ar'
              ? `مفتاح النشر يجب أن يبدأ بـ ${keyPrefix}`
              : `Publishable key must start with ${keyPrefix}`
          );
          return;
        }

        const secretPrefix = testMode ? 'sk_test_' : 'sk_live_';
        if (!secretKey.startsWith(secretPrefix)) {
          haptics.error();
          Alert.alert(
            currentLanguage === 'ar' ? 'خطأ' : 'Error',
            currentLanguage === 'ar'
              ? `المفتاح السري يجب أن يبدأ بـ ${secretPrefix}`
              : `Secret key must start with ${secretPrefix}`
          );
          return;
        }
      }

      setSaving(true);
      haptics.light();

      const updates = {
        enabled,
        publishableKey: publishableKey.trim(),
        secretKey: secretKey.trim(),
        webhookSecret: webhookSecret.trim(),
        testMode,
      };

      // Update Stripe settings
      await apiPut('/settings/stripe', updates);

      haptics.success();
      Alert.alert(
        currentLanguage === 'ar' ? 'نجح' : 'Success',
        currentLanguage === 'ar' ? 'تم حفظ إعدادات Stripe بنجاح' : 'Stripe settings saved successfully'
      );

      // Reload settings to update originalSettings
      await loadStripeSettings();
    } catch (error: any) {
      haptics.error();
      Alert.alert(
        currentLanguage === 'ar' ? 'خطأ' : 'Error',
        error.message || (currentLanguage === 'ar' ? 'فشل حفظ إعدادات Stripe' : 'Failed to save Stripe settings')
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
            onRefresh={() => loadStripeSettings(true)}
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
                  style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' }}
                >
                  <CreditCard size={28} color="#6366f1" strokeWidth={2.5} />
                </Box>
                <VStack flex={1}>
                  <Heading size="xl" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                    Stripe
                  </Heading>
                  <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'إعدادات بوابة الدفع Stripe' : 'Stripe payment gateway settings'}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Enable Stripe */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <HStack
                alignItems="center"
                justifyContent="space-between"
                flexDirection={isRTL ? 'row-reverse' : 'row'}
              >
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'تفعيل Stripe' : 'Enable Stripe'}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'السماح للعملاء بالدفع عبر Stripe' : 'Allow customers to pay via Stripe'}
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

            {/* Test Mode */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <HStack
                alignItems="center"
                justifyContent="space-between"
                flexDirection={isRTL ? 'row-reverse' : 'row'}
              >
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'وضع الاختبار' : 'Test Mode'}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                    {currentLanguage === 'ar' ? 'استخدام مفاتيح الاختبار بدلاً من المفاتيح الفعلية' : 'Use test keys instead of live keys'}
                  </Text>
                </VStack>
                <Switch
                  value={testMode}
                  onValueChange={(value) => {
                    haptics.light();
                    setTestMode(value);
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

            {/* API Keys */}
            <VStack space="md" bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <Text fontSize="$lg" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                {currentLanguage === 'ar' ? 'مفاتيح API' : 'API Keys'}
              </Text>

              {/* Publishable Key */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontWeight="$medium"
                  color="$textLight"
                  $dark-color="$textDark"
                  textAlign={isRTL ? 'right' : 'left'}
                >
                  {currentLanguage === 'ar' ? 'مفتاح النشر' : 'Publishable Key'} {enabled && '*'}
                </Text>
                <Input
                  borderRadius="$xl"
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                >
                  <InputField
                    value={publishableKey}
                    onChangeText={setPublishableKey}
                    placeholder={testMode ? "pk_test_..." : "pk_live_..."}
                    autoCapitalize="none"
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </Input>
              </VStack>

              {/* Secret Key */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontWeight="$medium"
                  color="$textLight"
                  $dark-color="$textDark"
                  textAlign={isRTL ? 'right' : 'left'}
                >
                  {currentLanguage === 'ar' ? 'المفتاح السري' : 'Secret Key'} {enabled && '*'}
                </Text>
                <Input
                  borderRadius="$xl"
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                >
                  <InputField
                    value={secretKey}
                    onChangeText={setSecretKey}
                    placeholder={testMode ? "sk_test_..." : "sk_live_..."}
                    autoCapitalize="none"
                    secureTextEntry={!showSecretKey}
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  <Pressable
                    onPress={() => setShowSecretKey(!showSecretKey)}
                    p="$2"
                  >
                    {showSecretKey ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </Pressable>
                </Input>
              </VStack>

              {/* Webhook Secret */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontWeight="$medium"
                  color="$textLight"
                  $dark-color="$textDark"
                  textAlign={isRTL ? 'right' : 'left'}
                >
                  {currentLanguage === 'ar' ? 'سر Webhook (اختياري)' : 'Webhook Secret (Optional)'}
                </Text>
                <Input
                  borderRadius="$xl"
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                >
                  <InputField
                    value={webhookSecret}
                    onChangeText={setWebhookSecret}
                    placeholder="whsec_..."
                    autoCapitalize="none"
                    secureTextEntry={!showWebhookSecret}
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  <Pressable
                    onPress={() => setShowWebhookSecret(!showWebhookSecret)}
                    p="$2"
                  >
                    {showWebhookSecret ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </Pressable>
                </Input>
                <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                  {currentLanguage === 'ar' ? 'مطلوب للتحقق من Webhooks من Stripe' : 'Required to verify webhooks from Stripe'}
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
