import { useOptimizedSWR } from './useOptimizedSWR';
import * as gradeService from '../services/gradeService';

export function useGrades(filters = {}) {
  const { data, error, isLoading, mutate } = useOptimizedSWR('/grades', filters);

  const grades = data?.data?.grades || [];
  const summary = data?.data?.summary || [];

  const addGrade = async (payload) => {
    const res = await gradeService.createGrade(payload);
    mutate(); // trigger re-fetch
    return res.data.data;
  };

  const editGrade = async (id, payload) => {
    const res = await gradeService.updateGrade(id, payload);
    mutate(); // trigger re-fetch
    return res.data.data;
  };

  const removeGrade = async (id) => {
    await gradeService.deleteGrade(id);
    mutate(); // trigger re-fetch
  };

  return { grades, summary, loading: isLoading, error, addGrade, editGrade, removeGrade, refreshGrades: mutate };
}
