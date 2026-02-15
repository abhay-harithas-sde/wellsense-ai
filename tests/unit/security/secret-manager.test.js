const SecretManager = require('../../../lib/security/secret-manager');

describe('SecretManager', () => {
  let secretManager;

  beforeEach(() => {
    secretManager = new SecretManager();
  });

  describe('generateJWTSecret', () => {
    test('generates JWT secret with default length of 64 characters', () => {
      const secret = secretManager.generateJWTSecret();
      expect(secret).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(secret)).toBe(true); // hex-encoded
    });

    test('generates JWT secret with custom length', () => {
      const secret = secretManager.generateJWTSecret(128);
      expect(secret).toHaveLength(128);
      expect(/^[0-9a-f]+$/.test(secret)).toBe(true);
    });

    test('throws error for length less than 64', () => {
      expect(() => secretManager.generateJWTSecret(32)).toThrow('JWT secret must be at least 64 characters');
    });

    test('generates unique secrets on each call', () => {
      const secret1 = secretManager.generateJWTSecret();
      const secret2 = secretManager.generateJWTSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('generateDatabasePassword', () => {
    test('generates database password with default length of 32 characters', () => {
      const password = secretManager.generateDatabasePassword();
      expect(password).toHaveLength(32);
    });

    test('generates database password with custom length', () => {
      const password = secretManager.generateDatabasePassword(64);
      expect(password).toHaveLength(64);
    });

    test('throws error for length less than 32', () => {
      expect(() => secretManager.generateDatabasePassword(16)).toThrow('Database password must be at least 32 characters');
    });

    test('includes at least one uppercase letter', () => {
      const password = secretManager.generateDatabasePassword();
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    test('includes at least one lowercase letter', () => {
      const password = secretManager.generateDatabasePassword();
      expect(/[a-z]/.test(password)).toBe(true);
    });

    test('includes at least one number', () => {
      const password = secretManager.generateDatabasePassword();
      expect(/[0-9]/.test(password)).toBe(true);
    });

    test('includes at least one special character', () => {
      const password = secretManager.generateDatabasePassword();
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
    });

    test('generates unique passwords on each call', () => {
      const password1 = secretManager.generateDatabasePassword();
      const password2 = secretManager.generateDatabasePassword();
      expect(password1).not.toBe(password2);
    });
  });

  describe('generateOAuthSecret', () => {
    test('generates OAuth secret with default length of 48 characters', () => {
      const secret = secretManager.generateOAuthSecret();
      expect(secret).toHaveLength(48);
      expect(/^[A-Za-z0-9+/]+$/.test(secret)).toBe(true); // base64-encoded
    });

    test('generates OAuth secret with custom length', () => {
      const secret = secretManager.generateOAuthSecret(96);
      expect(secret).toHaveLength(96);
      expect(/^[A-Za-z0-9+/]+$/.test(secret)).toBe(true);
    });

    test('throws error for length less than 48', () => {
      expect(() => secretManager.generateOAuthSecret(32)).toThrow('OAuth secret must be at least 48 characters');
    });

    test('generates unique secrets on each call', () => {
      const secret1 = secretManager.generateOAuthSecret();
      const secret2 = secretManager.generateOAuthSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('calculateEntropy', () => {
    test('returns 0 for empty string', () => {
      expect(secretManager.calculateEntropy('')).toBe(0);
    });

    test('returns 0 for null or undefined', () => {
      expect(secretManager.calculateEntropy(null)).toBe(0);
      expect(secretManager.calculateEntropy(undefined)).toBe(0);
    });

    test('calculates entropy for single character repeated', () => {
      const entropy = secretManager.calculateEntropy('aaaa');
      expect(entropy).toBe(0); // No entropy in repeated characters
    });

    test('calculates higher entropy for diverse characters', () => {
      const lowEntropy = secretManager.calculateEntropy('aaaa');
      const highEntropy = secretManager.calculateEntropy('abcd');
      expect(highEntropy).toBeGreaterThan(lowEntropy);
    });

    test('calculates entropy for known string', () => {
      // "abc" has 3 unique characters, each appearing once
      // Entropy = -3 * (1/3 * log2(1/3)) * 3 = 3 * log2(3) ≈ 4.75 bits
      const entropy = secretManager.calculateEntropy('abc');
      expect(entropy).toBeCloseTo(4.75, 1);
    });

    test('calculates high entropy for generated secrets', () => {
      const secret = secretManager.generateJWTSecret();
      const entropy = secretManager.calculateEntropy(secret);
      expect(entropy).toBeGreaterThan(200); // Should have high entropy (hex has ~4 bits per char)
    });
  });

  describe('validateSecret', () => {
    test('validates secret with minimum length requirement', () => {
      const result = secretManager.validateSecret('a'.repeat(64), { minLength: 64 });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects secret shorter than minimum length', () => {
      const result = secretManager.validateSecret('short', { minLength: 64 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret length is 5 characters, minimum required is 64');
    });

    test('rejects empty or null secret', () => {
      const result1 = secretManager.validateSecret('', { minLength: 32 });
      expect(result1.valid).toBe(false);
      expect(result1.errors).toContain('Secret is required');

      const result2 = secretManager.validateSecret(null, { minLength: 32 });
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain('Secret is required');
    });

    test('rejects secret with weak pattern', () => {
      const result = secretManager.validateSecret('your-secret-key', { minLength: 10 });
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('weak pattern'))).toBe(true);
    });

    test('validates secret with minimum entropy requirement', () => {
      const strongSecret = secretManager.generateJWTSecret(128); // Use longer secret for higher entropy
      const result = secretManager.validateSecret(strongSecret, { minLength: 64, minEntropy: 256 });
      expect(result.valid).toBe(true);
    });

    test('rejects secret with insufficient entropy', () => {
      const weakSecret = 'a'.repeat(64);
      const result = secretManager.validateSecret(weakSecret, { minLength: 64, minEntropy: 256 });
      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes('entropy'))).toBe(true);
    });

    test('validates password with all character type requirements', () => {
      const password = 'Abc123!@#xyz';
      const result = secretManager.validateSecret(password, {
        minLength: 10,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      });
      expect(result.valid).toBe(true);
    });

    test('rejects password missing uppercase', () => {
      const password = 'abc123!@#';
      const result = secretManager.validateSecret(password, {
        minLength: 8,
        requireUppercase: true
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must contain at least one uppercase letter');
    });

    test('rejects password missing lowercase', () => {
      const password = 'ABC123!@#';
      const result = secretManager.validateSecret(password, {
        minLength: 8,
        requireLowercase: true
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must contain at least one lowercase letter');
    });

    test('rejects password missing numbers', () => {
      const password = 'Abcdef!@#';
      const result = secretManager.validateSecret(password, {
        minLength: 8,
        requireNumbers: true
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must contain at least one number');
    });

    test('rejects password missing special characters', () => {
      const password = 'Abc123xyz';
      const result = secretManager.validateSecret(password, {
        minLength: 8,
        requireSpecialChars: true
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must contain at least one special character');
    });

    test('returns multiple errors for multiple violations', () => {
      const password = 'short';
      const result = secretManager.validateSecret(password, {
        minLength: 32,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('isWeakPattern', () => {
    test('detects "your-" pattern', () => {
      expect(secretManager.isWeakPattern('your-secret-key')).toBe(true);
      expect(secretManager.isWeakPattern('YOUR-SECRET-KEY')).toBe(true);
    });

    test('detects "change-in-production" pattern', () => {
      expect(secretManager.isWeakPattern('change-in-production-123')).toBe(true);
      expect(secretManager.isWeakPattern('CHANGE-IN-PRODUCTION')).toBe(true);
    });

    test('detects "test-" pattern', () => {
      expect(secretManager.isWeakPattern('test-secret')).toBe(true);
      expect(secretManager.isWeakPattern('TEST-SECRET')).toBe(true);
    });

    test('detects "example-" pattern', () => {
      expect(secretManager.isWeakPattern('example-key')).toBe(true);
      expect(secretManager.isWeakPattern('EXAMPLE-KEY')).toBe(true);
    });

    test('detects "placeholder-" pattern', () => {
      expect(secretManager.isWeakPattern('placeholder-value')).toBe(true);
      expect(secretManager.isWeakPattern('PLACEHOLDER-VALUE')).toBe(true);
    });

    test('detects "secret" pattern', () => {
      expect(secretManager.isWeakPattern('mysecret123')).toBe(true);
      expect(secretManager.isWeakPattern('SECRET')).toBe(true);
    });

    test('detects "password" pattern', () => {
      expect(secretManager.isWeakPattern('mypassword123')).toBe(true);
      expect(secretManager.isWeakPattern('PASSWORD')).toBe(true);
    });

    test('detects "admin" pattern', () => {
      expect(secretManager.isWeakPattern('admin123')).toBe(true);
      expect(secretManager.isWeakPattern('ADMIN')).toBe(true);
    });

    test('detects "root" pattern', () => {
      expect(secretManager.isWeakPattern('root123')).toBe(true);
      expect(secretManager.isWeakPattern('ROOT')).toBe(true);
    });

    test('returns false for strong secrets', () => {
      const strongSecret = secretManager.generateJWTSecret();
      expect(secretManager.isWeakPattern(strongSecret)).toBe(false);
    });

    test('returns false for null or undefined', () => {
      expect(secretManager.isWeakPattern(null)).toBe(false);
      expect(secretManager.isWeakPattern(undefined)).toBe(false);
    });
  });
});
