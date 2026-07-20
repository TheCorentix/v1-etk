import { useQuery } from '@tanstack/react-query';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Return static luxury categories mapping to backend prefixes
      return ['ALL', 'WOMEN', 'MEN', 'KIDS'];
    },
    staleTime: Infinity, // Static list, never expires
  });
};

export default useCategories;
