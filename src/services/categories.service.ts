import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface CategoryTranslations {
  [languageCode: string]: {
    name?: string;
    description?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  displayOrder: number;
  isActive?: boolean;
  parentId?: string | null;
  settings?: {
    translations?: CategoryTranslations;
  };
  translations?: CategoryTranslations;
  children?: Category[];
  parent?: Category;
  _count?: {
    products: number;
  };
}

export interface CategoriesResponse {
  message: string;
  data: Category[];
}

export interface CategoryResponse {
  message: string;
  data: Category;
}

export interface CreateCategoryData {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  displayOrder?: number;
  parentId?: string;
  translations?: CategoryTranslations;
}

export interface UpdateCategoryData {
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: string | null;
  translations?: CategoryTranslations;
}

/**
 * Get all categories with subcategories hierarchy
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiGet<CategoriesResponse>('/categories');

    if (response.data?.data) {
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    console.error('Get categories error:', error.message);
    throw error;
  }
};

/**
 * Get single category by ID
 */
export const getCategory = async (categoryId: string): Promise<Category> => {
  try {
    const response = await apiGet<CategoryResponse>(`/categories/${categoryId}`);

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to fetch category');
  } catch (error: any) {
    console.error('Get category error:', error.message);
    throw error;
  }
};

/**
 * Create new category
 */
export const createCategory = async (categoryData: CreateCategoryData): Promise<Category> => {
  try {
    const response = await apiPost<CategoryResponse>('/categories', categoryData);

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to create category');
  } catch (error: any) {
    console.error('Create category error:', error.message);
    throw error;
  }
};

/**
 * Update category
 */
export const updateCategory = async (
  categoryId: string,
  categoryData: UpdateCategoryData
): Promise<Category> => {
  try {
    const response = await apiPut<CategoryResponse>(`/categories/${categoryId}`, categoryData);

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to update category');
  } catch (error: any) {
    console.error('Update category error:', error.message);
    throw error;
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await apiDelete(`/categories/${categoryId}`);
  } catch (error: any) {
    console.error('Delete category error:', error.message);
    throw error;
  }
};

/**
 * Toggle category active status
 */
export const toggleCategoryStatus = async (
  categoryId: string,
  isActive: boolean
): Promise<Category> => {
  try {
    const response = await apiPut<CategoryResponse>(`/categories/${categoryId}/status`, {
      isActive,
    });

    if (response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to toggle category status');
  } catch (error: any) {
    console.error('Toggle category status error:', error.message);
    throw error;
  }
};

/**
 * Get category name based on current language
 */
export const getCategoryName = (category: Category, language: string): string => {
  if (language === 'ar' && category.nameAr) {
    return category.nameAr;
  }
  return category.name;
};

/**
 * Get category description based on current language
 */
export const getCategoryDescription = (category: Category, language: string): string => {
  if (language === 'ar' && category.descriptionAr) {
    return category.descriptionAr;
  }
  return category.description || '';
};

/**
 * Count total products in category and subcategories
 * Note: Backend doesn't return _count in getCategories endpoint
 * This function returns 0 for now - product count should be fetched separately if needed
 */
export const getTotalProductsCount = (category: Category): number => {
  // Backend doesn't include _count in categories list endpoint
  // Return 0 or fetch products count separately
  let count = category._count?.products || 0;

  if (category.children) {
    category.children.forEach((child) => {
      count += child._count?.products || 0;
    });
  }

  return count;
};
