import {
  HeroBannerRepository, HeroBannerDocument,
  HomepageSectionRepository, HomepageSectionDocument,
  StatisticRepository, StatisticDocument,
  AnnouncementBarRepository, AnnouncementBarDocument,
  HomepageVideoRepository, HomepageVideoDocument,
} from '../repositories/homepage.repository';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { logger } from '../config/logger';

const publicIdFromUrl = (url: string, folder: string): string => {
  const parts = url.split('/');
  const file = parts[parts.length - 1];
  return `etniko/${folder}/${file.split('.')[0]}`;
};

export class HomepageService {
  private bannerRepo = new HeroBannerRepository();
  private sectionRepo = new HomepageSectionRepository();
  private statisticRepo = new StatisticRepository();
  private announcementRepo = new AnnouncementBarRepository();
  private videoRepo = new HomepageVideoRepository();

  // ---------- Banners ----------

  async listBanners(): Promise<HeroBannerDocument[]> {
    return this.bannerRepo.list();
  }

  async createBanner(data: Omit<HeroBannerDocument, 'id' | 'imageUrl'>, localImagePath: string): Promise<HeroBannerDocument> {
    const uploadResult = await uploadToCloudinary(localImagePath, 'homepage/banner');
    const banner = await this.bannerRepo.create({ ...data, imageUrl: uploadResult.secureUrl });
    logger.info(`🖼️ Homepage banner created (ID: ${banner.id})`);
    return banner;
  }

  async updateBanner(id: string, data: Partial<HeroBannerDocument>, localImagePath?: string): Promise<HeroBannerDocument | null> {
    const existing = await this.bannerRepo.findById(id);
    if (!existing) throw new Error(`Banner with ID ${id} not found.`);

    let imageUrl = existing.imageUrl;
    if (localImagePath) {
      const uploadResult = await uploadToCloudinary(localImagePath, 'homepage/banner');
      imageUrl = uploadResult.secureUrl;
      await deleteFromCloudinary(
  publicIdFromUrl(existing.imageUrl, 'homepage/banner')
);
    }

    return this.bannerRepo.update(id, { ...data, imageUrl });
  }

  async deleteBanner(id: string): Promise<void> {
    const existing = await this.bannerRepo.findById(id);
    if (!existing) throw new Error(`Banner with ID ${id} not found.`);
    await deleteFromCloudinary(
  publicIdFromUrl(existing.imageUrl, 'homepage/banner')
);
    await this.bannerRepo.delete(id);
    logger.info(`🖼️ Homepage banner deleted (ID: ${id})`);
  }

  // ---------- Sections ----------

  async listSections(): Promise<HomepageSectionDocument[]> {
    return this.sectionRepo.list();
  }

  async createSection(data: Omit<HomepageSectionDocument, 'id' | 'imageUrl'>, localImagePath?: string): Promise<HomepageSectionDocument> {
    let imageUrl: string | null = null;
    if (localImagePath) {
      const uploadResult = await uploadToCloudinary(localImagePath, 'homepage/section');
      imageUrl = uploadResult.secureUrl;
    }
    const section = await this.sectionRepo.create({ ...data, imageUrl });
    logger.info(`🧩 Homepage section created (ID: ${section.id})`);
    return section;
  }

  async updateSection(id: string, data: Partial<HomepageSectionDocument>, localImagePath?: string): Promise<HomepageSectionDocument | null> {
    const existing = await this.sectionRepo.findById(id);
    if (!existing) throw new Error(`Section with ID ${id} not found.`);

    let imageUrl = existing.imageUrl;
    if (localImagePath) {
      const uploadResult = await uploadToCloudinary(localImagePath, 'homepage/section');
      imageUrl = uploadResult.secureUrl;
      if (existing.imageUrl) {
        await deleteFromCloudinary(publicIdFromUrl(existing.imageUrl, 'homepage/section'));
      }
    }

    return this.sectionRepo.update(id, { ...data, imageUrl });
  }

  async deleteSection(id: string): Promise<void> {
    const existing = await this.sectionRepo.findById(id);
    if (!existing) throw new Error(`Section with ID ${id} not found.`);
    if (existing.imageUrl) {
      await deleteFromCloudinary(publicIdFromUrl(existing.imageUrl, 'homepage/section'));
    }
    await this.sectionRepo.delete(id);
    logger.info(`🧩 Homepage section deleted (ID: ${id})`);
  }

  // ---------- Statistics ----------

  async listStatistics(): Promise<StatisticDocument[]> {
    return this.statisticRepo.list();
  }

  async createStatistic(data: Omit<StatisticDocument, 'id'>): Promise<StatisticDocument> {
    return this.statisticRepo.create(data);
  }

  async updateStatistic(id: string, data: Partial<StatisticDocument>): Promise<StatisticDocument | null> {
    const existing = await this.statisticRepo.findById(id);
    if (!existing) throw new Error(`Statistic with ID ${id} not found.`);
    return this.statisticRepo.update(id, data);
  }

  async deleteStatistic(id: string): Promise<void> {
    await this.statisticRepo.delete(id);
  }

  // ---------- Announcement Bar ----------

  async getAnnouncementBar(): Promise<AnnouncementBarDocument> {
    const existing = await this.announcementRepo.get();
    return existing || { text: '', isActive: false };
  }

  async updateAnnouncementBar(data: Partial<AnnouncementBarDocument>): Promise<AnnouncementBarDocument> {
    return this.announcementRepo.update(data);
  }

  // ---------- Video ----------

  async getVideo(): Promise<HomepageVideoDocument> {
    const existing = await this.videoRepo.get();
    return existing || { videoUrl: '', thumbnailUrl: null };
  }

  async updateVideo(data: Partial<HomepageVideoDocument>, localVideoPath?: string): Promise<HomepageVideoDocument> {
    let videoUrl = data.videoUrl;
    if (localVideoPath) {
      const uploadResult = await uploadToCloudinary(localVideoPath, 'homepage/video');
      videoUrl = uploadResult.secureUrl;
    }
    return this.videoRepo.update({ ...data, ...(videoUrl ? { videoUrl } : {}) });
  }
}

export default HomepageService;