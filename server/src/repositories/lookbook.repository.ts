import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';
import { Query } from 'firebase-admin/firestore';

export interface HotspotTag {
  productId: string;
  x: number; // Percent coordinate offset (0 - 100)
  y: number; // Percent coordinate offset (0 - 100)
  timestamp?: string | null;
}

export interface LookbookDocument {
  id?: string;
  videoUrl: string; // Cloudinary secure URL
  thumbnailUrl: string | null; // Cloudinary secure image URL
  title: string;
  tags: HotspotTag[];
  createdAt?: string;
  updatedAt?: string;
}

export class LookbookRepository {
  private static collectionName = 'lookVideos';

  /**
   * Retrieves a single lookbook video record by ID.
   * @param id Lookbook document ID
   */
  async findById(id: string): Promise<LookbookDocument | null> {
    const doc = await db.collection(LookbookRepository.collectionName).doc(id).get();
    return mapDoc<LookbookDocument>(doc);
  }

  /**
   * Creates a new lookbook video document.
   * @param lookbook Lookbook request details
   */
  async create(lookbook: Omit<LookbookDocument, 'id'>): Promise<LookbookDocument> {
    const docRef = db.collection(LookbookRepository.collectionName).doc();
    const now = new Date().toISOString();

    const dataToSave = {
      ...lookbook,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(dataToSave);
    return { id: docRef.id, ...dataToSave };
  }

  /**
   * Updates an existing lookbook video tags or coordinates.
   * @param id Lookbook document ID
   * @param data Partial lookbook details
   */
  async update(id: string, data: Partial<LookbookDocument>): Promise<LookbookDocument | null> {
    const docRef = db.collection(LookbookRepository.collectionName).doc(id);
    const now = new Date().toISOString();

    const dataToUpdate = {
      ...data,
      updatedAt: now,
    };

    await docRef.update(dataToUpdate);
    return this.findById(id);
  }

  /**
   * Removes a lookbook video document.
   * @param id Lookbook document ID
   */
  async delete(id: string): Promise<void> {
    await db.collection(LookbookRepository.collectionName).doc(id).delete();
  }

  /**
   * Lists lookbook videos with page offsets.
   * @param pagination Page index and limit
   */
  async list(pagination: { page: number; limit: number }): Promise<{ items: LookbookDocument[]; total: number }> {
    let queryRef: Query = db.collection(LookbookRepository.collectionName);

    // Sort by creation date (descending)
    queryRef = queryRef.orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    const lookbooks = mapQuery<LookbookDocument>(snapshot);

    const total = lookbooks.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedItems = lookbooks.slice(startIndex, startIndex + pagination.limit);

    return {
      items: paginatedItems,
      total,
    };
  }
}

export default LookbookRepository;
