import http, { cleanParams } from './axios';
import type {
  BulkUploadResult,
  CreateEvaluationFormResponseDto,
  EvaluationFormResponse,
  EvaluationFormResponseReport,
  PersonnelSummaryReport,
} from '@/types/evaluation-form-response';

export const getEvaluationFormResponses = async (
  formId: string,
  filters?: {
    department?: string;
    semester?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<EvaluationFormResponse[]> => {
  if (!formId || formId === 'undefined' || formId === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const response = await http.get('/evaluation-form-responses', {
    params: { formId, ...cleanParams(filters) },
  });
  return response.data;
};

export const downloadEvaluationFormResponsesTemplate = async (
  formId: string,
): Promise<Blob> => {
  if (!formId || formId === 'undefined' || formId === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const response = await http.get(`/evaluation-form-responses/${formId}/template`, {
    responseType: 'blob',
  });
  return response.data;
};

export const downloadEvaluationFormResponsesExport = async (
  formId: string,
  filters?: {
    department?: string;
    semester?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<Blob> => {
  if (!formId || formId === 'undefined' || formId === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const response = await http.get(`/evaluation-form-responses/${formId}/export`, {
    responseType: 'blob',
    params: cleanParams(filters),
  });
  return response.data;
};

export const getEvaluationFormResponsesReport = async (
  formId: string,
  semester?: string,
): Promise<EvaluationFormResponseReport> => {
  if (!formId || formId === 'undefined' || formId === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const params =
    semester && String(semester).trim()
      ? { semester: String(semester).trim() }
      : {};
  const response = await http.get(`/evaluation-form-responses/${formId}/report`, {
    params,
  });
  return response.data;
};

export const bulkUploadEvaluationFormResponses = async (
  formId: string,
  file: File,
): Promise<BulkUploadResult> => {
  if (!formId || formId === 'undefined' || formId === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const formData = new FormData();
  formData.append('file', file);
  const response = await http.post(`/evaluation-form-responses/${formId}/bulk-upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const submitEvaluationFormResponse = async (
  data: CreateEvaluationFormResponseDto,
): Promise<EvaluationFormResponse> => {
  const response = await http.post('/evaluation-form-responses/submit', data);
  return response.data;
};

export const getMyEvaluationFormResponses = async (): Promise<EvaluationFormResponse[]> => {
  const response = await http.get('/evaluation-form-responses/my-responses');
  return response.data;
};

export const getPersonnelSummaryReport = async (
  formId: string,
  semester?: string,
): Promise<PersonnelSummaryReport> => {
  if (!formId || formId === 'undefined' || formId === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const params =
    semester && String(semester).trim()
      ? { semester: String(semester).trim() }
      : {};
  const response = await http.get(`/evaluation-form-responses/${formId}/personnel-summary`, {
    params,
  });
  return response.data;
};
