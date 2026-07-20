import { Response } from 'express';

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: any[];
}

/**
 * Sends a structured success response.
 * @param res Express Response object
 * @param data Response payload data
 * @param message Client status description (defaults to 'Success')
 * @param statusCode HTTP Status Code (defaults to 200)
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const payload: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(payload);
};

/**
 * Sends a structured error response.
 * @param res Express Response object
 * @param message Client error description (defaults to 'Error')
 * @param errors Array of validation issues or detailed error summaries
 * @param statusCode HTTP Status Code (defaults to 500)
 */
export const sendError = (
  res: Response,
  message = 'Error',
  errors: any[] = [],
  statusCode = 500
): Response => {
  const payload: ErrorResponse = {
    success: false,
    message,
    errors: errors.length > 0 ? errors : [message],
  };
  return res.status(statusCode).json(payload);
};

export default {
  sendSuccess,
  sendError,
};
