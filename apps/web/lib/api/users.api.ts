import axiosInstance, { ApiResponse, cleanParams } from './axios';
import { Role } from './roles.api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  department?: string | { _id: string; name: string };
  studentId?: string;
  gradeLevel?: string;
  semester?: string;
  adviser?: string;
  course?: string;
  enrolledSubjects?: string[] | { _id: string; name: string; code: string }[];
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  roles?: string[];
  department?: string;
  studentId?: string;
  gradeLevel?: string;
  semester?: string;
  adviser?: string;
  course?: string;
  enrolledSubjects?: string[];
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = {
  /**
   * Get all users with pagination and filters
   */
  getAll: async (filters?: UserFilters): Promise<PaginatedUsers> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedUsers>>('/users', {
      params: cleanParams(filters),
    });
    return response.data as unknown as PaginatedUsers;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<{ user: User }> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data as unknown as { user: User };
  },

  /**
   * Create new user
   */
  create: async (data: CreateUserDto): Promise<{ user: User }> => {
    const response = await axiosInstance.post<ApiResponse<{ user: User }>>('/users', data);
    return response.data as unknown as { user: User };
  },

  /**
   * Update user
   */
  update: async (id: string, data: UpdateUserDto): Promise<{ user: User }> => {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(`/users/${id}`, data);
    return response.data as unknown as { user: User };
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  /**
   * Assign roles to user
   */
  assignRoles: async (id: string, roleIds: string[]): Promise<{ user: User }> => {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(`/users/${id}/roles`, {
      roleIds,
    });
    return response.data as unknown as { user: User };
  },

  /**
   * Promote a single student to the next semester/year level
   */
  promoteStudent: async (id: string): Promise<{ status: string; gradeLevel: string; semester: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ status: string; gradeLevel: string; semester: string }>>(`/users/${id}/promote`);
    return response.data as unknown as { status: string; gradeLevel: string; semester: string };
  },

  /**
   * Promote all students to the next semester/year level
   */
  promoteStudents: async (): Promise<{ promoted: number; graduated: number }> => {
    const response = await axiosInstance.post<ApiResponse<{ promoted: number; graduated: number }>>('/users/promote-students');
    return response.data as unknown as { promoted: number; graduated: number };
  },

  updateMyProfile: async (
    id: string,
    data: Pick<UpdateUserDto, 'department' | 'studentId' | 'gradeLevel' | 'semester' | 'adviser' | 'course' | 'enrolledSubjects'>,
  ): Promise<{ user: User }> => {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(`/users/${id}`, data);
    return response.data as unknown as { user: User };
  },
};
