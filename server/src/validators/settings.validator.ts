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

// Schema for updating global store settings
export const updateSettingsSchema = z.object({
  body: z.object({
    heroBanners: jsonStringPreprocess(
      z.array(
        z.object({
          imageUrl: z.string({
            message: 'Image URL is required',
          }).url('Must be a valid URL'),
          title: z.string({
            message: 'Banner title is required',
          }).min(1, 'Title cannot be empty'),
          subtitle: z.string({
            message: 'Banner subtitle is required',
          }).min(1, 'Subtitle cannot be empty'),
          link: z.string({
            message: 'Banner redirect link is required',
          }).min(1, 'Link cannot be empty'),
        })
      )
    ).optional(),
    whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 digits long').optional(),
    storeHours: z.string().min(1, 'Store hours cannot be empty').optional(),
    shippingRates: jsonStringPreprocess(
      z.array(
        z.object({
          pincodeRange: z.string({
            message: 'Pincode range definition is required',
          }).min(1, 'Pincode range cannot be empty'),
          rate: z.preprocess((val) => {
            if (typeof val === 'string') {
              const parsed = parseInt(val, 10);
              return isNaN(parsed) ? val : parsed;
            }
            return val;
          }, z.number().int().min(0, 'Shipping rate cannot be negative')),
        })
      )
    ).optional(),
  }),
});

export default {
  updateSettingsSchema,
};
