import { z } from 'zod';

// Schema for initial checkout order creation
export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string({
          message: 'Product ID is required',
        }).min(1, 'Product ID cannot be empty'),
        size: z.string({
          message: 'Size code is required',
        }).min(1, 'Size code cannot be empty'),
        quantity: z.number({
          message: 'Quantity is required',
        }).int().min(1, 'Quantity must be at least 1'),
        color: z.string({
          message: 'Color description is required',
        }).min(1, 'Color cannot be empty'),
      })
    ).min(1, 'An order must contain at least one item'),
    shippingAddress: z.object({
      name: z.string({
        message: 'Shipping receiver name is required',
      }).min(2, 'Name must be at least 2 characters long'),
      phone: z.string({
        message: 'Shipping phone number is required',
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
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email('Please provide a valid contact email').optional(),
  }),
});

// Schema for payment verification
export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string({
      message: 'Razorpay Order ID is required',
    }).min(1, 'Order ID cannot be empty'),
    razorpayPaymentId: z.string({
      message: 'Razorpay Payment ID is required',
    }).min(1, 'Payment ID cannot be empty'),
    razorpaySignature: z.string({
      message: 'Razorpay Signature hash is required',
    }).min(1, 'Signature cannot be empty'),
  }),
});

// Schema for order status updates
export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['NEW', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
      message: 'Invalid order pipeline status value',
    }),
    note: z.string().optional(),
  }),
});

// Schema for assigning airway tracking bill numbers
export const addTrackingSchema = z.object({
  body: z.object({
    trackingNumber: z.string({
      message: 'Tracking airway bill code is required',
    }).min(1, 'Tracking number cannot be empty'),
  }),
});

export default {
  createOrderSchema,
  verifyPaymentSchema,
  updateStatusSchema,
  addTrackingSchema,
};
