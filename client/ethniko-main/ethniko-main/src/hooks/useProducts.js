import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import toast from 'react-hot-toast';

/**
 * Custom hook to fetch a list of products based on query filters.
 * @param {Object} filters Query filter object
 */
export const useProducts = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    keepPreviousData: true,
  });
};

/**
 * Custom hook to fetch a single product by its URL slug.
 * @param {string} slug Product URL slug
 */
export const useProductBySlug = (slug) => {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
  });
};

/**
 * Custom hook to fetch a single product by its ID.
 * @param {string} id Product document ID
 */
export const useProductById = (id) => {
  return useQuery({
    queryKey: ['product', 'id', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

/**
 * Custom hook for administrative product mutations (Create, Update, Delete).
 */
export const useProductMutations = () => {
  const queryClient = useQueryClient();

  // 1. Create Product mutation
  const createMutation = useMutation({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create product.');
    },
  });

  // 2. Update Product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', 'id', data.id]);
      queryClient.invalidateQueries(['product', 'slug', data.slug]);
      toast.success('Product updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product.');
    },
  });

  // 3. Delete Product mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deleted successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete product.');
    },
  });

  return {
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
