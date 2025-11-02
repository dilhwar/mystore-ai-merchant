/**
 * Language Store (Zustand)
 * Manages application language state with support for Arabic/English/System modes
 * Persists language preference using AsyncStorage
 * Automatically follows device system language when set to 'system' mode
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import i18n from '@/locales/i18n';

export type LanguageMode = 'ar' | 'en' | 'system';

interface LanguageState {
  // Language mode preference
  languageMode: LanguageMode;

  // Actions
  setLanguageMode: (mode: LanguageMode) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      languageMode: 'system', // Default to system

      setLanguageMode: (mode: LanguageMode) => {
        set({ languageMode: mode });

        // Determine the actual language to use
        let actualLanguage = mode;
        if (mode === 'system') {
          const deviceLocale = Localization.locale || Localization.getLocales()[0]?.languageCode || 'en';
          const systemLang = deviceLocale.split('-')[0];
          actualLanguage = systemLang === 'ar' ? 'ar' : 'en';
        }

        // Change i18n language
        i18n.changeLanguage(actualLanguage);

        // Update RTL setting
        const isRTL = actualLanguage === 'ar';
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.forceRTL(isRTL);
          // Note: Changing RTL requires app reload in production
        }
      },

      toggleLanguage: () => {
        const { languageMode } = get();
        const { setLanguageMode } = get();

        if (languageMode === 'system') {
          setLanguageMode('ar');
        } else if (languageMode === 'ar') {
          setLanguageMode('en');
        } else {
          setLanguageMode('system');
        }
      },
    }),
    {
      name: '@mystore:language_store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        languageMode: state.languageMode,
      }),
    }
  )
);

/**
 * Custom hook for language management
 * Automatically detects and follows device system language when languageMode is 'system'
 * Provides convenient access to language state, current language, and actions
 */
export const useLanguage = () => {
  const languageMode = useLanguageStore((state) => state.languageMode);
  const setLanguageMode = useLanguageStore((state) => state.setLanguageMode);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  // Get device system language safely
  const deviceLocale = Localization.locale || Localization.getLocales()[0]?.languageCode || 'en';
  const systemLanguage = deviceLocale.split('-')[0];

  // Determine current language based on user preference and system language
  // If languageMode is 'system', follow device language, otherwise use selected mode
  const currentLanguage =
    languageMode === 'system'
      ? systemLanguage === 'ar'
        ? 'ar'
        : 'en'
      : languageMode;

  const isRTL = currentLanguage === 'ar';

  return {
    languageMode,
    currentLanguage,
    isRTL,
    isArabic: currentLanguage === 'ar',
    isEnglish: currentLanguage === 'en',
    setLanguageMode,
    toggleLanguage,
  };
};

export default useLanguageStore;
