/**
 * Axios instance with interceptors for JWT token injection and error handling
 * Handles request/response interceptors, token refresh logic, and standardized error handling
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { config } from '@/config/env';
import { getSecureItem, setSecureItem } from '@/utils/secureStorage';

interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing the token
let isTokenRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  isTokenRefreshing = false;
  failedQueue = [];
};

/**
 * Request interceptor: Add JWT token to authorization header
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getSecureItem('ACCESS_TOKEN');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Debug log for product creation
      if (config.url?.includes('/products') && config.method === 'post') {
        console.log('🚀 [API] Sending POST /products request');
        console.log('🚀 [API] Request data:', JSON.stringify(config.data, null, 2));
        console.log('🚀 [API] Request headers:', config.headers['Content-Type']);
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors and token refresh
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isTokenRefreshing) {
        // Queue the request if token is already being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isTokenRefreshing = true;

      try {
        // Attempt to refresh the token
        const refreshToken = await getSecureItem('REFRESH_TOKEN');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call your token refresh endpoint
        const response = await axios.post<TokenResponse>(
          `${config.API_URL}/auth/refresh`,
          { refreshToken },
          { timeout: config.API_TIMEOUT }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        await setSecureItem('ACCESS_TOKEN', accessToken);
        if (newRefreshToken) {
          await setSecureItem('REFRESH_TOKEN', newRefreshToken);
        }

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - clear tokens and redirect to login
        processQueue(refreshError, '');

        try {
          const { removeSecureItem } = await import('@/utils/secureStorage');
          await removeSecureItem('ACCESS_TOKEN');
          await removeSecureItem('REFRESH_TOKEN');
        } catch (e) {
          console.error('Error clearing tokens:', e);
        }

        // Emit logout event or dispatch action
        // This should be handled by your auth store or middleware
        return Promise.reject(new Error('Authentication failed. Please login again.'));
      }
    }

    // Handle other error status codes
    if (error.response?.status === 403) {
      return Promise.reject(new Error('You do not have permission to access this resource.'));
    }

    if (error.response?.status === 404) {
      return Promise.reject(new Error('The requested resource was not found.'));
    }

    // For 500 errors, try to get the actual error message from the server
    if (error.response?.status === 500) {
      const serverMessage = error.response?.data?.message || error.message;
      return Promise.reject(new Error(serverMessage || 'Server error. Please try again later.'));
    }

    // Default error handling
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Helper function to make GET requests
 */
export const apiGet = async <T = any,>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.get<T>(url, config);
};

/**
 * Helper function to make POST requests
 */
export const apiPost = async <T = any,>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.post<T>(url, data, config);
};

/**
 * Helper function to make PUT requests
 */
export const apiPut = async <T = any,>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.put<T>(url, data, config);
};

/**
 * Helper function to make PATCH requests
 */
export const apiPatch = async <T = any,>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.patch<T>(url, data, config);
};

/**
 * Helper function to make DELETE requests
 */
export const apiDelete = async <T = any,>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.delete<T>(url, config);
};

export default api;
