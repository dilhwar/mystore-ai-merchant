import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { spacing } from '@/theme/spacing';
import {
  getCheckoutSettings,
  updateCheckoutSettings,
  CheckoutSettings,
  FormField,
} from '@/services/checkout-settings.service';

export default function FormFieldsScreen() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const currentLanguage = i18n.language;

  // Load checkout settings
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCheckoutSettings();
      setSettings(data);
      setFormFields(data.orderFormFields || []);
    } catch (error: any) {
      console.error('Load checkout settings error:', error);
      Alert.alert(t('common:error'), error.message || t('settings:load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSettings();
  }, [loadSettings]);

  // Toggle field enabled/disabled
  const handleToggleField = async (fieldId: string) => {
    const updatedFields = formFields.map((field) =>
      field.id === fieldId ? { ...field, enabled: !field.enabled } : field
    );
    setFormFields(updatedFields);

    try {
      await updateCheckoutSettings({ orderFormFields: updatedFields });
      Alert.alert(t('common:success'), t('settings:form_field_updated'));
    } catch (error: any) {
      Alert.alert(t('common:error'), error.message);
      // Revert on error
      loadSettings();
    }
  };

  // Toggle field required
  const handleToggleRequired = async (fieldId: string) => {
    const updatedFields = formFields.map((field) =>
      field.id === fieldId ? { ...field, required: !field.required } : field
    );
    setFormFields(updatedFields);

    try {
      await updateCheckoutSettings({ orderFormFields: updatedFields });
      Alert.alert(t('common:success'), t('settings:form_field_updated'));
    } catch (error: any) {
      Alert.alert(t('common:error'), error.message);
      // Revert on error
      loadSettings();
    }
  };

  // Get field label
  const getFieldLabel = (field: FormField): string => {
    return currentLanguage === 'ar' ? field.labelAr : field.label;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PageHeader title={t('settings:form_fields')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={t('settings:form_fields')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Description */}
        <View style={[styles.descriptionCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {t('settings:form_fields_description')}
          </Text>
        </View>

        {/* Form Fields List */}
        {formFields.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('settings:no_form_fields')}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {formFields.map((field) => {
              const fieldLabel = getFieldLabel(field);

              return (
                <View
                  key={field.id}
                  style={[
                    styles.fieldCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.fieldHeader}>
                    <View style={styles.fieldInfo}>
                      <Text style={[styles.fieldName, { color: colors.text }]}>
                        {fieldLabel}
                      </Text>
                      <Text style={[styles.fieldType, { color: colors.textSecondary }]}>
                        {field.type}
                      </Text>
                    </View>
                    <Switch
                      value={field.enabled}
                      onValueChange={() => handleToggleField(field.id)}
                      trackColor={{ false: colors.border, true: colors.primary + '80' }}
                      thumbColor={field.enabled ? colors.primary : colors.textSecondary}
                    />
                  </View>

                  {field.enabled && (
                    <View style={styles.requiredRow}>
                      <Text style={[styles.requiredLabel, { color: colors.text }]}>
                        {t('settings:required')}
                      </Text>
                      <Switch
                        value={field.required}
                        onValueChange={() => handleToggleRequired(field.id)}
                        trackColor={{ false: colors.border, true: colors.primary + '80' }}
                        thumbColor={field.required ? colors.primary : colors.textSecondary}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    gap: spacing.md,
  },
  fieldCard: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldType: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  requiredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  requiredLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
