import useSWR from 'swr';
import * as learningResultService from '../services/learningResultService';

export function useLearningResults(subjectId = null, page = 1) {
  const key = subjectId 
    ? `/learning-results?page=${page}&subject_id=${subjectId}` 
    : `/learning-results?page=${page}`;

  const fetcher = async () => {
    const res = await learningResultService.getLearningResults(page, subjectId);
    return res.data.data; // Returns the paginated object
  };

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true, // Keeps old data while fetching new page/filter
    revalidateOnFocus: false,
  });

  const addResult = async (formData) => {
    const res = await learningResultService.createLearningResult(formData);
    mutate(); // Re-fetch to update list
    return res.data.data;
  };

  const editResult = async (id, formData) => {
    const res = await learningResultService.updateLearningResult(id, formData);
    mutate();
    return res.data.data;
  };

  const removeResult = async (id) => {
    await learningResultService.deleteLearningResult(id);
    mutate();
  };

  return { 
    results: data?.data || [], 
    pagination: data || null,
    loading: isLoading, 
    error: error?.response?.data?.message || error?.message, 
    addResult, 
    editResult, 
    removeResult, 
    refreshResults: mutate 
  };
}
