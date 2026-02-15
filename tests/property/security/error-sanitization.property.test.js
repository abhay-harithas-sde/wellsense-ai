const fc = require('fast-check');
const { errorHandler } = require('../../../middleware/errorHandler');

// Mock logger
jest.mock('../../../lib/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('Property-Based Tests: Error Sanitization', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      method: 'GET',
      url: '/test',
      body: {},
      user: { id: 'user123' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
  });

  /**
   * Property 10: Production Error Sanitization
   * For any error response when NODE_ENV=production, the response should not contain 
   * stack traces or verbose error details.
   * 
   * **Validates: Requirements 2.7**
   */
  test('Property 10: production errors never expose stack traces or sensitive details', () => {
    process.env.NODE_ENV = 'production';

    fc.assert(
      fc.property(
        // Generate arbitrary error messages and stack traces
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.integer({ min: 400, max: 599 }),
        fc.record({
          sensitiveData: fc.string(),
          internalPath: fc.string(),
          databaseQuery: fc.string()
        }),
        (errorMessage, stackTrace, statusCode, details) => {
          // Create error with sensitive information
          const error = new Error(errorMessage);
          error.stack = stackTrace;
          error.statusCode = statusCode;
          error.details = details;

          // Reset mocks for this iteration
          res.json.mockClear();

          // Handle the error
          errorHandler(error, req, res, next);

          // Get the response that was sent
          const response = res.json.mock.calls[0][0];

          // Verify no stack trace is exposed
          expect(response.stack).toBeUndefined();

          // Verify no sensitive details are exposed
          expect(response.details).toBeUndefined();
          expect(response.sensitiveData).toBeUndefined();
          expect(response.internalPath).toBeUndefined();
          expect(response.databaseQuery).toBeUndefined();

          // Verify response has required fields
          expect(response.success).toBe(false);
          expect(response.message).toBeDefined();

          // For 5xx errors, message should be generic
          if (statusCode >= 500) {
            expect(response.message).toBe('Internal server error');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: production errors sanitize Prisma error metadata', () => {
    process.env.NODE_ENV = 'production';

    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
        (targetFields) => {
          // Create Prisma P2002 error with metadata
          const error = new Error('Unique constraint failed');
          error.code = 'P2002';
          error.meta = { target: targetFields };

          // Reset mocks
          res.json.mockClear();

          // Handle the error
          errorHandler(error, req, res, next);

          // Get the response
          const response = res.json.mock.calls[0][0];

          // Verify field information is not exposed in production
          expect(response.field).toBeUndefined();
          expect(response.meta).toBeUndefined();

          // Verify generic message is returned
          expect(response.message).toBe('Resource conflict');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: production errors sanitize validation error details', () => {
    process.env.NODE_ENV = 'production';

    fc.assert(
      fc.property(
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 100 })
        ),
        (validationDetails) => {
          // Create validation error with details
          const error = new Error('Validation failed');
          error.name = 'ValidationError';
          error.details = validationDetails;

          // Reset mocks
          res.json.mockClear();

          // Handle the error
          errorHandler(error, req, res, next);

          // Get the response
          const response = res.json.mock.calls[0][0];

          // Verify validation details are not exposed in production
          expect(response.errors).toBeUndefined();
          expect(response.details).toBeUndefined();

          // Verify generic message is returned
          expect(response.message).toBe('Invalid request data');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: development mode includes full error details', () => {
    process.env.NODE_ENV = 'development';

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.integer({ min: 400, max: 599 }),
        (errorMessage, stackTrace, statusCode) => {
          // Create error
          const error = new Error(errorMessage);
          error.stack = stackTrace;
          error.statusCode = statusCode;

          // Reset mocks
          res.json.mockClear();

          // Handle the error
          errorHandler(error, req, res, next);

          // Get the response
          const response = res.json.mock.calls[0][0];

          // Verify stack trace IS included in development
          expect(response.stack).toBe(stackTrace);

          // Verify message is the actual error message
          expect(response.message).toBe(errorMessage);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: CORS errors always return 403 with sanitized message', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('production', 'development', 'test'),
        fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
        (nodeEnv, corsDetails) => {
          process.env.NODE_ENV = nodeEnv;

          // Create CORS error with details
          const error = new Error(`CORS policy violation: ${corsDetails}`);

          // Reset mocks
          res.status.mockClear();
          res.json.mockClear();

          // Handle the error
          errorHandler(error, req, res, next);

          // Verify 403 status code
          expect(res.status).toHaveBeenCalledWith(403);

          // Get the response
          const response = res.json.mock.calls[0][0];

          // Verify response structure
          expect(response.success).toBe(false);
          expect(response.message).toBeDefined();

          // In production, message should be generic
          if (nodeEnv === 'production') {
            expect(response.message).toBe('Access forbidden');
            // Verify CORS details are not exposed (check that the specific details string is not in the message)
            expect(response.message).not.toContain(corsDetails.trim());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: all errors are logged server-side regardless of environment', () => {
    const { logger } = require('../../../lib/logger');

    fc.assert(
      fc.property(
        fc.constantFrom('production', 'development', 'test'),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        (nodeEnv, errorMessage, stackTrace) => {
          process.env.NODE_ENV = nodeEnv;

          // Create error
          const error = new Error(errorMessage);
          error.stack = stackTrace;

          // Reset mocks
          logger.error.mockClear();

          // Handle the error
          errorHandler(error, req, res, next);

          // Verify error was logged with full details
          expect(logger.error).toHaveBeenCalledWith(
            'Application Error',
            expect.objectContaining({
              error: errorMessage,
              stack: stackTrace,
              method: 'GET',
              url: '/test'
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
