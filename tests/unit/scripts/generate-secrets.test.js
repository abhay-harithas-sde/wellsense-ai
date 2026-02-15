/**
 * Unit tests for Secret Generation CLI Tool
 */

const SecretManager = require('../../../lib/security/secret-manager');
const { parseArgs } = require('../../../scripts/generate-secrets');

describe('Secret Generation CLI Tool', () => {
  let secretManager;

  beforeEach(() => {
    secretManager = new SecretManager();
  });

  describe('parseArgs', () => {
    it('should parse --type jwt argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'generate-secrets.js', '--type', 'jwt'];
      
      const options = parseArgs();
      expect(options.type).toBe('jwt');
      expect(options.length).toBeNull();
      
      process.argv = originalArgv;
    });

    it('should parse --type database argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'generate-secrets.js', '--type', 'database'];
      
      const options = parseArgs();
      expect(options.type).toBe('database');
      expect(options.length).toBeNull();
      
      process.argv = originalArgv;
    });

    it('should parse --type oauth argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'generate-secrets.js', '--type', 'oauth'];
      
      const options = parseArgs();
      expect(options.type).toBe('oauth');
      expect(options.length).toBeNull();
      
      process.argv = originalArgv;
    });

    it('should parse --length argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'generate-secrets.js', '--length', '128'];
      
      const options = parseArgs();
      expect(options.type).toBeNull();
      expect(options.length).toBe(128);
      
      process.argv = originalArgv;
    });

    it('should parse both --type and --length arguments', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'generate-secrets.js', '--type', 'jwt', '--length', '128'];
      
      const options = parseArgs();
      expect(options.type).toBe('jwt');
      expect(options.length).toBe(128);
      
      process.argv = originalArgv;
    });

    it('should return null values when no arguments provided', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'generate-secrets.js'];
      
      const options = parseArgs();
      expect(options.type).toBeNull();
      expect(options.length).toBeNull();
      
      process.argv = originalArgv;
    });
  });

  describe('JWT Secret Generation', () => {
    it('should generate valid JWT secret with default length', () => {
      const secret = secretManager.generateJWTSecret();
      
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThanOrEqual(64);
      expect(/^[0-9a-f]+$/.test(secret)).toBe(true); // Hex-encoded
    });

    it('should generate valid JWT secret with custom length', () => {
      const secret = secretManager.generateJWTSecret(128);
      
      expect(secret).toBeDefined();
      expect(secret.length).toBe(128);
      expect(/^[0-9a-f]+$/.test(secret)).toBe(true); // Hex-encoded
    });

    it('should generate JWT secret with sufficient entropy', () => {
      const secret = secretManager.generateJWTSecret();
      const entropy = secretManager.calculateEntropy(secret);
      
      expect(entropy).toBeGreaterThanOrEqual(200); // Should have high entropy
    });

    it('should throw error for JWT secret length less than 64', () => {
      expect(() => {
        secretManager.generateJWTSecret(32);
      }).toThrow('JWT secret must be at least 64 characters');
    });
  });

  describe('Database Password Generation', () => {
    it('should generate valid database password with default length', () => {
      const password = secretManager.generateDatabasePassword();
      
      expect(password).toBeDefined();
      expect(password.length).toBeGreaterThanOrEqual(32);
    });

    it('should generate database password with all required character types', () => {
      const password = secretManager.generateDatabasePassword();
      
      expect(/[A-Z]/.test(password)).toBe(true); // Uppercase
      expect(/[a-z]/.test(password)).toBe(true); // Lowercase
      expect(/[0-9]/.test(password)).toBe(true); // Numbers
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true); // Special chars
    });

    it('should generate database password with custom length', () => {
      const password = secretManager.generateDatabasePassword(64);
      
      expect(password).toBeDefined();
      expect(password.length).toBe(64);
    });

    it('should generate database password with sufficient entropy', () => {
      const password = secretManager.generateDatabasePassword();
      const entropy = secretManager.calculateEntropy(password);
      
      expect(entropy).toBeGreaterThanOrEqual(100); // Should have high entropy
    });

    it('should throw error for database password length less than 32', () => {
      expect(() => {
        secretManager.generateDatabasePassword(16);
      }).toThrow('Database password must be at least 32 characters');
    });
  });

  describe('OAuth Secret Generation', () => {
    it('should generate valid OAuth secret with default length', () => {
      const secret = secretManager.generateOAuthSecret();
      
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThanOrEqual(48);
      expect(/^[A-Za-z0-9+/]+$/.test(secret)).toBe(true); // Base64-encoded
    });

    it('should generate valid OAuth secret with custom length', () => {
      const secret = secretManager.generateOAuthSecret(96);
      
      expect(secret).toBeDefined();
      expect(secret.length).toBe(96);
      expect(/^[A-Za-z0-9+/]+$/.test(secret)).toBe(true); // Base64-encoded
    });

    it('should generate OAuth secret with sufficient entropy', () => {
      const secret = secretManager.generateOAuthSecret();
      const entropy = secretManager.calculateEntropy(secret);
      
      expect(entropy).toBeGreaterThanOrEqual(200); // Should have high entropy
    });

    it('should throw error for OAuth secret length less than 48', () => {
      expect(() => {
        secretManager.generateOAuthSecret(32);
      }).toThrow('OAuth secret must be at least 48 characters');
    });
  });

  describe('Entropy Calculation', () => {
    it('should calculate entropy for generated secrets', () => {
      const jwtSecret = secretManager.generateJWTSecret();
      const entropy = secretManager.calculateEntropy(jwtSecret);
      
      expect(entropy).toBeGreaterThan(0);
      expect(typeof entropy).toBe('number');
    });

    it('should return higher entropy for longer secrets', () => {
      const shortSecret = secretManager.generateJWTSecret(64);
      const longSecret = secretManager.generateJWTSecret(128);
      
      const shortEntropy = secretManager.calculateEntropy(shortSecret);
      const longEntropy = secretManager.calculateEntropy(longSecret);
      
      expect(longEntropy).toBeGreaterThan(shortEntropy);
    });
  });

  describe('Secret Validation', () => {
    it('should validate generated JWT secret meets requirements', () => {
      const secret = secretManager.generateJWTSecret();
      const result = secretManager.validateSecret(secret, {
        minLength: 64,
        minEntropy: 200
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate generated database password meets requirements', () => {
      const password = secretManager.generateDatabasePassword();
      const result = secretManager.validateSecret(password, {
        minLength: 32,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate generated OAuth secret meets requirements', () => {
      const secret = secretManager.generateOAuthSecret();
      const result = secretManager.validateSecret(secret, {
        minLength: 48,
        minEntropy: 200
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Weak Pattern Detection', () => {
    it('should not detect weak patterns in generated secrets', () => {
      const jwtSecret = secretManager.generateJWTSecret();
      const dbPassword = secretManager.generateDatabasePassword();
      const oauthSecret = secretManager.generateOAuthSecret();
      
      expect(secretManager.isWeakPattern(jwtSecret)).toBe(false);
      expect(secretManager.isWeakPattern(dbPassword)).toBe(false);
      expect(secretManager.isWeakPattern(oauthSecret)).toBe(false);
    });
  });
});
