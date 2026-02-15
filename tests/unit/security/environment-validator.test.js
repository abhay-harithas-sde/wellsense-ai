const EnvironmentValidator = require('../../../lib/security/environment-validator');
const SecretManager = require('../../../lib/security/secret-manager');

describe('EnvironmentValidator', () => {
  let validator;
  let secretManager;

  beforeEach(() => {
    validator = new EnvironmentValidator();
    secretManager = new SecretManager();
  });

  describe('validateNodeEnv', () => {
    test('should pass for valid NODE_ENV values', () => {
      const validEnvs = ['development', 'production', 'test'];
      
      validEnvs.forEach(env => {
        const result = validator.validateNodeEnv(env);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should warn when NODE_ENV is not set', () => {
      const result = validator.validateNodeEnv(undefined);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('NODE_ENV is not set');
    });

    test('should warn for non-standard NODE_ENV values', () => {
      const result = validator.validateNodeEnv('staging');
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('not a standard value');
    });
  });

  describe('validateSecrets', () => {
    test('should pass with strong secrets in production mode', () => {
      const env = {
        JWT_SECRET: secretManager.generateJWTSecret(),
        DATABASE_URL: `postgresql://user:${secretManager.generateDatabasePassword()}@localhost:5432/db`,
        MONGODB_URI: `mongodb://user:${secretManager.generateDatabasePassword()}@localhost:27017/db`
      };

      const result = validator.validateSecrets(env, true);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail with weak JWT secret in production mode', () => {
      const env = {
        JWT_SECRET: 'your-jwt-secret-change-in-production',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        MONGODB_URI: 'mongodb://user:password@localhost:27017/db'
      };

      const result = validator.validateSecrets(env, true);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('JWT_SECRET'))).toBe(true);
    });

    test('should fail with short JWT secret in production mode', () => {
      const env = {
        JWT_SECRET: 'short-secret',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        MONGODB_URI: 'mongodb://user:password@localhost:27017/db'
      };

      const result = validator.validateSecrets(env, true);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('JWT_SECRET') && err.includes('length'))).toBe(true);
    });

    test('should warn with weak secrets in development mode', () => {
      const env = {
        JWT_SECRET: 'test-jwt-secret',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        MONGODB_URI: 'mongodb://user:password@localhost:27017/db'
      };

      const result = validator.validateSecrets(env, false);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should fail when required secrets are missing in production', () => {
      const env = {};

      const result = validator.validateSecrets(env, true);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('JWT_SECRET'))).toBe(true);
      expect(result.errors.some(err => err.includes('DATABASE_URL'))).toBe(true);
    });

    test('should skip optional secrets when not present', () => {
      const env = {
        JWT_SECRET: secretManager.generateJWTSecret(),
        DATABASE_URL: `postgresql://user:${secretManager.generateDatabasePassword()}@localhost:5432/db`,
        MONGODB_URI: `mongodb://user:${secretManager.generateDatabasePassword()}@localhost:27017/db`
        // GOOGLE_CLIENT_SECRET is optional and not provided
      };

      const result = validator.validateSecrets(env, true);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate optional secrets when present', () => {
      const env = {
        JWT_SECRET: secretManager.generateJWTSecret(),
        DATABASE_URL: `postgresql://user:${secretManager.generateDatabasePassword()}@localhost:5432/db`,
        MONGODB_URI: `mongodb://user:${secretManager.generateDatabasePassword()}@localhost:27017/db`,
        GOOGLE_CLIENT_SECRET: 'weak-secret'
      };

      const result = validator.validateSecrets(env, true);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('GOOGLE_CLIENT_SECRET'))).toBe(true);
    });

    test('should extract and validate passwords from connection strings', () => {
      const env = {
        JWT_SECRET: secretManager.generateJWTSecret(),
        DATABASE_URL: 'postgresql://user:weak@localhost:5432/db',
        MONGODB_URI: 'mongodb://user:weak@localhost:27017/db'
      };

      const result = validator.validateSecrets(env, true);
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('DATABASE_URL'))).toBe(true);
      expect(result.errors.some(err => err.includes('MONGODB_URI'))).toBe(true);
    });
  });

  describe('validateCORS', () => {
    test('should pass with explicit origins in production', () => {
      const env = {
        CORS_ORIGIN: 'https://app.example.com,https://www.example.com'
      };

      const result = validator.validateCORS(env, 'production');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail with wildcard in production', () => {
      const env = {
        CORS_ORIGIN: '*'
      };

      const result = validator.validateCORS(env, 'production');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('wildcard'))).toBe(true);
    });

    test('should fail with wildcard pattern in production', () => {
      const env = {
        CORS_ORIGIN: 'https://*.example.com'
      };

      const result = validator.validateCORS(env, 'production');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('wildcard'))).toBe(true);
    });

    test('should warn with localhost in production', () => {
      const env = {
        CORS_ORIGIN: 'https://app.example.com,http://localhost:3000'
      };

      const result = validator.validateCORS(env, 'production');
      expect(result.valid).toBe(true);
      expect(result.warnings.some(warn => warn.includes('localhost'))).toBe(true);
    });

    test('should allow wildcard in development', () => {
      const env = {
        CORS_ORIGIN: '*'
      };

      const result = validator.validateCORS(env, 'development');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail when CORS_ORIGIN is not set in production', () => {
      const env = {};

      const result = validator.validateCORS(env, 'production');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('CORS_ORIGIN is not set'))).toBe(true);
    });

    test('should warn when CORS_ORIGIN is not set in development', () => {
      const env = {};

      const result = validator.validateCORS(env, 'development');
      expect(result.valid).toBe(true);
      expect(result.warnings.some(warn => warn.includes('CORS_ORIGIN is not set'))).toBe(true);
    });
  });

  describe('validateSSL', () => {
    test('should pass when SSL is properly configured', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: './ssl/private.key',
        SSL_CERT_PATH: './ssl/certificate.crt'
      };

      const result = validator.validateSSL(env, 'production');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail when HTTPS is enabled but SSL_KEY_PATH is missing', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_CERT_PATH: './ssl/certificate.crt'
      };

      const result = validator.validateSSL(env, 'production');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('SSL_KEY_PATH'))).toBe(true);
    });

    test('should fail when HTTPS is enabled but SSL_CERT_PATH is missing', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: './ssl/private.key'
      };

      const result = validator.validateSSL(env, 'production');
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('SSL_CERT_PATH'))).toBe(true);
    });

    test('should warn when SSL is not enabled in production', () => {
      const env = {
        ENABLE_HTTPS: 'false'
      };

      const result = validator.validateSSL(env, 'production');
      expect(result.valid).toBe(true);
      expect(result.warnings.some(warn => warn.includes('HTTPS is not enabled'))).toBe(true);
    });

    test('should not warn when SSL is not enabled in development', () => {
      const env = {
        ENABLE_HTTPS: 'false'
      };

      const result = validator.validateSSL(env, 'development');
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    test('should pass when SSL is not configured in development', () => {
      const env = {};

      const result = validator.validateSSL(env, 'development');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateAll', () => {
    test('should pass with valid production configuration', () => {
      const env = {
        JWT_SECRET: secretManager.generateJWTSecret(),
        DATABASE_URL: `postgresql://user:${secretManager.generateDatabasePassword()}@localhost:5432/db`,
        MONGODB_URI: `mongodb://user:${secretManager.generateDatabasePassword()}@localhost:27017/db`,
        CORS_ORIGIN: 'https://app.example.com',
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: './ssl/private.key',
        SSL_CERT_PATH: './ssl/certificate.crt'
      };

      const result = validator.validateAll(env, 'production');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail with multiple validation errors in production', () => {
      const env = {
        JWT_SECRET: 'weak-secret',
        DATABASE_URL: 'postgresql://user:weak@localhost:5432/db',
        MONGODB_URI: 'mongodb://user:weak@localhost:27017/db',
        CORS_ORIGIN: '*'
      };

      const result = validator.validateAll(env, 'production');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('JWT_SECRET'))).toBe(true);
      expect(result.errors.some(err => err.includes('wildcard'))).toBe(true);
    });

    test('should warn but pass with weak secrets in development', () => {
      const env = {
        JWT_SECRET: 'test-secret',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        MONGODB_URI: 'mongodb://user:password@localhost:27017/db',
        CORS_ORIGIN: '*'
      };

      const result = validator.validateAll(env, 'development');
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should provide clear error messages', () => {
      const env = {
        JWT_SECRET: 'short',
        CORS_ORIGIN: '*'
      };

      const result = validator.validateAll(env, 'production');
      expect(result.valid).toBe(false);
      
      // Check that error messages are clear and actionable
      result.errors.forEach(error => {
        expect(error).toBeTruthy();
        expect(error.length).toBeGreaterThan(10);
      });
    });

    test('should collect warnings from all validators', () => {
      const env = {
        JWT_SECRET: secretManager.generateJWTSecret(),
        DATABASE_URL: `postgresql://user:${secretManager.generateDatabasePassword()}@localhost:5432/db`,
        MONGODB_URI: `mongodb://user:${secretManager.generateDatabasePassword()}@localhost:27017/db`,
        CORS_ORIGIN: 'https://app.example.com,http://localhost:3000'
        // ENABLE_HTTPS not set - should warn in production
      };

      const result = validator.validateAll(env, 'production');
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(warn => warn.includes('localhost'))).toBe(true);
      expect(result.warnings.some(warn => warn.includes('HTTPS'))).toBe(true);
    });
  });
});
