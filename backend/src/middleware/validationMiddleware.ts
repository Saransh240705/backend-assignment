import { Request, Response, NextFunction } from 'express';
import { Schema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export const validateBody = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new BadRequestError('Validation failed', issues));
      } else {
        next(error);
      }
    }
  };
};
