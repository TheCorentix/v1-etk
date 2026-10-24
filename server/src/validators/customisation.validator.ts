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
    productId: z.string().optional().nullable(),
    productSku: z.string().optional().nullable(),
    fabricPref: z.string().optional().nullable(), // For tailoring, free-text fabric details
    colorPref: z.string().optional().nullable(),
    budgetRange: z.string().optional().nullable(),
    address: z.string().optional().nullable(), // Sender's postal address (bespoke tailoring)
    deliveryDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(), // Stores measurement details and styling notes
  }),
});

// Schema for updating request details. Customers can only change their own notes and
// preferences; the contact fields (name, phone, email, WhatsApp, address) are applied for
// admins only, which the controller enforces.
export const updateCustomisationSchema = z.object({
  body: z.object({
    customerName: z.string().trim().min(2, 'Name must be at least 2 characters long').optional(),
    phone: z.string().trim().min(10, 'Phone number must be at least 10 digits long').optional(),
    email: z.string().trim().email('Please provide a valid contact email').optional(),
    whatsappNumber: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    notes: z.string().optional(),
    fabricPref: z.string().optional().nullable(),
    colorPref: z.string().optional().nullable(),
    budgetRange: z.string().optional().nullable(),
    deliveryDate: z.string().optional().nullable(),
  }),
});

// Schema for creating or editing a request's invoice. Amounts are whole paise; the server
// recomputes every total, so none are accepted here.
export const saveInvoiceSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invoice date must look like 2026-10-24').optional(),
    items: z
      .array(
        z.object({
          name: z.string({ message: 'Item name is required' }).trim().min(1, 'Item name is required').max(200, 'Item name is too long'),
          quantity: z.number({ message: 'Quantity is required' }).int('Quantity must be a whole number').min(1, 'Quantity must be at least 1').max(10000, 'Quantity is too large'),
          unitPrice: z.number({ message: 'Cost is required' }).int().min(0, 'Cost cannot be negative').max(1_000_000_000, 'Cost is too large'),
        })
      )
      .min(1, 'Add at least one item')
      .max(50, 'An invoice can have at most 50 items'),
    discount: z.number().int().min(0, 'Discount cannot be negative').default(0),
    shipping: z.number().int().min(0, 'Shipping cannot be negative').default(0),
  }),
});

// Schema for adding an internal team comment
export const addCommentSchema = z.object({
  body: z.object({
    text: z.string({
      message: 'Comment text is required',
    }).trim().min(1, 'Comment cannot be empty').max(2000, 'Comment cannot exceed 2000 characters'),
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
    status: z.enum(['NEW', 'ORDER_TAKEN', 'SHIPPED', 'DELIVERED'], {
      message: 'Invalid status value. Must match the customisation status workflow.',
    }),
  }),
});

export default {
  createCustomisationSchema,
  updateCustomisationSchema,
  addNoteSchema,
  addCommentSchema,
  saveInvoiceSchema,
  updateCustomisationStatusSchema,
};
