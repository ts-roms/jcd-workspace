import http from './axios';
import {
  NonTeachingEvaluation,
  CreateNonTeachingEvaluationDto,
  UpdateNonTeachingEvaluationDto,
} from '@/types/non-teaching-evaluation';

export const getNonTeachingEvaluations = async (): Promise<NonTeachingEvaluation[]> => {
  const response = await http.get('/non-teaching-evaluations');
  return response.data;
};

export const createNonTeachingEvaluation = async (
  data: CreateNonTeachingEvaluationDto,
): Promise<NonTeachingEvaluation> => {
  const response = await http.post('/non-teaching-evaluations', data);
  return response.data;
};

export const updateNonTeachingEvaluation = async (
  id: string,
  data: UpdateNonTeachingEvaluationDto,
): Promise<NonTeachingEvaluation> => {
  const response = await http.patch(`/non-teaching-evaluations/${id}`, data);
  return response.data;
};

export const deleteNonTeachingEvaluation = async (id: string): Promise<void> => {
  await http.delete(`/non-teaching-evaluations/${id}`);
};

export interface BulkUploadResult {
  totalRows: number;
  successfulPersonnel: number;
  successfulEvaluations: number;
  skippedRows: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data?: any;
  }>;
}

export const bulkUploadNonTeachingEvaluations = async (
  file: File,
): Promise<BulkUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await http.post('/non-teaching-evaluations/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const downloadNonTeachingTemplate = async (): Promise<Blob> => {
  const response = await http.get('/non-teaching-evaluations/download-template', {
    responseType: 'blob',
  });
  return response.data;
};
