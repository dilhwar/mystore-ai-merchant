import { apiGet, apiPost, apiDelete } from './api';

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
  price: number;
  sku?: string;
  quantity: number;
  isActive: boolean;
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
 */
export const getProductName = (product: Product, language: string): string => {
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
  isActive?: boolean;
  featured?: boolean;
  images?: any[];
}

/**
 * Create a new product
 */
export const createProduct = async (data: CreateProductData): Promise<Product> => {
  try {
    const formData = new FormData();

    // Add basic fields
    formData.append('name', data.name);
    if (data.nameAr) formData.append('nameAr', data.nameAr);
    if (data.description) formData.append('description', data.description);
    if (data.descriptionAr) formData.append('descriptionAr', data.descriptionAr);
    formData.append('price', data.price.toString());
    if (data.sku) formData.append('sku', data.sku);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    formData.append('quantity', data.quantity.toString());
    formData.append('isActive', data.isActive !== false ? 'true' : 'false');
    formData.append('featured', data.featured ? 'true' : 'false');
    formData.append('trackInventory', 'true');
    formData.append('allowOutOfStock', 'false');
    formData.append('variantsRequired', 'false');

    // Add images if provided
    if (data.images && data.images.length > 0) {
      data.images.forEach((image: any) => {
        formData.append('images', image);
      });
    }

    const response = await apiPost<{ message: string; data: Product }>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Create product error:', error.message);
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
    const formData = new FormData();

    // Add fields to update (only if provided)
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.nameAr !== undefined) formData.append('nameAr', data.nameAr || '');
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.descriptionAr !== undefined) formData.append('descriptionAr', data.descriptionAr || '');
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.quantity !== undefined) formData.append('quantity', data.quantity.toString());
    if (data.sku !== undefined) formData.append('sku', data.sku || '');
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId || '');
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    if (data.featured !== undefined) formData.append('featured', data.featured.toString());

    // Handle images if provided
    if (data.images && data.images.length > 0) {
      data.images.forEach((image: any) => {
        formData.append('images', image);
      });
    }

    const response = await apiPost<{ message: string; data: Product }>(
      `/products/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
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
 * Toggle product active status
 */
export const toggleProductActive = async (
  id: string,
  isActive: boolean
): Promise<Product> => {
  try {
    const response = await apiPost<{ message: string; data: Product }>(
      `/products/${id}`,
      { isActive },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Toggle product active error:', error.message);
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
