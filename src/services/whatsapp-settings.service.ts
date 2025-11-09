import { apiGet, apiPut, apiPost } from './api';

// ========================================
// TYPES
// ========================================

export interface WhatsAppSettings {
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappLanguage: 'ar' | 'en';
  enableWhatsappOrder: boolean;
}

export interface UpdateWhatsAppSettingsData {
  whatsappNumber?: string;
  whatsappMessage?: string;
  whatsappLanguage?: 'ar' | 'en';
  enableWhatsappOrder?: boolean;
}

export interface TestWhatsAppData {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumber: string;
  message?: string;
}

export interface TestWhatsAppResponse {
  success: boolean;
  message: string;
  messageId?: string;
  status?: string;
  error?: string;
}

// ========================================
// WHATSAPP SETTINGS
// ========================================

/**
 * Get WhatsApp settings from StoreSettings
 */
export const getWhatsAppSettings = async (): Promise<WhatsAppSettings> => {
  try {
    const response = await apiGet<{ success: boolean; data: any }>('/settings');

    const settings = response.data.data;

    return {
      whatsappNumber: settings.whatsappNumber || '',
      whatsappMessage: settings.whatsappMessage || '',
      whatsappLanguage: settings.whatsappLanguage || 'ar',
      enableWhatsappOrder: settings.enableWhatsappOrder || false,
    };
  } catch (error: any) {
    console.error('Get WhatsApp settings error:', error.message);
    throw error;
  }
};

/**
 * Update WhatsApp settings in StoreSettings
 */
export const updateWhatsAppSettings = async (
  data: UpdateWhatsAppSettingsData
): Promise<void> => {
  try {
    await apiPut('/settings', data);
  } catch (error: any) {
    console.error('Update WhatsApp settings error:', error.message);
    throw error;
  }
};

/**
 * Test Twilio WhatsApp integration
 */
export const testTwilioWhatsApp = async (
  data: TestWhatsAppData
): Promise<TestWhatsAppResponse> => {
  try {
    const response = await apiPost<TestWhatsAppResponse>(
      '/settings/test-twilio-whatsapp',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Test WhatsApp error:', error.message);
    throw error;
  }
};
