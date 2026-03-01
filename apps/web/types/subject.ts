import type { Department } from './department';
import type { Personnel } from './personnel';

export interface Subject {
  _id: string;
  code: string;
  name: string;
  description?: string;
  department: Department | string;
  teacher?: Personnel | string;
  gradeLevel?: string;
  semester?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectDto {
  code: string;
  name: string;
  description?: string;
  department: string;
  teacher?: string;
  gradeLevel?: string;
  semester?: string;
  isActive?: boolean;
}

export interface UpdateSubjectDto extends Partial<CreateSubjectDto> {}
