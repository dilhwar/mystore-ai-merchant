import { apiGet, apiPatch, apiPost } from './api';

// ========================================
// TYPES
// ========================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'info';
  isRead: boolean;
  createdAt: string;
  orderId?: string;
  productId?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ========================================
// NOTIFICATIONS FUNCTIONS
// ========================================

/**
 * Get all notifications for the merchant
 */
export const getNotifications = async (): Promise<NotificationsResponse> => {
  try {
    const response = await apiGet<{ success: boolean; data: NotificationsResponse }>(
      '/notifications'
    );
    return response.data.data;
  } catch (error: any) {
    // Silently return empty data if API is not available
    return {
      notifications: [],
      unreadCount: 0,
    };
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiPatch(`/notifications/${notificationId}/read`, {});
  } catch (error: any) {
    // Silently fail if API is not available
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  try {
    await apiPatch('/notifications/read-all', {});
  } catch (error: any) {
    // Silently fail if API is not available
  }
};

/**
 * Get unread count only (for badge)
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await apiGet<{ success: boolean; data: { unreadCount: number } }>(
      '/notifications/unread-count'
    );
    return response.data.data.unreadCount;
  } catch (error: any) {
    // Silently return 0 if API is not available
    return 0;
  }
};

/**
 * Send Expo Push Token to backend
 */
export const sendPushToken = async (token: string): Promise<void> => {
  try {
    await apiPost('/notifications/register-token', { pushToken: token });
    console.log('✅ Push token registered successfully');
  } catch (error: any) {
    console.error('❌ Failed to register push token:', error);
    throw error;
  }
};
