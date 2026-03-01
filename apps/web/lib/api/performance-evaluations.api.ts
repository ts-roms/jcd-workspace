import http from './axios';
import {
  PerformanceEvaluation,
  CreatePerformanceEvaluationDto,
  UpdatePerformanceEvaluationDto,
} from '@/types/performance-evaluation';

export const getPerformanceEvaluations = async (): Promise<PerformanceEvaluation[]> => {
  const response = await http.get('/performance-evaluations');
  return response.data;
};

export const createPerformanceEvaluation = async (
  data: CreatePerformanceEvaluationDto,
): Promise<PerformanceEvaluation> => {
  const response = await http.post('/performance-evaluations', data);
  return response.data;
};

export const updatePerformanceEvaluation = async (
  id: string,
  data: UpdatePerformanceEvaluationDto,
): Promise<PerformanceEvaluation> => {
  const response = await http.patch(`/performance-evaluations/${id}`, data);
  return response.data;
};

export const deletePerformanceEvaluation = async (id: string): Promise<void> => {
  await http.delete(`/performance-evaluations/${id}`);
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

export const bulkUploadPerformanceEvaluations = async (
  file: File,
): Promise<BulkUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await http.post('/performance-evaluations/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const downloadTemplate = async (): Promise<Blob> => {
  const response = await http.get('/performance-evaluations/download-template', {
    responseType: 'blob',
  });
  return response.data;
};
