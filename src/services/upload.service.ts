import { apiPost } from './api';

export interface UploadedImage {
  original: {
    fileName: string;
    mimetype: string;
    size: number;
  };
  sizes: {
    thumbnail: {
      url: string;
      fileName: string;
      width: number;
      height: number;
    };
    medium: {
      url: string;
      fileName: string;
      width: number;
      height: number;
    };
    large: {
      url: string;
      fileName: string;
      width: number;
      height: number;
    };
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload single image to S3
 */
export const uploadImage = async (
  imageUri: string,
  folder: string = 'products',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedImage> => {
  try {
    // Get file info from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Create FormData
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);
    formData.append('folder', folder);

    // Upload to backend
    const response = await apiPost<{ message: string; data: UploadedImage }>(
      '/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Upload image error:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload image');
  }
};

/**
 * Upload multiple images to S3
 */
export const uploadMultipleImages = async (
  imageUris: string[],
  folder: string = 'products',
  onProgress?: (index: number, progress: UploadProgress) => void
): Promise<UploadedImage[]> => {
  try {
    if (imageUris.length === 0) {
      throw new Error('No images to upload');
    }

    if (imageUris.length > 10) {
      throw new Error('Maximum 10 images allowed');
    }

    // Create FormData
    const formData = new FormData();

    imageUris.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `image-${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('images', {
        uri: uri,
        type: type,
        name: filename,
      } as any);
    });

    formData.append('folder', folder);

    // Upload to backend
    const response = await apiPost<{ message: string; data: UploadedImage[] }>(
      '/upload/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // Estimate which image is currently uploading
            const currentIndex = Math.min(
              Math.floor((progressEvent.loaded / progressEvent.total) * imageUris.length),
              imageUris.length - 1
            );
            onProgress(currentIndex, {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Upload multiple images error:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload images');
  }
};

/**
 * Validate image before upload
 */
export interface ImageValidationOptions {
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedFormats?: string[];
}

export const validateImage = async (
  imageUri: string,
  options: ImageValidationOptions = {}
): Promise<{ valid: boolean; error?: string }> => {
  const {
    maxSizeMB = 5,
    maxWidth = 4000,
    maxHeight = 4000,
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp'],
  } = options;

  try {
    // Check file extension
    const filename = imageUri.split('/').pop() || '';
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    if (!allowedFormats.includes(extension)) {
      return {
        valid: false,
        error: `Invalid format. Allowed: ${allowedFormats.join(', ')}`,
      };
    }

    // Get file info
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const sizeInMB = blob.size / (1024 * 1024);

    if (sizeInMB > maxSizeMB) {
      return {
        valid: false,
        error: `Image size (${sizeInMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`,
      };
    }

    // Check dimensions using React Native Image API
    const { Image: RNImage } = require('react-native');
    return new Promise((resolve) => {
      RNImage.getSize(
        imageUri,
        (width: number, height: number) => {
          if (width > maxWidth || height > maxHeight) {
            resolve({
              valid: false,
              error: `Image dimensions (${width}x${height}) exceed maximum (${maxWidth}x${maxHeight})`,
            });
          } else {
            resolve({ valid: true });
          }
        },
        (error: any) => {
          resolve({ valid: false, error: 'Failed to load image dimensions' });
        }
      );
    });
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Image validation failed',
    };
  }
};

/**
 * Validate multiple images
 */
export const validateImages = async (
  imageUris: string[],
  options: ImageValidationOptions = {}
): Promise<{ valid: boolean; errors: string[] }> => {
  if (imageUris.length === 0) {
    return { valid: false, errors: ['At least one image is required'] };
  }

  if (imageUris.length > 10) {
    return { valid: false, errors: ['Maximum 10 images allowed'] };
  }

  const errors: string[] = [];

  for (let i = 0; i < imageUris.length; i++) {
    const result = await validateImage(imageUris[i], options);
    if (!result.valid && result.error) {
      errors.push(`Image ${i + 1}: ${result.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Delete image from S3
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    await apiPost('/upload/image', { imageUrl });
  } catch (error: any) {
    console.error('Delete image error:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete image');
  }
};
