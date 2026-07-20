import { db } from '../config/firebase';
import { mapQuery } from '../utils/firebase';
import { logger } from '../config/logger';

export interface DashboardAnalytics {
  kpis: {
    totalRevenue: number; // Stored in Paise
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    totalCustomisations: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  categorySales: Array<{ category: string; salesCount: number }>;
}

export class DashboardService {
  /**
   * Aggregates database records to compile comprehensive store analytics.
   */
  async getAnalytics(): Promise<DashboardAnalytics> {
    try {
      // 1. Fetch all paid orders for revenue and count metrics
      const ordersSnapshot = await db
        .collection('orders')
        .where('paymentStatus', '==', 'paid')
        .get();
      const paidOrders = mapQuery<any>(ordersSnapshot);

      // 2. Query total catalog product documents size
      const productsSnapshot = await db.collection('products').select().get();
      const totalProducts = productsSnapshot.size;

      // 3. Query total user documents with CUSTOMER role
      const usersSnapshot = await db
        .collection('users')
        .where('role', '==', 'CUSTOMER')
        .select()
        .get();
      const totalCustomers = usersSnapshot.size;

      // 4. Query total customized styling request documents size
      const customisationsSnapshot = await db.collection('customisations').select().get();
      const totalCustomisations = customisationsSnapshot.size;

      // Calculate Gross Revenue and compile monthly chart groups
      let totalRevenue = 0;
      const monthlyRevenueMap: Record<string, number> = {};
      const categorySalesMap: Record<string, number> = {};

      paidOrders.forEach((order) => {
        totalRevenue += order.total;

        // Group monthly revenue (format: YYYY-MM)
        if (order.createdAt) {
          const monthKey = order.createdAt.substring(0, 7);
          monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + order.total;
        }

        // Aggregate category distributions from purchase items list
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const catPrefix = item.sku?.substring(0, 3) || 'GEN';
            categorySalesMap[catPrefix] = (categorySalesMap[catPrefix] || 0) + item.quantity;
          });
        }
      });

      // Format monthly revenue charts sorted chronologically
      const monthlyRevenue = Object.keys(monthlyRevenueMap)
        .map((month) => ({
          month,
          revenue: monthlyRevenueMap[month],
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Resolve category sales count mapping values
      const categorySales = Object.keys(categorySalesMap).map((prefix) => {
        let categoryName = 'OTHER';
        if (prefix === 'WOM') categoryName = 'WOMEN';
        else if (prefix === 'MEN') categoryName = 'MEN';
        else if (prefix === 'KID') categoryName = 'KIDS';

        return {
          category: categoryName,
          salesCount: categorySalesMap[prefix],
        };
      });

      logger.info('📊 Compiled administrative dashboard analytics successfully.');
      return {
        kpis: {
          totalRevenue,
          totalOrders: paidOrders.length,
          totalProducts,
          totalCustomers,
          totalCustomisations,
        },
        monthlyRevenue,
        categorySales,
      };
    } catch (error) {
      logger.error('Error in DashboardService getAnalytics:', error);
      throw error;
    }
  }
}

export default DashboardService;
