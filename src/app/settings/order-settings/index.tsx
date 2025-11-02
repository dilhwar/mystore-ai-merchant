import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { spacing } from '@/theme/spacing';

export default function OrderSettingsScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();
  const router = useRouter();

  const orderSettingsSections = [
    {
      id: 'shipping',
      title: t('settings:shipping_methods'),
      icon: '🚚',
      route: '/settings/order-settings/shipping',
    },
    {
      id: 'payment',
      title: t('settings:payment_methods'),
      icon: '💳',
      route: '/settings/order-settings/payment-methods',
    },
    {
      id: 'form-fields',
      title: t('settings:form_fields'),
      icon: '📝',
      route: '/settings/order-settings/form-fields',
    },
    {
      id: 'whatsapp',
      title: t('settings:whatsapp_settings'),
      icon: '💬',
      route: '/settings/order-settings/whatsapp',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={t('settings:order_settings')} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Settings Sections */}
        <View style={styles.sectionsContainer}>
          {orderSettingsSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(section.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '10' }]}>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
              <Text style={[styles.sectionArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
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
    padding: spacing.m,
  },
  sectionsContainer: {
    gap: spacing.s,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  sectionIcon: {
    fontSize: 22,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionArrow: {
    fontSize: 24,
    marginLeft: spacing.s,
  },
});
