import client from '../api/client';

export const getSubjects = async () => {
  const res = await client.get('/subjects');
  return res.data;
};

export const createSubject = async (data) => {
  const res = await client.post('/subjects', data);
  return res.data;
};

export const updateSubject = async (id, data) => {
  const res = await client.put(`/subjects/${id}`, data);
  return res.data;
};

export const deleteSubject = async (id) => {
  const res = await client.delete(`/subjects/${id}`);
  return res.data;
};
