import { useState, useEffect, useCallback } from 'react';
import * as learningResultService from '../services/learningResultService';

export function useLearningResults(subjectId = null) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await learningResultService.getLearningResults(1, subjectId);
      setResults(res.data.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat hasil belajar');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const addResult = async (formData) => {
    const res = await learningResultService.createLearningResult(formData);
    setResults((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  const editResult = async (id, data) => {
    const res = await learningResultService.updateLearningResult(id, data);
    setResults((prev) => prev.map((r) => (r.id === id ? res.data.data : r)));
    return res.data.data;
  };

  const removeResult = async (id) => {
    await learningResultService.deleteLearningResult(id);
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  return { results, loading, error, addResult, editResult, removeResult, refreshResults: fetchResults };
}
