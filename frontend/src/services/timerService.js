import api from '../api/client';

export const getStudySessions = (page = 1) => api.get(`/study-sessions?page=${page}`);
export const createStudySession = (data) => api.post('/study-sessions', data);
export const getStudySummary = () => api.get('/study-sessions/summary');
