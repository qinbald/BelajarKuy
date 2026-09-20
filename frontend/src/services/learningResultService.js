import api from '../api/client';

export const getLearningResults = (page = 1, subjectId = null) => {
  const params = { page };
  if (subjectId) params.subject_id = subjectId;
  return api.get('/learning-results', { params });
};

export const createLearningResult = (formData) => {
  return api.post('/learning-results', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateLearningResult = (id, data) => api.put(`/learning-results/${id}`, data);
export const deleteLearningResult = (id) => api.delete(`/learning-results/${id}`);
