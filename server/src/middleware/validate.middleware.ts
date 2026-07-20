import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export const validate = (schema: ZodObject<any, any>) => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request fields with parsed, coerced, and validated values
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query as any;
    if (parsed.params !== undefined) req.params = parsed.params as any;

    next();
  } catch (error) {
    next(error); // Pass ZodError to the global error handler
  }
};

export default validate;
