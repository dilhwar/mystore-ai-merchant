import { apiGet, apiPut } from './api';

// ========================================
// TYPES
// ========================================

export interface App {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  category: 'essential' | 'integration' | 'checkout' | 'product' | 'analytics';
  isEnabled: boolean;
  isEssential?: boolean; // Cannot be disabled
}

export interface AppsSettings {
  // Essential Apps
  enableProducts: boolean;
  enableOrders: boolean;
  enableCategories: boolean;
  enableTemplate: boolean;

  // Integration Apps
  enablePaymentGateways: boolean;
  enableAI: boolean;

  // Checkout Features
  enableWhatsapp: boolean;
  enableWhatsappOrder: boolean;

  // Product Management Apps
  enableInventoryTracking: boolean;
  enableSKU: boolean;
  enableVariants: boolean;
  enableReviews: boolean;
}

export interface UpdateAppsData {
  [key: string]: boolean;
}

// ========================================
// AVAILABLE APPS DEFINITION
// ========================================

export const AVAILABLE_APPS: App[] = [
  // Essential Apps (cannot be disabled)
  {
    id: 'enableProducts',
    name: 'Products',
    nameAr: 'المنتجات',
    description: 'Manage your store products',
    descriptionAr: 'إدارة منتجات متجرك',
    icon: '📦',
    category: 'essential',
    isEnabled: true,
    isEssential: true,
  },
  {
    id: 'enableOrders',
    name: 'Orders',
    nameAr: 'الطلبات',
    description: 'Track and manage orders',
    descriptionAr: 'تتبع وإدارة الطلبات',
    icon: '🛒',
    category: 'essential',
    isEnabled: true,
    isEssential: true,
  },
  {
    id: 'enableCategories',
    name: 'Categories',
    nameAr: 'الفئات',
    description: 'Organize products by category',
    descriptionAr: 'تنظيم المنتجات حسب الفئة',
    icon: '📂',
    category: 'essential',
    isEnabled: true,
    isEssential: true,
  },
  {
    id: 'enableTemplate',
    name: 'Store Template',
    nameAr: 'قالب المتجر',
    description: 'Customize store appearance',
    descriptionAr: 'تخصيص مظهر المتجر',
    icon: '🎨',
    category: 'essential',
    isEnabled: true,
    isEssential: true,
  },

  // Integration Apps
  {
    id: 'enablePaymentGateways',
    name: 'Payment Gateways',
    nameAr: 'بوابات الدفع',
    description: 'Enable online payment processing',
    descriptionAr: 'تمكين معالجة المدفوعات الإلكترونية',
    icon: '💳',
    category: 'integration',
    isEnabled: true,
  },
  {
    id: 'enableAI',
    name: 'AI Assistant',
    nameAr: 'مساعد الذكاء الاصطناعي',
    description: 'AI-powered content generation',
    descriptionAr: 'توليد المحتوى بالذكاء الاصطناعي',
    icon: '🤖',
    category: 'integration',
    isEnabled: true,
  },

  // Checkout Features
  {
    id: 'enableWhatsapp',
    name: 'WhatsApp Notifications',
    nameAr: 'إشعارات واتساب',
    description: 'Send order updates via WhatsApp',
    descriptionAr: 'إرسال تحديثات الطلبات عبر واتساب',
    icon: '💬',
    category: 'checkout',
    isEnabled: true,
  },
  {
    id: 'enableWhatsappOrder',
    name: 'WhatsApp Ordering',
    nameAr: 'الطلب عبر واتساب',
    description: 'Allow customers to order via WhatsApp',
    descriptionAr: 'السماح للعملاء بالطلب عبر واتساب',
    icon: '📱',
    category: 'checkout',
    isEnabled: true,
  },

  // Product Management Apps
  {
    id: 'enableInventoryTracking',
    name: 'Inventory Tracking',
    nameAr: 'تتبع المخزون',
    description: 'Track stock levels automatically',
    descriptionAr: 'تتبع مستويات المخزون تلقائياً',
    icon: '📊',
    category: 'product',
    isEnabled: true,
  },
  {
    id: 'enableSKU',
    name: 'SKU Management',
    nameAr: 'إدارة SKU',
    description: 'Assign unique SKUs to products',
    descriptionAr: 'تعيين SKU فريد للمنتجات',
    icon: '🔖',
    category: 'product',
    isEnabled: false,
  },
  {
    id: 'enableVariants',
    name: 'Product Variants',
    nameAr: 'خيارات المنتج',
    description: 'Add sizes, colors, and variants',
    descriptionAr: 'إضافة الأحجام والألوان والخيارات',
    icon: '🎯',
    category: 'product',
    isEnabled: true,
  },
  {
    id: 'enableReviews',
    name: 'Product Reviews',
    nameAr: 'تقييمات المنتج',
    description: 'Allow customer product reviews',
    descriptionAr: 'السماح بتقييمات العملاء للمنتجات',
    icon: '⭐',
    category: 'product',
    isEnabled: true,
  },
];

// ========================================
// APPS FUNCTIONS
// ========================================

/**
 * Get all apps with their current enabled status
 */
export const getApps = async (): Promise<App[]> => {
  try {
    // Get store settings which contains app statuses
    const response = await apiGet<{ success: boolean; data: any }>('/settings');
    const settings = response.data.data;

    // Map apps with current enabled status from settings
    const apps = AVAILABLE_APPS.map((app) => ({
      ...app,
      isEnabled: settings[app.id] !== undefined ? settings[app.id] : app.isEnabled,
    }));

    return apps;
  } catch (error: any) {
    console.error('Get apps error:', error.message);
    throw error;
  }
};

/**
 * Update app enabled status
 */
export const updateApp = async (appId: string, isEnabled: boolean): Promise<void> => {
  try {
    await apiPut('/settings', {
      [appId]: isEnabled,
    });
  } catch (error: any) {
    console.error('Update app error:', error.message);
    throw error;
  }
};

/**
 * Update multiple apps at once
 */
export const updateApps = async (updates: UpdateAppsData): Promise<void> => {
  try {
    await apiPut('/settings', updates);
  } catch (error: any) {
    console.error('Update apps error:', error.message);
    throw error;
  }
};

/**
 * Get apps by category
 */
export const getAppsByCategory = (
  apps: App[],
  category: App['category']
): App[] => {
  return apps.filter((app) => app.category === category);
};
