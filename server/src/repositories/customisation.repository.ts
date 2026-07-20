import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';
import { Query } from 'firebase-admin/firestore';

export interface AdminNote {
  author: string;
  text: string;
  timestamp: string;
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
  fabricPref?: string | null;
  colorPref?: string | null;
  budgetRange?: string | null;
  deliveryDate?: string | null;
  images: string[]; // Cloudinary secure URLs of design sketches/inspiration photos
  notes?: string | null; // Measurement values and stylist summary details
  status: 'NEW' | 'IN_DISCUSSION' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY' | 'DELIVERED';
  adminNotes: AdminNote[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomisationFilters {
  userId?: string;
  status?: 'NEW' | 'IN_DISCUSSION' | 'CONFIRMED' | 'IN_PRODUCTION' | 'READY' | 'DELIVERED';
}

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

    // Default sorting order by creation date (descending)
    queryRef = queryRef.orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    const customisations = mapQuery<CustomisationDocument>(snapshot);

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
      .orderBy('createdAt', 'desc')
      .get();

    return mapQuery<CustomisationDocument>(querySnapshot);
  }
}

export default CustomisationRepository;
