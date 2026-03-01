import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mlApi } from '@/lib/api/ml.api';
import { TrainingConfigDto } from '@/types/ml.types';
import { toast } from 'sonner';
import { useAlert } from '@/lib/contexts/AlertContext';

/**
 * Hook to get training history
 */
export function useTrainingHistory() {
  return useQuery({
    queryKey: ['ml-training-history'],
    queryFn: () => mlApi.getTrainingHistory(),
  });
}

/**
 * Hook to get specific model information
 */
export function useModelInfo(version: string) {
  return useQuery({
    queryKey: ['ml-model-info', version],
    queryFn: () => mlApi.getModelInfo(version),
    enabled: !!version,
  });
}

/**
 * Hook to get current active model
 */
export function useCurrentModel() {
  return useQuery({
    queryKey: ['ml-current-model'],
    queryFn: () => mlApi.getCurrentModel(),
  });
}

/**
 * Hook to train a new model
 */
export function useTrainModel() {
  const queryClient = useQueryClient();
  const alert = useAlert();

  return useMutation({
    mutationFn: (config: TrainingConfigDto) => mlApi.trainModel(config),
    onSuccess: (data) => {
      toast.success(
        `Model training completed! Version: ${data.modelVersion}, Accuracy: ${(data.metrics.accuracy * 100).toFixed(2)}%`
      );
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['ml-training-history'] });
      queryClient.invalidateQueries({ queryKey: ['ml-current-model'] });
      queryClient.invalidateQueries({ queryKey: ['ml-analytics-model-performance'] });
    },
    onError: (error: any) => {
      alert.showError(error.message || 'Failed to train model', {
        title: 'Training Failed',
      });
    },
  });
}
