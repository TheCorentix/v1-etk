import api from '../api/api';

// Product reviews. Customers can only review products they have bought and received, and every
// review waits for admin approval before it is shown to anyone else.
export const reviewService = {
  /** Approved reviews of a product, plus { average, count, distribution }. Public. */
  getProductReviews: async (productId, page = 1, limit = 10) => {
    const response = await api.get('/reviews', { params: { productId, page, limit } });
    return response.data; // { items, summary, pagination }
  },

  /** Can the signed-in customer review this product? { canReview, reason, review, message } */
  getEligibility: async (productId) => {
    const response = await api.get(`/reviews/eligibility/${productId}`);
    return response.data;
  },

  /** Sends a review (stars, text and up to 3 photos). It is saved as pending. */
  submitReview: async ({ productId, rating, title, comment, images = [] }) => {
    const payload = new FormData();
    payload.append('productId', productId);
    payload.append('rating', String(rating));
    if (title) payload.append('title', title);
    payload.append('comment', comment);
    images.forEach((file) => payload.append('images', file));

    const response = await api.post('/reviews', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.review;
  },

  // ---------- Admin moderation ----------
  /** All reviews (optionally one status) with counts: { items, counts } */
  getAdminReviews: async (status) => {
    const response = await api.get('/reviews/admin/list', { params: status ? { status } : {} });
    return response.data;
  },

  setReviewStatus: async (id, status) => {
    const response = await api.put(`/reviews/admin/${id}/status`, { status });
    return response.data.review;
  },

  deleteReview: async (id) => {
    await api.delete(`/reviews/admin/${id}`);
  },
};

export default reviewService;
