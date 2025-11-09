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
  Text,
  Pressable,
  Spinner,
  Input,
  InputField,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import {
  getWhatsAppSettings,
  updateWhatsAppSettings,
} from '@/services/whatsapp-settings.service';

export default function WhatsAppSettingsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappLanguage, setWhatsappLanguage] = useState<'ar' | 'en'>('ar');

  // Track original values to detect changes
  const [originalWhatsappNumber, setOriginalWhatsappNumber] = useState('');
  const [originalWhatsappLanguage, setOriginalWhatsappLanguage] = useState<'ar' | 'en'>('ar');

  // Check if there are any changes
  const hasChanges =
    whatsappNumber.trim() !== originalWhatsappNumber ||
    whatsappLanguage !== originalWhatsappLanguage;

  // Load settings
  const loadSettings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getWhatsAppSettings();
      const number = data.whatsappNumber || '';
      const language = data.whatsappLanguage || 'ar';

      setWhatsappNumber(number);
      setWhatsappLanguage(language);

      // Update original values
      setOriginalWhatsappNumber(number);
      setOriginalWhatsappLanguage(language);

      if (isRefresh) {
        haptics.success();
      }
    } catch (error: any) {
      if (isRefresh) {
        haptics.error();
      }
      console.error('Load WhatsApp settings error:', error);
      Alert.alert(t('error'), error.message || t('load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings
  const handleSave = async () => {
    try {
      haptics.light();
      setSaving(true);

      await updateWhatsAppSettings({
        whatsappNumber: whatsappNumber.trim(),
        whatsappLanguage,
      });

      // Update original values after successful save
      setOriginalWhatsappNumber(whatsappNumber.trim());
      setOriginalWhatsappLanguage(whatsappLanguage);

      haptics.success();
      Alert.alert(t('success'), t('settings_saved_successfully'));
    } catch (error: any) {
      haptics.error();
      Alert.alert(t('error'), error.message || t('failed_to_save_settings'));
    } finally {
      setSaving(false);
    }
  };

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
            onRefresh={() => loadSettings(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Box px="$4">
          <VStack space="md">
            {/* WhatsApp Settings Card */}
            <Box
              bg="$surfaceLight"
              $dark-bg="$surfaceDark"
              borderRadius="$2xl"
              overflow="hidden"
            >
              <VStack>
                {/* WhatsApp Number */}
                <Box px="$4" py="$4" borderBottomWidth={1} borderBottomColor="$borderLight" $dark-borderBottomColor="$borderDark">
                  <VStack space="sm">
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('whatsapp_number') || 'WhatsApp Number'}
                    </Text>
                    <Input
                      size="lg"
                      variant="outline"
                      borderRadius="$xl"
                      borderColor="$borderLight"
                      $dark-borderColor="$borderDark"
                      bg="$backgroundLight"
                      $dark-bg="$backgroundDark"
                      $focus-borderColor="$primary500"
                    >
                      <InputField
                        value={whatsappNumber}
                        onChangeText={setWhatsappNumber}
                        placeholder="+9647XXXXXXXXX"
                        placeholderTextColor={colors.textSecondary}
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                        keyboardType="phone-pad"
                      />
                    </Input>
                    <Text
                      fontSize="$xs"
                      color="$textSecondaryLight"
                      $dark-color="$textSecondaryDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('whatsapp_number_hint') || 'Include country code (e.g., +964...)'}
                    </Text>
                  </VStack>
                </Box>

                {/* WhatsApp Notification Language */}
                <Box px="$4" py="$4" borderBottomWidth={1} borderBottomColor="$borderLight" $dark-borderBottomColor="$borderDark">
                  <VStack space="sm">
                    <Text
                      fontSize="$sm"
                      fontWeight="$semibold"
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('whatsapp_notification_language') || 'WhatsApp Notification Language'}
                    </Text>
                    <HStack space="sm">
                      {/* Arabic Button */}
                      <Pressable
                        flex={1}
                        onPress={() => {
                          setWhatsappLanguage('ar');
                          haptics.light();
                        }}
                        bg={whatsappLanguage === 'ar' ? '$primary500' : '$backgroundLight'}
                        $dark-bg={whatsappLanguage === 'ar' ? '$primary500' : '$backgroundDark'}
                        borderRadius="$xl"
                        borderWidth={1}
                        borderColor={whatsappLanguage === 'ar' ? '$primary500' : '$borderLight'}
                        $dark-borderColor={whatsappLanguage === 'ar' ? '$primary500' : '$borderDark'}
                        py="$3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize="$md"
                          fontWeight="$semibold"
                          color={whatsappLanguage === 'ar' ? '$white' : '$textLight'}
                          $dark-color={whatsappLanguage === 'ar' ? '$white' : '$textDark'}
                        >
                          العربية
                        </Text>
                      </Pressable>

                      {/* English Button */}
                      <Pressable
                        flex={1}
                        onPress={() => {
                          setWhatsappLanguage('en');
                          haptics.light();
                        }}
                        bg={whatsappLanguage === 'en' ? '$primary500' : '$backgroundLight'}
                        $dark-bg={whatsappLanguage === 'en' ? '$primary500' : '$backgroundDark'}
                        borderRadius="$xl"
                        borderWidth={1}
                        borderColor={whatsappLanguage === 'en' ? '$primary500' : '$borderLight'}
                        $dark-borderColor={whatsappLanguage === 'en' ? '$primary500' : '$borderDark'}
                        py="$3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize="$md"
                          fontWeight="$semibold"
                          color={whatsappLanguage === 'en' ? '$white' : '$textLight'}
                          $dark-color={whatsappLanguage === 'en' ? '$white' : '$textDark'}
                        >
                          English
                        </Text>
                      </Pressable>
                    </HStack>
                    <Text
                      fontSize="$xs"
                      color="$textSecondaryLight"
                      $dark-color="$textSecondaryDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    >
                      {t('whatsapp_language_hint') || 'Language for WhatsApp order notifications and OTP messages'}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* Save Button - Only show when there are changes */}
            {hasChanges && (
              <Button
                size="lg"
                bg="$primary500"
                borderRadius="$2xl"
                onPress={handleSave}
                isDisabled={saving}
                $hover-bg="$primary600"
                $active-bg="$primary700"
              >
                {saving ? (
                  <Spinner color="$white" />
                ) : (
                  <ButtonText fontSize="$md" fontWeight="$bold">
                    {t('save_settings') || 'Save Settings'}
                  </ButtonText>
                )}
              </Button>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
}
