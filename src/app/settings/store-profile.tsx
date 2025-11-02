/**
 * Store Profile Settings Screen
 * Manage store information, branding, and configuration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { router } from 'expo-router';
import { AppHeader } from '@/components/ui/AppHeader';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';
import { getStoreSettings, updateStoreSettings, UpdateStoreData } from '@/services/store-settings.service';
import { Store } from '@/types/api.types';

export default function StoreProfileScreen() {
  const { t } = useTranslation('settings');
  const { colors } = useTheme();
  const { user, setStoreSettings } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<Store | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    try {
      setLoading(true);
      const data = await getStoreSettings();
      setStore(data);

      // Populate form
      setName(data.name || '');
      setSlug(data.slug || '');
      setDescription(data.description || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
    } catch (error: any) {
      console.error('Load store settings error:', error.message);
      haptics.error();
      Alert.alert(t('error'), t('failed_to_load_settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert(t('error'), t('store_name_required'));
      return;
    }

    if (!slug.trim()) {
      Alert.alert(t('error'), t('store_slug_required'));
      return;
    }

    try {
      haptics.medium();
      setSaving(true);

      const updateData: UpdateStoreData = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      const updatedStore = await updateStoreSettings(updateData);

      // Update auth store with new settings
      setStoreSettings({
        storeLanguages: updatedStore.storeLanguages || [],
        defaultLanguage: updatedStore.defaultLanguage || 'ar',
        storeCurrency: updatedStore.storeCurrency || 'SAR',
      });

      haptics.success();
      Alert.alert(t('success'), t('settings_updated'), [
        {
          text: t('ok'),
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Save store settings error:', error.message);
      haptics.error();
      Alert.alert(t('error'), error.message || t('failed_to_save_settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('loading_settings')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={t('store_settings')}
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('store_information')}
          </Text>

          <Input
            label={t('store_name')}
            value={name}
            onChangeText={setName}
            placeholder={t('enter_store_name')}
            autoCapitalize="words"
          />

          <Input
            label={t('store_slug')}
            value={slug}
            onChangeText={(text) => setSlug(text.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder={t('enter_store_slug')}
            autoCapitalize="none"
            helperText={t('slug_helper_text')}
          />

          <Input
            label={t('store_description')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('enter_store_description')}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100 }}
          />
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('contact_information')}
          </Text>

          <Input
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('enter_email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label={t('phone')}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('enter_phone')}
            keyboardType="phone-pad"
          />

          <Input
            label={t('address')}
            value={address}
            onChangeText={setAddress}
            placeholder={t('enter_address')}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Store URL Info */}
        {store && (
          <View style={[styles.infoBox, { backgroundColor: colors.cardBackgroundSecondary }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('store_url')}
            </Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {store.storeUrl || `https://${slug}.mystore.com`}
            </Text>
          </View>
        )}

        {/* Save Button */}
        <Button
          title={t('save_changes')}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          variant="primary"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.l,
    gap: spacing.l,
  },
  section: {
    padding: spacing.l,
    borderRadius: design.radius.md,
    gap: spacing.m,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  infoBox: {
    padding: spacing.l,
    borderRadius: design.radius.md,
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
