const { errorHandler, notFoundHandler } = require('../../middleware/errorHandler');

// Mock logger
jest.mock('../../lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

const { logger } = require('../../lib/logger');

describe('Error Handler Integration Tests', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock request object
    req = {
      method: 'GET',
      url: '/test',
      body: {},
      user: null
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock next function
    next = jest.fn();
  });

  describe('Production Mode Error Logging', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    test('should log full error details server-side while returning sanitized response', () => {
      const error = new Error('Sensitive database error with connection details');
      error.stack = 'Error: Sensitive database error\n    at /app/database.js:123:45';
      error.statusCode = 500;

      errorHandler(error, req, res, next);

      // Verify response is sanitized
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });

      // Verify full error was logged server-side
      expect(logger.error).toHaveBeenCalledWith(
        'Application Error',
        expect.objectContaining({
          error: 'Sensitive database error with connection details',
          stack: expect.stringContaining('Error: Sensitive database error'),
          method: 'GET',
          url: '/test'
        })
      );
    });

    test('should log validation errors with details while returning generic message', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = {
        email: 'Invalid email format',
        password: 'Password too short',
        ssn: '123-45-6789' // Sensitive data
      };

      req.method = 'POST';
      req.url = '/test-validation';

      errorHandler(error, req, res, next);

      // Verify response is sanitized
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid request data'
      });

      // Verify full error was logged
      expect(logger.error).toHaveBeenCalledWith(
        'Application Error',
        expect.objectContaining({
          error: 'Validation failed',
          method: 'POST',
          url: '/test-validation'
        })
      );
    });

    test('should log CORS errors and return 403', () => {
      const error = new Error('CORS policy violation from https://malicious-site.com');

      errorHandler(error, req, res, next);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access forbidden'
      });

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith(
        'Application Error',
        expect.objectContaining({
          error: 'CORS policy violation from https://malicious-site.com',
          method: 'GET',
          url: '/test'
        })
      );
    });

    test('should log Prisma errors with metadata while returning sanitized response', () => {
      const error = new Error('Unique constraint failed on the fields: (`email`)');
      error.code = 'P2002';
      error.meta = { target: ['email'] };

      errorHandler(error, req, res, next);

      // Verify response is sanitized
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource conflict'
      });

      // Verify full error was logged with metadata
      expect(logger.error).toHaveBeenCalledWith(
        'Application Error',
        expect.objectContaining({
          error: 'Unique constraint failed on the fields: (`email`)',
          code: 'P2002'
        })
      );
    });
  });

  describe('Development Mode Error Logging', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    test('should log and return full error details in development', () => {
      const error = new Error('Database connection failed');
      error.stack = 'Error: Database connection failed\n    at /app/database.js:123:45';
      error.statusCode = 500;

      errorHandler(error, req, res, next);

      // Verify response includes full details
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database connection failed',
        stack: error.stack
      });

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith(
        'Application Error',
        expect.objectContaining({
          error: 'Database connection failed',
          stack: expect.stringContaining('Database connection failed'),
          method: 'GET',
          url: '/test'
        })
      );
    });

    test('should include validation error details in development', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = {
        email: 'Invalid email format',
        password: 'Password too short'
      };

      req.method = 'POST';

      errorHandler(error, req, res, next);

      // Verify response includes details
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: {
          email: 'Invalid email format',
          password: 'Password too short'
        }
      });

      // Verify error was logged
      expect(logger.error).toHaveBeenCalled();
    });

    test('should include Prisma error metadata in development', () => {
      const error = new Error('Unique constraint failed');
      error.code = 'P2002';
      error.meta = { target: ['email'] };

      errorHandler(error, req, res, next);

      // Verify response includes field information
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource already exists',
        field: 'email'
      });
    });
  });

  describe('Test Mode Error Logging', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    test('should log errors in test mode', () => {
      const error = new Error('Test error');
      error.statusCode = 500;

      errorHandler(error, req, res, next);

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith(
        'Application Error',
        expect.objectContaining({
          error: 'Test error',
          method: 'GET',
          url: '/test'
        })
      );
    });
  });

  describe('404 Not Found Handler', () => {
    test('should handle 404 errors correctly', () => {
      req.method = 'GET';
      req.url = '/nonexistent-route';

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route GET /nonexistent-route not found'
      });
    });

    test('should handle POST 404 errors', () => {
      req.method = 'POST';
      req.url = '/api/missing';

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route POST /api/missing not found'
      });
    });
  });

  describe('Error Logging with User Context', () => {
    test('should log user ID when available', () => {
      process.env.NODE_ENV = 'production';
      req.user = { id: 'user-12345' };

      const error = new Error('User-specific error');
      errorHandler(error, req, res, next);

      // Verify user ID was logged
      expect(logger.error).toHaveBeenCalledWith(
        'Application Error',
        expect.objectContaining({
          user: 'user-12345'
        })
      );
    });

    test('should handle missing user gracefully', () => {
      process.env.NODE_ENV = 'production';
      req.user = null;

      const error = new Error('Anonymous error');
      errorHandler(error, req, res, next);

      // Verify error was logged without user
      expect(logger.error).toHaveBeenCalledWith(
        'Application Error',
        expect.objectContaining({
          error: 'Anonymous error',
          user: undefined
        })
      );
    });
  });

  describe('Cross-Environment Consistency', () => {
    test('should always log errors regardless of environment', () => {
      const environments = ['production', 'development', 'test'];
      
      environments.forEach(env => {
        process.env.NODE_ENV = env;
        logger.error.mockClear();

        const error = new Error(`Error in ${env}`);
        errorHandler(error, req, res, next);

        expect(logger.error).toHaveBeenCalledWith(
          'Application Error',
          expect.objectContaining({
            error: `Error in ${env}`
          })
        );
      });
    });

    test('should always return appropriate HTTP status codes', () => {
      const statusCodes = [400, 401, 403, 404, 409, 500, 503];
      
      statusCodes.forEach(code => {
        res.status.mockClear();
        res.json.mockClear();

        const error = new Error(`Error with status ${code}`);
        error.statusCode = code;
        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(code);
      });
    });
  });
});
