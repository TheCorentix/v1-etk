import { db } from '../config/firebase';
import { mapDoc } from '../utils/firebase';

export interface HeroBanner {
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface ShippingRate {
  pincodeRange: string;
  rate: number; // Stored in Paise
}

export interface SettingsDocument {
  id?: string;
  heroBanners: HeroBanner[];
  whatsappNumber: string;
  storeHours: string;
  shippingRates: ShippingRate[];
  updatedAt?: string;
}

export class SettingsRepository {
  private static collectionName = 'storeSettings';
  private static docId = 'default';

  /**
   * Fetches the global settings document.
   */
  async get(): Promise<SettingsDocument | null> {
    const doc = await db.collection(SettingsRepository.collectionName).doc(SettingsRepository.docId).get();
    return mapDoc<SettingsDocument>(doc);
  }

  /**
   * Modifies or initializes the global settings document.
   * @param settings Partial settings parameters
   */
  async update(settings: Partial<SettingsDocument>): Promise<SettingsDocument | null> {
    const docRef = db.collection(SettingsRepository.collectionName).doc(SettingsRepository.docId);
    const now = new Date().toISOString();

    const dataToSave = {
      ...settings,
      updatedAt: now,
    };

    // Use merge: true to avoid erasing unspecified existing configurations
    await docRef.set(dataToSave, { merge: true });
    return this.get();
  }
}

export default SettingsRepository;
