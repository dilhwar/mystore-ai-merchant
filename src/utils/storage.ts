/**
 * AsyncStorage wrapper functions
 * Provides a clean interface for storing and retrieving non-sensitive data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic function to set a value in AsyncStorage
 * @param key - The storage key
 * @param value - The value to store (will be JSON stringified)
 */
export const setStorageItem = async <T,>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing item ${key}:`, error);
    throw error;
  }
};

/**
 * Generic function to get a value from AsyncStorage
 * @param key - The storage key
 * @returns The retrieved value or null if not found
 */
export const getStorageItem = async <T,>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
  } catch (error) {
    console.error(`Error retrieving item ${key}:`, error);
    throw error;
  }
};

/**
 * Remove a single item from AsyncStorage
 * @param key - The storage key
 */
export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
    throw error;
  }
};

/**
 * Remove multiple items from AsyncStorage
 * @param keys - Array of storage keys to remove
 */
export const removeMultipleStorageItems = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error(`Error removing multiple items:`, error);
    throw error;
  }
};

/**
 * Clear all items from AsyncStorage
 * Use with caution as this clears everything
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

/**
 * Get all keys from AsyncStorage
 * @returns Array of all storage keys
 */
export const getAllStorageKeys = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    console.error('Error getting all storage keys:', error);
    throw error;
  }
};

/**
 * Get multiple items from AsyncStorage
 * @param keys - Array of storage keys to retrieve
 * @returns Record of key-value pairs
 */
export const getMultipleStorageItems = async <T,>(keys: string[]): Promise<Record<string, T | null>> => {
  try {
    const results = await AsyncStorage.multiGet(keys);
    const items: Record<string, T | null> = {};
    results.forEach(([key, value]) => {
      items[key] = value ? (JSON.parse(value) as T) : null;
    });
    return items;
  } catch (error) {
    console.error('Error retrieving multiple items:', error);
    throw error;
  }
};

// Storage keys constants
export const STORAGE_KEYS = {
  THEME_MODE: '@mystore:theme_mode',
  AUTH_TOKEN: '@mystore:auth_token',
  USER_DATA: '@mystore:user_data',
  LANGUAGE: '@mystore:language',
  ONBOARDING_COMPLETED: '@mystore:onboarding_completed',
} as const;
