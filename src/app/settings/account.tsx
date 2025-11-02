/**
 * Account Settings Screen
 * Manage user profile and account settings
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
import {
  getProfile,
  updateProfile,
  changePassword,
  UpdateProfileData,
  ChangePasswordData,
} from '@/services/account.service';
import { User } from '@/types/api.types';

export default function AccountSettingsScreen() {
  const { t } = useTranslation('settings');
  const { colors } = useTheme();
  const { user: authUser, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUser(data);

      // Populate form
      setFirstName((data as any).firstName || '');
      setLastName((data as any).lastName || '');
      setEmail(data.email || '');
      setPhone((data as any).phone || '');
    } catch (error: any) {
      console.error('Load profile error:', error.message);
      haptics.error();
      Alert.alert(t('error'), t('failed_to_load_profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert(t('error'), t('first_name_required'));
      return;
    }

    if (!email.trim()) {
      Alert.alert(t('error'), t('email_required'));
      return;
    }

    try {
      haptics.medium();
      setSaving(true);

      const updateData: UpdateProfileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      const updatedUser = await updateProfile(updateData);

      // Update auth store
      updateUser(updatedUser);

      haptics.success();
      Alert.alert(t('success'), t('profile_updated'));
    } catch (error: any) {
      console.error('Save profile error:', error.message);
      haptics.error();
      Alert.alert(t('error'), error.message || t('failed_to_update_profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword) {
      Alert.alert(t('error'), t('current_password_required'));
      return;
    }

    if (!newPassword) {
      Alert.alert(t('error'), t('new_password_required'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('error'), t('password_min_length'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwords_dont_match'));
      return;
    }

    try {
      haptics.medium();
      setChangingPassword(true);

      const passwordData: ChangePasswordData = {
        currentPassword,
        newPassword,
        confirmPassword,
      };

      await changePassword(passwordData);

      haptics.success();
      Alert.alert(t('success'), t('password_changed'), [
        {
          text: t('ok'),
          onPress: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Change password error:', error.message);
      haptics.error();
      Alert.alert(t('error'), error.message || t('failed_to_change_password'));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('loading_profile')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={t('account_settings')}
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('profile_information')}
          </Text>

          <Input
            label={t('first_name')}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t('enter_first_name')}
            autoCapitalize="words"
          />

          <Input
            label={t('last_name')}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t('enter_last_name')}
            autoCapitalize="words"
          />

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

          <Button
            title={t('save_changes')}
            onPress={handleSaveProfile}
            loading={saving}
            disabled={saving}
            variant="primary"
          />
        </View>

        {/* Change Password */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('change_password')}
          </Text>

          <Input
            label={t('current_password')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t('enter_current_password')}
            secureTextEntry
            autoCapitalize="none"
          />

          <Input
            label={t('new_password')}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('enter_new_password')}
            secureTextEntry
            autoCapitalize="none"
            helperText={t('password_min_length_helper')}
          />

          <Input
            label={t('confirm_password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('confirm_new_password')}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title={t('change_password')}
            onPress={handleChangePassword}
            loading={changingPassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            variant="secondary"
          />
        </View>
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
});
