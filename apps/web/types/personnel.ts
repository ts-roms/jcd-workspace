import { Department } from './department';

export interface Personnel {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  department: Department;
  jobTitle?: string;
  hireDate?: string;
  phoneNumber?: string;
  gender?: string;
  personnelType?: 'Teaching' | 'Non-Teaching';
  predictedPerformance?: string;
  performanceStatus?: 'Performing' | 'Non-Performing';
  excellenceStatus?: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Not Evaluated';
  excellenceStartYear?: number;
  excellenceEndYear?: number;
  excellenceThreshold?: number;
  lastExcellenceCalculation?: string;
  sixYearAverage?: number;
  totalSemestersEvaluated?: number;
  // Synced metric averages (Teaching personnel)
  avgPAA?: number;
  avgKSM?: number;
  avgTS?: number;
  avgCM?: number;
  avgAL?: number;
  avgGO?: number;
  // Synced metric averages (Non-Teaching personnel)
  avgJK?: number;
  avgWQ?: number;
  avgPR?: number;
  avgTW?: number;
  avgRL?: number;
  avgIN?: number;
  lastMetricSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonnelDto {
  firstName: string;
  lastName:string;
  middleName?: string;
  email: string;
  department: string;
  jobTitle?: string;
  hireDate?: string;
  phoneNumber?: string;
  gender?: string;
  personnelType?: 'Teaching' | 'Non-Teaching';
}

export interface UpdatePersonnelDto extends Partial<CreatePersonnelDto> {}
