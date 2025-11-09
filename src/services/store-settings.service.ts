/**
 * Store Settings Service
 * Handles merchant store settings and configuration
 */

import { apiGet, apiPut } from './api';
import { Store } from '@/types/api.types';

export interface UpdateStoreData {
  name?: string;
  slug?: string;
  description?: string;
  logo?: string;
  defaultCurrency?: string;
  supportedLanguages?: string[];
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * Get store settings
 */
export const getStoreSettings = async (): Promise<Store> => {
  try {
    const response = await apiGet<Store>('/merchant/store');
    return response.data;
  } catch (error: any) {
    console.error('🏪 Store Settings: Get error:', error.message);
    throw new Error(error.message || 'Failed to fetch store settings');
  }
};

/**
 * Update store settings
 * @param storeId - The ID of the store to update
 * @param data - The data to update
 */
export const updateStoreSettings = async (storeId: string, data: UpdateStoreData): Promise<Store> => {
  try {
    const response = await apiPut<Store>(`/stores/${storeId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('🏪 Store Settings: Update error:', error.message);
    throw new Error(error.message || 'Failed to update store settings');
  }
};
