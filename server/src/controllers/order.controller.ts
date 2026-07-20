import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class OrderController {
  private orderService = new OrderService();

  /**
   * Initializes a pending checkout order.
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const { items, shippingAddress, customerName, customerPhone, customerEmail } = req.body;

      // Extract details from authenticated request or allow manual forms override
      const customerDetails = {
        name: customerName || req.user!.name || 'Client',
        phone: customerPhone || '',
        email: customerEmail || req.user!.email,
      };

      const order = await this.orderService.createOrder(
        userId,
        customerDetails,
        items,
        shippingAddress
      );

      sendSuccess(res, { order }, 'Order initialized successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Confirms payment signature and updates item stock levels.
   */
  verifyPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const order = await this.orderService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      sendSuccess(res, { order }, 'Payment verified and order confirmed.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates order pipeline state (Admin only).
   */
  updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { status, note } = req.body;

      const order = await this.orderService.updateStatus(id, status, note || `Order transitioned to ${status}.`);
      sendSuccess(res, { order }, 'Order status updated successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assigns an airway bill courier tracking number (Admin only).
   */
  addTracking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { trackingNumber } = req.body;

      const order = await this.orderService.addTrackingNumber(id, trackingNumber);
      sendSuccess(res, { order }, 'Tracking number assigned and order status updated.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generates invoice parameters for printing.
   */
  getInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      
      // Confirm ownership before generating invoices
      const order = await this.orderService.getOrderById(id);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found', errors: ['Not Found'] });
        return;
      }

      if (order.userId !== req.user!.uid && req.user!.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Access denied.', errors: ['Forbidden'] });
        return;
      }

      const invoice = await this.orderService.generateInvoice(id);
      sendSuccess(res, { invoice }, 'Invoice details compiled successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves detail logs for a specific order.
   */
  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found', errors: ['Not Found'] });
        return;
      }

      // Enforce order ownership checks
      if (order.userId !== req.user!.uid && req.user!.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Access denied.', errors: ['Forbidden'] });
        return;
      }

      sendSuccess(res, { order }, 'Order retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lists orders. Customers can only see their own transactions; admins can see all database items.
   */
  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, orderStatus, paymentStatus } = req.query;

      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;

      const filters: any = {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
      };

      // Restrict customers to only viewing their own order logs
      if (req.user!.role !== 'ADMIN') {
        filters.userId = req.user!.uid;
      }

      const result = await this.orderService.listOrders(filters, pageNum, limitNum);
      sendSuccess(res, result, 'Orders retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default OrderController;
