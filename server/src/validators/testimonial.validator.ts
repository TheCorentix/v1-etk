import { z } from 'zod';

// Coerce ratings that may arrive as strings (e.g. from forms) into numbers.
const ratingSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? val : parsed;
  }
  return val;
}, z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'));

export const createTestimonialSchema = z.object({
  body: z.object({
    customerName: z.string({
      message: 'Customer name is required',
    }).min(2, 'Customer name must be at least 2 characters long'),
    review: z.string({
      message: 'Review text is required',
    }).min(5, 'Review must be at least 5 characters long'),
    rating: ratingSchema.optional().default(5),
    customerImageUrl: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  }),
});

export const updateTestimonialSchema = z.object({
  body: z.object({
    customerName: z.string().min(2).optional(),
    review: z.string().min(5).optional(),
    rating: ratingSchema.optional(),
    customerImageUrl: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export default {
  createTestimonialSchema,
  updateTestimonialSchema,
};
