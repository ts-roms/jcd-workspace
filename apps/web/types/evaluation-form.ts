export type EvaluationAudience = 'teaching' | 'non-teaching';

export interface EvaluationScaleItem {
  value: number;
  label: string;
}

export interface EvaluationSection {
  /** Short code for the section (e.g. PAA, KSM, TS, CM, AL, GO). */
  key?: string;
  title: string;
  items: string[];
}

export interface EvaluationFormDepartment {
  _id: string;
  name: string;
}

export interface EvaluationForm {
  _id: string;
  name: string;
  audience: EvaluationAudience;
  description?: string;
  evaluatorOptions?: string[];
  scale?: EvaluationScaleItem[];
  sections?: EvaluationSection[];
  departments?: EvaluationFormDepartment[];
  semester?: string;
  schoolYear?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvaluationFormDto {
  name: string;
  audience: EvaluationAudience;
  description?: string;
  evaluatorOptions?: string[];
  scale?: EvaluationScaleItem[];
  sections?: EvaluationSection[];
  departments?: string[];
  semester?: string;
  schoolYear?: string;
  endDate?: string;
}

export interface UpdateEvaluationFormDto
  extends Partial<CreateEvaluationFormDto> {}
