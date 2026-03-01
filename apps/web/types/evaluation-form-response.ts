import type { EvaluationScaleItem } from './evaluation-form';

export interface EvaluationResponseItem {
  section: string;
  item: string;
  score: number;
}

export interface EvaluationFormResponse {
  _id: string;
  form: string;
  respondentName?: string;
  respondentEmail?: string;
  respondentDepartment?: string;
  semester?: string;
  evaluator?: string;
  answers: EvaluationResponseItem[];
  totalScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationFormResponseReportItem {
  section: string;
  item: string;
  respondentCount: number;
  averageScore: number;
  percentage: number;
}

export interface EvaluationFormResponseReport {
  semester: string | null;
  totalResponses: number;
  overallAverageScore: number;
  overallPercentage: number;
  items: EvaluationFormResponseReportItem[];
}

export interface PersonnelSectionItem {
  item: string;
  averageScore: number;
  percentage: number;
  count: number;
}

export interface PersonnelSection {
  section: string;
  items: PersonnelSectionItem[];
  averageScore: number;
  percentage: number;
}

export interface PersonnelSummaryItem {
  name: string;
  department: string;
  responseCount: number;
  totalScore: number;
  averageScore: number;
  percentage: number;
  semesters: string;
  evaluators: string;
  evaluatorCount: number;
  sections: PersonnelSection[];
}

export interface PersonnelSummaryReport {
  semester: string | null;
  totalPersonnel: number;
  totalResponses: number;
  overallAverageScore: number;
  overallPercentage: number;
  personnel: PersonnelSummaryItem[];
}

export interface BulkUploadError {
  row: number;
  message: string;
  data: Record<string, unknown>;
}

export interface BulkUploadResult {
  totalRows: number;
  successfulResponses: number;
  skippedRows: number;
  errors: BulkUploadError[];
}

export interface EvaluationFormResponseTemplate {
  headers: string[];
  scale?: EvaluationScaleItem[];
}

export interface CreateEvaluationFormResponseDto {
  formId: string;
  semester?: string;
  evaluator?: string;
  answers: EvaluationResponseItem[];
}
