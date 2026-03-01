import axiosInstance, { ApiResponse } from './axios';
import { Role } from './roles.api';

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles: Role[];
  permissions: string[];
  department?: { _id: string; name: string };
  studentId?: string;
  gradeLevel?: string;
  adviser?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginDto): Promise<{ user: User }> => {
    const response = await axiosInstance.post<ApiResponse<{ user: User }>>(
      '/auth/login',
      credentials
    );
    return response.data as unknown as { user: User };
  },

  /**
   * Register new user
   */
  register: async (data: RegisterDto): Promise<{ user: User }> => {
    const response = await axiosInstance.post<ApiResponse<{ user: User }>>(
      '/auth/register',
      data
    );
    return response.data as unknown as { user: User };
  },

  /**
   * Get current user
   */
  me: async (): Promise<{ user: User }> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data as unknown as { user: User };
  },

  /**
   * Refresh access token
   */
  refresh: async (): Promise<{ user: User }> => {
    const response = await axiosInstance.post<ApiResponse<{ user: User }>>('/auth/refresh');
    return response.data as unknown as { user: User };
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
