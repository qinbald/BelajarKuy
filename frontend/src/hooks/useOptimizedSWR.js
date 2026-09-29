import useSWR from 'swr';
import client from '../api/client';

const fetcher = (url) => client.get(url).then((res) => res.data);

/**
 * useOptimizedSWR - wrapper SWR bebas render-loop
 * params object -> query string (bukan memory reference)
 * ponytail: simple URLSearchParams, upgrade ke qs lib when nested filter needed
 */
export function useOptimizedSWR(key, params = null, options = {}) {
  const queryString = params
    ? '?' +
      new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      ).toString()
    : '';

  const url = key ? `${key}${queryString}` : null;

  return useSWR(url, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    errorRetryCount: 2,
    dedupingInterval: 5000,
    ...options,
  });
}

export default useOptimizedSWR;
