import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Signs a payload to generate a JWT token.
 * @param payload Object containing properties to sign (e.g. { uid, email, role })
 * @param expiresIn Expiration duration (defaults to 7d)
 */
export const generateToken = (payload: object, expiresIn: string | number = '7d'): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: expiresIn as any,
  });
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param token JWT token string
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET);
};

export default {
  generateToken,
  verifyToken,
};
