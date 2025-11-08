import { apiGet } from './api';

// ========================================
// TYPES
// ========================================

export interface Store {
  id: string;
  name: string; // Store name (default/English)
  nameAr?: string; // Store name (Arabic)
  nameHi?: string; // Store name (Hindi)
  nameEs?: string; // Store name (Spanish)
  nameFr?: string; // Store name (French)
  // Add more languages as needed
  storeName?: string; // Fallback for compatibility
  slug: string;
  isPublished: boolean;
  customDomain?: string;
  storeUrl?: string; // Full URL to the store
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
    const response = await apiGet<{ message: string; data: Store[] | Store }>('/stores');

    // Handle both array and single store response
    const storeData = Array.isArray(response.data.data)
      ? response.data.data[0]
      : response.data.data;

    if (!storeData) {
      throw new Error('No store found');
    }

    // Build storeUrl if not provided
    const storeUrl = storeData.customDomain
      ? `https://${storeData.customDomain}`
      : `https://shop.my-store.ai/${storeData.slug}`;

    return {
      ...storeData,
      storeName: storeData.name || storeData.storeName,
      storeUrl,
    };
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
    return store.storeUrl || `https://shop.my-store.ai/${store.slug}`;
  } catch (error: any) {
    // Silently return empty string - store link will be hidden
    return '';
  }
};
