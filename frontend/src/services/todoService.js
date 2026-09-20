import client from '../api/client';

export const getTasks = async (params = {}) => {
  const res = await client.get('/tasks', { params });
  return res.data;
};

export const createTask = async (data) => {
  const res = await client.post('/tasks', data);
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await client.put(`/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await client.delete(`/tasks/${id}`);
  return res.data;
};

export const toggleTaskComplete = async (id) => {
  const res = await client.patch(`/tasks/${id}/toggle`);
  return res.data;
};
