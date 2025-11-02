import { apiPost } from './api';

export interface GenerateContentParams {
  imageUrl: string;
  productName?: string;
  category?: string;
  language: string;
  type: 'name' | 'description';
  dashboardLanguage?: string;
}

export interface GenerateAllContentParams {
  imageUrl: string;
  category?: string;
  language: string;
  dashboardLanguage?: string;
}

export interface AIUsage {
  current: number;
  limit: number;
  remaining: number;
  resetAt: string;
}

export interface GenerateContentResponse {
  success: boolean;
  message: string;
  data: {
    content: string;
    aiUsage: AIUsage;
  };
}

export interface GenerateAllContentResponse {
  success: boolean;
  message: string;
  data: {
    name: string;
    description: string;
    aiUsage: AIUsage;
  };
}

/**
 * Generate specific product content (name or description)
 */
export const generateProductContent = async (
  params: GenerateContentParams
): Promise<GenerateContentResponse['data']> => {
  try {
    const response = await apiPost<GenerateContentResponse>('/ai/generate-product-content', {
      imageUrl: params.imageUrl,
      productName: params.productName,
      category: params.category,
      language: params.language,
      type: params.type,
      dashboardLanguage: params.dashboardLanguage || params.language,
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Generate content error:', error);
    throw error;
  }
};

/**
 * Generate all product content at once (name + description)
 */
export const generateAllProductContent = async (
  params: GenerateAllContentParams
): Promise<GenerateAllContentResponse['data']> => {
  try {
    const response = await apiPost<GenerateAllContentResponse>('/ai/generate-all-content', {
      imageUrl: params.imageUrl,
      category: params.category,
      language: params.language,
      dashboardLanguage: params.dashboardLanguage || params.language,
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Generate all content error:', error);
    throw error;
  }
};

/**
 * Generate content for all store languages dynamically
 * This is the CORRECT way - generates based on actual store languages
 *
 * @param imageUri - Local image URI
 * @param storeLanguages - Array of store languages from authStore
 * @param category - Optional category ID
 * @param dashboardLanguage - Dashboard language for error messages
 * @returns Object with generated content for each language
 *
 * Example:
 * storeLanguages = ['fr', 'es']
 * Returns: { fr: { name: '...', description: '...' }, es: { name: '...', description: '...' } }
 */
export const generateAllContentWithImage = async (params: {
  imageUri: string;
  category?: string;
  storeLanguages: string[];
  dashboardLanguage?: string;
}): Promise<Record<string, { name: string; description: string }>> => {
  try {
    const { imageUri, category, storeLanguages, dashboardLanguage } = params;

    // For Mobile: We're using imageUri directly
    // In production, this should be uploaded to S3 first to get a URL
    // For now, backend needs to handle local URIs or we use a different approach

    const results: Record<string, { name: string; description: string }> = {};

    // Generate content for each language
    for (const lang of storeLanguages) {
      try {
        const content = await generateAllProductContent({
          imageUrl: imageUri, // TODO: Upload to S3 first in production
          category,
          language: lang,
          dashboardLanguage: dashboardLanguage || lang,
        });

        results[lang] = {
          name: content.name,
          description: content.description,
        };
      } catch (error) {
        console.error(`Failed to generate content for ${lang}:`, error);
        // Continue with other languages even if one fails
        results[lang] = {
          name: '',
          description: '',
        };
      }
    }

    return results;
  } catch (error: any) {
    console.error('Generate all content with image error:', error);
    throw error;
  }
};
