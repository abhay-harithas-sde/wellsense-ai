// Global Error Handler Middleware
import { logger } from '../lib/logger.js';

// 404 Not Found Handler
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Always log full error details server-side in all modes
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user?.id,
    code: err.code,
    name: err.name
  });

  // CORS errors - return 403 Forbidden
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: isProduction ? 'Access forbidden' : 'CORS policy violation'
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: isProduction ? 'Resource conflict' : 'Resource already exists',
      ...(isProduction ? {} : { field: err.meta?.target?.[0] })
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: isProduction ? 'Invalid request data' : 'Validation failed',
      ...(isProduction ? {} : { errors: err.details })
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token expired'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  
  // Production mode: return generic error messages only, exclude stack traces
  // Development mode: include full error details and stack traces
  if (isProduction) {
    res.status(statusCode).json({
      success: false,
      message: statusCode >= 500 ? 'Internal server error' : err.message || 'An error occurred'
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message: err.message || 'An error occurred',
      stack: err.stack,
      ...(err.details && { details: err.details })
    });
  }
};

export default {
  notFoundHandler,
  errorHandler
};
