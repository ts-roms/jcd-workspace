import axiosInstance, { ApiResponse, cleanParams } from './axios';
import type { Subject, CreateSubjectDto, UpdateSubjectDto } from '@/types/subject';

export const subjectsApi = {
  /**
   * Get all subjects with optional filters
   */
  getAll: async (filters?: { departmentId?: string; gradeLevel?: string }): Promise<Subject[]> => {
    const response = await axiosInstance.get<ApiResponse<Subject[]>>('/subjects', {
      params: cleanParams(filters),
    });
    return response.data as unknown as Subject[];
  },

  /**
   * Get subjects by department and grade level
   */
  getByDepartmentAndGrade: async (departmentId: string, gradeLevel?: string): Promise<Subject[]> => {
    const response = await axiosInstance.get<ApiResponse<Subject[]>>('/subjects', {
      params: cleanParams({ departmentId, gradeLevel }),
    });
    return response.data as unknown as Subject[];
  },

  /**
   * Get subject by ID
   */
  getById: async (id: string): Promise<Subject> => {
    const response = await axiosInstance.get<ApiResponse<Subject>>(`/subjects/${id}`);
    return response.data as unknown as Subject;
  },

  /**
   * Create new subject
   */
  create: async (data: CreateSubjectDto): Promise<Subject> => {
    const response = await axiosInstance.post<ApiResponse<Subject>>('/subjects', data);
    return response.data as unknown as Subject;
  },

  /**
   * Update subject
   */
  update: async (id: string, data: UpdateSubjectDto): Promise<Subject> => {
    const response = await axiosInstance.put<ApiResponse<Subject>>(`/subjects/${id}`, data);
    return response.data as unknown as Subject;
  },

  /**
   * Delete subject
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/subjects/${id}`);
  },
};
