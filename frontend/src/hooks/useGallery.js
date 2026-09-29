import useSWR from 'swr';
import * as galleryService from '../services/galleryService';
import client from '../api/client';

const fetcher = (url) => client.get(url).then((res) => res.data);

export function useGallery(tab = 'personal', page = 1) {
  const endpoint = tab === 'personal' ? `/gallery?page=${page}` : `/gallery/recommendations?page=${page}`;
  
  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const { data: tagsData } = useSWR('/gallery/tags', fetcher, {
    revalidateOnFocus: false,
  });

  const addItem = async (formData) => {
    const res = await galleryService.uploadGalleryItem(formData);
    mutate(); // Revalidate list
    return res.data.data;
  };

  const removeItem = async (id) => {
    await galleryService.deleteGalleryItem(id);
    mutate(); // Revalidate list
  };

  return {
    items: data?.data || [],
    meta: data?.meta || null,
    tags: tagsData?.data || [],
    userTags: data?.user_tags || [],
    loading: isLoading,
    error: error?.response?.data?.message || (error ? 'Gagal memuat galeri' : null),
    addItem,
    removeItem,
    refreshItems: mutate,
  };
}
