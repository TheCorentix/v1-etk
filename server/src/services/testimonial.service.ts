import { TestimonialRepository, TestimonialDocument, TestimonialFilters } from '../repositories/testimonial.repository';
import { getPaginationMetadata, PaginationMeta } from '../utils/pagination';
import { logger } from '../config/logger';

export class TestimonialService {
  private testimonialRepository = new TestimonialRepository();

  async createTestimonial(data: Omit<TestimonialDocument, 'id'>): Promise<TestimonialDocument> {
    const created = await this.testimonialRepository.create(data);
    logger.info(`⭐ New testimonial created by ${created.customerName} (ID: ${created.id})`);
    return created;
  }

  async updateTestimonial(id: string, data: Partial<TestimonialDocument>): Promise<TestimonialDocument | null> {
    const existing = await this.testimonialRepository.findById(id);
    if (!existing) {
      throw new Error(`Testimonial with ID ${id} not found.`);
    }
    return this.testimonialRepository.update(id, data);
  }

  async deleteTestimonial(id: string): Promise<void> {
    return this.testimonialRepository.delete(id);
  }

  async getById(id: string): Promise<TestimonialDocument | null> {
    return this.testimonialRepository.findById(id);
  }

  async listTestimonials(
    filters: TestimonialFilters,
    page = 1,
    limit = 20
  ): Promise<{ items: TestimonialDocument[]; pagination: PaginationMeta }> {
    const { items, total } = await this.testimonialRepository.list(filters, { page, limit });
    const pagination = getPaginationMetadata(total, page, limit);
    return { items, pagination };
  }
}

export default TestimonialService;
