import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

/**
 * Custom hook to retrieve gross revenue, orders, and sales charts (Admin only).
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => dashboardService.getAnalytics(),
  });
};

export default useDashboard;
