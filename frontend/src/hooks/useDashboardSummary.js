import { useState, useEffect, useCallback } from 'react';
import { getDashboardSummary } from '../services/dashboardService';

export function useDashboardSummary() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDashboardSummary();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, isLoading, error, refetch: fetchSummary };
}
