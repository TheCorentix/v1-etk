import { z } from 'zod';

// Schema for client customisation request creation
export const createCustomisationSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    phone: z.string({
      message: 'Contact phone number is required',
    }).min(10, 'Phone number must be at least 10 digits long'),
    email: z.string().email('Please provide a valid contact email').optional(),
    whatsappNumber: z.string().optional().nullable(),
    category: z.string({
      message: 'Garment category is required',
    }).min(1, 'Category cannot be empty'),
    occasion: z.string({
      message: 'Occasion details are required',
    }).min(1, 'Occasion cannot be empty'),
    fabricPref: z.string().optional().nullable(),
    colorPref: z.string().optional().nullable(),
    budgetRange: z.string().optional().nullable(),
    deliveryDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(), // Stores measurement details and styling notes
  }),
});

// Schema for updating tailoring request details
export const updateCustomisationSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
    fabricPref: z.string().optional().nullable(),
    colorPref: z.string().optional().nullable(),
    budgetRange: z.string().optional().nullable(),
    deliveryDate: z.string().optional().nullable(),
  }),
});

// Schema for appending stylist notes
export const addNoteSchema = z.object({
  body: z.object({
    text: z.string({
      message: 'Note content is required',
    }).min(1, 'Note content cannot be empty'),
  }),
});

// Schema for transitioning status
export const updateCustomisationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['NEW', 'IN_DISCUSSION', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'DELIVERED'], {
      message: 'Invalid status value. Must match the customisation status workflow.',
    }),
  }),
});

export default {
  createCustomisationSchema,
  updateCustomisationSchema,
  addNoteSchema,
  updateCustomisationStatusSchema,
};
