import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';

export interface MediaDocument {
  id?: string;
  url: string; // Cloudinary secure URL
  publicId: string;
  filename: string; // Original file name shown in the admin library
  folder: string; // Library folder key (media_library, products, homepage, lookbooks)
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  fileSize: number; // bytes
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

// Collections that can embed media URLs, with the label shown in the library's "used in" list
const USAGE_SOURCES: { collection: string; label: string; nameFields: string[] }[] = [
  { collection: 'products', label: 'Product', nameFields: ['name'] },
  { collection: 'homepageBanners', label: 'Homepage banner', nameFields: ['title', 'heading'] },
  { collection: 'homepageSections', label: 'Homepage section', nameFields: ['title'] },
  { collection: 'testimonials', label: 'Testimonial', nameFields: ['customerName'] },
  { collection: 'lookVideos', label: 'Lookbook', nameFields: ['title'] },
  { collection: 'storeSettings', label: 'Store settings', nameFields: [] },
  { collection: 'homepageSettings', label: 'Homepage settings', nameFields: [] },
];

// Collects every http(s) string found anywhere inside a document
const collectUrls = (value: unknown, found: Set<string>): void => {
  if (typeof value === 'string') {
    if (/^https?:\/\//.test(value)) found.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectUrls(item, found));
  } else if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectUrls(item, found));
  }
};

export class MediaRepository {
  private static collectionName = 'mediaAssets';
  // Safety cap on how many assets the library loads at once
  private static maxAssets = 2000;

  async findById(id: string): Promise<MediaDocument | null> {
    const doc = await db.collection(MediaRepository.collectionName).doc(id).get();
    return mapDoc<MediaDocument>(doc);
  }

  async create(media: Omit<MediaDocument, 'id'>): Promise<MediaDocument> {
    const docRef = db.collection(MediaRepository.collectionName).doc();
    const now = new Date().toISOString();
    const dataToSave = { ...media, createdAt: now, updatedAt: now };
    await docRef.set(dataToSave);
    return { id: docRef.id, ...dataToSave };
  }

  async delete(id: string): Promise<void> {
    await db.collection(MediaRepository.collectionName).doc(id).delete();
  }

  /**
   * Newest-first list of all assets. Filtering, search and paging happen in the service
   * so no composite Firestore indexes are needed.
   */
  async listAll(): Promise<MediaDocument[]> {
    const snapshot = await db
      .collection(MediaRepository.collectionName)
      .orderBy('createdAt', 'desc')
      .limit(MediaRepository.maxAssets)
      .get();
    return mapQuery<MediaDocument>(snapshot);
  }

  /**
   * Maps each media URL to the places that currently use it (products, banners, etc.).
   */
  async buildUsageMap(): Promise<Map<string, string[]>> {
    const usage = new Map<string, string[]>();

    await Promise.all(
      USAGE_SOURCES.map(async ({ collection, label, nameFields }) => {
        const snapshot = await db.collection(collection).get();
        snapshot.forEach((doc: { id: string; data: () => Record<string, any> }) => {
          const data = doc.data();
          const name = nameFields.map((field) => data[field]).find(Boolean);
          const where = name ? `${label}: ${name}` : label;

          const urls = new Set<string>();
          collectUrls(data, urls);
          urls.forEach((url) => {
            const places = usage.get(url) || [];
            if (!places.includes(where)) places.push(where);
            usage.set(url, places);
          });
        });
      })
    );

    return usage;
  }
}
