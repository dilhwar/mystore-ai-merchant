/**
 * Authentication Store (Zustand)
 * Manages user authentication state, including tokens, user data, and login status
 * Handles token persistence and authentication state synchronization
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSecureItem, setSecureItem, removeSecureItem } from '@/utils/secureStorage';
import * as authService from '@/services/auth.service';
import type { User } from '@/types/api.types';

// Use User type from API types
export type UserData = User;

interface AuthState {
  // Authentication data
  accessToken: string | null;
  refreshToken: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Store settings (for language system)
  storeLanguages: string[]; // e.g., ['ar', 'en'] or ['fr', 'es']
  defaultLanguage: string; // Primary language (languages[0])
  storeCurrency: string; // e.g., 'IQD', 'USD'

  // Actions
  setUser: (user: UserData) => void;
  setTokens: (accessToken: string, refreshToken?: string) => Promise<void>;
  setAccessToken: (token: string) => Promise<void>;
  setRefreshToken: (token: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (storeName: string, email: string, country: string, whatsappNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserData>) => void;
  setStoreSettings: (languages: string[], defaultLanguage: string, currency: string) => void;

  // Initialization
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Store settings defaults
      storeLanguages: ['ar', 'en'], // Default languages
      defaultLanguage: 'ar',
      storeCurrency: 'IQD',

      setUser: (user: UserData) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      setTokens: async (accessToken: string, refreshToken?: string) => {
        try {
          set({ accessToken });

          // Store tokens securely
          await setSecureItem('ACCESS_TOKEN', accessToken);

          if (refreshToken) {
            set({ refreshToken });
            await setSecureItem('REFRESH_TOKEN', refreshToken);
          }
        } catch (error) {
          console.error('Error setting tokens:', error);
          set({ error: 'Failed to store authentication tokens' });
          throw error;
        }
      },

      setAccessToken: async (token: string) => {
        try {
          set({ accessToken: token });
          await setSecureItem('ACCESS_TOKEN', token);
        } catch (error) {
          console.error('Error setting access token:', error);
          set({ error: 'Failed to store access token' });
          throw error;
        }
      },

      setRefreshToken: async (token: string) => {
        try {
          set({ refreshToken: token });
          await setSecureItem('REFRESH_TOKEN', token);
        } catch (error) {
          console.error('Error setting refresh token:', error);
          set({ error: 'Failed to store refresh token' });
          throw error;
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log('🔐 AuthStore: Calling login service...');
          const response = await authService.login({ email, password });
          console.log('📦 AuthStore: Response received:', { success: response.success, hasData: !!response.data });

          if (response.success && response.data) {
            const { user, merchant, accessToken, refreshToken } = response.data;
            console.log('👤 AuthStore: User data:', { hasUser: !!user, hasMerchant: !!merchant });

            // Use merchant data if user is not provided
            const userData = user || (merchant ? {
              id: merchant.id,
              email: merchant.email,
              firstName: merchant.storeName || merchant.firstName || '',
              lastName: merchant.lastName || '',
            } as UserData : null);

            if (!userData) {
              console.error('❌ AuthStore: No user data found');
              throw new Error('No user data received from server');
            }

            console.log('✅ AuthStore: Setting authenticated state');
            set({
              accessToken,
              refreshToken,
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            console.log('✅ AuthStore: State updated successfully');
          } else {
            console.error('❌ AuthStore: Response not successful or no data');
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          console.error('❌ AuthStore: Login error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (storeName: string, email: string, country: string, whatsappNumber: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register({
            storeName,
            email,
            country,
            whatsappNumber,
            password,
          });

          if (response.success && response.data) {
            const { merchant, user, accessToken, refreshToken } = response.data;

            // Use user data if available, otherwise map merchant data to user format
            const userData = user || (merchant ? {
              id: merchant.id,
              email: merchant.email,
              firstName: merchant.storeName || merchant.firstName || '',
              lastName: merchant.lastName || '',
            } as UserData : null);

            if (!userData) {
              throw new Error('No user data received from server');
            }

            set({
              accessToken,
              refreshToken,
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();

          // Reset auth state
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            error: null,
          });
        } catch (error) {
          console.error('Error during logout:', error);
          // Still reset state even if API call fails
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
          });
        }
      },

      updateUser: (userData: Partial<UserData>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setStoreSettings: (languages: string[], defaultLanguage: string, currency: string) => {
        set({
          storeLanguages: languages,
          defaultLanguage,
          storeCurrency: currency,
        });
      },

      initializeAuth: async () => {
        try {
          // Attempt to retrieve tokens from secure storage
          const accessToken = await getSecureItem('ACCESS_TOKEN');
          const refreshToken = await getSecureItem('REFRESH_TOKEN');

          if (accessToken) {
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
            });

            // Try to fetch fresh user data, but don't fail if endpoint doesn't exist
            try {
              const userData = await authService.getCurrentUser();
              if (userData.success && userData.data) {
                set({ user: userData.data });
              }
            } catch (error) {
              // Silently ignore - user data will be populated on next login
            }
          } else {
            set({
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: '@mystore:auth_store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        storeLanguages: state.storeLanguages,
        defaultLanguage: state.defaultLanguage,
        storeCurrency: state.storeCurrency,
      }),
    }
  )
);

/**
 * Custom hook for authentication management
 * Provides convenient access to auth state and actions
 */
export const useAuth = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const storeLanguages = useAuthStore((state) => state.storeLanguages);
  const defaultLanguage = useAuthStore((state) => state.defaultLanguage);
  const storeCurrency = useAuthStore((state) => state.storeCurrency);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setStoreSettings = useAuthStore((state) => state.setStoreSettings);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  return {
    // State
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isLoading,
    error,
    storeLanguages,
    defaultLanguage,
    storeCurrency,

    // Actions
    login,
    register,
    logout,
    setUser,
    setTokens,
    updateUser,
    setStoreSettings,
    initializeAuth,
  };
};

export default useAuthStore;
