const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const SecretManager = require('../../../lib/security/secret-manager');

/**
 * Property-Based Tests for Docker Configuration Security
 * Feature: production-security-hardening
 * 
 * These tests verify that Docker environment files meet security requirements:
 * - Property 20: Docker database passwords meet strength requirements
 * - Property 21: Docker environment files exclude application secrets
 */

describe('Docker Configuration Properties', () => {
  const secretManager = new SecretManager();
  const dockerEnvPath = path.join(__dirname, '../../../docker/.env.docker');
  const dockerEnvProductionPath = path.join(__dirname, '../../../docker/.env.docker.production');

  describe('Property 20: Docker Password Strength', () => {
    /**
     * **Validates: Requirements 8.2**
     * 
     * For any database password in Docker environment files, it should meet 
     * the minimum strength requirements (32+ characters, complexity).
     */
    test('all database passwords in Docker production file meet strength requirements', () => {
      // Read the production Docker environment file
      const envContent = fs.readFileSync(dockerEnvProductionPath, 'utf-8');
      
      // Extract password variables
      const passwordVars = [
        'POSTGRES_PASSWORD',
        'MONGO_INITDB_ROOT_PASSWORD',
        'REDIS_PASSWORD',
        'PGADMIN_DEFAULT_PASSWORD',
        'ME_CONFIG_MONGODB_ADMINPASSWORD',
        'ME_CONFIG_BASICAUTH_PASSWORD'
      ];

      passwordVars.forEach(varName => {
        // Extract password value from env file
        const regex = new RegExp(`^${varName}=(.+)$`, 'm');
        const match = envContent.match(regex);
        
        if (match && match[1]) {
          const password = match[1].trim();
          
          // Skip if it's a placeholder or empty
          if (password && !password.startsWith('your-') && !password.includes('REPLACE')) {
            // Validate password meets requirements
            const validation = secretManager.validateSecret(password, {
              minLength: 32,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: true
            });

            expect(validation.valid).toBe(true);
            expect(password.length).toBeGreaterThanOrEqual(32);
            expect(/[A-Z]/.test(password)).toBe(true);
            expect(/[a-z]/.test(password)).toBe(true);
            expect(/[0-9]/.test(password)).toBe(true);
            expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
          }
        }
      });
    });

    /**
     * **Validates: Requirements 8.2**
     * 
     * Property test: For any generated database password, it should always
     * meet the minimum strength requirements.
     */
    test('generated database passwords always meet strength requirements', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 32, max: 64 }), // Password length
          (length) => {
            const password = secretManager.generateDatabasePassword(length);
            
            // Validate password meets all requirements
            const validation = secretManager.validateSecret(password, {
              minLength: 32,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: true
            });

            expect(validation.valid).toBe(true);
            expect(password.length).toBeGreaterThanOrEqual(32);
            expect(password.length).toBe(length);
            expect(/[A-Z]/.test(password)).toBe(true);
            expect(/[a-z]/.test(password)).toBe(true);
            expect(/[0-9]/.test(password)).toBe(true);
            expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Validates: Requirements 8.2**
     * 
     * Property test: Weak passwords should always be rejected.
     */
    test('weak passwords are always rejected', () => {
      const weakPasswords = [
        'password123',
        'admin',
        'root',
        'test',
        '12345678',
        'qwerty',
        'password',
        'Abhay#1709' // Example weak password
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...weakPasswords),
          (weakPassword) => {
            const validation = secretManager.validateSecret(weakPassword, {
              minLength: 32,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: true
            });

            // Weak passwords should fail validation
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: weakPasswords.length }
      );
    });
  });

  describe('Property 21: Docker Secret Exclusion', () => {
    /**
     * **Validates: Requirements 8.3**
     * 
     * For any Docker environment file, it should not contain application secrets
     * (JWT_SECRET, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY).
     */
    test('Docker development environment file excludes application secrets', () => {
      const envContent = fs.readFileSync(dockerEnvPath, 'utf-8');
      
      // Application secrets that should NOT be in Docker env files
      const forbiddenSecrets = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_CALLBACK_URL',
        'OPENAI_API_KEY',
        'SESSION_SECRET'
      ];

      forbiddenSecrets.forEach(secretName => {
        // Check that the secret is not defined in the file
        const regex = new RegExp(`^${secretName}=`, 'm');
        const hasSecret = regex.test(envContent);
        
        expect(hasSecret).toBe(false);
      });
    });

    /**
     * **Validates: Requirements 8.3**
     * 
     * For any Docker production environment file, it should not contain 
     * application secrets (JWT_SECRET, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY).
     */
    test('Docker production environment file excludes application secrets', () => {
      const envContent = fs.readFileSync(dockerEnvProductionPath, 'utf-8');
      
      // Application secrets that should NOT be in Docker env files
      const forbiddenSecrets = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_CALLBACK_URL',
        'OPENAI_API_KEY',
        'SESSION_SECRET'
      ];

      forbiddenSecrets.forEach(secretName => {
        // Check that the secret is not defined in the file (not as a variable assignment)
        // Allow mentions in comments (documentation)
        const lines = envContent.split('\n');
        const secretLines = lines.filter(line => {
          const trimmed = line.trim();
          // Ignore comments
          if (trimmed.startsWith('#')) return false;
          // Check for actual variable assignment
          return new RegExp(`^${secretName}=`).test(trimmed);
        });
        
        expect(secretLines.length).toBe(0);
      });
    });

    /**
     * **Validates: Requirements 8.3, 8.4**
     * 
     * Docker environment files should document how to pass application secrets
     * via environment variables.
     */
    test('Docker production file documents secret passing methods', () => {
      const envContent = fs.readFileSync(dockerEnvProductionPath, 'utf-8');
      
      // Check for documentation of secret passing methods
      const requiredDocumentation = [
        'APPLICATION SECRETS',
        'Environment Variables',
        'Docker Secrets',
        'JWT_SECRET',
        'GOOGLE_CLIENT_SECRET',
        'OPENAI_API_KEY'
      ];

      requiredDocumentation.forEach(keyword => {
        expect(envContent).toContain(keyword);
      });
    });

    /**
     * **Validates: Requirements 8.3**
     * 
     * Property test: For any list of application secret names, none should
     * appear as variable assignments in Docker environment files.
     */
    test('application secrets are never assigned in Docker environment files', () => {
      const applicationSecrets = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'GOOGLE_CLIENT_SECRET',
        'OPENAI_API_KEY',
        'SESSION_SECRET'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(dockerEnvPath, dockerEnvProductionPath),
          fc.constantFrom(...applicationSecrets),
          (envFilePath, secretName) => {
            const envContent = fs.readFileSync(envFilePath, 'utf-8');
            
            // Extract non-comment lines
            const lines = envContent.split('\n');
            const codeLines = lines.filter(line => {
              const trimmed = line.trim();
              return trimmed && !trimmed.startsWith('#');
            });

            // Check that secret is not assigned
            const hasAssignment = codeLines.some(line => 
              new RegExp(`^${secretName}=`).test(line.trim())
            );

            expect(hasAssignment).toBe(false);
          }
        ),
        { numRuns: applicationSecrets.length * 2 }
      );
    });
  });

  describe('Property 20 & 21: Combined Docker Security', () => {
    /**
     * **Validates: Requirements 8.2, 8.3**
     * 
     * Docker production environment file should have strong database passwords
     * AND exclude application secrets.
     */
    test('Docker production file meets all security requirements', () => {
      const envContent = fs.readFileSync(dockerEnvProductionPath, 'utf-8');
      
      // 1. Check NODE_ENV is production
      expect(envContent).toMatch(/^NODE_ENV=production$/m);
      
      // 2. Check database passwords are strong (already tested above)
      const passwordVars = ['POSTGRES_PASSWORD', 'MONGO_INITDB_ROOT_PASSWORD'];
      passwordVars.forEach(varName => {
        const regex = new RegExp(`^${varName}=(.+)$`, 'm');
        const match = envContent.match(regex);
        if (match && match[1]) {
          const password = match[1].trim();
          expect(password.length).toBeGreaterThanOrEqual(32);
        }
      });
      
      // 3. Check application secrets are excluded
      const forbiddenSecrets = ['JWT_SECRET', 'GOOGLE_CLIENT_SECRET', 'OPENAI_API_KEY'];
      const lines = envContent.split('\n').filter(line => !line.trim().startsWith('#'));
      forbiddenSecrets.forEach(secretName => {
        const hasSecret = lines.some(line => 
          new RegExp(`^${secretName}=`).test(line.trim())
        );
        expect(hasSecret).toBe(false);
      });
      
      // 4. Check documentation is present
      expect(envContent).toContain('APPLICATION SECRETS');
      expect(envContent).toContain('DO NOT STORE IN THIS FILE');
    });
  });
});
