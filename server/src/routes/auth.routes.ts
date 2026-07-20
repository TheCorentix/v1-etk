import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { 
  registerSchema, 
  loginSchema, 
  addressSchema 
} from '../validators/auth.validator';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();
const controller = new AuthController();

// Authentication Endpoints (Brute force protected via rate limiting)
router.post('/register', authRateLimiter, validate(registerSchema), controller.register);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);
router.post('/logout', controller.logout);

// Protected Client Profile & Address Registry Routes
router.get('/profile', authMiddleware, controller.getProfile);
router.post('/addresses', authMiddleware, validate(addressSchema), controller.addAddress);
router.delete('/addresses/:addressId', authMiddleware, controller.deleteAddress);

export default router;
