import client from '../api/client';

export const getDashboardSummary = () => client.get('/dashboard/summary');
