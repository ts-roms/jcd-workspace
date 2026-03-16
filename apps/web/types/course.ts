export interface Course {
  _id: string;
  name: string;
  code: string;
  department: { _id: string; name: string } | string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  name: string;
  code: string;
  department: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}
