import http from './axios';
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '@/types/department';

export const getDepartments = async (): Promise<Department[]> => {
  const response = await http.get('/departments');
  return response.data;
};

export const createDepartment = async (
  data: CreateDepartmentDto,
): Promise<Department> => {
  const response = await http.post('/departments', data);
  return response.data;
};

export const updateDepartment = async (
  id: string,
  data: UpdateDepartmentDto,
): Promise<Department> => {
  const response = await http.patch(`/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await http.delete(`/departments/${id}`);
};
