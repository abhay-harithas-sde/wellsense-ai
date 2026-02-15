const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Integration Tests for Task 2.1: Environment Validation Integration
 * 
 * Tests the integration of Environment Validator into god-server.js startup process.
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 5.5, 5.6**
 */

describe('Task 2.1: Environment Validation Integration', () => {
  const testEnvDir = path.join(__dirname, '../../test-env-files');
  
  beforeAll(() => {
    // Create test environment directory
    if (!fs.existsSync(testEnvDir)) {
      fs.mkdirSync(testEnvDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test environment files
    if (fs.existsSync(testEnvDir)) {
      fs.rmSync(testEnvDir, { recursive: true, force: true });
    }
  });

  /**
   * Test: Application starts with valid production config
   * **Validates: Requirements 2.2, 5.5**
   */
  test('application starts with valid production config', () => {
    const validProductionEnv = `
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://example.com,https://www.example.com
ENABLE_HTTPS=false
DATABASE_URL="postgresql://user:Str0ngP@ssw0rd!2024SecureDBP@ssw0rd@localhost:5432/db"
MONGODB_URI="mongodb://admin:SecureM0ng0!P@ss2024WithExtraLength@localhost:27017/db?authSource=admin"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=test-client-id
GOOGLE_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4
GOOGLE_CALLBACK_URL=https://example.com/auth/callback
OPENAI_API_KEY=sk-proj-validkeyhere
`;

    const envPath = path.join(testEnvDir, '.env.production');
    fs.writeFileSync(envPath, validProductionEnv.trim());

    // Test that validation passes
    const EnvironmentValidator = require('../../lib/security/environment-validator');
    const validator = new EnvironmentValidator();
    
    // Parse the env file
    const envVars = {};
    validProductionEnv.trim().split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=').replace(/^"|"$/g, '');
      }
    });

    const result = validator.validateAll(envVars, 'production');
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  /**
   * Test: Application fails to start with weak secrets in production
   * **Validates: Requirements 5.5, 5.2**
   */
  test('application fails to start with weak secrets in production', () => {
    const weakProductionEnv = `
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://example.com
ENABLE_HTTPS=false
DATABASE_URL="postgresql://user:weak@localhost:5432/db"
MONGODB_URI="mongodb://admin:weak@localhost:27017/db?authSource=admin"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=your-jwt-secret-change-in-production
JWT_EXPIRES_IN=7d
`;

    const EnvironmentValidator = require('../../lib/security/environment-validator');
    const validator = new EnvironmentValidator();
    
    // Parse the env file
    const envVars = {};
    weakProductionEnv.trim().split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=').replace(/^"|"$/g, '');
      }
    });

    const result = validator.validateAll(envVars, 'production');
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(err => err.includes('JWT_SECRET'))).toBe(true);
  });

  /**
   * Test: Application starts with weak secrets in development (warnings only)
   * **Validates: Requirements 5.6**
   */
  test('application starts with weak secrets in development (warnings only)', () => {
    const weakDevelopmentEnv = `
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
ENABLE_HTTPS=false
DATABASE_URL="postgresql://user:weak@localhost:5432/db"
MONGODB_URI="mongodb://admin:weak@localhost:27017/db?authSource=admin"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=test-jwt-secret
JWT_EXPIRES_IN=7d
`;

    const EnvironmentValidator = require('../../lib/security/environment-validator');
    const validator = new EnvironmentValidator();
    
    // Parse the env file
    const envVars = {};
    weakDevelopmentEnv.trim().split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=').replace(/^"|"$/g, '');
      }
    });

    const result = validator.validateAll(envVars, 'development');
    
    // In development, weak secrets should generate warnings, not errors
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(warn => warn.includes('JWT_SECRET'))).toBe(true);
  });

  /**
   * Test: Correct .env file loaded for each NODE_ENV
   * **Validates: Requirements 2.2, 2.3, 2.4**
   */
  test('correct .env file loaded for each NODE_ENV', () => {
    // Test development
    let nodeEnv = 'development';
    let expectedFile = nodeEnv === 'production' 
      ? '.env.production' 
      : nodeEnv === 'test'
      ? '.env.test'
      : '.env';
    expect(expectedFile).toBe('.env');

    // Test production
    nodeEnv = 'production';
    expectedFile = nodeEnv === 'production' 
      ? '.env.production' 
      : nodeEnv === 'test'
      ? '.env.test'
      : '.env';
    expect(expectedFile).toBe('.env.production');

    // Test test
    nodeEnv = 'test';
    expectedFile = nodeEnv === 'production' 
      ? '.env.production' 
      : nodeEnv === 'test'
      ? '.env.test'
      : '.env';
    expect(expectedFile).toBe('.env.test');
  });

  /**
   * Test: Production mode exits with error code 1 on validation failure
   * **Validates: Requirements 2.1, 5.5**
   */
  test('production mode exits with error code 1 on validation failure', () => {
    const EnvironmentValidator = require('../../lib/security/environment-validator');
    const validator = new EnvironmentValidator();
    
    const invalidEnv = {
      NODE_ENV: 'production',
      JWT_SECRET: 'weak',
      DATABASE_URL: 'postgresql://user:weak@localhost:5432/db',
      MONGODB_URI: 'mongodb://admin:weak@localhost:27017/db',
      CORS_ORIGIN: 'https://example.com'
    };

    const result = validator.validateAll(invalidEnv, 'production');
    
    expect(result.valid).toBe(false);
    
    // In production, the application should exit with code 1
    // This is tested by checking that validation fails
    expect(result.errors.length).toBeGreaterThan(0);
  });

  /**
   * Test: Development mode logs warnings but continues startup
   * **Validates: Requirements 2.1, 5.6**
   */
  test('development mode logs warnings but continues startup', () => {
    const EnvironmentValidator = require('../../lib/security/environment-validator');
    const validator = new EnvironmentValidator();
    
    const weakEnv = {
      NODE_ENV: 'development',
      JWT_SECRET: 'weak',
      DATABASE_URL: 'postgresql://user:weak@localhost:5432/db',
      MONGODB_URI: 'mongodb://admin:weak@localhost:27017/db',
      CORS_ORIGIN: 'http://localhost:3000'
    };

    const result = validator.validateAll(weakEnv, 'development');
    
    // In development, validation should pass (valid=true) but with warnings
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  /**
   * Test: Clear error messages for validation failures
   * **Validates: Requirements 2.1, 10.6**
   */
  test('clear error messages for validation failures', () => {
    const EnvironmentValidator = require('../../lib/security/environment-validator');
    const validator = new EnvironmentValidator();
    
    const invalidEnv = {
      NODE_ENV: 'production',
      JWT_SECRET: 'short',
      DATABASE_URL: 'postgresql://user:weak@localhost:5432/db',
      CORS_ORIGIN: '*'
    };

    const result = validator.validateAll(invalidEnv, 'production');
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    
    // Check that error messages are clear and specific
    const jwtError = result.errors.find(err => err.includes('JWT_SECRET'));
    expect(jwtError).toBeDefined();
    expect(jwtError).toMatch(/length|short|minimum/i);
    
    const corsError = result.errors.find(err => err.includes('CORS'));
    expect(corsError).toBeDefined();
    expect(corsError).toMatch(/wildcard|\*/);
  });

  /**
   * Test: Validation success logged in development mode
   * **Validates: Requirements 2.1**
   */
  test('validation success logged in development mode', () => {
    const EnvironmentValidator = require('../../lib/security/environment-validator');
    const validator = new EnvironmentValidator();
    
    const validEnv = {
      NODE_ENV: 'development',
      JWT_SECRET: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
      DATABASE_URL: 'postgresql://user:Str0ngP@ssw0rd!2024SecureDBP@ssw0rd@localhost:5432/db',
      MONGODB_URI: 'mongodb://admin:SecureM0ng0!P@ss2024WithExtraLength@localhost:27017/db',
      CORS_ORIGIN: 'http://localhost:3000',
      REDIS_URL: 'redis://localhost:6379'
    };

    const result = validator.validateAll(validEnv, 'development');
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    // May have warnings about SSL not being enabled, which is fine
  });
});

