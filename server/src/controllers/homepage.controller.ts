import { Request, Response, NextFunction } from 'express';
import { HomepageService } from '../services/homepage.service';
import { sendSuccess } from '../utils/response';

export class HomepageController {
  private homepageService = new HomepageService();

  

  // ---------- Banners ----------

  listBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const banners = await this.homepageService.listBanners();
      sendSuccess(res, { banners }, 'Banners retrieved successfully.', 200);
    } catch (error) { next(error); }
  };

  createBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, subtitle, ctaText, ctaLink, order, isActive } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const localImagePath = files?.image?.[0]?.path;

      if (!localImagePath) {
        res.status(400).json({ success: false, message: 'Banner image is required.', errors: ['image is required'] });
        return;
      }

      const banner = await this.homepageService.createBanner({
        title, subtitle, ctaText, ctaLink,
        order: order ? parseInt(order, 10) : 0,
        isActive: isActive === 'true' || isActive === true,
      }, localImagePath);

      sendSuccess(res, { banner }, 'Banner created successfully.', 201);
    } catch (error) { next(error); }
  };

  updateBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { title, subtitle, ctaText, ctaLink, order, isActive } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const localImagePath = files?.image?.[0]?.path;

      const fields: any = {};
      if (title !== undefined) fields.title = title;
      if (subtitle !== undefined) fields.subtitle = subtitle;
      if (ctaText !== undefined) fields.ctaText = ctaText;
      if (ctaLink !== undefined) fields.ctaLink = ctaLink;
      if (order !== undefined) fields.order = parseInt(order, 10);
      if (isActive !== undefined) fields.isActive = isActive === 'true' || isActive === true;

      const banner = await this.homepageService.updateBanner(id, fields, localImagePath);
      sendSuccess(res, { banner }, 'Banner updated successfully.', 200);
    } catch (error) { next(error); }
  };

  deleteBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.homepageService.deleteBanner(id);
      sendSuccess(res, {}, 'Banner deleted successfully.', 200);
    } catch (error) { next(error); }
  };

  // ---------- Sections ----------

  listSections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sections = await this.homepageService.listSections();
      sendSuccess(res, { sections }, 'Sections retrieved successfully.', 200);
    } catch (error) { next(error); }
  };

  createSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, title, config, order, isActive } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const localImagePath = files?.image?.[0]?.path;

      const section = await this.homepageService.createSection({
        type, title,
        config: typeof config === 'string' ? JSON.parse(config) : config,
        order: order ? parseInt(order, 10) : 0,
        isActive: isActive === 'true' || isActive === true,
      }, localImagePath);

      sendSuccess(res, { section }, 'Section created successfully.', 201);
    } catch (error) { next(error); }
  };

  updateSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { type, title, config, order, isActive } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const localImagePath = files?.image?.[0]?.path;

      const fields: any = {};
      if (type !== undefined) fields.type = type;
      if (title !== undefined) fields.title = title;
      if (config !== undefined) fields.config = typeof config === 'string' ? JSON.parse(config) : config;
      if (order !== undefined) fields.order = parseInt(order, 10);
      if (isActive !== undefined) fields.isActive = isActive === 'true' || isActive === true;

      const section = await this.homepageService.updateSection(id, fields, localImagePath);
      sendSuccess(res, { section }, 'Section updated successfully.', 200);
    } catch (error) { next(error); }
  };

  deleteSection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.homepageService.deleteSection(id);
      sendSuccess(res, {}, 'Section deleted successfully.', 200);
    } catch (error) { next(error); }
  };

  // ---------- Statistics ----------

  listStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statistics = await this.homepageService.listStatistics();
      sendSuccess(res, { statistics }, 'Statistics retrieved successfully.', 200);
    } catch (error) { next(error); }
  };

  createStatistic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { label, value, icon, order } = req.body;
      const statistic = await this.homepageService.createStatistic({
        label, value, icon, order: order ? parseInt(order, 10) : 0,
      });
      sendSuccess(res, { statistic }, 'Statistic created successfully.', 201);
    } catch (error) { next(error); }
  };

  updateStatistic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const statistic = await this.homepageService.updateStatistic(id, req.body);
      sendSuccess(res, { statistic }, 'Statistic updated successfully.', 200);
    } catch (error) { next(error); }
  };

  deleteStatistic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.homepageService.deleteStatistic(id);
      sendSuccess(res, {}, 'Statistic deleted successfully.', 200);
    } catch (error) { next(error); }
  };

  // ---------- Announcement Bar ----------

  getAnnouncementBar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcementBar = await this.homepageService.getAnnouncementBar();
      sendSuccess(res, { announcementBar }, 'Announcement bar retrieved.', 200);
    } catch (error) { next(error); }
  };

  updateAnnouncementBar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const announcementBar = await this.homepageService.updateAnnouncementBar(req.body);
      sendSuccess(res, { announcementBar }, 'Announcement bar updated.', 200);
    } catch (error) { next(error); }
  };

  // ---------- Video ----------

  getVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const video = await this.homepageService.getVideo();
      sendSuccess(res, { video }, 'Homepage video retrieved.', 200);
    } catch (error) { next(error); }
  };

  updateVideo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const localVideoPath = files?.video?.[0]?.path;

      const video = await this.homepageService.updateVideo({ title }, localVideoPath);
      sendSuccess(res, { video }, 'Homepage video updated.', 200);
    } catch (error) { next(error); }
  };
}

export default HomepageController;