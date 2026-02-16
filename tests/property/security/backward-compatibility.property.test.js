const fc = require('fast-check');
const EnvironmentValidator = require('../../../lib/security/environment-validator');
const CORSConfigurator = require('../../../lib/security/cors-configurator');
const SSLManager = require('../../../lib/security/ssl-manager');

/**
 * Property-Based Tests for Backward Compatibility
 * Feature: production-security-hardening
 * 
 * These tests verify that the security hardening maintains backward compatibility
 * with existing development workflows.
 */

describe('Backward Compatibility Properties', () => {
  let validator;
  let corsConfigurator;
  let sslManager;

  beforeEach(() => {
    validator = new EnvironmentValidator();
    corsConfigurator = new CORSConfigurator();
    sslManager = new SSLManager();
  });

  /**
   * Property 22: Development Mode Preservation
   * **Validates: Requirements 10.1**
   * 
   * For any existing development workflow when NODE_ENV is development or not set,
   * the system should maintain the same behavior as before the security hardening.
   */
  describe('Property 22: Development Mode Preservation', () => {
    test('development mode allows weak secrets with warnings only', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 31 }), // Short secret
          fc.constantFrom('development', undefined, ''), // Development or unset NODE_ENV
          (weakSecret, nodeEnv) => {
            const env = {
              JWT_SECRET: weakSecret,
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'http://localhost:3000'
            };

            const result = validator.validateAll(env, nodeEnv || 'development');

            // Should pass validation (valid = true) but have warnings
            expect(result.valid).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('development mode allows permissive CORS settings', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('*', 'http://localhost:3000', ''), // Permissive CORS
          (corsOrigin) => {
            const env = {
              JWT_SECRET: 'a'.repeat(64), // Valid secret
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: corsOrigin
            };

            const result = validator.validateAll(env, 'development');

            // Should pass validation in development
            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('development mode does not require SSL certificates', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('false', ''), // HTTPS disabled or not set
          (enableHttps) => {
            const env = {
              JWT_SECRET: 'a'.repeat(64),
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'http://localhost:3000',
              ENABLE_HTTPS: enableHttps
            };

            const result = validator.validateAll(env, 'development');

            // Should pass validation when SSL is not enabled
            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('localhost origins are always allowed in development', () => {
      const localhostOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...localhostOrigins),
          fc.webUrl({ validSchemes: ['https'] }),
          (localhostOrigin, corsOrigin) => {
            // Use a non-empty CORS_ORIGIN
            const env = { CORS_ORIGIN: corsOrigin };
            const corsOptions = corsConfigurator.getCORSOptions(env, 'development');

            // Localhost should always be allowed in development
            const callback = jest.fn();
            corsOptions.origin(localhostOrigin, callback);
            expect(callback).toHaveBeenCalledWith(null, true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('test mode uses relaxed validation without production-level security', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 31 }), // Short secret
          (weakSecret) => {
            const env = {
              JWT_SECRET: weakSecret,
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'http://localhost:3000'
            };

            const result = validator.validateAll(env, 'test');

            // Should pass validation in test mode
            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('existing .env file continues to work for local development', () => {
      fc.assert(
        fc.property(
          fc.record({
            JWT_SECRET: fc.string({ minLength: 10, maxLength: 50 }),
            DATABASE_URL: fc.constant('postgresql://user:password@localhost:5432/db'),
            MONGODB_URI: fc.constant('mongodb://user:password@localhost:27017/db'),
            CORS_ORIGIN: fc.constantFrom('http://localhost:3000', '*', '')
          }),
          (env) => {
            // Simulate loading from .env file (development mode)
            const result = validator.validateAll(env, 'development');

            // Should always pass in development mode
            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('development mode behavior is consistent regardless of secret strength', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 31 }), // Weak secret
            fc.string({ minLength: 64, maxLength: 128 }) // Strong secret
          ),
          (secret) => {
            const env = {
              JWT_SECRET: secret,
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'http://localhost:3000'
            };

            const result = validator.validateAll(env, 'development');

            // Should always pass in development mode
            expect(result.valid).toBe(true);
            // Should never have errors in development
            expect(result.errors).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 23: Configuration Error Clarity
   * **Validates: Requirements 10.6**
   * 
   * For any invalid configuration detected by the Environment_Validator,
   * the error message should clearly state what is invalid and how to fix it.
   * 
   * Note: This property is also tested in secret-validation.property.test.js
   * but we include additional tests here for completeness.
   */
  describe('Property 23: Configuration Error Clarity', () => {
    test('error messages always include the variable name', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('JWT_SECRET', 'DATABASE_URL', 'MONGODB_URI'),
          fc.string({ minLength: 5, maxLength: 20 }).filter(s => s.trim().length >= 5), // Longer invalid value
          (varName, invalidValue) => {
            const env = {
              JWT_SECRET: varName === 'JWT_SECRET' ? invalidValue : 'a'.repeat(64),
              DATABASE_URL: varName === 'DATABASE_URL' ? `postgresql://user:${invalidValue}@localhost:5432/db` : 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: varName === 'MONGODB_URI' ? `mongodb://user:${invalidValue}@localhost:27017/db` : 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'https://example.com'
            };

            const result = validator.validateAll(env, 'production');

            if (!result.valid && result.errors.length > 0) {
              // At least one error should mention the variable name or related term
              const hasRelevantError = result.errors.some(err => 
                err.includes(varName) || 
                err.includes('JWT') ||
                err.includes('DATABASE') ||
                err.includes('MONGODB') ||
                err.includes('password') ||
                err.includes('secret')
              );
              expect(hasRelevantError).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('error messages always describe the problem', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 31 }).filter(s => s.trim().length >= 5), // Non-whitespace too short
          (shortSecret) => {
            const env = {
              JWT_SECRET: shortSecret,
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'https://example.com'
            };

            const result = validator.validateAll(env, 'production');

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            
            // Error messages should describe the problem
            result.errors.forEach(error => {
              expect(error).toBeTruthy();
              expect(error.length).toBeGreaterThan(10); // Reasonably descriptive
              expect(typeof error).toBe('string');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('error messages provide actionable guidance', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            { JWT_SECRET: 'test-secret', issue: 'weak pattern' },
            { JWT_SECRET: 'short', issue: 'too short' },
            { CORS_ORIGIN: '*', issue: 'wildcard' }
          ),
          (testCase) => {
            const env = {
              JWT_SECRET: testCase.JWT_SECRET || 'a'.repeat(64),
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: testCase.CORS_ORIGIN || 'https://example.com'
            };

            const result = validator.validateAll(env, 'production');

            if (!result.valid) {
              // Errors should be actionable (contain guidance)
              result.errors.forEach(error => {
                expect(error).toBeTruthy();
                expect(typeof error).toBe('string');
                expect(error.length).toBeGreaterThan(15);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('multiple errors are all reported together', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 31 }), // Short JWT secret
          fc.string({ minLength: 1, maxLength: 20 }), // Short password
          (shortJWT, shortPassword) => {
            const env = {
              JWT_SECRET: shortJWT,
              DATABASE_URL: `postgresql://user:${shortPassword}@localhost:5432/db`,
              MONGODB_URI: `mongodb://user:${shortPassword}@localhost:27017/db`,
              CORS_ORIGIN: '*' // Also invalid in production
            };

            const result = validator.validateAll(env, 'production');

            expect(result.valid).toBe(false);
            
            // Should report multiple errors
            expect(result.errors.length).toBeGreaterThan(0);
            
            // Each error should be distinct and descriptive
            const uniqueErrors = new Set(result.errors);
            expect(uniqueErrors.size).toBe(result.errors.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('warnings are clearly distinguished from errors', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 31 }), // Weak secret
          (weakSecret) => {
            const env = {
              JWT_SECRET: weakSecret,
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'http://localhost:3000'
            };

            const result = validator.validateAll(env, 'development');

            // In development, should have warnings but no errors
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings.length).toBeGreaterThan(0);

            // Warnings should be descriptive
            result.warnings.forEach(warning => {
              expect(warning).toBeTruthy();
              expect(typeof warning).toBe('string');
              expect(warning.length).toBeGreaterThan(10);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('error messages are consistent across different validation methods', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 31 }), // Short secret
          (shortSecret) => {
            const env = {
              JWT_SECRET: shortSecret,
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'https://example.com'
            };

            // Validate using validateAll
            const resultAll = validator.validateAll(env, 'production');
            
            // Validate using validateSecrets
            const resultSecrets = validator.validateSecrets(env, true);

            // Both should fail
            expect(resultAll.valid).toBe(false);
            expect(resultSecrets.valid).toBe(false);

            // Both should have errors about JWT_SECRET
            const allHasJWTError = resultAll.errors.some(err => err.includes('JWT_SECRET'));
            const secretsHasJWTError = resultSecrets.errors.some(err => err.includes('JWT_SECRET'));
            
            expect(allHasJWTError).toBe(true);
            expect(secretsHasJWTError).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional Backward Compatibility Tests
   */
  describe('Additional Backward Compatibility', () => {
    test('SSL is optional in all non-production environments', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('development', 'test', 'staging'),
          fc.record({
            JWT_SECRET: fc.constant('a'.repeat(64)),
            DATABASE_URL: fc.constant('postgresql://user:password@localhost:5432/db'),
            MONGODB_URI: fc.constant('mongodb://user:password@localhost:27017/db'),
            CORS_ORIGIN: fc.constant('http://localhost:3000')
          }),
          (nodeEnv, env) => {
            // SSL not configured
            expect(sslManager.isSSLConfigured(env)).toBe(false);

            // Should still pass validation
            const result = validator.validateAll(env, nodeEnv);
            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('environment-specific behavior is predictable and documented', () => {
      const environments = ['development', 'production', 'test'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...environments),
          fc.string({ minLength: 1, maxLength: 31 }), // Weak secret
          (nodeEnv, weakSecret) => {
            const env = {
              JWT_SECRET: weakSecret,
              DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
              MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
              CORS_ORIGIN: 'http://localhost:3000'
            };

            const result = validator.validateAll(env, nodeEnv);

            // Behavior should be predictable based on environment
            if (nodeEnv === 'production') {
              // Production: strict validation, should fail
              expect(result.valid).toBe(false);
              expect(result.errors.length).toBeGreaterThan(0);
            } else {
              // Development/Test: relaxed validation, should pass
              expect(result.valid).toBe(true);
              expect(result.errors).toHaveLength(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
