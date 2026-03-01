import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mlApi } from '@/lib/api/ml.api';
import {
  MLPrediction,
  PredictionFilters,
  BatchPredictDto,
} from '@/types/ml.types';
import { toast } from 'sonner';
import { useAlert } from '@/lib/contexts/AlertContext';

/**
 * Hook to get all predictions with filters
 */
export function useAllPredictions(filters?: PredictionFilters) {
  return useQuery({
    queryKey: ['ml-predictions', filters],
    queryFn: () => mlApi.getAllPredictions(filters),
  });
}

/**
 * Hook to get prediction history for a specific employee
 */
export function usePredictionHistory(personnelId: string) {
  return useQuery({
    queryKey: ['ml-prediction-history', personnelId],
    queryFn: () => mlApi.getPredictionHistory(personnelId),
    enabled: !!personnelId,
  });
}

/**
 * Hook to get latest prediction for a specific employee
 */
export function useLatestPrediction(personnelId: string) {
  return useQuery({
    queryKey: ['ml-latest-prediction', personnelId],
    queryFn: () => mlApi.getLatestPrediction(personnelId),
    enabled: !!personnelId,
  });
}

/**
 * Hook to predict performance for a single employee
 */
export function usePredictPerformance() {
  const queryClient = useQueryClient();
  const alert = useAlert();

  return useMutation({
    mutationFn: (personnelId: string) => mlApi.predictPerformance(personnelId),
    onSuccess: (data, personnelId) => {
      toast.success('Performance prediction generated successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['ml-predictions'] });
      queryClient.invalidateQueries({ queryKey: ['ml-prediction-history', personnelId] });
      queryClient.invalidateQueries({ queryKey: ['ml-latest-prediction', personnelId] });
    },
    onError: (error: any) => {
      alert.showError(error.message || 'Failed to generate prediction', {
        title: 'Prediction Failed',
      });
    },
  });
}

/**
 * Hook to batch predict performance for multiple employees
 */
export function useBatchPredict() {
  const queryClient = useQueryClient();
  const alert = useAlert();

  return useMutation({
    mutationFn: (data: BatchPredictDto) => mlApi.batchPredict(data),
    onSuccess: (data) => {
      toast.success(`Generated predictions for ${data.length} employees`);
      queryClient.invalidateQueries({ queryKey: ['ml-predictions'] });
      // Invalidate each personnel's prediction history
      data.forEach((prediction) => {
        queryClient.invalidateQueries({
          queryKey: ['ml-prediction-history', prediction.personnel._id],
        });
        queryClient.invalidateQueries({
          queryKey: ['ml-latest-prediction', prediction.personnel._id],
        });
      });
    },
    onError: (error: any) => {
      alert.showError(error.message || 'Failed to generate batch predictions', {
        title: 'Batch Prediction Failed',
      });
    },
  });
}

/**
 * Hook to get all personnel for prediction selection
 */
export function useAllPersonnel(params?: {
  search?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['personnel', params],
    queryFn: () => mlApi.getAllPersonnel(params),
  });
}

/**
 * Hook to get personnel by ID
 */
export function usePersonnel(personnelId: string) {
  return useQuery({
    queryKey: ['personnel', personnelId],
    queryFn: () => mlApi.getPersonnelById(personnelId),
    enabled: !!personnelId,
  });
}
