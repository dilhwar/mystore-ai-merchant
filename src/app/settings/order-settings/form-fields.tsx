import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Alert, RefreshControl, Switch } from 'react-native';
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
} from '@gluestack-ui/themed';
import {
  ArrowLeft,
  FileText,
  CheckSquare,
  Square,
} from 'lucide-react-native';
import {
  getCheckoutSettings,
  updateCheckoutSettings,
  CheckoutSettings,
  FormField,
} from '@/services/checkout-settings.service';

export default function FormFieldsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const currentLanguage = i18n.language;

  // Load checkout settings
  const loadSettings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getCheckoutSettings();
      setSettings(data);
      setFormFields(data.orderFormFields || []);

      if (isRefresh) {
        haptics.success();
      }
    } catch (error: any) {
      if (isRefresh) {
        haptics.error();
      }
      console.error('Load checkout settings error:', error);
      Alert.alert(t('error'), error.message || t('load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Toggle field enabled/disabled
  const handleToggleField = async (fieldId: string) => {
    haptics.light();
    const updatedFields = formFields.map((field) =>
      field.id === fieldId ? { ...field, enabled: !field.enabled } : field
    );
    setFormFields(updatedFields);

    try {
      await updateCheckoutSettings({ orderFormFields: updatedFields });
      haptics.success();
      Alert.alert(t('success'), t('form_field_updated'));
    } catch (error: any) {
      haptics.error();
      Alert.alert(t('error'), error.message);
      // Revert on error
      loadSettings();
    }
  };

  // Toggle field required
  const handleToggleRequired = async (fieldId: string) => {
    haptics.light();
    const updatedFields = formFields.map((field) =>
      field.id === fieldId ? { ...field, required: !field.required } : field
    );
    setFormFields(updatedFields);

    try {
      await updateCheckoutSettings({ orderFormFields: updatedFields });
      haptics.success();
      Alert.alert(t('success'), t('form_field_updated'));
    } catch (error: any) {
      haptics.error();
      Alert.alert(t('error'), error.message);
      // Revert on error
      loadSettings();
    }
  };

  // Get field label
  const getFieldLabel = (field: FormField): string => {
    return currentLanguage === 'ar' ? field.labelAr : field.label;
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
          {formFields.length === 0 ? (
            <Box alignItems="center" py="$20">
              <Box
                w={80}
                h={80}
                borderRadius="$full"
                bg="$purple50"
                $dark-bg="rgba(139, 92, 246, 0.15)"
                alignItems="center"
                justifyContent="center"
                mb="$6"
              >
                <FileText size={40} color={colors.purple500} strokeWidth={2} />
              </Box>
              <Heading
                size="lg"
                color="$textLight"
                $dark-color="$textDark"
                mb="$2"
                textAlign="center"
              >
                {t('no_form_fields')}
              </Heading>
            </Box>
          ) : (
            <VStack space="sm">
              {formFields.map((field) => {
                const fieldLabel = getFieldLabel(field);
                return (
                  <Box
                    key={field.id}
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
                        bg={field.enabled ? '$purple50' : '$gray100'}
                        $dark-bg={field.enabled ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FileText
                          size={24}
                          color={field.enabled ? colors.purple500 : colors.textSecondary}
                          strokeWidth={2}
                        />
                      </Box>

                      {/* Info */}
                      <VStack flex={1} space="xs">
                        <Text
                          fontSize="$md"
                          fontWeight="$semibold"
                          color="$textLight"
                          $dark-color="$textDark"
                          textAlign={isRTL ? 'right' : 'left'}
                        >
                          {fieldLabel}
                        </Text>

                        {/* Required Toggle */}
                        {field.enabled && (
                          <Pressable
                            onPress={() => handleToggleRequired(field.id)}
                            opacity={field.enabled ? 1 : 0.5}
                            disabled={!field.enabled}
                          >
                            <HStack
                              alignItems="center"
                              space="xs"
                              flexDirection={isRTL ? 'row-reverse' : 'row'}
                            >
                              {field.required ? (
                                <CheckSquare size={16} color={colors.purple500} strokeWidth={2.5} />
                              ) : (
                                <Square size={16} color={colors.textSecondary} strokeWidth={2.5} />
                              )}
                              <Text
                                fontSize="$sm"
                                color={field.required ? '$purple500' : '$textSecondaryLight'}
                                $dark-color={field.required ? '$purple400' : '$textSecondaryDark'}
                              >
                                {t('required')}
                              </Text>
                            </HStack>
                          </Pressable>
                        )}
                      </VStack>

                      {/* Enable/Disable Switch */}
                      <Switch
                        value={field.enabled}
                        onValueChange={() => handleToggleField(field.id)}
                        trackColor={{
                          false: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
                          true: colors.primary,
                        }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor={isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA'}
                      />
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      </ScrollView>
    </Box>
  );
}
