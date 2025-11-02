import { apiGet } from './api';

// ========================================
// TYPES
// ========================================

export interface Store {
  id: string;
  storeName: string;
  slug: string;
  isPublished: boolean;
  customDomain?: string;
  storeUrl: string; // Full URL to the store
}

export interface StoreResponse {
  success: boolean;
  data: Store;
}

// ========================================
// STORE FUNCTIONS
// ========================================

/**
 * Get merchant's store information
 */
export const getStore = async (): Promise<Store> => {
  try {
    const response = await apiGet<{ success: boolean; data: Store }>('/merchant/store');
    return response.data.data;
  } catch (error: any) {
    // Silently throw error - will be caught by getStoreUrl
    throw error;
  }
};

/**
 * Get store URL only (optimized for header)
 */
export const getStoreUrl = async (): Promise<string> => {
  try {
    const store = await getStore();
    return store.storeUrl || `https://my-store.ai/${store.slug}`;
  } catch (error: any) {
    // Silently return empty string - store link will be hidden
    return '';
  }
};
