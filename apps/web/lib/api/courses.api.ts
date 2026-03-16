import axiosInstance, { ApiResponse, cleanParams } from './axios';
import type { Course, CreateCourseDto, UpdateCourseDto } from '@/types/course';

export const coursesApi = {
  getAll: async (filters?: { departmentId?: string }): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]>>('/courses', {
      params: cleanParams(filters),
    });
    return response.data as unknown as Course[];
  },

  getByDepartment: async (departmentId: string): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]>>('/courses', {
      params: { departmentId },
    });
    return response.data as unknown as Course[];
  },

  getById: async (id: string): Promise<Course> => {
    const response = await axiosInstance.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data as unknown as Course;
  },

  create: async (data: CreateCourseDto): Promise<Course> => {
    const response = await axiosInstance.post<ApiResponse<Course>>('/courses', data);
    return response.data as unknown as Course;
  },

  update: async (id: string, data: UpdateCourseDto): Promise<Course> => {
    const response = await axiosInstance.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data as unknown as Course;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/courses/${id}`);
  },
};
