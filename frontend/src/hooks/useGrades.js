import { useState, useEffect, useCallback } from 'react';
import * as gradeService from '../services/gradeService';

export function useGrades(filters = {}) {
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gradeService.getGrades(filters);
      setGrades(res.data.data.grades);
      setSummary(res.data.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat nilai');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const addGrade = async (data) => {
    const res = await gradeService.createGrade(data);
    setGrades((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  const editGrade = async (id, data) => {
    const res = await gradeService.updateGrade(id, data);
    setGrades((prev) => prev.map((g) => (g.id === id ? res.data.data : g)));
    return res.data.data;
  };

  const removeGrade = async (id) => {
    await gradeService.deleteGrade(id);
    setGrades((prev) => prev.filter((g) => g.id !== id));
  };

  return { grades, summary, loading, error, addGrade, editGrade, removeGrade, refreshGrades: fetchGrades };
}
