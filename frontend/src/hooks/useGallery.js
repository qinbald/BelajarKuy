import { useState, useEffect, useCallback } from 'react';
import * as galleryService from '../services/galleryService';

export function useGallery(tab = 'personal') {
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [userTags, setUserTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'personal') {
        const res = await galleryService.getPersonalGallery();
        setItems(res.data.data);
      } else {
        const res = await galleryService.getRecommendations();
        setItems(res.data.data);
        setUserTags(res.data.user_tags || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat galeri');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await galleryService.getTags();
      setTags(res.data.data);
    } catch (err) {
      // quiet fail for tag options
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchTags();
  }, [fetchItems, fetchTags]);

  const addItem = async (formData) => {
    const res = await galleryService.uploadGalleryItem(formData);
    if (tab === 'personal') {
      setItems((prev) => [res.data.data, ...prev]);
    }
    return res.data.data;
  };

  const removeItem = async (id) => {
    await galleryService.deleteGalleryItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, tags, userTags, loading, error, addItem, removeItem, refreshItems: fetchItems };
}
