import { Personnel } from './personnel';

export interface NonTeachingScores {
  JK: number; // Job Knowledge
  WQ: number; // Work Quality
  PR: number; // Productivity
  TW: number; // Teamwork
  RL: number; // Reliability
  IN: number; // Initiative
}

export interface NonTeachingEvaluation {
  _id: string;
  personnel: Personnel;
  evaluationDate: string;
  semester: string;
  scores: NonTeachingScores;
  feedback?: string;
  evaluatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNonTeachingEvaluationDto {
  personnel: string;
  evaluationDate: string;
  semester: string;
  scores: NonTeachingScores;
  feedback?: string;
  evaluatedBy?: string;
}

export interface UpdateNonTeachingEvaluationDto
  extends Partial<CreateNonTeachingEvaluationDto> {}
