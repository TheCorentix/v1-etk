import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';
import { Query, FieldValue, Transaction, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';

export interface AdminNote {
  author: string;
  text: string;
  timestamp: string;
}

// Internal comment left by the admin team (e.g. after contacting the customer).
// Never sent to customers, unlike AdminNote which shows on their profile.
export interface InternalComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

// A customer invoice raised by the team for a customisation request. Amounts are in paise.
export interface CustomisationInvoice {
  number: string; // e.g. INV-2026-0007, assigned once and kept when the invoice is edited
  date: string; // YYYY-MM-DD shown on the invoice
  items: { name: string; quantity: number; unitPrice: number; amount: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CustomisationDocument {
  id?: string;
  userId: string | null; // References `users.id` if registered, or null for guests
  customerName: string;
  phone: string;
  email: string;
  whatsappNumber?: string | null;
  category: string; // e.g. "Saree", "Lehenga"
  occasion: string; // e.g. "Bridal Wedding"
  productId?: string | null; // References `products.id` when the request originated from a specific catalog item
  productSku?: string | null;
  fabricPref?: string | null; // For tailoring, stores free-text fabric details
  colorPref?: string | null;
  budgetRange?: string | null;
  address?: string | null; // Sender's postal address (used by bespoke tailoring requests)
  deliveryDate?: string | null;
  images: string[]; // Cloudinary secure URLs of design sketches/inspiration photos
  notes?: string | null; // Measurement values and stylist summary details
  status: 'NEW' | 'ORDER_TAKEN' | 'SHIPPED' | 'DELIVERED';
  adminNotes: AdminNote[];
  comments?: InternalComment[]; // Internal team comments, admin-only
  invoice?: CustomisationInvoice; // Invoice raised by the team, admin-only
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomisationFilters {
  userId?: string;
  status?: 'NEW' | 'ORDER_TAKEN' | 'SHIPPED' | 'DELIVERED';
}

const byNewestFirst = (a: CustomisationDocument, b: CustomisationDocument): number =>
  (b.createdAt || '').localeCompare(a.createdAt || '');

export class CustomisationRepository {
  private static collectionName = 'customisations';

  /**
   * Retrieves a single customisation request by ID.
   * @param id Customisation document ID
   */
  async findById(id: string): Promise<CustomisationDocument | null> {
    const doc = await db.collection(CustomisationRepository.collectionName).doc(id).get();
    return mapDoc<CustomisationDocument>(doc);
  }

  /**
   * Creates a new customisation request document.
   * @param customisation Customisation request details
   */
  async create(customisation: Omit<CustomisationDocument, 'id'>): Promise<CustomisationDocument> {
    const docRef = db.collection(CustomisationRepository.collectionName).doc();
    const now = new Date().toISOString();

    const dataToSave = {
      ...customisation,
      createdAt: now,
      updatedAt: now,
      adminNotes: customisation.adminNotes || [],
    };

    await docRef.set(dataToSave);
    return { id: docRef.id, ...dataToSave };
  }

  /**
   * Updates an existing customisation request parameters.
   * @param id Customisation document ID
   * @param data Partial customisation details
   */
  async update(id: string, data: Partial<CustomisationDocument>): Promise<CustomisationDocument | null> {
    const docRef = db.collection(CustomisationRepository.collectionName).doc(id);
    const now = new Date().toISOString();

    const dataToUpdate = {
      ...data,
      updatedAt: now,
    };

    await docRef.update(dataToUpdate);
    return this.findById(id);
  }

  /**
   * Appends an internal comment. Uses an atomic array append so two admins commenting
   * at the same moment never overwrite each other.
   */
  async addComment(id: string, comment: InternalComment): Promise<CustomisationDocument | null> {
    const docRef = db.collection(CustomisationRepository.collectionName).doc(id);
    await docRef.update({
      comments: FieldValue.arrayUnion(comment),
      updatedAt: new Date().toISOString(),
    });
    return this.findById(id);
  }

  /**
   * Hands out the next invoice number for a year (1, 2, 3, ...). Done in a transaction so two
   * admins creating invoices at the same moment never get the same number.
   */
  async nextInvoiceSequence(year: number): Promise<number> {
    const counterRef = db.collection('counters').doc(`invoices-${year}`) as DocumentReference;
    return db.runTransaction(async (transaction: Transaction) => {
      const snapshot = (await transaction.get(counterRef)) as DocumentSnapshot;
      const next = (snapshot.exists ? (snapshot.data()?.value as number) : 0) + 1;
      transaction.set(counterRef, { value: next, updatedAt: new Date().toISOString() });
      return next;
    });
  }

  /**
   * Stores (or replaces) the invoice on a request.
   */
  async setInvoice(id: string, invoice: CustomisationInvoice): Promise<CustomisationDocument | null> {
    const docRef = db.collection(CustomisationRepository.collectionName).doc(id);
    await docRef.update({ invoice, updatedAt: new Date().toISOString() });
    return this.findById(id);
  }

  /**
   * Lists customisation requests matching filters with page offsets.
   * @param filters Query filter keys
   * @param pagination Page index and limit
   */
  async list(
    filters: CustomisationFilters,
    pagination: { page: number; limit: number }
  ): Promise<{ items: CustomisationDocument[]; total: number }> {
    let queryRef: Query = db.collection(CustomisationRepository.collectionName);

    // Apply exact match filters
    if (filters.userId) {
      queryRef = queryRef.where('userId', '==', filters.userId);
    }
    if (filters.status) {
      queryRef = queryRef.where('status', '==', filters.status);
    }

    const snapshot = await queryRef.get();
    const customisations = mapQuery<CustomisationDocument>(snapshot);

    // Newest first. Sorted in memory rather than with Firestore's orderBy, which would need
    // a composite index for every filter combination above (a missing index makes the whole
    // query fail, so customers saw no requests on their profile).
    customisations.sort(byNewestFirst);

    const total = customisations.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedItems = customisations.slice(startIndex, startIndex + pagination.limit);

    return {
      items: paginatedItems,
      total,
    };
  }

  /**
   * Lists all requests belonging to a specific client.
   * @param userId Client document ID
   */
  async findByUserId(userId: string): Promise<CustomisationDocument[]> {
    const querySnapshot = await db
      .collection(CustomisationRepository.collectionName)
      .where('userId', '==', userId)
      .get();

    return mapQuery<CustomisationDocument>(querySnapshot).sort(byNewestFirst);
  }
}

export default CustomisationRepository;
