import axiosInstance, { ApiResponse } from './axios';

export interface Permission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'view' | 'manage' | 'execute' | 'export';
  category: string;
  isSystemPermission?: boolean;
}

export const permissionsApi = {
  /**
   * Create a new permission
   */
  create: async (data: CreatePermissionDto): Promise<{ permission: Permission }> => {
    const response = await axiosInstance.post<ApiResponse<{ permission: Permission }>>(
      '/permissions',
      data
    );
    return response.data as unknown as { permission: Permission };
  },

  /**
   * Get all permissions
   */
  getAll: async (grouped?: boolean): Promise<{ permissions: Permission[] | Record<string, Permission[]> }> => {
    const response = await axiosInstance.get<ApiResponse<{ permissions: Permission[] | Record<string, Permission[]> }>>(
      '/permissions',
      {
        params: grouped ? { grouped: 'true' } : undefined,
      }
    );
    return response.data as unknown as { permissions: Permission[] | Record<string, Permission[]> };
  },

  /**
   * Get permission by ID
   */
  getById: async (id: string): Promise<{ permission: Permission }> => {
    const response = await axiosInstance.get<ApiResponse<{ permission: Permission }>>(`/permissions/${id}`);
    return response.data as unknown as { permission: Permission };
  },
};
