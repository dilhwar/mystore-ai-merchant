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
 * Get all shipping rates
 */
export const getShippingRates = async (): Promise<ShippingRate[]> => {
  try {
    const response = await apiGet<ShippingRate[]>('/shipping/rates');
    return response.data;
  } catch (error: any) {
    console.error('Get shipping rates error:', error.message);
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
 * Create a new shipping rate
 */
export const createShippingRate = async (data: CreateShippingRateData): Promise<ShippingRate> => {
  try {
    const response = await apiPost<{ success: boolean; data: ShippingRate }>('/shipping/rates', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create shipping rate error:', error.message);
    throw error;
  }
};

/**
 * Update a shipping rate
 */
export const updateShippingRate = async (
  rateId: string,
  data: Partial<CreateShippingRateData>
): Promise<ShippingRate> => {
  try {
    const response = await apiPut<{ success: boolean; data: ShippingRate }>(
      `/shipping/rates/${rateId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Update shipping rate error:', error.message);
    throw error;
  }
};

/**
 * Delete a shipping rate
 */
export const deleteShippingRate = async (rateId: string): Promise<void> => {
  try {
    await apiDelete(`/shipping/rates/${rateId}`);
  } catch (error: any) {
    console.error('Delete shipping rate error:', error.message);
    throw error;
  }
};
