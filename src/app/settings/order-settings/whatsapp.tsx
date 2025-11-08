import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
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
  Input,
  InputField,
  Button,
  ButtonText,
  Textarea,
  TextareaInput,
} from '@gluestack-ui/themed';
import {
  ArrowLeft,
  Send,
  Info,
} from 'lucide-react-native';
import { testTwilioWhatsApp } from '@/services/whatsapp-settings.service';

export default function WhatsAppSettingsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({
    accountSid: '',
    authToken: '',
    fromNumber: '',
    toNumber: '',
    message: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTest = async () => {
    // Validation
    if (!formData.accountSid.trim()) {
      Alert.alert(t('error'), t('account_sid_required'));
      return;
    }
    if (!formData.authToken.trim()) {
      Alert.alert(t('error'), t('auth_token_required'));
      return;
    }
    if (!formData.fromNumber.trim()) {
      Alert.alert(t('error'), t('from_number_required'));
      return;
    }
    if (!formData.toNumber.trim()) {
      Alert.alert(t('error'), t('to_number_required'));
      return;
    }

    try {
      haptics.light();
      setTesting(true);

      const result = await testTwilioWhatsApp({
        accountSid: formData.accountSid.trim(),
        authToken: formData.authToken.trim(),
        fromNumber: formData.fromNumber.trim(),
        toNumber: formData.toNumber.trim(),
        message: formData.message.trim() || undefined,
      });

      if (result.success) {
        haptics.success();
        Alert.alert(
          t('success'),
          t('whatsapp_test_success') + '\n\n' + (result.message || '')
        );
      } else {
        haptics.error();
        Alert.alert(t('error'), result.error || t('whatsapp_test_failed'));
      }
    } catch (error: any) {
      haptics.error();
      console.error('WhatsApp test error:', error);
      Alert.alert(t('error'), error.message || t('whatsapp_test_failed'));
    } finally {
      setTesting(false);
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
            {/* Info Card */}
            <Box
              bg="$blue50"
              $dark-bg="rgba(59, 130, 246, 0.1)"
              borderRadius="$2xl"
              p="$4"
            >
              <HStack space="sm" alignItems="flex-start" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                <Box
                  w={40}
                  h={40}
                  borderRadius="$full"
                  bg="$blue100"
                  $dark-bg="rgba(59, 130, 246, 0.2)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Info size={20} color={colors.blue500} strokeWidth={2.5} />
                </Box>
                <VStack flex={1} space="xs">
                  <Text
                    fontSize="$md"
                    fontWeight="$semibold"
                    color="$blue700"
                    $dark-color="$blue400"
                    textAlign={isRTL ? 'right' : 'left'}
                  >
                    {t('whatsapp_info_title')}
                  </Text>
                  <Text
                    fontSize="$sm"
                    color="$blue600"
                    $dark-color="$blue300"
                    textAlign={isRTL ? 'right' : 'left'}
                    lineHeight="$sm"
                  >
                    {t('whatsapp_info_description')}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Form Section */}
            <Box
              bg="$surfaceLight"
              $dark-bg="$surfaceDark"
              borderRadius="$2xl"
              p="$4"
            >
              <VStack space="md">
                {/* Account SID */}
                <VStack space="xs">
                  <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                    >
                      {t('account_sid')}
                    </Text>
                    <Text fontSize="$sm" color="$error500">*</Text>
                  </HStack>
                  <Input
                    borderRadius="$xl"
                    borderColor="$borderLight"
                    $dark-borderColor="$borderDark"
                    bg="$backgroundLight"
                    $dark-bg="$backgroundDark"
                  >
                    <InputField
                      value={formData.accountSid}
                      onChangeText={(text) => updateField('accountSid', text)}
                      placeholder={t('enter_account_sid')}
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </Input>
                </VStack>

                {/* Auth Token */}
                <VStack space="xs">
                  <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                    >
                      {t('auth_token')}
                    </Text>
                    <Text fontSize="$sm" color="$error500">*</Text>
                  </HStack>
                  <Input
                    borderRadius="$xl"
                    borderColor="$borderLight"
                    $dark-borderColor="$borderDark"
                    bg="$backgroundLight"
                    $dark-bg="$backgroundDark"
                  >
                    <InputField
                      value={formData.authToken}
                      onChangeText={(text) => updateField('authToken', text)}
                      placeholder={t('enter_auth_token')}
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                      autoCapitalize="none"
                      autoCorrect={false}
                      type="password"
                    />
                  </Input>
                </VStack>

                {/* From Number */}
                <VStack space="xs">
                  <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                    >
                      {t('from_number')}
                    </Text>
                    <Text fontSize="$sm" color="$error500">*</Text>
                  </HStack>
                  <Input
                    borderRadius="$xl"
                    borderColor="$borderLight"
                    $dark-borderColor="$borderDark"
                    bg="$backgroundLight"
                    $dark-bg="$backgroundDark"
                  >
                    <InputField
                      value={formData.fromNumber}
                      onChangeText={(text) => updateField('fromNumber', text)}
                      placeholder="+14155238886"
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
                    {t('from_number_hint')}
                  </Text>
                </VStack>

                {/* To Number */}
                <VStack space="xs">
                  <HStack space="xs" alignItems="center" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Text
                      fontSize="$sm"
                      fontWeight="$medium"
                      color="$textLight"
                      $dark-color="$textDark"
                    >
                      {t('to_number')}
                    </Text>
                    <Text fontSize="$sm" color="$error500">*</Text>
                  </HStack>
                  <Input
                    borderRadius="$xl"
                    borderColor="$borderLight"
                    $dark-borderColor="$borderDark"
                    bg="$backgroundLight"
                    $dark-bg="$backgroundDark"
                  >
                    <InputField
                      value={formData.toNumber}
                      onChangeText={(text) => updateField('toNumber', text)}
                      placeholder="+9647XXXXXXXXX"
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
                    {t('to_number_hint')}
                  </Text>
                </VStack>

                {/* Test Message */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontWeight="$medium"
                    color="$textLight"
                    $dark-color="$textDark"
                    textAlign={isRTL ? 'right' : 'left'}
                  >
                    {t('test_message')} ({t('optional')})
                  </Text>
                  <Textarea
                    borderRadius="$xl"
                    borderColor="$borderLight"
                    $dark-borderColor="$borderDark"
                    bg="$backgroundLight"
                    $dark-bg="$backgroundDark"
                    minHeight={100}
                  >
                    <TextareaInput
                      value={formData.message}
                      onChangeText={(text) => updateField('message', text)}
                      placeholder={t('enter_test_message')}
                      color="$textLight"
                      $dark-color="$textDark"
                      textAlign={isRTL ? 'right' : 'left'}
                    />
                  </Textarea>
                </VStack>
              </VStack>
            </Box>

            {/* Test Button */}
            <Button
              size="lg"
              bg="$primary500"
              borderRadius="$2xl"
              onPress={handleTest}
              isDisabled={testing}
              mt="$4"
            >
              {testing ? (
                <Spinner color="#FFFFFF" />
              ) : (
                <HStack space="sm" alignItems="center">
                  <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <ButtonText fontSize="$md" fontWeight="$bold" color="$white">
                    {t('send_test_message')}
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
