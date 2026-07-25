import { Request, Response, NextFunction } from 'express';
import { TestimonialService } from '../services/testimonial.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TestimonialController {
  private testimonialService = new TestimonialService();

  /**
   * Lists testimonials. Public callers see ACTIVE only; admins see all.
   */
  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, status } = req.query;
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 20;

      const isAdmin = req.user && req.user.role === 'ADMIN';
      const filters: any = {};
      if (isAdmin) {
        if (status) filters.status = status;
      } else {
        filters.status = 'ACTIVE';
      }

      const result = await this.testimonialService.listTestimonials(filters, pageNum, limitNum);
      sendSuccess(res, result, 'Testimonials retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerName, review, rating, customerImageUrl, status } = req.body;
      const testimonial = await this.testimonialService.createTestimonial({
        customerName,
        review,
        rating: rating ?? 5,
        customerImageUrl: customerImageUrl || null,
        status: status || 'ACTIVE',
      });
      sendSuccess(res, { testimonial }, 'Testimonial created successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const testimonial = await this.testimonialService.updateTestimonial(id, req.body);
      if (!testimonial) {
        res.status(404).json({ success: false, message: 'Testimonial not found', errors: ['Not Found'] });
        return;
      }
      sendSuccess(res, { testimonial }, 'Testimonial updated successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.testimonialService.deleteTestimonial(id);
      sendSuccess(res, {}, 'Testimonial deleted successfully.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default TestimonialController;
