import { apiGet, apiPut } from './api';

// ========================================
// TYPES
// ========================================

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
  label: string;
  labelAr: string;
  enabled: boolean;
  required: boolean;
  options?: string[]; // For select type
}

export interface CheckoutSettings {
  requirePhone: boolean;
  requireEmail: boolean;
  requireAddress: boolean;
  allowGuestCheckout: boolean;
  orderFormFields: FormField[] | null;
}

export interface UpdateCheckoutSettingsData {
  requirePhone?: boolean;
  requireEmail?: boolean;
  requireAddress?: boolean;
  allowGuestCheckout?: boolean;
  orderFormFields?: FormField[];
}

// ========================================
// CHECKOUT SETTINGS / FORM FIELDS
// ========================================

/**
 * Get checkout settings (includes form fields)
 */
export const getCheckoutSettings = async (): Promise<CheckoutSettings> => {
  try {
    const response = await apiGet<{ success: boolean; data: CheckoutSettings }>(
      '/settings/checkout-settings'
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Get checkout settings error:', error.message);
    throw error;
  }
};

/**
 * Update checkout settings (includes form fields)
 */
export const updateCheckoutSettings = async (
  data: UpdateCheckoutSettingsData
): Promise<CheckoutSettings> => {
  try {
    const response = await apiPut<{ success: boolean; data: CheckoutSettings }>(
      '/settings/checkout-settings',
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Update checkout settings error:', error.message);
    throw error;
  }
};
