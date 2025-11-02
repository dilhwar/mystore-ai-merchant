/**
 * i18n Helper Utilities
 * Professional translation system helper functions
 */

import { I18nManager } from 'react-native';
import i18n from '@/locales/i18n';

/**
 * Get text alignment based on current language direction
 * Returns 'right' for RTL languages (Arabic), 'left' for LTR
 */
export const getTextAlign = (): 'left' | 'right' | 'center' => {
  return I18nManager.isRTL ? 'right' : 'left';
};

/**
 * Get flex direction based on current language direction
 * Returns 'row-reverse' for RTL, 'row' for LTR
 */
export const getFlexDirection = (): 'row' | 'row-reverse' => {
  return I18nManager.isRTL ? 'row-reverse' : 'row';
};

/**
 * Check if current language is RTL
 */
export const isRTL = (): boolean => {
  return I18nManager.isRTL;
};

/**
 * Get current language code
 */
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

/**
 * Check if current language is Arabic
 */
export const isArabic = (): boolean => {
  return i18n.language === 'ar';
};

/**
 * Check if current language is English
 */
export const isEnglish = (): boolean => {
  return i18n.language === 'en';
};

/**
 * Change app language and update RTL settings
 * @param language - Language code ('ar', 'en', etc.)
 */
export const changeLanguage = async (language: string): Promise<void> => {
  await i18n.changeLanguage(language);

  const shouldBeRTL = language === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    // Note: In production, changing RTL requires app reload
    // You can use Updates.reloadAsync() from expo-updates
  }
};

/**
 * Get all available languages
 */
export const getAvailableLanguages = () => {
  return [
    { code: 'ar', name: 'العربية', nativeName: 'العربية' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ];
};

/**
 * Format number based on current locale
 * Arabic numbers: ١٢٣
 * English numbers: 123
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US').format(num);
};

/**
 * Format currency based on current locale
 */
export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format date based on current locale
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
