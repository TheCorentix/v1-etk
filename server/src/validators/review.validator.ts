import { z } from 'zod';

// A customer writing a review. Arrives as a multipart form (photos are attached as files),
// so every field is text and the rating has to be turned into a number.
export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string({ message: 'Product is required' }).trim().min(1, 'Product is required'),
    rating: z.preprocess(
      (value) => (value === '' || value === undefined || value === null ? undefined : Number(value)),
      z
        .number({ message: 'Please choose a star rating' })
        .int('Please choose a star rating')
        .min(1, 'Please choose a star rating')
        .max(5, 'The rating cannot be more than 5 stars')
    ),
    title: z.string().trim().max(100, 'The title cannot exceed 100 characters').optional(),
    comment: z
      .string({ message: 'Please write your review' })
      .trim()
      .min(10, 'Please write at least 10 characters')
      .max(2000, 'The review cannot exceed 2000 characters'),
  }),
});

// Moderation: an admin approving, rejecting or putting a review back to pending
export const reviewStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], {
      message: 'Status must be PENDING, APPROVED or REJECTED',
    }),
  }),
});

export default { createReviewSchema, reviewStatusSchema };
