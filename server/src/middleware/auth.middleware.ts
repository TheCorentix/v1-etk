import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'ORDER_MANAGER' | 'DESIGNER' | 'CUSTOMER';
    name?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = '';

    // 1. Extract bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // 2. Fallback to cookie verification
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access Denied. No authentication token provided.',
        errors: ['Unauthorized'],
      });
      return;
    }

    // 3. Verify Firebase ID Token
    const decodedToken = await auth.verifyIdToken(token);

    // 4. Resolve the user's role from Firestore database for real-time permissions check
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    let role: 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_MANAGER' | 'ORDER_MANAGER' | 'DESIGNER' | 'CUSTOMER' = 'CUSTOMER';

    if (userDoc.exists) {
      const userData = userDoc.data();
      const dbRole = userData?.role;
      if (dbRole && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'ORDER_MANAGER', 'DESIGNER', 'CUSTOMER'].includes(dbRole)) {
        role = dbRole as any;
      }
    }

    // 5. Attach decoded user details to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || userDoc.data()?.name || 'Client',
      role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
      errors: [error.message || 'Unauthorized'],
    });
  }
};

export default authMiddleware;
