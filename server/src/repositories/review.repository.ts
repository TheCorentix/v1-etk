import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewDocument {
  id?: string;
  productId: string;
  productName: string; // Snapshot, so the admin list still reads well if the product is renamed
  productSlug: string;
  userId: string;
  userName: string; // Full name (shown to the public as "Ananya R.")
  rating: number; // 1-5
  title?: string | null;
  comment: string;
  images: string[]; // Cloudinary URLs of the customer's photos
  orderId: string; // The delivered order that makes this a verified purchase
  status: ReviewStatus;
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const newestFirst = (a: ReviewDocument, b: ReviewDocument): number =>
  (b.createdAt || '').localeCompare(a.createdAt || '');

export class ReviewRepository {
  private static collectionName = 'reviews';
  // Safety cap on how many reviews are loaded at once
  private static maxReviews = 1000;

  async findById(id: string): Promise<ReviewDocument | null> {
    const doc = await db.collection(ReviewRepository.collectionName).doc(id).get();
    return mapDoc<ReviewDocument>(doc);
  }

  async create(review: Omit<ReviewDocument, 'id'>): Promise<ReviewDocument> {
    const docRef = db.collection(ReviewRepository.collectionName).doc();
    const now = new Date().toISOString();
    const dataToSave = { ...review, createdAt: now, updatedAt: now };
    await docRef.set(dataToSave);
    return { id: docRef.id, ...dataToSave };
  }

  async update(id: string, data: Partial<ReviewDocument>): Promise<ReviewDocument | null> {
    const docRef = db.collection(ReviewRepository.collectionName).doc(id);
    await docRef.update({ ...data, updatedAt: new Date().toISOString() });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await db.collection(ReviewRepository.collectionName).doc(id).delete();
  }

  /**
   * Reviews of one product, newest first. Sorted in memory (not with orderBy) so no composite
   * Firestore index is needed.
   */
  async findByProduct(productId: string, status?: ReviewStatus): Promise<ReviewDocument[]> {
    let query = db.collection(ReviewRepository.collectionName).where('productId', '==', productId);
    if (status) query = query.where('status', '==', status);
    const snapshot = await query.limit(ReviewRepository.maxReviews).get();
    return mapQuery<ReviewDocument>(snapshot).sort(newestFirst);
  }

  /** The review a customer already wrote for a product, if any (one review each). */
  async findByUserAndProduct(userId: string, productId: string): Promise<ReviewDocument | null> {
    const snapshot = await db
      .collection(ReviewRepository.collectionName)
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .limit(1)
      .get();
    const found = mapQuery<ReviewDocument>(snapshot);
    return found.length > 0 ? found[0] : null;
  }

  /** Every review, newest first (admin moderation list). */
  async listAll(): Promise<ReviewDocument[]> {
    const snapshot = await db
      .collection(ReviewRepository.collectionName)
      .limit(ReviewRepository.maxReviews)
      .get();
    return mapQuery<ReviewDocument>(snapshot).sort(newestFirst);
  }
}
