const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const SecretManager = require('../../../lib/security/secret-manager');

describe('Template Validation Properties', () => {
  let secretManager;
  let templateContent;

  beforeAll(() => {
    // Read the .env.production.template file
    const templatePath = path.join(__dirname, '../../../.env.production.template');
    templateContent = fs.readFileSync(templatePath, 'utf-8');
  });

  beforeEach(() => {
    secretManager = new SecretManager();
  });

  /**
   * Property 18: Template Placeholder Values
   * **Validates: Requirements 7.2, 7.5**
   * 
   * For any secret value in the .env.production.template file, it should match 
   * a placeholder pattern (your-, change-in-production, REPLACE_ME, etc.) and 
   * not contain real credentials.
   */
  test('Property 18: all template secret values are placeholders, not real credentials', () => {
    // Extract secret values from template
    const secretPatterns = [
      /JWT_SECRET=(.+)/,
      /GOOGLE_CLIENT_SECRET=(.+)/,
      /MICROSOFT_CLIENT_SECRET=(.+)/,
      /OPENAI_API_KEY=(.+)/,
      /FIREBASE_PRIVATE_KEY=(.+)/
    ];

    const extractedSecrets = [];
    secretPatterns.forEach(pattern => {
      const match = templateContent.match(pattern);
      if (match && match[1]) {
        extractedSecrets.push({
          name: pattern.source.split('=')[0],
          value: match[1].trim()
        });
      }
    });

    // Verify each extracted secret is a placeholder
    extractedSecrets.forEach(secret => {
      // Check if it matches weak patterns (which is good for templates!)
      const isPlaceholder = secretManager.isWeakPattern(secret.value);
      
      expect(isPlaceholder).toBe(true);
      expect(secret.value).toMatch(/REPLACE_WITH_|your-|change-in-production|placeholder-/i);
    });

    // Ensure we found at least some secrets to validate
    expect(extractedSecrets.length).toBeGreaterThan(0);
  });

  /**
   * Property 18 (Extended): Template passwords match weak patterns
   * **Validates: Requirements 7.2, 7.5**
   * 
   * For any database password in the template, it should be a placeholder
   * that would be rejected by the validator in production mode.
   */
  test('Property 18 (Extended): template database passwords are placeholders', () => {
    // Extract database passwords from template
    const databaseUrlMatch = templateContent.match(/DATABASE_URL="postgresql:\/\/[^:]+:([^@]+)@/);
    const mongodbUriMatch = templateContent.match(/MONGODB_URI="mongodb:\/\/[^:]+:([^@]+)@/);

    const passwords = [];
    if (databaseUrlMatch && databaseUrlMatch[1]) {
      passwords.push({ name: 'DATABASE_URL', password: databaseUrlMatch[1] });
    }
    if (mongodbUriMatch && mongodbUriMatch[1]) {
      passwords.push({ name: 'MONGODB_URI', password: mongodbUriMatch[1] });
    }

    // Verify each password is a placeholder
    passwords.forEach(({ name, password }) => {
      const isPlaceholder = secretManager.isWeakPattern(password);
      expect(isPlaceholder).toBe(true);
      expect(password).toMatch(/REPLACE_WITH_|your-|change-in-production|placeholder-/i);
    });

    // Ensure we found passwords to validate
    expect(passwords.length).toBeGreaterThan(0);
  });

  /**
   * Property 19: Template Variable Documentation
   * **Validates: Requirements 7.3**
   * 
   * For any configuration variable in the .env.production.template file, 
   * there should be a comment explaining its purpose.
   */
  test('Property 19: all configuration variables have explanatory comments', () => {
    // Extract all environment variable assignments
    const envVarPattern = /^([A-Z_]+)=/gm;
    const matches = [...templateContent.matchAll(envVarPattern)];
    const envVars = matches.map(match => match[1]);

    // For each environment variable, check if there's a comment nearby
    envVars.forEach(varName => {
      // Find the line with this variable
      const lines = templateContent.split('\n');
      const varLineIndex = lines.findIndex(line => line.startsWith(`${varName}=`));
      
      expect(varLineIndex).toBeGreaterThanOrEqual(0);

      // Check the 5 lines before this variable for a comment
      const precedingLines = lines.slice(Math.max(0, varLineIndex - 5), varLineIndex);
      const hasComment = precedingLines.some(line => line.trim().startsWith('#') && line.length > 2);

      expect(hasComment).toBe(true);
    });

    // Ensure we found variables to validate
    expect(envVars.length).toBeGreaterThan(0);
  });

  /**
   * Property 19 (Extended): Critical variables have detailed documentation
   * **Validates: Requirements 7.3**
   * 
   * For critical security variables (JWT_SECRET, database passwords, OAuth secrets),
   * the documentation should include security warnings and generation instructions.
   */
  test('Property 19 (Extended): critical variables have security warnings', () => {
    const criticalVars = [
      'JWT_SECRET',
      'DATABASE_URL',
      'MONGODB_URI',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY'
    ];

    criticalVars.forEach(varName => {
      // Find the section containing this variable
      const lines = templateContent.split('\n');
      const varLineIndex = lines.findIndex(line => line.startsWith(`${varName}=`));
      
      expect(varLineIndex).toBeGreaterThanOrEqual(0);

      // Check the 10 lines before this variable for security-related keywords
      const precedingLines = lines.slice(Math.max(0, varLineIndex - 10), varLineIndex);
      const documentation = precedingLines.join(' ');

      // Should contain security-related keywords
      const hasSecurityWarning = 
        documentation.includes('CRITICAL') ||
        documentation.includes('IMPORTANT') ||
        documentation.includes('secure') ||
        documentation.includes('secret') ||
        documentation.includes('password') ||
        documentation.includes('Generate');

      expect(hasSecurityWarning).toBe(true);
    });
  });

  /**
   * Property 18 & 19 Combined: Template is safe to commit
   * **Validates: Requirements 7.5**
   * 
   * The template file should not contain any real secrets that would
   * be detected as strong secrets by the secret manager.
   */
  test('Property 18 & 19: template contains no real secrets', () => {
    // Extract all potential secret values (anything after = on a non-comment line)
    const lines = templateContent.split('\n');
    const secretLines = lines.filter(line => 
      !line.trim().startsWith('#') && 
      line.includes('=') &&
      !line.includes('NODE_ENV') &&
      !line.includes('PORT') &&
      !line.includes('ENABLE_HTTPS')
    );

    secretLines.forEach(line => {
      const [, value] = line.split('=');
      if (value && value.trim().length > 10) {
        const trimmedValue = value.trim().replace(/^["']|["']$/g, '');
        
        // If it looks like a secret (long enough), it should be a weak pattern
        if (trimmedValue.length > 20 && !trimmedValue.includes('://')) {
          const isWeak = secretManager.isWeakPattern(trimmedValue);
          
          // For template, we WANT weak patterns (placeholders)
          // Strong secrets would indicate real credentials leaked into template
          if (!isWeak) {
            // Check if it's a URL or path (which are OK)
            const isUrlOrPath = 
              trimmedValue.includes('://') ||
              trimmedValue.startsWith('./') ||
              trimmedValue.startsWith('/') ||
              trimmedValue.includes('.com') ||
              trimmedValue.includes('.apps.googleusercontent.com') ||
              trimmedValue.includes('iam.gserviceaccount.com');
            
            expect(isUrlOrPath).toBe(true);
          }
        }
      }
    });
  });

  /**
   * Property 19 (Completeness): Template includes all required variables
   * **Validates: Requirements 7.1, 7.4**
   * 
   * The template should include all variables that are required for
   * production deployment.
   */
  test('Property 19 (Completeness): template includes all required production variables', () => {
    const requiredVars = [
      'NODE_ENV',
      'PORT',
      'CORS_ORIGIN',
      'ENABLE_HTTPS',
      'DATABASE_URL',
      'MONGODB_URI',
      'REDIS_URL',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY'
    ];

    requiredVars.forEach(varName => {
      const pattern = new RegExp(`^${varName}=`, 'm');
      expect(templateContent).toMatch(pattern);
    });
  });

  /**
   * Property 19 (Recommended Values): Template includes production recommendations
   * **Validates: Requirements 7.4**
   * 
   * The template should include recommended values for production settings
   * like timeouts, limits, and security configurations.
   */
  test('Property 19 (Recommended Values): template includes production recommendations', () => {
    // Check for recommended values in comments
    const hasRecommendations = 
      templateContent.includes('Recommended:') ||
      templateContent.includes('Default:') ||
      templateContent.includes('Example:');

    expect(hasRecommendations).toBe(true);

    // Check for specific production recommendations
    expect(templateContent).toMatch(/JWT_EXPIRES_IN=7d/);
    expect(templateContent).toMatch(/NODE_ENV=production/);
    expect(templateContent).toMatch(/ENABLE_HTTPS=true/);
    expect(templateContent).toMatch(/VITE_PRODUCTION_MODE=true/);
  });
});

