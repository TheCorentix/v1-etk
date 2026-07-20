import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

/**
 * Custom hook to retrieve the current customer's order history.
 */
export const useUserOrders = () => {
  return useQuery({
    queryKey: ['user-orders'],
    queryFn: () => userService.getUserOrders(),
  });
};

/**
 * Custom hook to retrieve all store orders (Admin only).
 */
export const useAdminOrders = (page, limit) => {
  return useQuery({
    queryKey: ['admin-orders', { page, limit }],
    queryFn: () => userService.getAllOrders(page, limit),
  });
};

/**
 * Custom hook for checkout order creations and payments verify checks.
 */
export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  // 1. Create Checkout Order
  const createMutation = useMutation({
    mutationFn: (orderData) => userService.createOrder(orderData),
    onError: (error) => {
      toast.error(error.message || 'Failed to initialize order checkout.');
    },
  });

  // 2. Verify Payment signature
  const verifyPaymentMutation = useMutation({
    mutationFn: (paymentDetails) => userService.verifyPayment(paymentDetails),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-orders']);
      toast.success('Payment verified! Order placed successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify transaction payment.');
    },
  });

  // 3. Update Order Status (Admin only)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }) => userService.updateOrderStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order status updated successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order status.');
    },
  });

  // 4. Add Courier Tracking ID (Admin only)
  const addTrackingMutation = useMutation({
    mutationFn: ({ id, trackingNumber }) => userService.addOrderTracking(id, trackingNumber),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Tracking number assigned successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save tracking number.');
    },
  });

  return {
    createOrder: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    verifyPayment: verifyPaymentMutation.mutateAsync,
    isVerifying: verifyPaymentMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    addTracking: addTrackingMutation.mutateAsync,
    isAddingTracking: addTrackingMutation.isPending,
  };
};
