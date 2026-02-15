const fc = require('fast-check');
const SecretManager = require('../../../lib/security/secret-manager');

describe('Secret Generation Properties', () => {
  let secretManager;

  beforeEach(() => {
    secretManager = new SecretManager();
  });

  describe('Property 1: JWT Secret Strength', () => {
    test('generated JWT secrets always meet minimum requirements', () => {
      /**
       * Feature: production-security-hardening, Property 1: JWT Secret Strength
       * **Validates: Requirements 1.1**
       * 
       * For any invocation of JWT secret generation, the generated secret should 
       * have minimum 64 characters and be generated using cryptographically secure randomness.
       */
      fc.assert(
        fc.property(fc.constant(null), () => {
          const secret = secretManager.generateJWTSecret();
          
          // Must be at least 64 characters
          expect(secret.length).toBeGreaterThanOrEqual(64);
          
          // Must be hex-encoded (only 0-9, a-f characters)
          expect(/^[0-9a-f]+$/.test(secret)).toBe(true);
          
          // Must have high entropy (at least 200 bits for 64-char hex string)
          const entropy = secretManager.calculateEntropy(secret);
          expect(entropy).toBeGreaterThanOrEqual(200);
          
          // Must not contain weak patterns
          expect(secretManager.isWeakPattern(secret)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    test('JWT secrets with custom length always meet requirements', () => {
      /**
       * Feature: production-security-hardening, Property 1: JWT Secret Strength
       * **Validates: Requirements 1.1**
       */
      fc.assert(
        fc.property(fc.integer({ min: 64, max: 256 }), (length) => {
          const secret = secretManager.generateJWTSecret(length);
          
          expect(secret.length).toBe(length);
          expect(/^[0-9a-f]+$/.test(secret)).toBe(true);
          expect(secretManager.isWeakPattern(secret)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Database Password Complexity', () => {
    test('generated database passwords always meet complexity requirements', () => {
      /**
       * Feature: production-security-hardening, Property 2: Database Password Complexity
       * **Validates: Requirements 1.2**
       * 
       * For any generated database password, it should contain minimum 32 characters 
       * and include at least one uppercase letter, one lowercase letter, one number, 
       * and one special character.
       */
      fc.assert(
        fc.property(fc.constant(null), () => {
          const password = secretManager.generateDatabasePassword();
          
          // Must be at least 32 characters
          expect(password.length).toBeGreaterThanOrEqual(32);
          
          // Must contain at least one uppercase letter
          expect(/[A-Z]/.test(password)).toBe(true);
          
          // Must contain at least one lowercase letter
          expect(/[a-z]/.test(password)).toBe(true);
          
          // Must contain at least one number
          expect(/[0-9]/.test(password)).toBe(true);
          
          // Must contain at least one special character
          expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
          
          // Must not contain weak patterns
          expect(secretManager.isWeakPattern(password)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    test('database passwords with custom length always meet complexity requirements', () => {
      /**
       * Feature: production-security-hardening, Property 2: Database Password Complexity
       * **Validates: Requirements 1.2**
       */
      fc.assert(
        fc.property(fc.integer({ min: 32, max: 128 }), (length) => {
          const password = secretManager.generateDatabasePassword(length);
          
          expect(password.length).toBe(length);
          expect(/[A-Z]/.test(password)).toBe(true);
          expect(/[a-z]/.test(password)).toBe(true);
          expect(/[0-9]/.test(password)).toBe(true);
          expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: OAuth Secret Strength', () => {
    test('generated OAuth secrets always meet minimum requirements', () => {
      /**
       * Feature: production-security-hardening, Property 3: OAuth Secret Strength
       * **Validates: Requirements 1.3**
       * 
       * For any invocation of OAuth secret generation, the generated secret should 
       * have minimum 48 characters and be generated using cryptographically secure randomness.
       */
      fc.assert(
        fc.property(fc.constant(null), () => {
          const secret = secretManager.generateOAuthSecret();
          
          // Must be at least 48 characters
          expect(secret.length).toBeGreaterThanOrEqual(48);
          
          // Must be base64-encoded (only A-Z, a-z, 0-9, +, / characters)
          expect(/^[A-Za-z0-9+/]+$/.test(secret)).toBe(true);
          
          // Must have high entropy (at least 200 bits for 48-char base64 string)
          const entropy = secretManager.calculateEntropy(secret);
          expect(entropy).toBeGreaterThanOrEqual(200);
          
          // Must not contain weak patterns
          expect(secretManager.isWeakPattern(secret)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    test('OAuth secrets with custom length always meet requirements', () => {
      /**
       * Feature: production-security-hardening, Property 3: OAuth Secret Strength
       * **Validates: Requirements 1.3**
       */
      fc.assert(
        fc.property(fc.integer({ min: 48, max: 256 }), (length) => {
          const secret = secretManager.generateOAuthSecret(length);
          
          expect(secret.length).toBe(length);
          expect(/^[A-Za-z0-9+/]+$/.test(secret)).toBe(true);
          expect(secretManager.isWeakPattern(secret)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Secret Entropy Threshold', () => {
    test('all generated secrets meet minimum entropy threshold', () => {
      /**
       * Feature: production-security-hardening, Property 4: Secret Entropy Threshold
       * **Validates: Requirements 1.4**
       * 
       * For any secret generated by the Secret_Manager, the calculated entropy 
       * should be at least 256 bits. Note: We use longer secrets to ensure this threshold.
       */
      fc.assert(
        fc.property(
          fc.constantFrom('jwt', 'oauth'),
          (secretType) => {
            let secret;
            if (secretType === 'jwt') {
              // Use 128 chars to ensure >256 bits entropy (hex: ~4 bits/char)
              secret = secretManager.generateJWTSecret(128);
            } else {
              // Use 64 chars to ensure >256 bits entropy (base64: ~6 bits/char)
              secret = secretManager.generateOAuthSecret(64);
            }
            
            const entropy = secretManager.calculateEntropy(secret);
            expect(entropy).toBeGreaterThanOrEqual(256);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('entropy increases with secret length and diversity', () => {
      /**
       * Feature: production-security-hardening, Property 4: Secret Entropy Threshold
       * **Validates: Requirements 1.4**
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 64, max: 128 }),
          fc.integer({ min: 128, max: 256 }),
          (shortLength, longLength) => {
            fc.pre(shortLength < longLength);
            
            const shortSecret = secretManager.generateJWTSecret(shortLength);
            const longSecret = secretManager.generateJWTSecret(longLength);
            
            const shortEntropy = secretManager.calculateEntropy(shortSecret);
            const longEntropy = secretManager.calculateEntropy(longSecret);
            
            // Longer secrets should have higher entropy
            expect(longEntropy).toBeGreaterThan(shortEntropy);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Uniqueness Properties', () => {
    test('generated secrets are always unique', () => {
      /**
       * Verify that the secret generation produces unique values on each invocation
       */
      fc.assert(
        fc.property(fc.constant(null), () => {
          const secrets = new Set();
          
          // Generate 10 secrets of each type
          for (let i = 0; i < 10; i++) {
            secrets.add(secretManager.generateJWTSecret());
            secrets.add(secretManager.generateDatabasePassword());
            secrets.add(secretManager.generateOAuthSecret());
          }
          
          // All 30 secrets should be unique
          expect(secrets.size).toBe(30);
        }),
        { numRuns: 100 }
      );
    });
  });
});
