const fs = require('fs');
const path = require('path');
const SecurityAuditor = require('../../../scripts/security-audit');

// Mock fs module
jest.mock('fs');

describe('SecurityAuditor', () => {
  let auditor;

  beforeEach(() => {
    auditor = new SecurityAuditor();
    jest.clearAllMocks();
  });

  describe('checkWeakSecrets', () => {
    it('should detect weak patterns in secrets', async () => {
      const envContent = `
NODE_ENV=development
JWT_SECRET=your-jwt-secret-change-in-production
DATABASE_URL=postgresql://user:password123@localhost:5432/db
`;
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkWeakSecrets('.env');

      expect(auditor.results).toHaveLength(1);
      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'JWT_SECRET',
            reason: 'Contains weak pattern'
          })
        ])
      );
    });

    it('should detect secrets that are too short', async () => {
      const envContent = `
JWT_SECRET=short
GOOGLE_CLIENT_SECRET=tooshort
DATABASE_PASSWORD=weak
`;
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkWeakSecrets('.env');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].details.length).toBeGreaterThan(0);
    });

    it('should pass when no weak secrets are found', async () => {
      const envContent = `
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
DATABASE_URL=postgresql://user:StrongP@ssw0rd123!WithSpecialChars@localhost:5432/db
`;
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkWeakSecrets('.env');

      expect(auditor.results[0].passed).toBe(true);
    });

    it('should handle missing file for production environment', async () => {
      fs.existsSync.mockReturnValue(false);

      await auditor.checkWeakSecrets('.env.production');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].severity).toBe('critical');
      expect(auditor.results[0].message).toContain('File not found');
    });

    it('should handle missing file for non-production environment', async () => {
      fs.existsSync.mockReturnValue(false);

      await auditor.checkWeakSecrets('.env.test');

      expect(auditor.results[0].passed).toBe(true);
      expect(auditor.results[0].severity).toBe('info');
    });
  });

  describe('checkCORSConfig', () => {
    it('should detect wildcard CORS in production', async () => {
      const envContent = 'CORS_ORIGIN=*';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkCORSConfig('.env.production');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].severity).toBe('critical');
      expect(auditor.results[0].message).toContain('wildcard');
    });

    it('should pass with specific origins', async () => {
      const envContent = 'CORS_ORIGIN=https://example.com,https://app.example.com';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkCORSConfig('.env.production');

      expect(auditor.results[0].passed).toBe(true);
    });

    it('should handle missing CORS_ORIGIN', async () => {
      const envContent = 'NODE_ENV=production';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkCORSConfig('.env.production');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].message).toContain('not configured');
    });

    it('should handle missing file', async () => {
      fs.existsSync.mockReturnValue(false);

      await auditor.checkCORSConfig('.env.production');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].message).toContain('File not found');
    });
  });

  describe('checkNodeEnv', () => {
    it('should verify NODE_ENV matches expected value for production', async () => {
      const envContent = 'NODE_ENV=production';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkNodeEnv('.env.production');

      expect(auditor.results[0].passed).toBe(true);
      expect(auditor.results[0].message).toContain('production');
    });

    it('should verify NODE_ENV matches expected value for development', async () => {
      const envContent = 'NODE_ENV=development';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkNodeEnv('.env');

      expect(auditor.results[0].passed).toBe(true);
    });

    it('should verify NODE_ENV matches expected value for test', async () => {
      const envContent = 'NODE_ENV=test';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkNodeEnv('.env.test');

      expect(auditor.results[0].passed).toBe(true);
    });

    it('should fail when NODE_ENV does not match expected value', async () => {
      const envContent = 'NODE_ENV=development';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkNodeEnv('.env.production');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].message).toContain('expected');
    });

    it('should handle missing NODE_ENV', async () => {
      const envContent = 'PORT=3000';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkNodeEnv('.env');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].message).toContain('not set');
    });
  });

  describe('checkGitignore', () => {
    it('should pass when production files are in .gitignore', async () => {
      const gitignoreContent = `
node_modules/
.env.production
.env.docker.production
dist/
`;
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(gitignoreContent);

      await auditor.checkGitignore();

      expect(auditor.results[0].passed).toBe(true);
    });

    it('should fail when .env.production is missing from .gitignore', async () => {
      const gitignoreContent = `
node_modules/
.env.docker.production
dist/
`;
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(gitignoreContent);

      await auditor.checkGitignore();

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].severity).toBe('critical');
    });

    it('should fail when .env.docker.production is missing from .gitignore', async () => {
      const gitignoreContent = `
node_modules/
.env.production
dist/
`;
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(gitignoreContent);

      await auditor.checkGitignore();

      expect(auditor.results[0].passed).toBe(false);
    });

    it('should handle missing .gitignore file', async () => {
      fs.existsSync.mockReturnValue(false);

      await auditor.checkGitignore();

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].severity).toBe('critical');
      expect(auditor.results[0].message).toContain('not found');
    });
  });

  describe('checkSSLConfig', () => {
    it('should pass when SSL is properly configured', async () => {
      const envContent = `
ENABLE_HTTPS=true
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
`;
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkSSLConfig('.env.production');

      expect(auditor.results[0].passed).toBe(true);
    });

    it('should warn when HTTPS is not enabled', async () => {
      const envContent = 'ENABLE_HTTPS=false';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkSSLConfig('.env.production');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].severity).toBe('warning');
      expect(auditor.results[0].message).toContain('not enabled');
    });

    it('should warn when SSL paths are missing', async () => {
      const envContent = 'ENABLE_HTTPS=true';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(envContent);

      await auditor.checkSSLConfig('.env.production');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].message).toContain('paths not configured');
    });

    it('should handle missing file', async () => {
      fs.existsSync.mockReturnValue(false);

      await auditor.checkSSLConfig('.env.production');

      expect(auditor.results[0].passed).toBe(false);
      expect(auditor.results[0].message).toContain('File not found');
    });
  });

  describe('generateReport', () => {
    it('should return exit code 0 when all checks pass', () => {
      auditor.results = [
        { name: 'Test 1', passed: true, severity: 'info', message: 'OK' },
        { name: 'Test 2', passed: true, severity: 'info', message: 'OK' }
      ];

      const report = auditor.generateReport();

      expect(report.passed).toBe(true);
      expect(report.exitCode).toBe(0);
    });

    it('should return exit code 1 when critical checks fail', () => {
      auditor.results = [
        { name: 'Test 1', passed: false, severity: 'critical', message: 'Failed' },
        { name: 'Test 2', passed: true, severity: 'info', message: 'OK' }
      ];

      const report = auditor.generateReport();

      expect(report.passed).toBe(false);
      expect(report.exitCode).toBe(1);
    });

    it('should return exit code 2 when only warnings are present', () => {
      auditor.results = [
        { name: 'Test 1', passed: false, severity: 'warning', message: 'Warning' },
        { name: 'Test 2', passed: true, severity: 'info', message: 'OK' }
      ];

      const report = auditor.generateReport();

      expect(report.passed).toBe(false);
      expect(report.exitCode).toBe(2);
    });

    it('should include summary statistics', () => {
      auditor.results = [
        { name: 'Test 1', passed: true, severity: 'info', message: 'OK' },
        { name: 'Test 2', passed: false, severity: 'critical', message: 'Failed' },
        { name: 'Test 3', passed: false, severity: 'warning', message: 'Warning' }
      ];

      const report = auditor.generateReport();

      expect(report.results).toHaveLength(3);
    });
  });

  describe('runAllChecks', () => {
    it('should run all security checks', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('NODE_ENV=development');

      const report = await auditor.runAllChecks();

      expect(auditor.results.length).toBeGreaterThan(0);
      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('exitCode');
      expect(report).toHaveProperty('results');
    });
  });
});
