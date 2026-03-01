import http from './axios';
import {
  CreateEvaluationFormDto,
  EvaluationForm,
  UpdateEvaluationFormDto,
} from '@/types/evaluation-form';

export const getEvaluationForms = async (): Promise<EvaluationForm[]> => {
  const response = await http.get('/evaluation-forms');
  return response.data;
};

export const getEvaluationForm = async (id: string): Promise<EvaluationForm> => {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const response = await http.get(`/evaluation-forms/${id}`);
  return response.data;
};

export const createEvaluationForm = async (
  data: CreateEvaluationFormDto,
): Promise<EvaluationForm> => {
  const response = await http.post('/evaluation-forms', data);
  return response.data;
};

export const updateEvaluationForm = async (
  id: string,
  data: UpdateEvaluationFormDto,
): Promise<EvaluationForm> => {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const response = await http.patch(`/evaluation-forms/${id}`, data);
  return response.data;
};

export const deleteEvaluationForm = async (id: string): Promise<void> => {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('Evaluation form id is required');
  }
  await http.delete(`/evaluation-forms/${id}`);
};

export const getAvailableEvaluationForms = async (): Promise<EvaluationForm[]> => {
  const response = await http.get('/evaluation-forms/user/available');
  return response.data;
};

export const getAvailableEvaluationForm = async (id: string): Promise<EvaluationForm> => {
  if (!id || id === 'undefined' || id === 'null') {
    throw new Error('Evaluation form id is required');
  }
  const response = await http.get(`/evaluation-forms/user/available/${id}`);
  return response.data;
};
