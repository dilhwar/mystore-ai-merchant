import { apiPost } from './api';

// ========================================
// TYPES
// ========================================

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
