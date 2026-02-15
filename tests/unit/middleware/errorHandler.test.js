const { errorHandler, notFoundHandler } = require('../../../middleware/errorHandler');

// Mock logger
jest.mock('../../../lib/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

const { logger } = require('../../../lib/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request object
    req = {
      method: 'GET',
      url: '/test',
      body: {},
      user: { id: 'user123' }
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock next function
    next = jest.fn();

    // Reset NODE_ENV
    delete process.env.NODE_ENV;
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    test('should return generic error message for 500 errors', () => {
      const error = new Error('Database connection failed');
      error.statusCode = 500;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });

    test('should exclude stack traces from response', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      errorHandler(error, req, res, next);

      const response = res.json.mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });

    test('should log full error details server-side', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalledWith('Application Error', {
        error: 'Test error',
        stack: error.stack,
        method: 'GET',
        url: '/test',
        body: {},
        user: 'user123',
        code: undefined,
        name: 'Error'
      });
    });

    test('should return generic message for Prisma P2002 errors', () => {
      const error = new Error('Unique constraint failed');
      error.code = 'P2002';
      error.meta = { target: ['email'] };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource conflict'
      });
      expect(res.json.mock.calls[0][0].field).toBeUndefined();
    });

    test('should return generic message for validation errors', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = { email: 'Invalid email format' };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid request data'
      });
      expect(res.json.mock.calls[0][0].errors).toBeUndefined();
    });

    test('should handle CORS errors with 403 Forbidden', () => {
      const error = new Error('CORS policy violation');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access forbidden'
      });
    });

    test('should return client error message for 4xx errors', () => {
      const error = new Error('Invalid input');
      error.statusCode = 400;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input'
      });
    });
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    test('should include full error details', () => {
      const error = new Error('Test error');
      error.statusCode = 500;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test error',
        stack: error.stack
      });
    });

    test('should include stack traces in response', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      errorHandler(error, req, res, next);

      const response = res.json.mock.calls[0][0];
      expect(response.stack).toBe(error.stack);
    });

    test('should include error details if present', () => {
      const error = new Error('Test error');
      error.details = { field: 'email', issue: 'invalid format' };

      errorHandler(error, req, res, next);

      const response = res.json.mock.calls[0][0];
      expect(response.details).toEqual(error.details);
    });

    test('should include field information for Prisma P2002 errors', () => {
      const error = new Error('Unique constraint failed');
      error.code = 'P2002';
      error.meta = { target: ['email'] };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource already exists',
        field: 'email'
      });
    });

    test('should include validation error details', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = { email: 'Invalid email format' };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: { email: 'Invalid email format' }
      });
    });

    test('should include CORS error details', () => {
      const error = new Error('CORS policy violation');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'CORS policy violation'
      });
    });
  });

  describe('Common Error Handling', () => {
    test('should handle Prisma P2025 (not found) errors', () => {
      const error = new Error('Record not found');
      error.code = 'P2025';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found'
      });
    });

    test('should handle JWT invalid token errors', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid authentication token'
      });
    });

    test('should handle JWT expired token errors', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication token expired'
      });
    });

    test('should use 500 as default status code', () => {
      const error = new Error('Unknown error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should respect custom status codes', () => {
      const error = new Error('Custom error');
      error.statusCode = 418;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(418);
    });
  });

  describe('notFoundHandler', () => {
    test('should return 404 with route information', () => {
      req.method = 'POST';
      req.url = '/api/nonexistent';

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route POST /api/nonexistent not found'
      });
    });
  });
});
