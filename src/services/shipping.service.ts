import { apiGet, apiPost, apiPut, apiDelete } from './api';

// ========================================
// TYPES
// ========================================

export interface ShippingZone {
  id: string;
  storeId: string;
  name: string;
  nameAr?: string;
  countries: string[] | null;
  states: string[] | null;
  cities: string[] | null;
  postalCodes: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rates?: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  zoneId: string;
  name: string;
  nameAr?: string;
  type: string;
  cost: number;
  minOrderAmount?: number | null;
  maxOrderAmount?: number | null;
  minWeight?: number | null;
  maxWeight?: number | null;
  estimatedDays?: number | null;
  estimatedDeliveryTime?: string | null;
  isActive: boolean;
  settings?: {
    timeUnit?: 'hours' | 'days';
    translations?: Record<string, { name: string; description?: string }>;
    [key: string]: any;
  };
  translations?: Record<string, { name: string; description?: string }>;
  zone?: ShippingZone;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingZoneData {
  name: string;
  nameAr?: string;
  countries?: string[];
  states?: string[];
  cities?: string[];
  postalCodes?: string[];
  isActive?: boolean;
}

export interface CreateShippingRateData {
  zoneId?: string;
  name: string;
  nameAr?: string;
  type?: string;
  cost: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  minWeight?: number;
  maxWeight?: number;
  estimatedDays?: number;
  estimatedDeliveryTime?: string;
  isActive?: boolean;
  settings?: {
    timeUnit?: 'hours' | 'days';
    [key: string]: any;
  };
  translations?: Record<string, { name: string; description?: string }>;
}

// ========================================
// SHIPPING ZONES
// ========================================

/**
 * Get all shipping zones
 */
export const getShippingZones = async (): Promise<ShippingZone[]> => {
  try {
    const response = await apiGet<ShippingZone[]>('/shipping/zones');
    return response.data;
  } catch (error: any) {
    console.error('Get shipping zones error:', error.message);
    throw error;
  }
};

/**
 * Create a new shipping zone
 */
export const createShippingZone = async (data: CreateShippingZoneData): Promise<ShippingZone> => {
  try {
    const response = await apiPost<{ success: boolean; data: ShippingZone }>('/shipping/zones', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create shipping zone error:', error.message);
    throw error;
  }
};

/**
 * Update a shipping zone
 */
export const updateShippingZone = async (
  zoneId: string,
  data: Partial<CreateShippingZoneData>
): Promise<ShippingZone> => {
  try {
    const response = await apiPut<{ success: boolean; data: ShippingZone }>(
      `/shipping/zones/${zoneId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Update shipping zone error:', error.message);
    throw error;
  }
};

/**
 * Delete a shipping zone
 */
export const deleteShippingZone = async (zoneId: string): Promise<void> => {
  try {
    await apiDelete(`/shipping/zones/${zoneId}`);
  } catch (error: any) {
    console.error('Delete shipping zone error:', error.message);
    throw error;
  }
};

// ========================================
// SHIPPING RATES
// ========================================

/**
 * Get all shipping rates from StoreSettings
 */
export const getShippingRates = async (): Promise<ShippingRate[]> => {
  try {
    console.log('🔍 [getShippingRates] Fetching shipping rates from /settings...');
    const response = await apiGet<{ success: boolean; data: any }>('/settings');

    // Extract shippingMethods from StoreSettings
    const shippingMethods = response.data.data?.shippingMethods;

    if (!shippingMethods) {
      console.log('✅ [getShippingRates] No shipping methods found');
      return [];
    }

    // Parse if it's a string
    const methods = typeof shippingMethods === 'string'
      ? JSON.parse(shippingMethods)
      : shippingMethods;

    // Convert to ShippingRate format
    const rates: ShippingRate[] = Array.isArray(methods) ? methods.map((method: any) => ({
      id: method.id || String(Date.now()),
      zoneId: '',
      name: method.name || '',
      nameAr: method.nameAr || '',
      type: 'FLAT_RATE',
      cost: method.cost || 0,
      minOrderAmount: null,
      maxOrderAmount: null,
      minWeight: null,
      maxWeight: null,
      estimatedDays: method.estimatedDays ? Number(method.estimatedDays) : null,
      estimatedDeliveryTime: method.estimatedDays?.toString() || null,
      isActive: method.enabled !== false,
      settings: {
        timeUnit: method.estimatedTimeUnit || 'days',
      },
      translations: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) : [];

    console.log('✅ [getShippingRates] Got', rates.length, 'shipping rates');
    console.log('Data:', JSON.stringify(rates, null, 2));
    return rates;
  } catch (error: any) {
    console.error('❌ [getShippingRates] Error:', error.message);
    throw error;
  }
};

/**
 * Get a single shipping rate by ID
 */
export const getShippingRate = async (rateId: string): Promise<ShippingRate> => {
  try {
    const response = await apiGet<ShippingRate>(`/shipping/rates/${rateId}`);
    return response.data;
  } catch (error: any) {
    console.error('Get shipping rate error:', error.message);
    throw error;
  }
};

/**
 * Create a new shipping rate in StoreSettings
 */
export const createShippingRate = async (data: CreateShippingRateData): Promise<ShippingRate> => {
  try {
    console.log('📤 [createShippingRate] Sending data:', JSON.stringify(data, null, 2));

    // First, get current settings to retrieve existing shipping methods
    const settingsResponse = await apiGet<{ success: boolean; data: any }>('/settings');
    const currentMethods = settingsResponse.data.data?.shippingMethods;

    // Parse existing methods
    const existingMethods = currentMethods
      ? (typeof currentMethods === 'string' ? JSON.parse(currentMethods) : currentMethods)
      : [];

    // Create new method in StoreSettings format
    const newMethod = {
      id: String(Date.now()),
      name: data.name,
      nameAr: data.nameAr || '',
      cost: data.cost,
      estimatedDays: data.estimatedDeliveryTime || '',
      estimatedTimeUnit: data.settings?.timeUnit || 'days',
      enabled: data.isActive !== false,
      description: '',
      descriptionAr: '',
    };

    // Add to existing methods
    const updatedMethods = [...existingMethods, newMethod];

    // Update settings with new shipping methods
    console.log('📝 [createShippingRate] Updating settings with:', JSON.stringify(updatedMethods, null, 2));
    const updateResponse = await apiPut('/settings', {
      shippingMethods: JSON.stringify(updatedMethods),
    });

    console.log('✅ [createShippingRate] Success! Update response:', JSON.stringify(updateResponse, null, 2));

    // Return in ShippingRate format
    return {
      id: newMethod.id,
      zoneId: '',
      name: newMethod.name,
      nameAr: newMethod.nameAr,
      type: 'FLAT_RATE',
      cost: newMethod.cost,
      minOrderAmount: null,
      maxOrderAmount: null,
      minWeight: null,
      maxWeight: null,
      estimatedDays: newMethod.estimatedDays ? Number(newMethod.estimatedDays) : null,
      estimatedDeliveryTime: newMethod.estimatedDays,
      isActive: newMethod.enabled,
      settings: {
        timeUnit: newMethod.estimatedTimeUnit as 'hours' | 'days',
      },
      translations: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('❌ [createShippingRate] Error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

/**
 * Update a shipping rate in StoreSettings
 */
export const updateShippingRate = async (
  rateId: string,
  data: Partial<CreateShippingRateData>
): Promise<ShippingRate> => {
  try {
    console.log('📝 [updateShippingRate] Updating rate:', rateId);

    // Get current settings
    const settingsResponse = await apiGet<{ success: boolean; data: any }>('/settings');
    const currentMethods = settingsResponse.data.data?.shippingMethods;

    // Parse existing methods
    const existingMethods = currentMethods
      ? (typeof currentMethods === 'string' ? JSON.parse(currentMethods) : currentMethods)
      : [];

    // Find and update the method
    const updatedMethods = existingMethods.map((method: any) => {
      if (method.id === rateId) {
        return {
          ...method,
          name: data.name !== undefined ? data.name : method.name,
          nameAr: data.nameAr !== undefined ? data.nameAr : method.nameAr,
          cost: data.cost !== undefined ? data.cost : method.cost,
          estimatedDays: data.estimatedDeliveryTime !== undefined ? data.estimatedDeliveryTime : method.estimatedDays,
          estimatedTimeUnit: data.settings?.timeUnit || method.estimatedTimeUnit || 'days',
          enabled: data.isActive !== undefined ? data.isActive : method.enabled,
        };
      }
      return method;
    });

    // Update settings
    await apiPut('/settings', {
      shippingMethods: JSON.stringify(updatedMethods),
    });

    console.log('✅ [updateShippingRate] Success!');

    // Find updated method and return it
    const updatedMethod = updatedMethods.find((m: any) => m.id === rateId);

    return {
      id: updatedMethod.id,
      zoneId: '',
      name: updatedMethod.name,
      nameAr: updatedMethod.nameAr,
      type: 'FLAT_RATE',
      cost: updatedMethod.cost,
      minOrderAmount: null,
      maxOrderAmount: null,
      minWeight: null,
      maxWeight: null,
      estimatedDays: updatedMethod.estimatedDays ? Number(updatedMethod.estimatedDays) : null,
      estimatedDeliveryTime: updatedMethod.estimatedDays,
      isActive: updatedMethod.enabled,
      settings: {
        timeUnit: updatedMethod.estimatedTimeUnit as 'hours' | 'days',
      },
      translations: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('❌ [updateShippingRate] Error:', error.message);
    throw error;
  }
};

/**
 * Delete a shipping rate from StoreSettings
 */
export const deleteShippingRate = async (rateId: string): Promise<void> => {
  try {
    console.log('🗑️ [deleteShippingRate] Deleting rate:', rateId);

    // Get current settings
    const settingsResponse = await apiGet<{ success: boolean; data: any }>('/settings');
    const currentMethods = settingsResponse.data.data?.shippingMethods;

    // Parse existing methods
    const existingMethods = currentMethods
      ? (typeof currentMethods === 'string' ? JSON.parse(currentMethods) : currentMethods)
      : [];

    // Filter out the deleted method
    const updatedMethods = existingMethods.filter((method: any) => method.id !== rateId);

    // Update settings
    await apiPut('/settings', {
      shippingMethods: JSON.stringify(updatedMethods),
    });

    console.log('✅ [deleteShippingRate] Success!');
  } catch (error: any) {
    console.error('❌ [deleteShippingRate] Error:', error.message);
    throw error;
  }
};
