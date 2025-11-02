/**
 * Theme Store (Zustand)
 * Manages application theme state with support for light/dark/system modes
 * Persists theme preference using AsyncStorage
 * Automatically follows device system theme when set to 'system' mode
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '@/theme/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  // Theme mode preference
  themeMode: ThemeMode;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system', // Default to system

      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },

      toggleTheme: () => {
        const { themeMode } = get();
        if (themeMode === 'system') {
          set({ themeMode: 'light' });
        } else if (themeMode === 'light') {
          set({ themeMode: 'dark' });
        } else {
          set({ themeMode: 'system' });
        }
      },
    }),
    {
      name: '@mystore:theme_store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
    }
  )
);

/**
 * Custom hook for theme management
 * Automatically detects and follows device system theme when themeMode is 'system'
 * Provides convenient access to theme state, colors, and actions
 */
export const useTheme = () => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Get device system color scheme
  const systemColorScheme = useColorScheme();

  // Determine current theme based on user preference and system theme
  // If themeMode is 'system', follow device theme, otherwise use selected mode
  const currentTheme =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode;

  // Select appropriate color palette
  const colors = currentTheme === 'dark' ? darkColors : lightColors;

  return {
    themeMode,
    currentTheme,
    isDark: currentTheme === 'dark',
    colors,
    setThemeMode,
    toggleTheme,
  };
};

export default useThemeStore;
