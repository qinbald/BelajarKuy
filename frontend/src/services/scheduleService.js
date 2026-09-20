import api from '../api/client';

export const getSchedules = () => api.get('/schedules');
export const createSchedule = (data) => api.post('/schedules', data);
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);
