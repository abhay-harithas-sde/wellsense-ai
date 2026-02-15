const fc = require('fast-check');
const EnvironmentValidator = require('../../../lib/security/environment-validator');
const SecretManager = require('../../../lib/security/secret-manager');

describe('Secret Validation Properties', () => {
  let validator;
  let secretManager;

  beforeEach(() => {
    validator = new EnvironmentValidator();
    secretManager = new SecretManager();
  });

  /**
   * Property 5: Weak Pattern Detection
   * **Validates: Requirements 1.6, 5.1, 5.2**
   * 
   * For any secret containing weak patterns (your-, change-in-production, test-, 
   * example-, placeholder-), the Environment_Validator should reject it in 
   * production mode and provide a clear error message indicating which pattern 
   * was detected.
   */
  test('Property 5: weak patterns are always detected and rejected in production', () => {
    const weakPatterns = ['your-', 'change-in-production', 'test-', 'example-', 'placeholder-'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...weakPatterns),
        fc.string({ minLength: 10, maxLength: 50 }),
        (pattern, suffix) => {
          const weakSecret = pattern + suffix;
          const env = {
            JWT_SECRET: weakSecret,
            DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
            MONGODB_URI: 'mongodb://user:password@localhost:27017/db'
          };
          
          const result = validator.validateSecrets(env, true);
          
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          expect(result.errors.some(err => 
            err.includes('JWT_SECRET') && err.includes('weak pattern')
          )).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Minimum Length Enforcement
   * **Validates: Requirements 5.3**
   * 
   * For any secret that is shorter than its required minimum length 
   * (JWT: 64, Database: 32, OAuth: 48), the Environment_Validator should 
   * reject the configuration in production mode.
   */
  test('Property 6: secrets shorter than minimum length are rejected in production', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 63 }),
        (length) => {
          const shortSecret = 'a'.repeat(length);
          const env = {
            JWT_SECRET: shortSecret,
            DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
            MONGODB_URI: 'mongodb://user:password@localhost:27017/db'
          };
          
          const result = validator.validateSecrets(env, true);
          
          expect(result.valid).toBe(false);
          expect(result.errors.some(err => 
            err.includes('JWT_SECRET') && err.includes('length')
          )).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Password Complexity Validation
   * **Validates: Requirements 5.4**
   * 
   * For any database password that lacks required character types 
   * (uppercase, lowercase, numbers, special characters), the 
   * Environment_Validator should reject it in production mode.
   */
  test('Property 7: database passwords without complexity are rejected in production', () => {
    // Test passwords with only one character type
    const singleTypePasswords = [
      fc.constant('a'.repeat(32)), // lowercase only
      fc.constant('A'.repeat(32)), // uppercase only
      fc.constant('1'.repeat(32)), // numbers only
      fc.constant('!'.repeat(32))  // special chars only
    ];

    fc.assert(
      fc.property(
        fc.oneof(...singleTypePasswords),
        (password) => {
          const env = {
            JWT_SECRET: secretManager.generateJWTSecret(),
            DATABASE_URL: `postgresql://user:${password}@localhost:5432/db`,
            MONGODB_URI: `mongodb://user:${password}@localhost:27017/db`
          };
          
          const result = validator.validateSecrets(env, true);
          
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Production Strict Validation
   * **Validates: Requirements 5.5**
   * 
   * For any invalid secret in production mode (NODE_ENV=production), 
   * the Environment_Validator should reject the configuration and 
   * prevent application startup.
   */
  test('Property 8: any invalid secret causes validation failure in production', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 31 }), // Too short for any secret type
        (invalidSecret) => {
          const env = {
            JWT_SECRET: invalidSecret,
            DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
            MONGODB_URI: 'mongodb://user:password@localhost:27017/db'
          };
          
          const result = validator.validateAll(env, 'production');
          
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Development Warning Mode
   * **Validates: Requirements 5.6**
   * 
   * For any weak secret in development mode (NODE_ENV=development), 
   * the Environment_Validator should log a warning but allow application startup.
   */
  test('Property 9: weak secrets generate warnings but pass in development', () => {
    const weakPatterns = ['your-', 'test-', 'example-'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...weakPatterns),
        fc.string({ minLength: 10, maxLength: 50 }),
        (pattern, suffix) => {
          const weakSecret = pattern + suffix;
          const env = {
            JWT_SECRET: weakSecret,
            DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
            MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
            CORS_ORIGIN: 'http://localhost:3000'
          };
          
          const result = validator.validateAll(env, 'development');
          
          // Should pass (valid = true) but have warnings
          expect(result.valid).toBe(true);
          expect(result.warnings.length).toBeGreaterThan(0);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 23: Configuration Error Clarity
   * **Validates: Requirements 10.6**
   * 
   * For any invalid configuration detected by the Environment_Validator, 
   * the error message should clearly state what is invalid and how to fix it.
   */
  test('Property 23: error messages are clear and actionable', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 31 }),
        (shortSecret) => {
          const env = {
            JWT_SECRET: shortSecret,
            DATABASE_URL: 'postgresql://user:weak@localhost:5432/db',
            MONGODB_URI: 'mongodb://user:weak@localhost:27017/db',
            CORS_ORIGIN: '*'
          };
          
          const result = validator.validateAll(env, 'production');
          
          expect(result.valid).toBe(false);
          
          // All error messages should be non-empty and descriptive
          result.errors.forEach(error => {
            expect(error).toBeTruthy();
            expect(error.length).toBeGreaterThan(20); // Reasonably descriptive
            expect(typeof error).toBe('string');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
