import { apiGet, apiPut } from './api';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'WALLET';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  variantId?: string;
  name: string;
  nameAr?: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
  productData?: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax?: number;
  discount?: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerInfo?: any;
  shippingInfo?: any;
  shippingAddress?: any;
  trackingToken?: string;
  trackingNumber?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
  customerNotes?: string;
}

export interface OrderStats {
  status: OrderStatus;
  _count: number;
}

export interface OrdersResponse {
  message: string;
  data: {
    items: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: OrderStats[];
  };
}

export interface OrderResponse {
  message: string;
  data: Order;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get all orders with optional filters
 */
export const getOrders = async (params: GetOrdersParams = {}): Promise<OrdersResponse['data']> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.customerId) queryParams.append('customerId', params.customerId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const url = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiGet<OrdersResponse>(url);

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to fetch orders');
  } catch (error: any) {
    console.error('Get orders error:', error.message);
    throw error;
  }
};

/**
 * Get single order by ID
 */
export const getOrder = async (orderId: string): Promise<Order> => {
  try {
    const response = await apiGet<OrderResponse>(`/orders/${orderId}`);

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to fetch order');
  } catch (error: any) {
    console.error('Get order error:', error.message);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
  notes?: string
): Promise<Order> => {
  try {
    const response = await apiPut<OrderResponse>(`/orders/${orderId}/status`, {
      status,
      trackingNumber,
      notes,
    });

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to update order status');
  } catch (error: any) {
    console.error('Update order status error:', error.message);
    throw error;
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<Order> => {
  try {
    const response = await apiPut<OrderResponse>(`/orders/${orderId}/payment-status`, {
      paymentStatus,
    });

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to update payment status');
  } catch (error: any) {
    console.error('Update payment status error:', error.message);
    throw error;
  }
};

/**
 * Get order status display info
 */
export const getOrderStatusInfo = (status: OrderStatus): { color: string; icon: string } => {
  switch (status) {
    case 'PENDING':
      return { color: '#F59E0B', icon: '⏳' };
    case 'CONFIRMED':
      return { color: '#3B82F6', icon: '✓' };
    case 'PROCESSING':
      return { color: '#8B5CF6', icon: '⚙️' };
    case 'SHIPPED':
      return { color: '#06B6D4', icon: '🚚' };
    case 'DELIVERED':
      return { color: '#10B981', icon: '✓' };
    case 'CANCELLED':
      return { color: '#EF4444', icon: '✗' };
    case 'REFUNDED':
      return { color: '#6B7280', icon: '↩' };
    default:
      return { color: '#9CA3AF', icon: '?' };
  }
};

/**
 * Get payment status display info
 */
export const getPaymentStatusInfo = (status: PaymentStatus): { color: string; icon: string } => {
  switch (status) {
    case 'PENDING':
      return { color: '#F59E0B', icon: '⏳' };
    case 'PAID':
      return { color: '#10B981', icon: '✓' };
    case 'FAILED':
      return { color: '#EF4444', icon: '✗' };
    case 'REFUNDED':
      return { color: '#6B7280', icon: '↩' };
    default:
      return { color: '#9CA3AF', icon: '?' };
  }
};
