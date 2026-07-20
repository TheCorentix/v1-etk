import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service';
import { sendSuccess } from '../utils/response';

export class SettingsController {
  private settingsService = new SettingsService();

  /**
   * Fetches the global settings.
   */
  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.settingsService.getSettings();
      sendSuccess(res, { settings }, 'Global configurations retrieved.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Modifies the global settings (Admin only).
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { heroBanners, whatsappNumber, storeHours, shippingRates } = req.body;

      const parsedBanners = typeof heroBanners === 'string' ? JSON.parse(heroBanners) : heroBanners;
      const parsedRates = typeof shippingRates === 'string' ? JSON.parse(shippingRates) : shippingRates;

      const updated = await this.settingsService.updateSettings({
        ...(parsedBanners && { heroBanners: parsedBanners }),
        ...(whatsappNumber && { whatsappNumber }),
        ...(storeHours && { storeHours }),
        ...(parsedRates && { shippingRates: parsedRates }),
      });

      sendSuccess(res, { settings: updated }, 'Store settings updated successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Uploads a promotional banner graphic (Admin only).
   */
  uploadBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const localFilePath = req.file?.path;
      if (!localFilePath) {
        res.status(400).json({
          success: false,
          message: 'Image file is required.',
          errors: ['image is required'],
        });
        return;
      }

      const imageUrl = await this.settingsService.uploadBannerImage(localFilePath);
      sendSuccess(res, { imageUrl }, 'Hero banner graphic uploaded successfully.', 201);
    } catch (error) {
      next(error);
    }
  };
}

export default SettingsController;
