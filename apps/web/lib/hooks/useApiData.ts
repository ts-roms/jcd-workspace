import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import axiosInstance from '@/lib/api/axios';
import { ApiState } from '@/types/ui.types';

interface UseApiDataOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApiData<T>(
  queryKey: string | (string | number)[],
  url: string,
  options: UseApiDataOptions<T> = {}
): ApiState<T> & {
  refetch: () => void;
  setData: (data: T | null) => void;
} {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const { data, error, isLoading, refetch } = useQuery<T, Error>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      const response = await axiosInstance.get(url);
      // After interceptor, response.data is already unwrapped
      return response.data;
    },
  });

  // Handle success callback
  useEffect(() => {
    if (data && onSuccess) {
      onSuccess(data);
    }
  }, [data, onSuccess]);

  // Handle error callback
  useEffect(() => {
    if (error && onError) {
      const axiosError = error as Error & {
        response?: {
          data?: {
            error?: {
              message?: string;
            };
          };
        };
      };
      const errorMessage =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'An error occurred';
      onError(errorMessage);
    }
  }, [error, onError]);

  const setData = (newData: T | null) => {
    queryClient.setQueryData(Array.isArray(queryKey) ? queryKey : [queryKey], newData);
  };

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch: () => {
      refetch();
    },
    setData,
  };
}
