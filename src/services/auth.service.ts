/**
 * Authentication Service
 * Handles login, register, logout, and token management
 */

import { apiPost } from './api';
import { setSecureItem, removeSecureItem } from '@/utils/secureStorage';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
} from '@/types/api.types';

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiPost<{ success?: boolean; message: string; data: AuthResponse['data'] }>('/auth/login', credentials);

    console.log('🔐 Auth Service: Raw response:', JSON.stringify(response.data, null, 2));

    // Backend doesn't return success field, so we check if data exists
    const hasData = !!response.data.data;

    // Store tokens securely
    if (hasData && response.data.data) {
      await setSecureItem('ACCESS_TOKEN', response.data.data.accessToken);
      await setSecureItem('REFRESH_TOKEN', response.data.data.refreshToken);
    }

    // Return the full response structure with success field
    const authResponse = {
      success: response.data.success !== undefined ? response.data.success : hasData,
      message: response.data.message,
      data: response.data.data,
    };

    console.log('🔐 Auth Service: Returning:', JSON.stringify(authResponse, null, 2));
    return authResponse;
  } catch (error: any) {
    console.error('🔐 Auth Service: Error:', error);
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

/**
 * Register new merchant account
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await apiPost<{ success?: boolean; message: string; data: AuthResponse['data'] }>('/auth/register', data);

    // Backend doesn't return success field, so we check if data exists
    const hasData = !!response.data.data;

    // Store tokens securely if registration is successful
    if (hasData && response.data.data) {
      await setSecureItem('ACCESS_TOKEN', response.data.data.accessToken);
      await setSecureItem('REFRESH_TOKEN', response.data.data.refreshToken);
    }

    // Return the full response structure with success field
    return {
      success: response.data.success !== undefined ? response.data.success : hasData,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

/**
 * Logout user and clear tokens
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint (optional - for server-side session cleanup)
    await apiPost('/auth/logout').catch(() => {
      // Ignore errors from logout endpoint
      console.log('Logout endpoint error ignored');
    });
  } finally {
    // Always clear local tokens
    await removeSecureItem('ACCESS_TOKEN');
    await removeSecureItem('REFRESH_TOKEN');
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (refreshToken: string): Promise<string> => {
  try {
    const response = await apiPost<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.data.success && response.data.data.accessToken) {
      await setSecureItem('ACCESS_TOKEN', response.data.data.accessToken);
      return response.data.data.accessToken;
    }

    throw new Error('Failed to refresh token');
  } catch (error: any) {
    // Clear tokens on refresh failure
    await removeSecureItem('ACCESS_TOKEN');
    await removeSecureItem('REFRESH_TOKEN');
    throw new Error('Session expired. Please login again.');
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiPost('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user info');
  }
};

/**
 * Verify email with verification code
 */
export const verifyEmail = async (code: string) => {
  try {
    const response = await apiPost('/auth/verify-email', { code });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Email verification failed');
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string) => {
  try {
    const response = await apiPost('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send reset email');
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await apiPost('/auth/reset-password', {
      token,
      password: newPassword,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to reset password');
  }
};
