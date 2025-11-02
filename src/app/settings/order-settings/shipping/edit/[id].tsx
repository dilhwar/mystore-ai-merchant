import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import {
  getShippingRate,
  updateShippingRate,
  getShippingZones,
  ShippingRate,
  ShippingZone,
} from '@/services/shipping.service';

export default function EditShippingMethodScreen() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [cost, setCost] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  const currentLanguage = i18n.language;

  // Load shipping rate and zones
  useEffect(() => {
    if (id) {
      loadData();
      loadZones();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const rate = await getShippingRate(id as string);

      setName(rate.name);
      setNameAr(rate.nameAr || '');
      setCost(rate.cost.toString());
      setEstimatedDays(rate.estimatedDays?.toString() || '');
      setIsActive(rate.isActive);
      setSelectedZoneId(rate.zoneId || '');
    } catch (error: any) {
      Alert.alert(
        t('common:error'),
        error.message || t('settings:load_error'),
        [
          {
            text: t('common:ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setLoadingData(false);
    }
  };

  const loadZones = async () => {
    try {
      setLoadingZones(true);
      const zonesData = await getShippingZones();
      setZones(zonesData);
    } catch (error: any) {
      // Silently fail - zones are optional
    } finally {
      setLoadingZones(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert(t('common:error'), t('settings:name_required'));
      return false;
    }

    if (!cost.trim() || isNaN(Number(cost)) || Number(cost) < 0) {
      Alert.alert(t('common:error'), t('settings:cost_invalid'));
      return false;
    }

    if (estimatedDays && (isNaN(Number(estimatedDays)) || Number(estimatedDays) < 0)) {
      Alert.alert(t('common:error'), t('settings:days_invalid'));
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
        name: name.trim(),
        nameAr: nameAr.trim() || undefined,
        cost: Number(cost),
        estimatedDays: estimatedDays ? Number(estimatedDays) : undefined,
        isActive,
        zoneId: selectedZoneId || undefined,
      };

      await updateShippingRate(id as string, data);

      Alert.alert(
        t('common:success'),
        t('settings:shipping_method_updated'),
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

  if (loadingData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PageHeader title={t('settings:edit_shipping_method')} showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={t('settings:edit_shipping_method')} showBack />

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
                placeholder={t('settings:shipping_method_name_placeholder')}
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
                placeholder={t('settings:shipping_method_name_ar_placeholder')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Cost */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:cost')} *
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
                value={cost}
                onChangeText={setCost}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Estimated Days */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('settings:estimated_days')}
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
                value={estimatedDays}
                onChangeText={setEstimatedDays}
                placeholder={t('settings:days_placeholder')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Shipping Zone */}
        <View style={styles.section}>
          <SectionHeader title={t('settings:shipping_zone')} icon="📍" />

          <View style={[styles.card, { backgroundColor: colors.surface, ...design.shadow.sm }]}>
            {loadingZones ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : zones.length === 0 ? (
              <Text style={[styles.noZonesText, { color: colors.textSecondary }]}>
                {t('settings:no_zones_available')}
              </Text>
            ) : (
              <>
                {/* No Zone Option */}
                <TouchableOpacity
                  style={styles.zoneOption}
                  onPress={() => setSelectedZoneId('')}
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: colors.border,
                        backgroundColor: selectedZoneId === '' ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {selectedZoneId === '' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.zoneName, { color: colors.text }]}>
                    {t('settings:no_zone')}
                  </Text>
                </TouchableOpacity>

                {/* Zone Options */}
                {zones.map((zone) => {
                  const zoneName =
                    currentLanguage === 'ar' && zone.nameAr ? zone.nameAr : zone.name;

                  return (
                    <TouchableOpacity
                      key={zone.id}
                      style={styles.zoneOption}
                      onPress={() => setSelectedZoneId(zone.id)}
                    >
                      <View
                        style={[
                          styles.radio,
                          {
                            borderColor: colors.border,
                            backgroundColor:
                              selectedZoneId === zone.id ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {selectedZoneId === zone.id && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.zoneName, { color: colors.text }]}>
                        {zoneName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <SectionHeader title={t('settings:settings')} icon="⚙️" />

          <View style={[styles.card, { backgroundColor: colors.surface, ...design.shadow.sm }]}>
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  {t('settings:active')}
                </Text>
                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                  {t('settings:active_shipping_description')}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Zones
  loadingContainer: {
    padding: spacing.l,
    alignItems: 'center',
  },
  noZonesText: {
    ...design.typography.body,
    textAlign: 'center',
    padding: spacing.l,
  },
  zoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: design.radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: design.radius.full,
    backgroundColor: '#FFFFFF',
  },
  zoneName: {
    ...design.typography.body,
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
