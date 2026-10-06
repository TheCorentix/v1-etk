import Razorpay from 'razorpay';
import crypto from 'crypto';
import { OrderRepository, OrderDocument, OrderItem, WhatsAppLogEntry } from '../repositories/order.repository';
import { ProductService } from './product.service';
import { OrderNotificationService, isNotifiableStatus } from './orderNotification.service';
import { httpError } from '../utils/httpError';
import { getPaginationMetadata, PaginationMeta } from '../utils/pagination';
import { computeShipping } from '../utils/shipping';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class OrderService {
  private orderRepository = new OrderRepository();
  private productService = new ProductService();
  private notifications = new OrderNotificationService();
  private razorpayClient: Razorpay | null = null;

  constructor() {
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      this.razorpayClient = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    } else {
      logger.warn('⚠️ Warning: Razorpay API keys are missing. Payment Sandbox bypass will be active.');
    }
  }

  /**
   * Calculates order fees and creates a pending checkout order.
   */
  async createOrder(
    userId: string,
    customerDetails: { name: string; phone: string; email: string },
    itemsInput: Array<{ productId: string; size: string; quantity: number; color: string }>,
    shippingAddress: OrderDocument['shippingAddress']
  ): Promise<OrderDocument> {
    try {
      let subtotal = 0;
      let totalWeightKg = 0;
      const orderItems: OrderItem[] = [];

      // 1. Validate product inventory and accumulate subtotal + weight
      for (const item of itemsInput) {
        const product = await this.productService.getProductById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        // Check if size exists and is in stock
        const availableStock = product.sizes[item.size] || 0;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for product "${product.name}" in size ${item.size}. Available: ${availableStock}`);
        }

        const price = product.discountPrice || product.price;
        subtotal += price * item.quantity;
        // Default to 0.5kg per unit when a product has no weight set.
        totalWeightKg += (product.weight && product.weight > 0 ? product.weight : 0.5) * item.quantity;

        orderItems.push({
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          productId: item.productId,
          name: product.name,
          sku: product.sku,
          size: item.size,
          quantity: item.quantity,
          price,
          color: item.color,
          image: product.images[0] || '',
        });
      }

      // 2. Calculate tax (12% GST) & Shipping.
      //    Domestic (India): free over ₹10k, else ₹150.
      //    International: weight-based per-kg rate, with INR->currency conversion.
      const gst = Math.round(subtotal * 0.12);
      const ship = computeShipping(totalWeightKg, shippingAddress?.country, subtotal);
      const shipping = ship.shippingPaise;
      const total = subtotal + gst + shipping;
      const totalConverted = +(((total / 100) * ship.conversionRate)).toFixed(2);

      // 3. Initiate payment gateway registration
      let razorpayOrderId: string | null = null;
      let paymentMethod: 'razorpay' | 'sandbox' = 'sandbox';

      if (this.razorpayClient) {
        const option = {
          amount: total,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        };
        const rpOrder = await this.razorpayClient.orders.create(option);
        razorpayOrderId = rpOrder.id;
        paymentMethod = 'razorpay';
      } else {
        // Fallback to Sandbox ID
        razorpayOrderId = `order_sandbox_${Math.random().toString(36).substring(2, 12)}`;
        paymentMethod = 'sandbox';
      }

      const pendingOrder: Omit<OrderDocument, 'id'> = {
        userId,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        customerEmail: customerDetails.email,
        items: orderItems,
        subtotal,
        gst,
        shipping,
        total,
        shippingWeightKg: ship.weightKg,
        shippingMethod: ship.method,
        shippingEta: ship.etaDays,
        currencyCode: ship.currencyCode,
        currencySymbol: ship.currencySymbol,
        conversionRate: ship.conversionRate,
        shippingConverted: ship.shippingConverted,
        totalConverted,
        razorpayOrderId,
        razorpayPaymentId: null,
        razorpaySignature: null,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'NEW',
        shippingAddress,
        trackingNumber: null,
        createdAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'NEW',
            timestamp: new Date().toISOString(),
            note: `Order initialized. Payment method: ${paymentMethod}.`,
          },
        ],
      };

      const createdOrder = await this.orderRepository.create(pendingOrder);
      logger.info(`📦 Order created: ${createdOrder.id} - Pending payment.`);
      return createdOrder;
    } catch (error) {
      logger.error('Error in OrderService createOrder:', error);
      throw error;
    }
  }

  /**
   * Verifies the Razorpay payment signature, confirms the order, and updates product inventory.
   */
  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<OrderDocument> {
    try {
      const order = await this.orderRepository.findByRazorpayOrderId(razorpayOrderId);
      if (!order || !order.id) {
        throw new Error(`Order with payment ID ${razorpayOrderId} not found.`);
      }

      if (order.paymentStatus === 'paid') {
        return order;
      }

      // 1. Signature Authentication
      if (order.paymentMethod === 'sandbox') {
        // Sandbox signature bypass verification rules
        if (razorpaySignature !== 'sandbox_signature' && !razorpayOrderId.startsWith('order_sandbox_')) {
          throw new Error('Sandbox payment verification failed. Invalid payload signature.');
        }
        logger.info(`💳 Sandbox bypass confirmed for order: ${order.id}`);
      } else {
        // Verify genuine Razorpay signature HMAC
        const hmac = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET || '');
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpaySignature) {
          throw new Error('Razorpay verification failed. Signature mismatch.');
        }
      }

      // 2. Allocate inventory (deduct sizes stock count)
      for (const item of order.items) {
        await this.productService.updateStock(item.productId, item.size, item.quantity);
      }

      // 3. Mark transaction paid and transition order status to CONFIRMED
      const now = new Date().toISOString();
      const updatedHistory = [
        ...order.statusHistory,
        {
          status: 'CONFIRMED',
          timestamp: now,
          note: `Payment verified. Transaction ID: ${razorpayPaymentId}`,
        },
      ];

      const updatedOrder = await this.orderRepository.update(order.id, {
        paymentStatus: 'paid',
        orderStatus: 'CONFIRMED',
        razorpayPaymentId,
        razorpaySignature,
        statusHistory: updatedHistory,
      });

      if (!updatedOrder) {
        throw new Error('Failed to update order status during checkout confirmation.');
      }

      logger.info(`💳 Order ${order.id} payment verified. Inventory allocated.`);

      // Tell the customer their order is placed. Not awaited: checkout shouldn't wait on WhatsApp.
      void this.sendStatusMessage(updatedOrder, 'CONFIRMED');

      return updatedOrder;
    } catch (error) {
      logger.error('Error in OrderService verifyPayment:', error);
      throw error;
    }
  }

  /**
   * Sends the WhatsApp message for `status` and records the outcome on the order.
   * Never throws. Returns the refreshed order plus what happened with the message.
   */
  private async sendStatusMessage(
    order: OrderDocument,
    status: OrderDocument['orderStatus']
  ): Promise<{ order: OrderDocument; notification: WhatsAppLogEntry }> {
    const notification = await this.notifications.notify(order, status);

    try {
      // Keep the most recent entries only, so the order document stays small
      const whatsappLog = [...(order.whatsappLog || []), notification].slice(-30);
      const updated = await this.orderRepository.update(order.id as string, { whatsappLog });
      return { order: updated || order, notification };
    } catch (error) {
      logger.error(`Could not save the WhatsApp log for order ${order.id}:`, error);
      return { order, notification };
    }
  }

  /**
   * Modifies an order's status pipeline (Admin only) and messages the customer on WhatsApp
   * when the status actually changes.
   */
  async updateStatus(
    orderId: string,
    status: OrderDocument['orderStatus'],
    note: string
  ): Promise<{ order: OrderDocument; notification: WhatsAppLogEntry | null }> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw httpError(404, `Order with ID ${orderId} not found.`);
    }

    const changed = order.orderStatus !== status;

    const updatedHistory = [
      ...order.statusHistory,
      {
        status,
        timestamp: new Date().toISOString(),
        note,
      },
    ];

    const updated = await this.orderRepository.update(orderId, {
      orderStatus: status,
      statusHistory: updatedHistory,
    });
    if (!updated) {
      throw httpError(500, 'Failed to update the order status.');
    }

    // Re-saving the same status (e.g. just adding a note) shouldn't message the customer again
    if (changed && isNotifiableStatus(status)) {
      return this.sendStatusMessage(updated, status);
    }
    return { order: updated, notification: null };
  }

  /**
   * Assigns a shipping carrier tracking airway bill number (Admin only), marks the order
   * shipped, and messages the customer with the tracking ID.
   */
  async addTrackingNumber(
    orderId: string,
    trackingNumber: string
  ): Promise<{ order: OrderDocument; notification: WhatsAppLogEntry | null }> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw httpError(404, `Order with ID ${orderId} not found.`);
    }

    const alreadyAnnounced = order.orderStatus === 'SHIPPED' && order.trackingNumber === trackingNumber;

    const updatedHistory = [
      ...order.statusHistory,
      {
        status: 'SHIPPED',
        timestamp: new Date().toISOString(),
        note: `Shipping tracking number assigned: ${trackingNumber}`,
      },
    ];

    const updated = await this.orderRepository.update(orderId, {
      trackingNumber,
      orderStatus: 'SHIPPED',
      statusHistory: updatedHistory,
    });
    if (!updated) {
      throw httpError(500, 'Failed to save the tracking number.');
    }

    if (alreadyAnnounced) {
      return { order: updated, notification: null };
    }
    return this.sendStatusMessage(updated, 'SHIPPED');
  }

  /**
   * Re-sends the WhatsApp message for the order's current status (Admin only),
   * e.g. after fixing a failed send.
   */
  async resendStatusNotification(
    orderId: string
  ): Promise<{ order: OrderDocument; notification: WhatsAppLogEntry }> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw httpError(404, `Order with ID ${orderId} not found.`);
    }
    if (!isNotifiableStatus(order.orderStatus)) {
      throw httpError(400, `Customers aren't messaged for the "${order.orderStatus}" status.`);
    }
    return this.sendStatusMessage(order, order.orderStatus);
  }

  /**
   * Retrieves a printable HTML/JSON invoice format for the order.
   */
  async generateInvoice(orderId: string): Promise<any> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    return {
      invoiceNumber: `INV-2026-${order.id?.substring(0, 8).toUpperCase()}`,
      issueDate: order.createdAt,
      company: {
        name: 'ETNIKO Atelier',
        address: '12-C, Heritage Lane, Colaba, Mumbai, MH, 400001, India',
        phone: '+91 22 8765 4321',
        gstin: '27AAAAA1111A1Z1',
      },
      order,
    };
  }

  /**
   * Lists orders matching filters.
   */
  async listOrders(filters: any, page = 1, limit = 10): Promise<{ items: OrderDocument[]; pagination: PaginationMeta }> {
    const { items, total } = await this.orderRepository.list(filters, { page, limit });
    const pagination = getPaginationMetadata(total, page, limit);
    return { items, pagination };
  }

  /**
   * Lists all transactions completed or drafts belonging to a specific client profile.
   */
  async getClientOrders(userId: string): Promise<OrderDocument[]> {
    return this.orderRepository.findByUserId(userId);
  }

  /**
   * Retrieves details for a specific order.
   */
  async getOrderById(orderId: string): Promise<OrderDocument | null> {
    return this.orderRepository.findById(orderId);
  }
}

export default OrderService;
