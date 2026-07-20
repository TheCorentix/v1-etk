import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';
import { Query } from 'firebase-admin/firestore';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  size: string;
  quantity: number;
  price: number; // In Paise
  color: string;
  image: string; // Cloudinary secure URL
}

export interface OrderDocument {
  id?: string;
  userId: string; // References `users.id` or 'GUEST'
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number; // In Paise
  gst: number; // In Paise
  shipping: number; // In Paise
  total: number; // In Paise
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paymentMethod: 'razorpay' | 'sandbox';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'NEW' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string | null;
  createdAt?: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
}

export interface OrderFilters {
  userId?: string;
  orderStatus?: 'NEW' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export class OrderRepository {
  private static collectionName = 'orders';

  /**
   * Retrieves a single order document by ID.
   * @param id Firestore order document ID
   */
  async findById(id: string): Promise<OrderDocument | null> {
    const doc = await db.collection(OrderRepository.collectionName).doc(id).get();
    return mapDoc<OrderDocument>(doc);
  }

  /**
   * Finds an order by its Razorpay transaction order ID.
   * @param razorpayOrderId Razorpay Order ID
   */
  async findByRazorpayOrderId(razorpayOrderId: string): Promise<OrderDocument | null> {
    const querySnapshot = await db
      .collection(OrderRepository.collectionName)
      .where('razorpayOrderId', '==', razorpayOrderId)
      .limit(1)
      .get();

    const results = mapQuery<OrderDocument>(querySnapshot);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Registers a brand new client order document in Firestore.
   * @param order Order details
   */
  async create(order: Omit<OrderDocument, 'id'>): Promise<OrderDocument> {
    const docRef = db.collection(OrderRepository.collectionName).doc();
    const now = new Date().toISOString();

    const dataToSave = {
      ...order,
      createdAt: now,
      statusHistory: order.statusHistory || [
        {
          status: 'NEW',
          timestamp: now,
          note: 'Order draft initialized.',
        },
      ],
    };

    await docRef.set(dataToSave);
    return { id: docRef.id, ...dataToSave };
  }

  /**
   * Updates an existing order's parameters (e.g. status histories, payment verification IDs).
   * @param id Order document ID
   * @param order Partial order parameters
   */
  async update(id: string, order: Partial<OrderDocument>): Promise<OrderDocument | null> {
    const docRef = db.collection(OrderRepository.collectionName).doc(id);
    await docRef.update(order);
    return this.findById(id);
  }

  /**
   * Lists orders matching filters with page offsets.
   * @param filters Query filter keys
   * @param pagination Page index and limit
   */
  async list(
    filters: OrderFilters,
    pagination: { page: number; limit: number }
  ): Promise<{ items: OrderDocument[]; total: number }> {
    let queryRef: Query = db.collection(OrderRepository.collectionName);

    // Apply exact match filters
    if (filters.userId) {
      queryRef = queryRef.where('userId', '==', filters.userId);
    }
    if (filters.orderStatus) {
      queryRef = queryRef.where('orderStatus', '==', filters.orderStatus);
    }
    if (filters.paymentStatus) {
      queryRef = queryRef.where('paymentStatus', '==', filters.paymentStatus);
    }

    // Default sorting order by creation date (descending)
    queryRef = queryRef.orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    const orders = mapQuery<OrderDocument>(snapshot);

    const total = orders.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + pagination.limit);

    return {
      items: paginatedOrders,
      total,
    };
  }

  /**
   * Lists all orders completed or drafts belonging to a specific client profile.
   * @param userId Client document ID
   */
  async findByUserId(userId: string): Promise<OrderDocument[]> {
    const querySnapshot = await db
      .collection(OrderRepository.collectionName)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return mapQuery<OrderDocument>(querySnapshot);
  }
}

export default OrderRepository;
