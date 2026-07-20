import { CustomisationRepository, CustomisationDocument, AdminNote } from '../repositories/customisation.repository';
import { uploadToCloudinary } from '../utils/cloudinary';
import { getPaginationMetadata, PaginationMeta } from '../utils/pagination';
import { logger } from '../config/logger';

export class CustomisationService {
  private customisationRepository = new CustomisationRepository();

  /**
   * Submits a new tailored fashion request, uploading client-supplied sketches to Cloudinary.
   */
  async createRequest(
    requestData: Omit<CustomisationDocument, 'images' | 'status' | 'adminNotes'>,
    localImagePaths: string[]
  ): Promise<CustomisationDocument> {
    try {
      // 1. Upload client design sketches to Cloudinary customisation-inspiration folder
      const imageUrls: string[] = [];
      for (const path of localImagePaths) {
        const uploadResult = await uploadToCloudinary(path, 'customisation-inspiration');
        imageUrls.push(uploadResult.secureUrl);
      }

      const newRequest: Omit<CustomisationDocument, 'id'> = {
        ...requestData,
        images: imageUrls,
        status: 'NEW',
        adminNotes: [],
      };

      const savedRequest = await this.customisationRepository.create(newRequest);
      logger.info(`✂️ New tailoring request submitted by: ${savedRequest.email} (ID: ${savedRequest.id})`);
      return savedRequest;
    } catch (error) {
      logger.error('Error in CustomisationService createRequest:', error);
      throw error;
    }
  }

  /**
   * Modifies tailoring fields or measurement logs of an existing custom request.
   */
  async updateRequest(id: string, data: Partial<CustomisationDocument>): Promise<CustomisationDocument | null> {
    const existing = await this.customisationRepository.findById(id);
    if (!existing) {
      throw new Error(`Customisation request with ID ${id} not found.`);
    }
    return this.customisationRepository.update(id, data);
  }

  /**
   * Appends an administrative note or stylist consultation logs to the request dossier.
   */
  async addAdminNote(id: string, author: string, text: string): Promise<CustomisationDocument | null> {
    const request = await this.customisationRepository.findById(id);
    if (!request) {
      throw new Error(`Customisation request with ID ${id} not found.`);
    }

    const newNote: AdminNote = {
      author,
      text,
      timestamp: new Date().toISOString(),
    };

    const updatedNotes = [...(request.adminNotes || []), newNote];
    return this.customisationRepository.update(id, { adminNotes: updatedNotes });
  }

  /**
   * Transitions the status state of the request (e.g. from DISCUSSION to PRODUCTION).
   */
  async updateStatus(id: string, status: CustomisationDocument['status']): Promise<CustomisationDocument | null> {
    const request = await this.customisationRepository.findById(id);
    if (!request) {
      throw new Error(`Customisation request with ID ${id} not found.`);
    }

    logger.info(`✂️ Transitioning custom request ${id} status: ${request.status} ➔ ${status}`);
    return this.customisationRepository.update(id, { status });
  }

  /**
   * Lists request dossiers matching filters with pagination data.
   */
  async listRequests(
    filters: any,
    page = 1,
    limit = 10
  ): Promise<{ items: CustomisationDocument[]; pagination: PaginationMeta }> {
    const { items, total } = await this.customisationRepository.list(filters, { page, limit });
    const pagination = getPaginationMetadata(total, page, limit);
    return { items, pagination };
  }

  /**
   * Fetches a specific requests record by ID.
   */
  async getRequestById(id: string): Promise<CustomisationDocument | null> {
    return this.customisationRepository.findById(id);
  }

  /**
   * Lists all requests made by a specific customer.
   */
  async getClientRequests(userId: string): Promise<CustomisationDocument[]> {
    return this.customisationRepository.findByUserId(userId);
  }
}

export default CustomisationService;
