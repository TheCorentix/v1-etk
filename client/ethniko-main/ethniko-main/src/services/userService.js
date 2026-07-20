import api from '../api/api';

export const userService = {
  /**
   * Retrieves the current logged-in user profile from the backend.
   */
  getUserProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.user;
  },

  /**
   * Updates profile metadata.
   */
  updateUserProfile: async (profileData) => {
    // Return updated data as local sync since Firebase Claims represent source of truth
    return {
      ...profileData,
    };
  },

  /**
   * Appends a shipping address card to the user's registry.
   */
  addAddress: async (address) => {
    const response = await api.post('/auth/addresses', address);
    // Refresh and return the complete updated address list
    const profile = await userService.getUserProfile();
    return profile.addresses || [];
  },

  /**
   * Removes a shipping address card from the user's registry.
   */
  deleteAddress: async (addressId) => {
    await api.delete(`/auth/addresses/${addressId}`);
    // Refresh and return the complete updated address list
    const profile = await userService.getUserProfile();
    return profile.addresses || [];
  },

  /**
   * Retrieves purchase orders belonging to the customer.
   */
  getUserOrders: async () => {
    const response = await api.get('/orders');
    return response.data.orders || [];
  },

  /**
   * Initializes a checkout order with Razorpay or Sandbox support.
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data; // Contains standard envelope with { order, paymentSession }
  },

  /**
   * Verifies Razorpay payment signatures.
   */
  verifyPayment: async (paymentDetails) => {
    const response = await api.post('/orders/verify', paymentDetails);
    return response.data;
  },

  /**
   * Retrieves customizations requests submitted by the customer.
   */
  getUserCustomizations: async () => {
    const response = await api.get('/customisations');
    return response.data.items || [];
  },

  /**
   * Submits a tailoring customization request.
   */
  submitCustomizationRequest: async (requestData) => {
    const payload = new FormData();

    // Map input fields to FormData object
    Object.keys(requestData).forEach((key) => {
      if (key === 'images' && Array.isArray(requestData.images)) {
        requestData.images.forEach((file) => payload.append('images', file));
      } else {
        payload.append(key, requestData[key]);
      }
    });

    const response = await api.post('/customisations', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.request;
  },

};

export default userService;
