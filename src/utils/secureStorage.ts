/**
 * SecureStore wrapper for sensitive data (JWT tokens, passwords, etc.)
 * Uses expo-secure-store for encrypted storage on iOS and Android
 */

import * as SecureStore from 'expo-secure-store';

/**
 * Save a sensitive value to SecureStore
 * @param key - The storage key
 * @param value - The value to store securely
 */
export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error storing secure item ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieve a sensitive value from SecureStore
 * @param key - The storage key
 * @returns The retrieved value or null if not found
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error(`Error retrieving secure item ${key}:`, error);
    throw error;
  }
};

/**
 * Remove a sensitive item from SecureStore
 * @param key - The storage key
 */
export const removeSecureItem = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error removing secure item ${key}:`, error);
    throw error;
  }
};

/**
 * Remove multiple sensitive items from SecureStore
 * @param keys - Array of storage keys to remove
 */
export const removeMultipleSecureItems = async (keys: string[]): Promise<void> => {
  try {
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
  } catch (error) {
    console.error('Error removing multiple secure items:', error);
    throw error;
  }
};

// SecureStore keys constants
export const SECURE_STORAGE_KEYS = {
  ACCESS_TOKEN: '@mystore:access_token',
  REFRESH_TOKEN: '@mystore:refresh_token',
  BIOMETRIC_ENABLED: '@mystore:biometric_enabled',
} as const;
