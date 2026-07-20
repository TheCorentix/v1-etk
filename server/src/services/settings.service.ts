import { SettingsRepository, SettingsDocument } from '../repositories/settings.repository';
import { uploadToCloudinary } from '../utils/cloudinary';
import { logger } from '../config/logger';

export class SettingsService {
  private settingsRepository = new SettingsRepository();

  /**
   * Fetches the global settings. Returns default configurations if the database record is empty.
   */
  async getSettings(): Promise<SettingsDocument> {
    const settings = await this.settingsRepository.get();
    if (settings) {
      return settings;
    }

    // Default configuration fallback
    const defaultSettings: SettingsDocument = {
      heroBanners: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1610030470298-4c5855797ee3?auto=format&fit=crop&w=1200&q=80',
          title: 'Timeless Heritage Weaves',
          subtitle: 'Pure Banarasi Chanderi Silks & Zari Couture',
          link: '/shop?category=WOMEN',
        },
      ],
      whatsappNumber: '+919876543210',
      storeHours: 'Monday - Saturday: 11:00 AM - 8:00 PM IST',
      shippingRates: [
        {
          pincodeRange: 'default',
          rate: 15000, // ₹150 in Paise
        },
      ],
    };

    logger.info('⚙️ Initializing default settings template on first fetch.');
    return this.settingsRepository.update(defaultSettings) as Promise<SettingsDocument>;
  }

  /**
   * Modifies the global settings parameters.
   * @param data Partial settings specifications
   */
  async updateSettings(data: Partial<SettingsDocument>): Promise<SettingsDocument | null> {
    logger.info('⚙️ Updating global settings configurations.');
    return this.settingsRepository.update(data);
  }

  /**
   * Uploads a promotional banner graphic directly to Cloudinary's settings repository.
   * @param localFilePath Path to the file stored temporarily on the server disk
   */
  async uploadBannerImage(localFilePath: string): Promise<string> {
    try {
      const uploadResult = await uploadToCloudinary(localFilePath, 'settings');
      return uploadResult.secureUrl;
    } catch (error) {
      logger.error('Failed to upload hero banner image:', error);
      throw error;
    }
  }
}

export default SettingsService;
