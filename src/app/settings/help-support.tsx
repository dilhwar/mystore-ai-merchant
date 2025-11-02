/**
 * Help & Support Screen
 * Provides help resources, FAQs, and contact options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { router } from 'expo-router';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';

interface HelpItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpSupportScreen() {
  const { t } = useTranslation('settings');
  const { colors } = useTheme();

  const helpOptions: HelpItem[] = [
    {
      id: 'whatsapp',
      icon: '💬',
      title: t('contact_whatsapp'),
      description: t('contact_whatsapp_desc'),
      action: () => {
        haptics.light();
        Linking.openURL('https://wa.me/1234567890');
      },
    },
    {
      id: 'email',
      icon: '📧',
      title: t('email_support'),
      description: t('email_support_desc'),
      action: () => {
        haptics.light();
        Linking.openURL('mailto:support@mystore.com');
      },
    },
    {
      id: 'docs',
      icon: '📚',
      title: t('documentation'),
      description: t('documentation_desc'),
      action: () => {
        haptics.light();
        Linking.openURL('https://docs.mystore.com');
      },
    },
    {
      id: 'video',
      icon: '🎥',
      title: t('video_tutorials'),
      description: t('video_tutorials_desc'),
      action: () => {
        haptics.light();
        Linking.openURL('https://youtube.com/@mystore');
      },
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: t('faq_1_question'),
      answer: t('faq_1_answer'),
    },
    {
      question: t('faq_2_question'),
      answer: t('faq_2_answer'),
    },
    {
      question: t('faq_3_question'),
      answer: t('faq_3_answer'),
    },
    {
      question: t('faq_4_question'),
      answer: t('faq_4_answer'),
    },
  ];

  const handleFAQPress = (faq: FAQItem) => {
    haptics.light();
    Alert.alert(faq.question, faq.answer, [{ text: t('ok') }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={t('help_support')}
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('contact_us')}
          </Text>

          <View style={styles.grid}>
            {helpOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.helpCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={styles.icon}>{option.icon}</Text>
                </View>
                <Text style={[styles.helpTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
                <Text style={[styles.helpDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('frequently_asked_questions')}
          </Text>

          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.faqItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleFAQPress(faq)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                  <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t('app_information')}
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('version')}
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {t('build')}
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>100</Text>
          </View>
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
    padding: spacing.l,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.m,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.s,
  },

  // Help Cards Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
  },
  helpCard: {
    width: '48%',
    padding: spacing.l,
    borderRadius: design.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.s,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 28,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  helpDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  // FAQs
  faqList: {
    gap: spacing.s,
  },
  faqItem: {
    padding: spacing.m,
    borderRadius: design.radius.md,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    fontSize: 24,
    marginLeft: spacing.s,
  },

  // Info Box
  infoBox: {
    padding: spacing.l,
    borderRadius: design.radius.md,
    gap: spacing.m,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});
