/**
 * OTP Service
 * Handles sending and verifying OTP codes via WhatsApp
 */

import { apiPost } from './api';

export interface SendOTPRequest {
  phoneNumber: string;
  purpose?: 'registration' | 'login' | 'password_reset';
  language?: 'ar' | 'en';
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
  purpose?: 'registration' | 'login' | 'password_reset';
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  expiresIn?: number;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  phoneNumber: string;
  verified: boolean;
  data?: {
    user?: any;
    merchant?: any;
    accessToken?: string;
    refreshToken?: string;
  };
}

/**
 * Send OTP code to WhatsApp number
 */
export const sendOTP = async (data: SendOTPRequest): Promise<OTPResponse> => {
  try {
    const response = await apiPost<{ success: boolean; message: string; data: any }>(
      '/auth/send-otp',
      data
    );

    return {
      success: response.data.success,
      message: response.data.message,
      expiresAt: response.data.data?.expiresAt,
      expiresIn: response.data.data?.expiresIn || 300,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send OTP. Please try again.');
  }
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  try {
    const response = await apiPost<{ success: boolean; message: string; data: any }>(
      '/auth/verify-otp',
      data
    );

    return {
      success: response.data.success,
      message: response.data.message,
      phoneNumber: response.data.data?.phoneNumber || data.phoneNumber,
      verified: response.data.data?.verified || false,
      data: response.data.data, // Include full data with tokens
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to verify OTP. Please try again.');
  }
};

/**
 * Resend OTP code
 */
export const resendOTP = async (data: SendOTPRequest): Promise<OTPResponse> => {
  try {
    const response = await apiPost<{ success: boolean; message: string; data: any }>(
      '/auth/resend-otp',
      data
    );

    return {
      success: response.data.success,
      message: response.data.message,
      expiresAt: response.data.data?.expiresAt,
      expiresIn: response.data.data?.expiresIn || 300,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to resend OTP. Please try again.');
  }
};
