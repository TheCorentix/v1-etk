import api from '../api/api';

export const dashboardService = {
  /**
   * Fetches gross store analytics (Admin only).
   */
  getAnalytics: async () => {
    const response = await api.get('/dashboard/analytics');
    return response.data; // Contains standard envelope { kpis, monthlyRevenue, categorySales }
  },
};

export default dashboardService;
