// ML Prediction Types
export interface PredictionResult {
  performanceScore: number;
  performanceCategory: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';
  confidence: number;
}

export interface RiskFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface Recommendation {
  category: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MLPrediction {
  _id: string;
  personnel: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    department?: {
      _id: string;
      name: string;
    };
  };
  predictionDate: string;
  modelVersion: string;
  prediction: PredictionResult;
  featureImportance?: Record<string, number>;
  riskFactors?: RiskFactor[];
  recommendations?: Recommendation[];
  actualOutcome?: {
    actualScore: number;
    evaluationId: string;
    accuracy: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ML Training Types
export interface TrainingMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
}

export interface HyperParameters {
  learningRate: number;
  epochs: number;
  batchSize: number;
  layers: Array<{ units: number; activation: string }>;
}

export interface MLTrainingData {
  _id: string;
  modelVersion: string;
  trainingDate: string;
  datasetSize: number;
  features: {
    numericFeatures: string[];
    categoricalFeatures: string[];
  };
  targetVariable: string;
  metrics: TrainingMetrics;
  hyperparameters: HyperParameters;
  modelPath: string;
  status: 'training' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface TrainingConfigDto {
  startDate?: string;
  endDate?: string;
  hyperparameters?: {
    learningRate?: number;
    epochs?: number;
    batchSize?: number;
  };
}

export interface TrainingResult {
  modelVersion: string;
  metrics: TrainingMetrics;
  trainingTime: number;
  datasetSize: number;
}

// Analytics Types
export interface ModelPerformanceMetrics {
  currentVersion: string;
  accuracy: number;
  predictionCount: number;
  avgConfidence: number;
  accuracyOverTime: Array<{
    date: string;
    accuracy: number;
  }>;
}

export interface FeatureImportance {
  name: string;
  importance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface DepartmentInsight {
  departmentId: string;
  departmentName: string;
  avgPredictedScore: number;
  employeeCount: number;
  riskLevel: 'high' | 'medium' | 'low';
  distribution: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    poor: number;
  };
}

// Personnel Types (for predictions list)
export interface Personnel {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: {
    _id: string;
    name: string;
  };
  hireDate?: string;
  predictedPerformance?: string;
}

// Batch Prediction Types
export interface BatchPredictDto {
  personnelIds: string[];
}

// Filters
export interface PredictionFilters {
  departmentId?: string;
  performanceCategory?: string;
  minConfidence?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
