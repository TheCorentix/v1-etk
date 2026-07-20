import { z } from 'zod';

// Helper to preprocess and parse potential JSON strings sent via multipart/form-data
const jsonStringPreprocess = (fallbackSchema: z.ZodTypeAny) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, fallbackSchema);

// Schema for lookbook coordinate hotspot tags
const tagSchema = z.object({
  productId: z.string({
    message: 'Tagged Product ID is required',
  }).min(1, 'Product ID cannot be empty'),
  x: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number().min(0, 'X percentage coordinate offset cannot be less than 0').max(100, 'X coordinate offset cannot exceed 100')),
  y: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number().min(0, 'Y percentage coordinate offset cannot be less than 0').max(100, 'Y coordinate offset cannot exceed 100')),
  timestamp: z.string().optional().nullable(),
});

export const createLookbookSchema = z.object({
  body: z.object({
    title: z.string({
      message: 'Lookbook title is required',
    }).min(2, 'Lookbook title must be at least 2 characters long'),
    tags: jsonStringPreprocess(z.array(tagSchema).default([])),
  }),
});

export const updateLookbookSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    tags: jsonStringPreprocess(z.array(tagSchema)).optional(),
  }),
});

export default {
  createLookbookSchema,
  updateLookbookSchema,
};
