import { useQuery } from '@tanstack/react-query';
import { mlApi } from '@/lib/api/ml.api';

/**
 * Hook to get model performance metrics
 */
export function useModelPerformance() {
  return useQuery({
    queryKey: ['ml-analytics-model-performance'],
    queryFn: () => mlApi.getModelPerformance(),
  });
}

/**
 * Hook to get feature importance analysis
 */
export function useFeatureImportance() {
  return useQuery({
    queryKey: ['ml-analytics-feature-importance'],
    queryFn: () => mlApi.getFeatureImportance(),
  });
}

/**
 * Hook to get department insights
 */
export function useDepartmentInsights() {
  return useQuery({
    queryKey: ['ml-analytics-department-insights'],
    queryFn: () => mlApi.getDepartmentInsights(),
  });
}

/**
 * Hook to get accuracy trends over time
 */
export function useAccuracyTrends(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['ml-analytics-accuracy-trends', params],
    queryFn: () => mlApi.getAccuracyTrends(params),
  });
}
