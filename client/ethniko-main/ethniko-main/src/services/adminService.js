import api from '../api/api';

export const adminService = {
  /**
   * Lists all boutique orders (Admin only).
   */
  getAllOrders: async (page = 1, limit = 100) => {
    const response = await api.get('/orders', { params: { page, limit } });
    return response.data.orders || [];
  },

  /**
   * Lists all bespoke tailoring requests (Admin only).
   */
  getAllCustomizations: async (page = 1, limit = 100) => {
    const response = await api.get('/customisations', { params: { page, limit } });
    return response.data.items || [];
  },

  /**
   * Updates an order's fulfillment status (Admin only).
   */
  updateOrderStatus: async (id, status, note = '') => {
    const response = await api.put(`/orders/${id}/status`, { status, note });
    return response.data.order;
  },

  /**
   * Assigns an airway tracking bill code to an order (Admin only).
   */
  addOrderTracking: async (id, trackingNumber) => {
    const response = await api.put(`/orders/${id}/tracking`, { trackingNumber });
    return response.data.order;
  },

  /**
   * Transitions the status state of a customization request (Admin only).
   */
  updateCustomizationStatus: async (id, status, stylistNote) => {
    if (stylistNote) {
      // Append stylist note comment first
      await api.post(`/customisations/${id}/notes`, { text: stylistNote });
    }
    const response = await api.put(`/customisations/${id}/status`, { status });
    return response.data.request;
  },

  // ==========================================
  // Namespaced CMS Endpoints (/api/v1/cms)
  // ==========================================

  // ---------- Categories ----------
  getCmsCategories: async (page = 1, limit = 20, search = '', status = '') => {
    const response = await api.get('/v1/cms/categories', { params: { page, limit, search, status } });
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/v1/cms/categories', categoryData);
    return response.data.category;
  },
  updateCategory: async (id, updates) => {
    const response = await api.put(`/v1/cms/categories/${id}`, updates);
    return response.data.category;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/v1/cms/categories/${id}`);
    return response.data;
  },

  // ---------- Collections ----------
  getCmsCollections: async (page = 1, limit = 20, search = '', status = '') => {
    const response = await api.get('/v1/cms/collections', { params: { page, limit, search, status } });
    return response.data;
  },
  createCollection: async (collectionData) => {
    const response = await api.post('/v1/cms/collections', collectionData);
    return response.data.collection;
  },
  updateCollection: async (id, updates) => {
    const response = await api.put(`/v1/cms/collections/${id}`, updates);
    return response.data.collection;
  },
  deleteCollection: async (id) => {
    const response = await api.delete(`/v1/cms/collections/${id}`);
    return response.data;
  },

  // ---------- Testimonials ----------
  getCmsTestimonials: async (page = 1, limit = 20, status = '') => {
    const response = await api.get('/v1/cms/testimonials', { params: { page, limit, status } });
    return response.data;
  },
  createTestimonial: async (testimonialData) => {
    const response = await api.post('/v1/cms/testimonials', testimonialData);
    return response.data.testimonial;
  },
  updateTestimonial: async (id, updates) => {
    const response = await api.put(`/v1/cms/testimonials/${id}`, updates);
    return response.data.testimonial;
  },
  deleteTestimonial: async (id) => {
    const response = await api.delete(`/v1/cms/testimonials/${id}`);
    return response.data;
  },

  // ---------- Lookbooks (PDF) ----------
  getCmsLookbookPdfs: async (page = 1, limit = 20, search = '', status = '') => {
    const response = await api.get('/v1/cms/lookbooks', { params: { page, limit, search, status } });
    return response.data;
  },
  createLookbookPdf: async (lookbookData) => {
    const response = await api.post('/v1/cms/lookbooks', lookbookData);
    return response.data.lookbook;
  },
  updateLookbookPdf: async (id, updates) => {
    const response = await api.put(`/v1/cms/lookbooks/${id}`, updates);
    return response.data.lookbook;
  },
  deleteLookbookPdf: async (id) => {
    const response = await api.delete(`/v1/cms/lookbooks/${id}`);
    return response.data;
  },

  // ---------- Info Pages ----------
  getAboutPage: async () => {
    const response = await api.get('/v1/cms/about');
    return response.data.about;
  },
  updateAboutPage: async (updates) => {
    const response = await api.put('/v1/cms/about', updates);
    return response.data.about;
  },
  getContactPage: async () => {
    const response = await api.get('/v1/cms/contact');
    return response.data.contact;
  },
  updateContactPage: async (updates) => {
    const response = await api.put('/v1/cms/contact', updates);
    return response.data.contact;
  },

  // ---------- Settings splits ----------
  getStoreSettings: async () => {
    const response = await api.get('/v1/cms/settings/store');
    return response.data.store;
  },
  updateStoreSettings: async (updates) => {
    const response = await api.put('/v1/cms/settings/store', updates);
    return response.data.store;
  },
  getSeoSettings: async () => {
    const response = await api.get('/v1/cms/settings/seo');
    return response.data.seo;
  },
  updateSeoSettings: async (updates) => {
    const response = await api.put('/v1/cms/settings/seo', updates);
    return response.data.seo;
  },
  getShippingSettings: async () => {
    const response = await api.get('/v1/cms/settings/shipping');
    return response.data.shipping;
  },
  updateShippingSettings: async (updates) => {
    const response = await api.put('/v1/cms/settings/shipping', updates);
    return response.data.shipping;
  },
  getFooterSettings: async () => {
    const response = await api.get('/v1/cms/settings/footer');
    return response.data.footer;
  },
  updateFooterSettings: async (updates) => {
    const response = await api.put('/v1/cms/settings/footer', updates);
    return response.data.footer;
  },
  getSocialSettings: async () => {
    const response = await api.get('/v1/cms/settings/social');
    return response.data.social;
  },
  updateSocialSettings: async (updates) => {
    const response = await api.put('/v1/cms/settings/social', updates);
    return response.data.social;
  },

  // ---------- Media Library ----------
  getCmsMedia: async (page = 1, limit = 20, folder = '', resourceType = '', search = '') => {
    const response = await api.get('/v1/cms/media', { params: { page, limit, folder, resourceType, search } });
    return response.data;
  },
  registerMedia: async (mediaData) => {
    const response = await api.post('/v1/cms/media', mediaData);
    return response.data.media;
  },
  uploadMedia: async (file, folder = 'media_library') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await api.post('/v1/cms/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.media;
  },
  deleteMedia: async (id) => {
    const response = await api.delete(`/v1/cms/media/${id}`);
    return response.data;
  },

  // ---------- Audit Logs ----------
  getCmsAuditLogs: async (page = 1, limit = 20, search = '', module = '') => {
    const response = await api.get('/v1/cms/audit', { params: { page, limit, search, module } });
    return response.data;
  },
};

export default adminService;
