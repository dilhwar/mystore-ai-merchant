/**
 * Account Service
 * Handles user account management and profile updates
 */

import { apiGet, apiPut, apiPost } from './api';
import { User } from '@/types/api.types';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

/**
 * Get user profile
 */
export const getProfile = async (): Promise<User> => {
  try {
    const response = await apiGet<User>('/merchant/profile');
    return response.data;
  } catch (error: any) {
    console.error('👤 Account: Get profile error:', error.message);
    throw new Error(error.message || 'Failed to fetch profile');
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  try {
    const response = await apiPut<User>('/merchant/profile', data);
    return response.data;
  } catch (error: any) {
    console.error('👤 Account: Update profile error:', error.message);
    throw new Error(error.message || 'Failed to update profile');
  }
};

/**
 * Change password
 */
export const changePassword = async (data: ChangePasswordData): Promise<ChangePasswordResponse> => {
  try {
    const response = await apiPost<ChangePasswordResponse>('/merchant/change-password', data);
    return response.data;
  } catch (error: any) {
    console.error('👤 Account: Change password error:', error.message);
    throw new Error(error.message || 'Failed to change password');
  }
};
