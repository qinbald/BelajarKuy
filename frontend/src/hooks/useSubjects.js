import { useState, useEffect, useCallback } from 'react';
import * as subjectService from '../services/subjectService';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subjectService.getSubjects();
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat mata pelajaran');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const addSubject = async (data) => {
    const res = await subjectService.createSubject(data);
    if (res.success) {
      setSubjects((prev) => [...prev, res.data]);
    }
    return res;
  };

  const editSubject = async (id, data) => {
    const res = await subjectService.updateSubject(id, data);
    if (res.success) {
      setSubjects((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    }
    return res;
  };

  const removeSubject = async (id) => {
    const res = await subjectService.deleteSubject(id);
    if (res.success) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    }
    return res;
  };

  return {
    subjects,
    loading,
    error,
    refreshSubjects: fetchSubjects,
    addSubject,
    editSubject,
    removeSubject,
  };
};
