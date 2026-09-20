import client from '../api/client';

export const adminService = {
  getStats: async () => {
    const response = await client.get('/admin/stats');
    return response.data.data;
  },
  getUsers: async () => {
    const response = await client.get('/admin/users');
    return response.data.data;
  },
  toggleUserStatus: async (id) => {
    const response = await client.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },
  getReports: async () => {
    const response = await client.get('/admin/reports');
    return response.data.data;
  },
  updateReportStatus: async (id, data) => {
    const response = await client.patch(`/admin/reports/${id}`, data);
    return response.data;
  }
};
