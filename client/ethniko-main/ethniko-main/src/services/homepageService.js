import api from '../api/api';

export const homepageService = {
  /**
   * Lists all homepage hero slider banners (Admin/Public).
   */
  getHeroSlides: async () => {
    const response = await api.get('/homepage/banners');
    return response.data.banners || [];
  },

  /**
   * Creates a new hero slider banner (Admin only).
   */
  createHeroSlide: async (formData) => {
    const response = await api.post('/homepage/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.banner;
  },

  /**
   * Updates a hero slider banner (Admin only).
   */
  updateHeroSlide: async (id, formData) => {
    const response = await api.put(`/homepage/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.banner;
  },

  /**
   * Deletes a hero slider banner permanently (Admin only).
   */
  deleteHeroSlide: async (id) => {
    const response = await api.delete(`/homepage/banners/${id}`);
    return response.data;
  },

  // ---------- Sections ----------
  getSections: async () => {
    const response = await api.get('/homepage/sections');
    return response.data.sections || [];
  },

  createSection: async (formData) => {
    const response = await api.post('/homepage/sections', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.section;
  },

  updateSection: async (id, formData) => {
    const response = await api.put(`/homepage/sections/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.section;
  },

  deleteSection: async (id) => {
    const response = await api.delete(`/homepage/sections/${id}`);
    return response.data;
  },
  
  // ---------- Statistics ----------
  getStatistics: async () => {
    const response = await api.get('/homepage/statistics');
    return response.data.statistics || [];
  },

  createStatistic: async (data) => {
    const response = await api.post('/homepage/statistics', data);
    return response.data.statistic;
  },

  updateStatistic: async (id, data) => {
    const response = await api.put(`/homepage/statistics/${id}`, data);
    return response.data.statistic;
  },

  deleteStatistic: async (id) => {
    const response = await api.delete(`/homepage/statistics/${id}`);
    return response.data;
  },

  // ---------- Announcement Bar ----------
  getAnnouncementBar: async () => {
    const response = await api.get('/homepage/announcement-bar');
    return response.data.announcementBar || {};
  },

  updateAnnouncementBar: async (data) => {
    const response = await api.put('/homepage/announcement-bar', data);
    return response.data.announcementBar;
  },

  // ---------- Video ----------
  getVideo: async () => {
    const response = await api.get('/homepage/video');
    return response.data.video || {};
  },

  updateVideo: async (formData) => {
    const response = await api.put('/homepage/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.video;
  }
};

export default homepageService;
