import client from '../api/client';

export const getPersonalGallery = () => client.get('/gallery');

export const getRecommendations = () => client.get('/gallery/recommendations');

export const getExternalGallery = (query = 'study aesthetic', source = 'all') => 
  client.get(`/gallery/external?query=${encodeURIComponent(query)}&source=${source}`);

export const getTags = () => client.get('/gallery/tags');

export const uploadGalleryItem = (formData) => 
  client.post('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteGalleryItem = (id) => client.delete(`/gallery/${id}`);
