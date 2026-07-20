import { useQuery } from '@tanstack/react-query';
import { searchService } from '../services/searchService';

/**
 * Custom hook to search products.
 * @param {string} query Search input
 */
export const useSearch = (query) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchService.search(query),
    enabled: !!query,
  });
};

/**
 * Custom hook to retrieve trending searches list.
 */
export const useTrendingSearches = () => {
  return useQuery({
    queryKey: ['trending-searches'],
    queryFn: () => searchService.getTrendingSearches(),
    staleTime: Infinity,
  });
};

export default useSearch;
