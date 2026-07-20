import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lookbookService } from '../services/lookbookService';
import toast from 'react-hot-toast';

/**
 * Custom hook to retrieve paginated list of lookbooks.
 */
export const useLookbooks = (page, limit) => {
  return useQuery({
    queryKey: ['lookbooks', { page, limit }],
    queryFn: () => lookbookService.getLookbooks(page, limit),
    keepPreviousData: true,
  });
};

/**
 * Custom hook to retrieve a specific lookbook details.
 */
export const useLookbookById = (id) => {
  return useQuery({
    queryKey: ['lookbook', id],
    queryFn: () => lookbookService.getLookbookById(id),
    enabled: !!id,
  });
};

/**
 * Custom hook for lookbook mutations (Create, Update, Delete).
 */
export const useLookbookMutations = () => {
  const queryClient = useQueryClient();

  // 1. Create Lookbook mutation
  const createMutation = useMutation({
    mutationFn: (formData) => lookbookService.createLookbook(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['lookbooks']);
      toast.success('Lookbook video published successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to publish lookbook.');
    },
  });

  // 2. Update Lookbook hotspot tags
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => lookbookService.updateLookbook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lookbooks']);
      toast.success('Lookbook hotspot tags updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update lookbook tags.');
    },
  });

  // 3. Delete Lookbook post
  const deleteMutation = useMutation({
    mutationFn: (id) => lookbookService.deleteLookbook(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lookbooks']);
      toast.success('Lookbook deleted successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete lookbook.');
    },
  });

  return {
    createLookbook: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateLookbook: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteLookbook: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
