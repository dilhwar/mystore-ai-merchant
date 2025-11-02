import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './api';

// ========================================
// TYPES
// ========================================

export interface PaymentMethod {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  instructions?: string;
  instructionsAr?: string;
  isActive: boolean;
  enabled: boolean;
  type: string;
  processingFee?: number | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  settings?: any;
  translations?: Record<string, { name: string; description?: string }>;
  isBuiltIn: boolean;
}

export interface CreatePaymentMethodData {
  type: string;
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  isActive?: boolean;
  feeAmount?: number;
  accountInfo?: any;
  translations?: Record<string, { name: string; description?: string }>;
  settings?: any;
}

export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {
  // For built-in methods (stripe, paypal)
  publishableKey?: string;
  secretKey?: string;
  clientId?: string;
  secret?: string;
}

// ========================================
// PAYMENT METHODS
// ========================================

/**
 * Get all payment methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await apiGet<{ success: boolean; data: PaymentMethod[] }>(
      '/settings/payment-methods'
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Get payment methods error:', error.message);
    throw error;
  }
};

/**
 * Get a single payment method by ID
 */
export const getPaymentMethod = async (methodId: string): Promise<PaymentMethod> => {
  try {
    const response = await apiGet<{ success: boolean; data: PaymentMethod }>(
      `/settings/payment-methods/${methodId}`
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Get payment method error:', error.message);
    throw error;
  }
};

/**
 * Create a new custom payment method
 */
export const createPaymentMethod = async (
  data: CreatePaymentMethodData
): Promise<PaymentMethod> => {
  try {
    const response = await apiPost<{ success: boolean; data: PaymentMethod }>(
      '/settings/payment-methods',
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Create payment method error:', error.message);
    throw error;
  }
};

/**
 * Update a payment method (both built-in and custom)
 */
export const updatePaymentMethod = async (
  methodId: string,
  data: UpdatePaymentMethodData
): Promise<void> => {
  try {
    await apiPut(`/settings/payment-methods/${methodId}`, data);
  } catch (error: any) {
    console.error('Update payment method error:', error.message);
    throw error;
  }
};

/**
 * Toggle payment method enabled/disabled status
 */
export const togglePaymentMethod = async (methodId: string, isActive: boolean): Promise<void> => {
  try {
    await apiPatch(`/settings/payment-methods/${methodId}`, { isActive });
  } catch (error: any) {
    console.error('Toggle payment method error:', error.message);
    throw error;
  }
};

/**
 * Delete a custom payment method
 */
export const deletePaymentMethod = async (methodId: string): Promise<void> => {
  try {
    await apiDelete(`/settings/payment-methods/${methodId}`);
  } catch (error: any) {
    console.error('Delete payment method error:', error.message);
    throw error;
  }
};
