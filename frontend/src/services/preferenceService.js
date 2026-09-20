import client from '../api/client';

export const getPreferences = () => client.get('/preferences');

export const savePreferences = (data) => client.post('/preferences', data);
