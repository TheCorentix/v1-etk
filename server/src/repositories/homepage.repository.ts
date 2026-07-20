import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';
import { Query } from 'firebase-admin/firestore';

// ---------- Types ----------

export interface HeroBannerDocument {
  id?: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageSectionDocument {
  id?: string;
  type: string; // e.g. 'featured-products', 'banner-grid', 'testimonial-strip'
  title?: string;
  imageUrl?: string | null;
  config?: Record<string, any>;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StatisticDocument {
  id?: string;
  label: string;
  value: string;
  icon?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncementBarDocument {
  text: string;
  isActive: boolean;
  link?: string;
  updatedAt?: string;
}

export interface HomepageVideoDocument {
  videoUrl: string;
  thumbnailUrl?: string | null;
  title?: string;
  updatedAt?: string;
}

// ---------- Generic ordered-collection repository (banners / sections / statistics) ----------

class OrderedRepository<T extends { id?: string; order: number }> {
  constructor(private collectionName: string) {}

  async findById(id: string): Promise<T | null> {
    const doc = await db.collection(this.collectionName).doc(id).get();
    return mapDoc<T>(doc);
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const docRef = db.collection(this.collectionName).doc();
    const now = new Date().toISOString();
    const dataToSave = { ...data, createdAt: now, updatedAt: now };
    await docRef.set(dataToSave);
    return { id: docRef.id, ...dataToSave } as unknown as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const docRef = db.collection(this.collectionName).doc(id);
    const now = new Date().toISOString();
    await docRef.update({ ...data, updatedAt: now });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await db.collection(this.collectionName).doc(id).delete();
  }

  async list(): Promise<T[]> {
    let queryRef: Query = db.collection(this.collectionName);
    queryRef = queryRef.orderBy('order', 'asc');
    const snapshot = await queryRef.get();
    return mapQuery<T>(snapshot);
  }
}

export class HeroBannerRepository extends OrderedRepository<HeroBannerDocument> {
  constructor() {
    super('homepageBanners');
  }
}

export class HomepageSectionRepository extends OrderedRepository<HomepageSectionDocument> {
  constructor() {
    super('homepageSections');
  }
}

export class StatisticRepository extends OrderedRepository<StatisticDocument> {
  constructor() {
    super('homepageStatistics');
  }
}

// ---------- Singleton-document repositories (announcement bar / video) ----------

export class AnnouncementBarRepository {
  private collectionName = 'homepageSettings';
  private docId = 'announcementBar';

  async get(): Promise<AnnouncementBarDocument | null> {
    const doc = await db.collection(this.collectionName).doc(this.docId).get();
    if (!doc.exists) return null;
    return doc.data() as AnnouncementBarDocument;
  }

  async update(data: Partial<AnnouncementBarDocument>): Promise<AnnouncementBarDocument> {
    const now = new Date().toISOString();
    const docRef = db.collection(this.collectionName).doc(this.docId);
    await docRef.set({ ...data, updatedAt: now }, { merge: true });
    const updated = await docRef.get();
    return updated.data() as AnnouncementBarDocument;
  }
}

export class HomepageVideoRepository {
  private collectionName = 'homepageSettings';
  private docId = 'video';

  async get(): Promise<HomepageVideoDocument | null> {
    const doc = await db.collection(this.collectionName).doc(this.docId).get();
    if (!doc.exists) return null;
    return doc.data() as HomepageVideoDocument;
  }

  async update(data: Partial<HomepageVideoDocument>): Promise<HomepageVideoDocument> {
    const now = new Date().toISOString();
    const docRef = db.collection(this.collectionName).doc(this.docId);
    await docRef.set({ ...data, updatedAt: now }, { merge: true });
    const updated = await docRef.get();
    return updated.data() as HomepageVideoDocument;
  }
}