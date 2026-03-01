import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Helper function to remove undefined, null, and empty string values from an object
 * This prevents axios from sending these values as query parameters
 */
export function cleanParams<T extends Record<string, any>>(params: T | undefined): Partial<T> {
  if (!params) return {};
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

// API Response format from NestJS backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Extended request config with retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Global session alert handler - will be set by SessionAlertContext
let globalSessionAlertHandler: ((type: 'device' | 'expired') => void) | null = null;

export const setGlobalSessionAlertHandler = (
  handler: (type: 'device' | 'expired') => void,
) => {
  globalSessionAlertHandler = handler;
};

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A separate instance for token refresh to avoid interceptor recursion
const axiosRefreshInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// Response interceptor for data unwrapping and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Unwrap the NestJS API response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return {
        ...response,
        data: response.data.data ?? response.data,
      };
    }
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

    // Check for session invalidation (logged in from another device)
    if (
      error.response?.status === 401 &&
      errorMessage.includes('logged in from another device')
    ) {
      // Session was invalidated by another login
      if (globalSessionAlertHandler) {
        globalSessionAlertHandler('device');
      } else if (typeof window !== 'undefined') {
        // Fallback to redirect if handler not set
        window.location.href = '/login?reason=device';
      }
      return Promise.reject({
        ...error,
        message: errorMessage,
      });
    }

    // Only try to refresh on 401 errors for non-auth-related endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/me')
    ) {
      originalRequest._retry = true;

      try {
        // Use the clean instance to refresh the token
        await axiosRefreshInstance.post('/auth/refresh');
        // Retry the original request with the main instance
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, just reject the promise. The UI will handle it.
        return Promise.reject(refreshError);
      }
    }

    // Format error response
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default axiosInstance;
