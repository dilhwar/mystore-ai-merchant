/**
 * Dashboard Service
 * Handles fetching dashboard statistics and analytics
 */

import { apiGet } from './api';

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  currency?: string;
  language?: string;
  timezone?: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
}

export interface DashboardData {
  totalRevenue: number;
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: RecentOrder[];
  currency?: string;
  language?: string;
  timezone?: string;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

/**
 * Get dashboard statistics from merchant endpoint
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiGet<DashboardResponse>('/merchant/dashboard');

    if (response.data.success && response.data.data) {
      const data = response.data.data;
      return {
        totalSales: data.totalSales || data.totalRevenue || 0,
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalCustomers: data.totalCustomers || 0,
        totalProducts: data.totalProducts || 0,
        currency: data.currency || 'SAR',
        language: data.language || 'ar',
        timezone: data.timezone,
      };
    }

    // If no data, return zeros
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      currency: 'SAR',
      language: 'ar',
    };
  } catch (error: any) {
    console.error('Dashboard stats error:', error.message);
    // Return zeros on error
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
    };
  }
};

/**
 * Get real stats from database queries
 * This will count actual records from products, orders, etc.
 */
export const getRealDashboardStats = async (storeId: string): Promise<DashboardStats> => {
  try {
    // Make parallel requests to get all stats
    const [products, orders] = await Promise.all([
      apiGet(`/stores/${storeId}/products/count`),
      apiGet(`/stores/${storeId}/orders/stats`),
    ]);

    const totalProducts = products.data?.data?.count || 0;
    const orderStats = orders.data?.data || {};

    return {
      totalSales: orderStats.totalRevenue || 0,
      totalOrders: orderStats.totalOrders || 0,
      totalCustomers: orderStats.uniqueCustomers || 0,
      totalProducts,
    };
  } catch (error) {
    console.error('Error fetching real stats:', error);
    return {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
    };
  }
};
