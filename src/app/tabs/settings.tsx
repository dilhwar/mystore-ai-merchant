import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { router } from 'expo-router';
import { AppHeader } from '@/components/ui/AppHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Divider } from '@/components/ui/Divider';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { changeLanguage } from '@/locales/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

interface SettingItem {
  id: string;
  icon: string;
  label: string;
  route?: string;
  onPress?: () => void;
  badge?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logout_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleLanguageChange = async () => {
    Alert.alert(
      tCommon('select_language'),
      tCommon('choose_app_language'),
      [
        {
          text: tCommon('ar'),
          onPress: async () => {
            try {
              await AsyncStorage.setItem('appLanguage', 'ar');
              await changeLanguage('ar');

              Alert.alert(
                tCommon('language_changed'),
                tCommon('reload_app_message'),
                [
                  { text: tCommon('later'), style: 'cancel' },
                  {
                    text: tCommon('reload'),
                    onPress: async () => {
                      if (__DEV__) {
                        Alert.alert(tCommon('reload'), tCommon('reload_manually'));
                      } else {
                        await Updates.reloadAsync();
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error changing language:', error);
            }
          },
        },
        {
          text: tCommon('en'),
          onPress: async () => {
            try {
              await AsyncStorage.setItem('appLanguage', 'en');
              await changeLanguage('en');

              Alert.alert(
                tCommon('language_changed'),
                tCommon('reload_app_message'),
                [
                  { text: tCommon('later'), style: 'cancel' },
                  {
                    text: tCommon('reload'),
                    onPress: async () => {
                      if (__DEV__) {
                        Alert.alert(tCommon('reload'), tCommon('reload_manually'));
                      } else {
                        await Updates.reloadAsync();
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error changing language:', error);
            }
          },
        },
        { text: tCommon('cancel'), style: 'cancel' },
      ]
    );
  };

  const sections: SettingSection[] = [
    {
      title: t('store'),
      items: [
        {
          id: 'store-settings',
          icon: '🏪',
          label: t('store_settings'),
          route: '/settings/store-profile',
        },
        {
          id: 'regional-settings',
          icon: '🌍',
          label: t('regional_settings'),
          route: '/settings/regional',
        },
        {
          id: 'order-settings',
          icon: '📋',
          label: t('order_settings'),
          route: '/settings/order-settings',
        },
        {
          id: 'apps',
          icon: '🧩',
          label: t('apps'),
          route: '/settings/apps',
        },
      ],
    },
    {
      title: t('preferences'),
      items: [
        {
          id: 'account',
          icon: '👤',
          label: t('account_settings'),
          route: '/settings/account',
        },
        {
          id: 'language',
          icon: '🌐',
          label: t('language'),
          onPress: handleLanguageChange,
        },
        {
          id: 'theme',
          icon: '🎨',
          label: t('theme'),
        },
      ],
    },
    {
      title: t('support'),
      items: [
        {
          id: 'help',
          icon: '❓',
          label: t('help_support'),
          route: '/settings/help-support',
        },
        {
          id: 'about',
          icon: 'ℹ️',
          label: t('about'),
        },
      ],
    },
  ];

  const handleItemPress = (item: SettingItem) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <AppHeader
        title={t('settings')}
        showNotifications={true}
        showStoreLink={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View style={[
          styles.profileCard,
          {
            backgroundColor: colors.surface,
            ...design.shadow.md,
          }
        ]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {(user as any)?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'M'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {(user as any)?.firstName || user?.email?.split('@')[0] || 'Merchant'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {user?.email || 'merchant@example.com'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {sections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <SectionHeader title={section.title} />

            <View style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                ...design.shadow.sm,
              }
            ]}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.settingIcon,
                      { backgroundColor: colors.primary + '10' }
                    ]}>
                      <Text style={styles.iconText}>{item.icon}</Text>
                    </View>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      {item.label}
                    </Text>
                    {item.badge && (
                      <View style={[
                        styles.badge,
                        { backgroundColor: colors.primary }
                      ]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Text style={[styles.chevron, { color: colors.textSecondary }]}>
                      ›
                    </Text>
                  </TouchableOpacity>

                  {itemIndex < section.items.length - 1 && (
                    <Divider spacing="none" style={styles.itemDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.error + '15',
              borderColor: colors.error + '30',
            }
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={[styles.logoutText, { color: colors.error }]}>
            {t('logout')}
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          {tCommon('version')} 1.0.0
        </Text>
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

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.l,
    borderRadius: design.radius.lg,
    marginBottom: spacing.l,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...design.typography.h3,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.m,
  },
  profileName: {
    ...design.typography.h4,
    marginBottom: 2,
  },
  profileEmail: {
    ...design.typography.caption,
  },
  editButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    marginBottom: spacing.l,
  },
  sectionCard: {
    borderRadius: design.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    minHeight: 60,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: design.iconSize.md,
  },
  settingLabel: {
    ...design.typography.body,
    flex: 1,
    marginLeft: spacing.m,
  },
  badge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: design.radius.sm,
    marginRight: spacing.s,
  },
  badgeText: {
    ...design.typography.small,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  itemDivider: {
    marginLeft: spacing.m + 40 + spacing.m,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
    borderRadius: design.radius.md,
    borderWidth: 1,
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  logoutIcon: {
    fontSize: design.iconSize.md,
    marginRight: spacing.s,
  },
  logoutText: {
    ...design.typography.bodyBold,
  },

  // Version
  versionText: {
    ...design.typography.caption,
    textAlign: 'center',
  },
});
