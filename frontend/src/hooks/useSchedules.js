import { useState, useEffect, useCallback } from 'react';
import * as scheduleService from '../services/scheduleService';

export function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await scheduleService.getSchedules();
      setSchedules(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const addSchedule = async (data) => {
    const res = await scheduleService.createSchedule(data);
    setSchedules((prev) => [...prev, res.data.data]);
    return res.data.data;
  };

  const editSchedule = async (id, data) => {
    const res = await scheduleService.updateSchedule(id, data);
    setSchedules((prev) => prev.map((s) => (s.id === id ? res.data.data : s)));
    return res.data.data;
  };

  const removeSchedule = async (id) => {
    await scheduleService.deleteSchedule(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    schedules,
    loading,
    error,
    refreshSchedules: fetchSchedules,
    addSchedule,
    editSchedule,
    removeSchedule,
  };
}
