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

type AuthUser = NonNullable<AuthenticatedRequest['user']>;

// Bearer token from the Authorization header, falling back to the auth cookie
const extractToken = (req: AuthenticatedRequest): string => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return '';
};

// Verifies a Firebase ID token and resolves the user's role from Firestore
const resolveUser = async (token: string): Promise<AuthUser> => {
  const decodedToken = await auth.verifyIdToken(token);

  // Resolve the user's role from Firestore database for real-time permissions check
  const userDoc = await db.collection('users').doc(decodedToken.uid).get();
  let role: AuthUser['role'] = 'CUSTOMER';

  if (userDoc.exists) {
    const userData = userDoc.data();
    const dbRole = userData?.role;
    if (dbRole && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'ORDER_MANAGER', 'DESIGNER', 'CUSTOMER'].includes(dbRole)) {
      role = dbRole as any;
    }
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email || '',
    name: decodedToken.name || userDoc.data()?.name || 'Client',
    role,
  };
};

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access Denied. No authentication token provided.',
        errors: ['Unauthorized'],
      });
      return;
    }

    req.user = await resolveUser(token);

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
      errors: [error.message || 'Unauthorized'],
    });
  }
};

/**
 * Attaches req.user when a valid token is present but never rejects the request.
 * For public endpoints that return extra data to signed-in admins.
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = await resolveUser(token);
    } catch {
      // Invalid or expired token: continue as an anonymous visitor
    }
  }
  next();
};

export default authMiddleware;
