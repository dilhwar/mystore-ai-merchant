import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// Import translations
import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enDashboard from './en/dashboard.json';
import enProducts from './en/products.json';
import enOrders from './en/orders.json';
import enSettings from './en/settings.json';
import enCategories from './en/categories.json';
import enHeader from './en/header.json';
import enNotifications from './en/notifications.json';

import arCommon from './ar/common.json';
import arAuth from './ar/auth.json';
import arDashboard from './ar/dashboard.json';
import arProducts from './ar/products.json';
import arOrders from './ar/orders.json';
import arSettings from './ar/settings.json';
import arCategories from './ar/categories.json';
import arHeader from './ar/header.json';
import arNotifications from './ar/notifications.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    products: enProducts,
    orders: enOrders,
    settings: enSettings,
    categories: enCategories,
    header: enHeader,
    notifications: enNotifications,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    dashboard: arDashboard,
    products: arProducts,
    orders: arOrders,
    settings: arSettings,
    categories: arCategories,
    header: arHeader,
    notifications: arNotifications,
  },
};

// Detect device language safely
const deviceLocale = Localization.locale || Localization.getLocales()[0]?.languageCode || 'en';
const deviceLanguage = deviceLocale.split('-')[0];
const initialLanguage = deviceLanguage === 'ar' ? 'ar' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Auto-detect device language: 'ar' or 'en'
    fallbackLng: 'en',
    defaultNS: 'common',
    compatibilityJSON: 'v3', // Fix for Intl.PluralRules warning
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Set RTL for Arabic
if (i18n.language === 'ar') {
  I18nManager.forceRTL(true);
} else {
  I18nManager.forceRTL(false);
}

export default i18n;
