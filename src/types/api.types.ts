/**
 * API Types - Matching Backend Prisma Schema
 */

// ============================================
// AUTH TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  storeName: string;
  email: string;
  country: string;
  whatsappNumber: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    merchant?: any;
    user?: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'MERCHANT' | 'CUSTOMER' | 'ADMIN';
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  stores?: Store[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STORE TYPES
// ============================================

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  defaultCurrency?: string;
  isActive: boolean;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity?: number;
  images: ProductImage[];
  categoryId?: string;
  category?: Category;
  storeId: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  items: OrderItem[];
  customer?: Customer;
  shippingAddress?: ShippingAddress;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  revenue: {
    total: number;
    change: number;
    changePercent: number;
  };
  orders: {
    total: number;
    change: number;
    changePercent: number;
  };
  products: {
    total: number;
    active: number;
  };
  customers: {
    total: number;
    new: number;
  };
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
