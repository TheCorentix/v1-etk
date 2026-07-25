import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';
import { Query } from 'firebase-admin/firestore';

export interface TestimonialDocument {
  id?: string;
  customerName: string;
  rating: number; // 1–5
  review: string;
  customerImageUrl?: string | null; // Optional; storefront falls back to default avatars
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonialFilters {
  status?: 'ACTIVE' | 'INACTIVE';
}

export class TestimonialRepository {
  private static collectionName = 'testimonials';

  async findById(id: string): Promise<TestimonialDocument | null> {
    const doc = await db.collection(TestimonialRepository.collectionName).doc(id).get();
    return mapDoc<TestimonialDocument>(doc);
  }

  async create(testimonial: Omit<TestimonialDocument, 'id'>): Promise<TestimonialDocument> {
    const docRef = db.collection(TestimonialRepository.collectionName).doc();
    const now = new Date().toISOString();
    const dataToSave = { ...testimonial, createdAt: now, updatedAt: now };
    await docRef.set(dataToSave);
    return { id: docRef.id, ...dataToSave };
  }

  async update(id: string, data: Partial<TestimonialDocument>): Promise<TestimonialDocument | null> {
    const docRef = db.collection(TestimonialRepository.collectionName).doc(id);
    await docRef.update({ ...data, updatedAt: new Date().toISOString() });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await db.collection(TestimonialRepository.collectionName).doc(id).delete();
  }

  async list(
    filters: TestimonialFilters,
    pagination: { page: number; limit: number }
  ): Promise<{ items: TestimonialDocument[]; total: number }> {
    let queryRef: Query = db.collection(TestimonialRepository.collectionName);
    if (filters.status) {
      queryRef = queryRef.where('status', '==', filters.status);
    }
    const snapshot = await queryRef.get();
    let items = mapQuery<TestimonialDocument>(snapshot);

    // Newest first (sorted in-memory to avoid composite index requirements)
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const total = items.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginated = items.slice(startIndex, startIndex + pagination.limit);
    return { items: paginated, total };
  }
}

export default TestimonialRepository;
