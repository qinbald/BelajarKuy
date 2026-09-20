import { useState, useEffect, useCallback } from 'react';
import * as todoService from '../services/todoService';

export const useTodos = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await todoService.getTasks(filters);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat tugas');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (data) => {
    const res = await todoService.createTask(data);
    if (res.success) {
      setTasks((prev) => [res.data, ...prev]);
    }
    return res;
  };

  const editTask = async (id, data) => {
    const res = await todoService.updateTask(id, data);
    if (res.success) {
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    }
    return res;
  };

  const removeTask = async (id) => {
    const res = await todoService.deleteTask(id);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
    return res;
  };

  const toggleTask = async (id) => {
    const res = await todoService.toggleTaskComplete(id);
    if (res.success) {
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    }
    return res;
  };

  return {
    tasks,
    loading,
    error,
    refreshTasks: fetchTasks,
    addTask,
    editTask,
    removeTask,
    toggleTask,
  };
};
