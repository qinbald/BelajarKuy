import { useOptimizedSWR } from './useOptimizedSWR';

export function useDashboardSummary() {
  const { data, error, isLoading, mutate } = useOptimizedSWR('/dashboard/summary');

  return {
    data: data?.data ?? null,
    isLoading,
    error: error?.response?.data?.message || error?.message || null,
    refetch: mutate,
    mutate,
  };
}