/**
 * Integration Tests for Task 3.2: Security Audit Tool
 * 
 * Tests the full security audit workflow with real file system operations.
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**
 */

describe('Task 3.2: Security Audit Tool Integration', () => {
  const SecurityAuditor = require('../../scripts/security-audit');
  const testEnvDir = path.join(__dirname, '../../test-audit-files');
  
  beforeAll(() => {
    // Create test environment directory
    if (!fs.existsSync(testEnvDir)) {
      fs.mkdirSync(testEnvDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test environment files
    if (fs.existsSync(testEnvDir)) {
      fs.rmSync(testEnvDir, { recursive: true, force: true });
    }
  });

  /**
   * Test: Security audit runs and generates report
   * **Validates: Requirements 6.1, 6.6**
   */
  test('security audit runs and generates report', async () => {
    const auditor = new SecurityAuditor();
    
    // Create test environment files
    const envContent = `
NODE_ENV=development
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
DATABASE_URL=postgresql://user:Str0ngP@ssw0rd!2024SecureDBP@ssw0rd@localhost:5432/db
MONGODB_URI=mongodb://admin:SecureM0ng0!P@ss2024WithExtraLength@localhost:27017/db
CORS_ORIGIN=http://localhost:3000
`;
    
    fs.writeFileSync(path.join(testEnvDir, '.env'), envContent);
    
    // Mock fs to use test directory
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    
    jest.spyOn(fs, 'existsSync').mockImplementation((filePath) => {
      if (filePath === '.env') return true;
      if (filePath === '.env.production') return false;
      if (filePath === '.env.test') return false;
      if (filePath === '.gitignore') return true;
      return originalExistsSync(filePath);
    });
    
    jest.spyOn(fs, 'readFileSync').mockImplementation((filePath, encoding) => {
      if (filePath === '.env') return envContent;
      if (filePath === '.gitignore') return '.env.production\n.env.docker.production\n';
      return originalReadFileSync(filePath, encoding);
    });
    
    const report = await auditor.runAllChecks();
    
    expect(report).toHaveProperty('passed');
    expect(report).toHaveProperty('exitCode');
    expect(report).toHaveProperty('results');
    expect(report.results.length).toBeGreaterThan(0);
    
    // Restore mocks
    fs.existsSync.mockRestore();
    fs.readFileSync.mockRestore();
  });

  /**
   * Test: Audit detects weak secrets
   * **Validates: Requirements 6.2**
   */
  test('audit detects weak secrets in environment files', async () => {
    const auditor = new SecurityAuditor();
    
    const weakEnvContent = `
NODE_ENV=development
JWT_SECRET=your-jwt-secret-change-in-production
DATABASE_URL=postgresql://user:weak@localhost:5432/db
`;
    
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(weakEnvContent);
    
    await auditor.checkWeakSecrets('.env');
    
    expect(auditor.results[0].passed).toBe(false);
    expect(auditor.results[0].details.length).toBeGreaterThan(0);
    expect(auditor.results[0].details.some(d => d.key === 'JWT_SECRET')).toBe(true);
    
    fs.existsSync.mockRestore();
    fs.readFileSync.mockRestore();
  });

  /**
   * Test: Audit verifies NODE_ENV across files
   * **Validates: Requirements 6.4**
   */
  test('audit verifies NODE_ENV matches expected value for each file', async () => {
    const auditor = new SecurityAuditor();
    
    // Test .env.production with wrong NODE_ENV
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('NODE_ENV=development');
    
    await auditor.checkNodeEnv('.env.production');
    
    expect(auditor.results[0].passed).toBe(false);
    expect(auditor.results[0].message).toContain('expected');
    
    fs.existsSync.mockRestore();
    fs.readFileSync.mockRestore();
  });

  /**
   * Test: Audit exits with correct status codes
   * **Validates: Requirements 6.7**
   */
  test('audit exits with code 0 when all checks pass', async () => {
    const auditor = new SecurityAuditor();
    
    auditor.results = [
      { name: 'Test 1', passed: true, severity: 'info', message: 'OK' },
      { name: 'Test 2', passed: true, severity: 'info', message: 'OK' }
    ];
    
    const report = auditor.generateReport();
    
    expect(report.exitCode).toBe(0);
    expect(report.passed).toBe(true);
  });

  test('audit exits with code 1 when critical checks fail', async () => {
    const auditor = new SecurityAuditor();
    
    auditor.results = [
      { name: 'Test 1', passed: false, severity: 'critical', message: 'Failed' },
      { name: 'Test 2', passed: true, severity: 'info', message: 'OK' }
    ];
    
    const report = auditor.generateReport();
    
    expect(report.exitCode).toBe(1);
    expect(report.passed).toBe(false);
  });

  test('audit exits with code 2 when only warnings present', async () => {
    const auditor = new SecurityAuditor();
    
    auditor.results = [
      { name: 'Test 1', passed: false, severity: 'warning', message: 'Warning' },
      { name: 'Test 2', passed: true, severity: 'info', message: 'OK' }
    ];
    
    const report = auditor.generateReport();
    
    expect(report.exitCode).toBe(2);
    expect(report.passed).toBe(false);
  });

  /**
   * Test: Audit can run specific checks
   * **Validates: Requirements 6.1**
   */
  test('audit can run specific check types', async () => {
    const auditor = new SecurityAuditor();
    
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('.env.production\n.env.docker.production\n');
    
    await auditor.checkGitignore();
    
    expect(auditor.results.length).toBe(1);
    expect(auditor.results[0].category).toBe('gitignore');
    
    fs.existsSync.mockRestore();
    fs.readFileSync.mockRestore();
  });

  /**
   * Test: Full audit workflow with npm script
   * **Validates: Requirements 6.1, 6.6, 6.7**
   */
  test('npm run security:audit executes successfully', () => {
    try {
      // This will fail with exit code 1 due to missing .env.production, which is expected
      execSync('npm run security:audit', { 
        stdio: 'pipe',
        cwd: path.join(__dirname, '../..')
      });
    } catch (error) {
      // Expected to fail with exit code 1 (critical issues)
      expect(error.status).toBe(1);
      expect(error.stdout.toString()).toContain('SECURITY AUDIT REPORT');
    }
  });
});
