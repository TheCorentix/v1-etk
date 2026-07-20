import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
  isOperational?: boolean;
}

export const errorMiddleware: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || [];

  // Log the complete error stack trace
  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, {
    stack: err.stack,
    statusCode,
  });

  // Handle specific database/library error typings
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Failed';
    // Format Zod sub-errors to return clear field-specific issues
    errors = (err as any).issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please sign in again.';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if ((err as any).code === 'auth/id-token-expired') {
    statusCode = 401;
    message = 'Firebase ID token has expired.';
  } else if (typeof (err as any).code === 'string' && (err as any).code?.startsWith('auth/')) {
    statusCode = 401;
    message = 'Firebase authentication failed.';
  }

  // Format response matching API standards
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : [message],
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorMiddleware;
