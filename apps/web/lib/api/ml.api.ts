import axiosInstance, { ApiResponse, cleanParams } from './axios';
import {
  MLPrediction,
  MLTrainingData,
  TrainingConfigDto,
  TrainingResult,
  ModelPerformanceMetrics,
  FeatureImportance,
  DepartmentInsight,
  Personnel,
  BatchPredictDto,
  PredictionFilters,
} from '@/types/ml.types';

export const mlApi = {
  // ============= Predictions =============

  /**
   * Get all predictions with filters
   */
  getAllPredictions: async (filters?: PredictionFilters): Promise<{
    predictions: MLPrediction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const response = await axiosInstance.get<ApiResponse>('/ml/predictions', {
      params: cleanParams(filters),
    });
    return response.data as any;
  },

  /**
   * Predict performance for a single employee
   */
  predictPerformance: async (personnelId: string): Promise<MLPrediction> => {
    const response = await axiosInstance.post<ApiResponse<MLPrediction>>(
      `/ml/predict/${personnelId}`
    );
    return response.data as unknown as MLPrediction;
  },

  /**
   * Batch predict performance for multiple employees
   */
  batchPredict: async (data: BatchPredictDto): Promise<MLPrediction[]> => {
    const response = await axiosInstance.post<ApiResponse<MLPrediction[]>>(
      '/ml/predict/batch',
      data
    );
    return response.data as unknown as MLPrediction[];
  },

  /**
   * Get prediction history for a specific employee
   */
  getPredictionHistory: async (personnelId: string): Promise<MLPrediction[]> => {
    const response = await axiosInstance.get<ApiResponse<MLPrediction[]>>(
      `/ml/predictions/history/${personnelId}`
    );
    return response.data as unknown as MLPrediction[];
  },

  /**
   * Get latest prediction for a specific employee
   */
  getLatestPrediction: async (personnelId: string): Promise<MLPrediction | null> => {
    const response = await axiosInstance.get<ApiResponse<MLPrediction | null>>(
      `/ml/predictions/latest/${personnelId}`
    );
    return response.data as unknown as MLPrediction | null;
  },

  // ============= Training =============

  /**
   * Train a new model
   */
  trainModel: async (config: TrainingConfigDto): Promise<TrainingResult> => {
    const response = await axiosInstance.post<ApiResponse<TrainingResult>>(
      '/ml/train',
      config
    );
    return response.data as unknown as TrainingResult;
  },

  /**
   * Get training history
   */
  getTrainingHistory: async (): Promise<MLTrainingData[]> => {
    const response = await axiosInstance.get<ApiResponse<MLTrainingData[]>>(
      '/ml/training-history'
    );
    return response.data as unknown as MLTrainingData[];
  },

  /**
   * Get specific model information
   */
  getModelInfo: async (version: string): Promise<MLTrainingData> => {
    const response = await axiosInstance.get<ApiResponse<MLTrainingData>>(
      `/ml/models/${version}`
    );
    return response.data as unknown as MLTrainingData;
  },

  /**
   * Get current active model information
   */
  getCurrentModel: async (): Promise<MLTrainingData> => {
    const response = await axiosInstance.get<ApiResponse<MLTrainingData>>(
      '/ml/models/current'
    );
    return response.data as unknown as MLTrainingData;
  },

  // ============= Analytics =============

  /**
   * Get model performance metrics
   */
  getModelPerformance: async (): Promise<ModelPerformanceMetrics> => {
    const response = await axiosInstance.get<ApiResponse<ModelPerformanceMetrics>>(
      '/ml/analytics/model-performance'
    );
    return response.data as unknown as ModelPerformanceMetrics;
  },

  /**
   * Get feature importance analysis
   */
  getFeatureImportance: async (): Promise<FeatureImportance[]> => {
    const response = await axiosInstance.get<ApiResponse<FeatureImportance[]>>(
      '/ml/analytics/feature-importance'
    );
    return response.data as unknown as FeatureImportance[];
  },

  /**
   * Get department-wise insights
   */
  getDepartmentInsights: async (): Promise<DepartmentInsight[]> => {
    const response = await axiosInstance.get<ApiResponse<DepartmentInsight[]>>(
      '/ml/analytics/department-insights'
    );
    return response.data as unknown as DepartmentInsight[];
  },

  /**
   * Get prediction accuracy trends
   */
  getAccuracyTrends: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Array<{ date: string; accuracy: number; count: number }>> => {
    const response = await axiosInstance.get<ApiResponse>(
      '/ml/analytics/accuracy-trends',
      { params }
    );
    return response.data as any;
  },

  // ============= Personnel (for predictions UI) =============

  /**
   * Get all personnel for prediction selection
   */
  getAllPersonnel: async (params?: {
    search?: string;
    departmentId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    personnel: Personnel[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const response = await axiosInstance.get<ApiResponse>('/personnel', {
      params,
    });
    return response.data as any;
  },

  /**
   * Get personnel by ID
   */
  getPersonnelById: async (id: string): Promise<Personnel> => {
    const response = await axiosInstance.get<ApiResponse<Personnel>>(
      `/personnel/${id}`
    );
    return response.data as unknown as Personnel;
  },

  /**
   * Check if a prediction already exists for a personnel and semester
   */
  checkExistingPrediction: async (
    personnelId: string,
    semester: string,
  ): Promise<{ exists: boolean; evaluation?: any }> => {
    const response = await axiosInstance.get('/ml/check-prediction', {
      params: { personnelId, semester },
    });
    return response.data;
  },
};
