import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isDefault: boolean;
  isCardImage?: boolean;
  displayOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  nameAr?: string;
  sku?: string;
  price: number;
  quantity: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
}

export interface ProductDiscount {
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  finalPrice: number;
  savings: number;
  endDate: Date;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  currency?: string;
  sku?: string;
  quantity: number;
  enabled: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  settings?: {
    translations?: any;
  };
  translations?: any;
  category?: ProductCategory;
  images: ProductImage[];
  variants?: ProductVariant[];
  discount?: any;
  discountInfo?: ProductDiscount;
}

export interface ProductsResponse {
  message: string;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  featured?: boolean;
}

/**
 * Get all products with optional filters
 */
export const getProducts = async (params: GetProductsParams = {}): Promise<ProductsResponse['data']> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());

    const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiGet<ProductsResponse>(url);

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to fetch products');
  } catch (error: any) {
    console.error('Get products error:', error.message);
    throw error;
  }
};

/**
 * Get product name based on current language
 * Uses dynamic language system - supports multiple languages
 */
export const getProductName = (product: Product, language: string, storeLanguages?: string[]): string => {
  // Use dynamic language system if storeLanguages provided
  if (storeLanguages && storeLanguages.length > 0) {
    const { getTranslatedName } = require('@/utils/language');
    return getTranslatedName(product, storeLanguages, language);
  }

  // Fallback to legacy two-language system (for backward compatibility)
  if (language === 'ar' && product.nameAr) {
    return product.nameAr;
  }
  return product.name;
};

/**
 * Get product default image
 */
export const getProductImage = (product: Product): string | null => {
  if (!product.images || product.images.length === 0) {
    return null;
  }

  // Try to get default image first
  const defaultImage = product.images.find(img => img.isDefault);
  if (defaultImage) {
    return defaultImage.url;
  }

  // Try to get card image
  const cardImage = product.images.find(img => img.isCardImage);
  if (cardImage) {
    return cardImage.url;
  }

  // Return first image
  return product.images[0]?.url || null;
};

/**
 * Get product price with discount
 */
export const getProductPrice = (product: Product): { price: number; originalPrice?: number } => {
  if (product.discountInfo && product.discountInfo.isActive) {
    return {
      price: product.discountInfo.finalPrice,
      originalPrice: product.price,
    };
  }

  return {
    price: product.price,
  };
};

/**
 * Check if product is in stock
 */
export const isProductInStock = (product: Product): boolean => {
  return product.quantity > 0;
};

/**
 * Get stock status text key for translation
 */
export const getStockStatusKey = (product: Product): string => {
  if (product.quantity === 0) {
    return 'out_of_stock';
  } else if (product.quantity < 10) {
    return 'low_stock';
  }
  return 'in_stock';
};

/**
 * Variant interface
 */
export interface ProductVariantInput {
  name: string;
  nameAr?: string;
  sku?: string;
  price?: number;
  quantity: number;
  attributes: Record<string, string>;
  isActive?: boolean;
  image?: string;
}

/**
 * Create product data interface
 */
export interface CreateProductData {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  sku?: string;
  categoryId?: string;
  quantity: number;
  enabled?: boolean;
  featured?: boolean;
  images?: any[];
  variants?: ProductVariantInput[];
  variantsRequired?: boolean;
}

/**
 * Create a new product
 */
export const createProduct = async (data: CreateProductData): Promise<Product> => {
  try {
    console.log('Creating product with data:', JSON.stringify(data, null, 2));

    // Prepare product data for React Native app
    // React Native sends pre-uploaded image URLs as an array
    const productData: any = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      quantity: data.quantity,
      isActive: data.enabled !== false,
      featured: data.featured || false,
      trackInventory: true,
      allowOutOfStock: false,
      variantsRequired: data.variantsRequired || false,
    };

    // Add optional fields
    if (data.nameAr) productData.nameAr = data.nameAr;
    if (data.descriptionAr) productData.descriptionAr = data.descriptionAr;
    if (data.sku) productData.sku = data.sku;
    if (data.categoryId) productData.categoryId = data.categoryId;

    // Add images array (pre-uploaded URLs from S3)
    if (data.images && data.images.length > 0) {
      productData.images = data.images;
      console.log('📸 Images being sent:', productData.images);
    }

    // Add variants array
    if (data.variants && data.variants.length > 0) {
      productData.variants = data.variants;
    }

    console.log('Sending product data as JSON');

    const response = await apiPost<{ message: string; data: Product }>('/products', productData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Create product error:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await apiGet<{ message: string; data: Product }>(`/products/${id}`);

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to fetch product');
  } catch (error: any) {
    console.error('Get product by ID error:', error.message);
    throw error;
  }
};

/**
 * Update product data interface
 */
export interface UpdateProductData extends Partial<CreateProductData> {
  // Supports partial updates
}

/**
 * Update an existing product
 */
export const updateProduct = async (
  id: string,
  data: UpdateProductData
): Promise<Product> => {
  try {
    const updateData: any = {};

    // Add fields to update (only if provided)
    if (data.name !== undefined) updateData.name = data.name;
    if (data.nameAr !== undefined) updateData.nameAr = data.nameAr || '';
    if (data.description !== undefined) updateData.description = data.description || '';
    if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr || '';
    if (data.price !== undefined) updateData.price = data.price;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.sku !== undefined) updateData.sku = data.sku || '';
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || '';
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.featured !== undefined) updateData.featured = data.featured;

    // Handle images if provided (pre-uploaded URLs from S3)
    if (data.images && data.images.length > 0) {
      updateData.images = data.images;
      console.log('📸 Images being sent for update:', data.images);
    }

    const response = await apiPut<{ message: string; data: Product }>(
      `/products/${id}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Update product error:', error.message);
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await apiDelete(`/products/${id}`);
  } catch (error: any) {
    console.error('Delete product error:', error.message);
    throw error;
  }
};

/**
 * Toggle product enabled status
 */
export const toggleProductEnabled = async (
  id: string,
  enabled: boolean
): Promise<Product> => {
  try {
    const response = await apiPut<{ message: string; data: Product }>(
      `/products/${id}`,
      { enabled },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Toggle product enabled error:', error.message);
    throw error;
  }
};

/**
 * Duplicate a product
 */
export const duplicateProduct = async (id: string): Promise<Product> => {
  try {
    const response = await apiPost<{ message: string; data: Product }>(
      `/products/${id}/duplicate`
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Duplicate product error:', error.message);
    throw error;
  }
};
