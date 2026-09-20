import client from '../api/client';

export const getAnalytics = () => client.get('/analytics');
