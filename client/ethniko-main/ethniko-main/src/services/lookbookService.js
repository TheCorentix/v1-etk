import api from '../api/api';

export const lookbookService = {
  /**
   * Lists editorial lookbook videos.
   */
  getLookbooks: async (page = 1, limit = 10) => {
    const response = await api.get('/lookbooks', { params: { page, limit } });
    return {
      items: response.data.items || [],
      pagination: response.data.pagination || { currentPage: page, totalPages: 1 },
    };
  },

  /**
   * Fetches details of a specific lookbook document by ID.
   */
  getLookbookById: async (id) => {
    const response = await api.get(`/lookbooks/${id}`);
    return response.data.look;
  },

  /**
   * Creates a new lookbook post with video file and optional thumbnail (Admin only).
   */
  createLookbook: async (formData) => {
    // If formData is not FormData, build it
    let payload = formData;
    let config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };

    if (!(formData instanceof FormData)) {
      payload = new FormData();
      payload.append('title', formData.title);
      payload.append('tags', JSON.stringify(formData.tags || []));
      if (formData.video) payload.append('video', formData.video);
      if (formData.thumbnail) payload.append('thumbnail', formData.thumbnail);
    }

    const response = await api.post('/lookbooks', payload, config);
    return response.data.look;
  },

  /**
   * Modifies lookbook coordinates hotspots or titles (Admin only).
   */
  updateLookbook: async (id, lookbookData) => {
    const response = await api.put(`/lookbooks/${id}`, lookbookData);
    return response.data.look;
  },

  /**
   * Removes a lookbook and purges Cloudinary files (Admin only).
   */
  deleteLookbook: async (id) => {
    const response = await api.delete(`/lookbooks/${id}`);
    return response.success;
  },
};

export default lookbookService;
