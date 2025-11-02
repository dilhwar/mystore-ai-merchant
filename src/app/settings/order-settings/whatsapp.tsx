import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { spacing } from '@/theme/spacing';
import { testTwilioWhatsApp } from '@/services/whatsapp-settings.service';

export default function WhatsAppSettingsScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();

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
      Alert.alert(t('common:error'), t('settings:account_sid_required'));
      return;
    }
    if (!formData.authToken.trim()) {
      Alert.alert(t('common:error'), t('settings:auth_token_required'));
      return;
    }
    if (!formData.fromNumber.trim()) {
      Alert.alert(t('common:error'), t('settings:from_number_required'));
      return;
    }
    if (!formData.toNumber.trim()) {
      Alert.alert(t('common:error'), t('settings:to_number_required'));
      return;
    }

    try {
      setTesting(true);

      const result = await testTwilioWhatsApp({
        accountSid: formData.accountSid.trim(),
        authToken: formData.authToken.trim(),
        fromNumber: formData.fromNumber.trim(),
        toNumber: formData.toNumber.trim(),
        message: formData.message.trim() || undefined,
      });

      if (result.success) {
        Alert.alert(
          t('common:success'),
          t('settings:whatsapp_test_success') + '\n\n' + (result.message || '')
        );
      } else {
        Alert.alert(t('common:error'), result.error || t('settings:whatsapp_test_failed'));
      }
    } catch (error: any) {
      console.error('WhatsApp test error:', error);
      Alert.alert(t('common:error'), error.message || t('settings:whatsapp_test_failed'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={t('settings:whatsapp_settings')} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>
            {t('settings:whatsapp_info_title')}
          </Text>
          <Text style={[styles.infoText, { color: colors.text }]}>
            {t('settings:whatsapp_info_description')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Account SID */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('settings:account_sid')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={formData.accountSid}
              onChangeText={(text) => updateField('accountSid', text)}
              placeholder={t('settings:enter_account_sid')}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Auth Token */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('settings:auth_token')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={formData.authToken}
              onChangeText={(text) => updateField('authToken', text)}
              placeholder={t('settings:enter_auth_token')}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>

          {/* From Number */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('settings:from_number')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={formData.fromNumber}
              onChangeText={(text) => updateField('fromNumber', text)}
              placeholder="+14155238886"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {t('settings:from_number_hint')}
            </Text>
          </View>

          {/* To Number */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('settings:to_number')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={formData.toNumber}
              onChangeText={(text) => updateField('toNumber', text)}
              placeholder="+9647XXXXXXXXX"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {t('settings:to_number_hint')}
            </Text>
          </View>

          {/* Test Message (Optional) */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('settings:test_message')} ({t('common:optional')})
            </Text>
            <TextInput
              style={[styles.textarea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              value={formData.message}
              onChangeText={(text) => updateField('message', text)}
              placeholder={t('settings:enter_test_message')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Test Button */}
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.primary }]}
            onPress={handleTest}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.testButtonText}>{t('settings:send_test_message')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    gap: spacing.md,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  testButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
