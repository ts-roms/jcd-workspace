import axiosInstance, { ApiResponse } from './axios';
import { Permission } from './permissions.api';

export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  hierarchy: number;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  hierarchy: number;
  permissions?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  displayName?: string;
  description?: string;
  hierarchy?: number;
  permissions?: string[];
}

export const rolesApi = {
  /**
   * Get all roles
   */
  getAll: async (): Promise<{ roles: Role[] }> => {
    const response = await axiosInstance.get<ApiResponse<{ roles: Role[] }>>('/roles');
    return response.data as unknown as { roles: Role[] };
  },

  /**
   * Get role by ID
   */
  getById: async (id: string): Promise<{ role: Role }> => {
    const response = await axiosInstance.get<ApiResponse<{ role: Role }>>(`/roles/${id}`);
    return response.data as unknown as { role: Role };
  },

  /**
   * Create new role
   */
  create: async (data: CreateRoleDto): Promise<{ role: Role }> => {
    const response = await axiosInstance.post<ApiResponse<{ role: Role }>>('/roles', data);
    return response.data as unknown as { role: Role };
  },

  /**
   * Update role
   */
  update: async (id: string, data: UpdateRoleDto): Promise<{ role: Role }> => {
    const response = await axiosInstance.put<ApiResponse<{ role: Role }>>(`/roles/${id}`, data);
    return response.data as unknown as { role: Role };
  },

  /**
   * Delete role
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/roles/${id}`);
  },
};
