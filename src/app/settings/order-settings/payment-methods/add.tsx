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
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { createPaymentMethod } from '@/services/payment-methods.service';

export default function AddPaymentMethodScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [instructions, setInstructions] = useState('');
  const [instructionsAr, setInstructionsAr] = useState('');
  const [processingFee, setProcessingFee] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Validate form
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert(t('common:error'), t('settings:name_required'));
      return false;
    }

    if (processingFee && (isNaN(Number(processingFee)) || Number(processingFee) < 0)) {
      Alert.alert(t('common:error'), t('settings:fee_invalid'));
      return false;
    }

    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = {
        type: 'custom',
        name: name.trim(),
        nameAr: nameAr.trim() || undefined,
        description: description.trim() || undefined,
        descriptionAr: descriptionAr.trim() || undefined,
        isActive,
        feeAmount: processingFee ? Number(processingFee) : undefined,
        accountInfo: instructions.trim()
          ? {
              instructions: instructions.trim(),
              instructionsAr: instructionsAr.trim() || undefined,
            }
          : undefined,
      };

      await createPaymentMethod(data);

      Alert.alert(
        t('common:success'),
        t('settings:payment_method_created'),
        [
          {
            text: t('common:ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(t('common:error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={t('settings:add_payment_method')} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <View style={styles.section}>
          <SectionHeader title={t('settings:basic_info')} icon="📝" />

          <View style={[styles.card, { backgroundColor: colors.surface, ...design.shadow.sm }]}>
            {/* English Name */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:name')} ({t('common:en')}) *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder={t('settings:payment_method_name_placeholder')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Arabic Name */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:name')} ({t('common:ar')})
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                    textAlign: 'right',
                  },
                ]}
                value={nameAr}
                onChangeText={setNameAr}
                placeholder={t('settings:payment_method_name_ar_placeholder')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* English Description */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:description')} ({t('common:en')})
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('settings:payment_method_description_placeholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Arabic Description */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:description')} ({t('common:ar')})
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                    textAlign: 'right',
                  },
                ]}
                value={descriptionAr}
                onChangeText={setDescriptionAr}
                placeholder={t('settings:payment_method_description_ar_placeholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.section}>
          <SectionHeader title={t('settings:payment_instructions')} icon="📋" />

          <View style={[styles.card, { backgroundColor: colors.surface, ...design.shadow.sm }]}>
            {/* English Instructions */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:instructions')} ({t('common:en')})
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={instructions}
                onChangeText={setInstructions}
                placeholder={t('settings:payment_instructions_placeholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Arabic Instructions */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:instructions')} ({t('common:ar')})
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                    textAlign: 'right',
                  },
                ]}
                value={instructionsAr}
                onChangeText={setInstructionsAr}
                placeholder={t('settings:payment_instructions_ar_placeholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>

        {/* Fees & Settings */}
        <View style={styles.section}>
          <SectionHeader title={t('settings:fees_and_settings')} icon="⚙️" />

          <View style={[styles.card, { backgroundColor: colors.surface, ...design.shadow.sm }]}>
            {/* Processing Fee */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:processing_fee')} (%)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={processingFee}
                onChangeText={setProcessingFee}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Active Switch */}
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  {t('settings:active')}
                </Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                  {t('settings:active_payment_description')}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={isActive ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary, ...design.shadow.md },
            loading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common:save')}</Text>
          )}
        </TouchableOpacity>
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
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },

  // Section
  section: {
    marginBottom: spacing.l,
  },
  card: {
    borderRadius: design.radius.md,
    padding: spacing.m,
  },

  // Form Fields
  fieldContainer: {
    marginBottom: spacing.m,
  },
  label: {
    ...design.typography.bodyBold,
    marginBottom: spacing.s,
  },
  input: {
    ...design.typography.body,
    borderWidth: 1,
    borderRadius: design.radius.sm,
    padding: spacing.m,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.s,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  switchLabel: {
    ...design.typography.bodyBold,
    marginBottom: 4,
  },
  switchDescription: {
    ...design.typography.caption,
  },

  // Save Button
  saveButton: {
    padding: spacing.l,
    borderRadius: design.radius.md,
    alignItems: 'center',
    marginTop: spacing.l,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...design.typography.bodyBold,
    color: '#FFFFFF',
  },
});
