import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    if (!err.isOperational) {
      logger.error(`Non-operational Error: ${err.stack}`);
    } else {
      logger.warn(`Operational Warning [${statusCode}]: ${message}`);
    }
  } else {
    // Unknown programmatic error
    logger.error(`Unhandled Programmatic Error: ${err.message}\nStack: ${err.stack}`);
    // Optional: Hide stack trace in production
    if (process.env.NODE_ENV === 'development') {
      details = { stack: err.stack };
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      status: statusCode,
      ...(details && { details }),
    },
  });
};
