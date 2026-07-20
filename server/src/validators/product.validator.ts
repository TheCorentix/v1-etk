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

// Helper to preprocess and coerce strings to integers (e.g. price fields)
const numberPreprocess = z.preprocess((val) => {
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? val : parsed;
  }
  return val;
}, z.number().int().min(0, 'Value must be a positive integer'));

export const createProductSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Product name is required',
    }).min(2, 'Product name must be at least 2 characters long'),
    category: z.enum(['WOMEN', 'MEN', 'KIDS'], {
      message: 'Category must be WOMEN, MEN, or KIDS',
    }),
    subcategory: z.string({
      message: 'Subcategory is required',
    }).min(1, 'Subcategory cannot be empty'),
    price: numberPreprocess,
    discountPrice: z.preprocess((val) => {
      if (val === '' || val === 'null' || val === undefined) return null;
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? val : parsed;
      }
      return val;
    }, z.number().int().min(0).nullable().optional()),
    description: z.string({
      message: 'Description is required',
    }).min(5, 'Description must be at least 5 characters long'),
    story: z.string().optional().nullable(),
    fabric: z.string({
      message: 'Fabric details are required',
    }).min(2, 'Fabric details must specify the weave'),
    colors: jsonStringPreprocess(z.array(z.string()).min(1, 'At least one color swatch is required')),
    sizes: jsonStringPreprocess(
      z.record(z.string(), z.number().int().min(0, 'Inventory stock cannot be negative'))
    ),
    type: z.enum(['READY_TO_WEAR', 'CUSTOM_MADE'], {
      message: 'Garment type must be READY_TO_WEAR or CUSTOM_MADE',
    }),
    status: z.enum(['PUBLISHED', 'DRAFT']).default('DRAFT'),
    care: z.string().optional().nullable(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    category: z.enum(['WOMEN', 'MEN', 'KIDS']).optional(),
    subcategory: z.string().min(1).optional(),
    price: numberPreprocess.optional(),
    discountPrice: z.preprocess((val) => {
      if (val === '' || val === 'null' || val === undefined) return null;
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? val : parsed;
      }
      return val;
    }, z.number().int().min(0).nullable().optional()),
    description: z.string().min(5).optional(),
    story: z.string().optional().nullable(),
    fabric: z.string().min(2).optional(),
    colors: jsonStringPreprocess(z.array(z.string()).min(1)).optional(),
    sizes: jsonStringPreprocess(
      z.record(z.string(), z.number().int().min(0))
    ).optional(),
    type: z.enum(['READY_TO_WEAR', 'CUSTOM_MADE']).optional(),
    status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
    care: z.string().optional().nullable(),
  }),
});

export default {
  createProductSchema,
  updateProductSchema,
};
