import { z } from 'zod';

// Schema for client registration
export const registerSchema = z.object({
  body: z.object({
    idToken: z.string({
      message: 'Firebase ID Token is required',
    }).min(1, 'Firebase ID Token cannot be empty'),
    name: z.string({
      message: 'Name is required',
    }).min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    phone: z.string({
      message: 'Phone number is required',
    }).regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number format (e.g. +919876543210)'),
  }),
});

// Schema for user login
export const loginSchema = z.object({
  body: z.object({
    idToken: z.string({
      message: 'Firebase ID Token is required',
    }).min(1, 'Firebase ID Token cannot be empty'),
  }),
});

// Schema for adding/modifying address books
export const addressSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Receiver name is required',
    }).min(2, 'Receiver name must be at least 2 characters long'),
    phone: z.string({
      message: 'Phone number is required',
    }).min(10, 'Phone number must be at least 10 digits long'),
    addressLine1: z.string({
      message: 'Address Line 1 is required',
    }).min(5, 'Address Line 1 must be at least 5 characters long'),
    addressLine2: z.string().optional().nullable(),
    city: z.string({
      message: 'City is required',
    }).min(2, 'City must be at least 2 characters long'),
    state: z.string({
      message: 'State is required',
    }).min(2, 'State must be at least 2 characters long'),
    postalCode: z.string({
      message: 'Postal ZIP Code is required',
    }).min(5, 'Postal code must be at least 5 digits long')
      .max(10, 'Postal code cannot exceed 10 characters'),
    country: z.string().default('India'),
  }),
});

export default {
  registerSchema,
  loginSchema,
  addressSchema,
};
