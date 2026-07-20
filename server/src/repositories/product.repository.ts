import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';
import { Query } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

export interface ProductDocument {
  id?: string;
  slug: string;
  sku: string;
  name: string;
  category: 'WOMEN' | 'MEN' | 'KIDS';
  subcategory: string;
  price: number; // Stored in Paise
  discountPrice?: number | null; // Stored in Paise
  description: string;
  story?: string | null;
  fabric: string;
  colors: string[];
  sizes: { [size: string]: number }; // Inventory map (e.g. { S: 10, M: 5 })
  images: string[];
  videoUrl?: string | null;
  type: 'READY_TO_WEAR' | 'CUSTOM_MADE';
  status: 'PUBLISHED' | 'DRAFT';
  care?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  category?: 'WOMEN' | 'MEN' | 'KIDS';
  subcategory?: string;
  type?: 'READY_TO_WEAR' | 'CUSTOM_MADE';
  status?: 'PUBLISHED' | 'DRAFT';
  priceRange?: 'below10k' | 'above10k';
  search?: string;
}

export class ProductRepository {
  private static collectionName = 'products';

  /**
   * Retrieves a product by its unique document ID.
   * @param id Firestore document ID
   */
  async findById(id: string): Promise<ProductDocument | null> {
    const doc = await db.collection(ProductRepository.collectionName).doc(id).get();
    return mapDoc<ProductDocument>(doc);
  }

  /**
   * Retrieves a product by its unique URL slug.
   * @param slug Unique product slug string
   */
  async findBySlug(slug: string): Promise<ProductDocument | null> {
    const querySnapshot = await db
      .collection(ProductRepository.collectionName)
      .where('slug', '==', slug.toLowerCase())
      .limit(1)
      .get();

    const results = mapQuery<ProductDocument>(querySnapshot);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Resolves the next sequence number in the collection to pad SKUs correctly.
   */
  async getNextSequence(): Promise<number> {
    const snapshot = await db.collection(ProductRepository.collectionName).select().get();
    return snapshot.size + 1;
  }

  /**
   * Creates a new product document.
   * @param product Product specifications
   */
  async create(product: Omit<ProductDocument, 'id'>): Promise<ProductDocument> {
    const docRef = db.collection(ProductRepository.collectionName).doc();
    const now = new Date().toISOString();

    const dataToSave = {
      ...product,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(dataToSave);
    return { id: docRef.id, ...dataToSave };
  }

  /**
   * Updates an existing product document.
   * @param id Product document ID
   * @param product Partial product details
   */
  async update(id: string, product: Partial<ProductDocument>): Promise<ProductDocument | null> {
    const docRef = db.collection(ProductRepository.collectionName).doc(id);
    const now = new Date().toISOString();

    const dataToUpdate = {
      ...product,
      updatedAt: now,
    };

    await docRef.update(dataToUpdate);
    return this.findById(id);
  }

  /**
   * Deletes a product document.
   * @param id Product document ID
   */
  async delete(id: string): Promise<void> {
    await db.collection(ProductRepository.collectionName).doc(id).delete();
  }

  /**
   * Lists products matching filters and applies pagination offsets.
   * @param filters Query filter keys
   * @param pagination Page index and limit
   */
  async list(
    filters: ProductFilters,
    pagination: { page: number; limit: number }
  ): Promise<{ items: ProductDocument[]; total: number }> {
    let queryRef: Query = db.collection(ProductRepository.collectionName);

    // Apply exact match Firestore indexes filters
    if (filters.category) {
      queryRef = queryRef.where('category', '==', filters.category);
    }
    if (filters.subcategory) {
      queryRef = queryRef.where('subcategory', '==', filters.subcategory);
    }
    if (filters.type) {
      queryRef = queryRef.where('type', '==', filters.type);
    }
    if (filters.status) {
      queryRef = queryRef.where('status', '==', filters.status);
    }

    const snapshot = await queryRef.get();
    let products = mapQuery<ProductDocument>(snapshot);

    // Apply client-side filters for search and price ranges to avoid index requirements
    if (filters.priceRange) {
      const tenThousandRupeesInPaise = 1000000;
      if (filters.priceRange === 'below10k') {
        products = products.filter(p => p.price < tenThousandRupeesInPaise);
      } else {
        products = products.filter(p => p.price >= tenThousandRupeesInPaise);
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.fabric.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination slice bounds
    const total = products.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedProducts = products.slice(startIndex, startIndex + pagination.limit);

    return {
      items: paginatedProducts,
      total,
    };
  }
}

export default ProductRepository;
