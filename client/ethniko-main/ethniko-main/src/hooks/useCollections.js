import { useQuery } from '@tanstack/react-query';

export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      // Returns curated seasonal lines mapping to occasion tags
      return [
        { id: 'bridal', name: 'Bridal & Wedding', link: '/shop?occasion=Bridal %26 Wedding' },
        { id: 'festive', name: 'Festive & Pujas', link: '/shop?occasion=Festive %26 Pujas' },
        { id: 'cocktail', name: 'Sangeet & Cocktails', link: '/shop?occasion=Sangeet %26 Cocktails' },
      ];
    },
    staleTime: Infinity,
  });
};

export default useCollections;
