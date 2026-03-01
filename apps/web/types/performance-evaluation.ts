import { Personnel } from './personnel';

export interface Scores {
  PAA: number;
  KSM: number;
  TS: number;
  CM: number;
  AL: number;
  GO: number;
}

export interface PerformanceEvaluation {
  _id: string;
  personnel: Personnel;
  evaluationDate: string;
  semester: string;
  scores: Scores;
  feedback?: string;
  evaluatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePerformanceEvaluationDto {
  personnel: string;
  evaluationDate: string;
  semester: string;
  scores: Scores;
  feedback?: string;
  evaluatedBy?: string;
}

export interface UpdatePerformanceEvaluationDto
  extends Partial<CreatePerformanceEvaluationDto> {}
