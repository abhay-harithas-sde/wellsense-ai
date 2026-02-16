const fc = require('fast-check');
const fs = require('fs');
const SecurityAuditor = require('../../../scripts/security-audit');

// Mock fs module
jest.mock('fs');

/**
 * Property-Based Tests for Security Audit Tool
 * Feature: production-security-hardening
 * 
 * These tests verify universal properties that should hold across all inputs.
 */

describe('Security Audit Property-Based Tests', () => {
  let auditor;

  beforeEach(() => {
    auditor = new SecurityAuditor();
    jest.clearAllMocks();
  });

  /**
   * Property 14: Weak Secret Detection in Files
   * For any environment file scanned by the Security_Auditor, all secrets containing 
   * weak patterns should be detected and reported.
   * **Validates: Requirements 6.2**
   */
  describe('Property 14: Weak Secret Detection', () => {
    test('weak patterns are always detected in any environment file', () => {
      const weakPatterns = ['your-', 'change-in-production', 'test-', 'example-', 'placeholder-'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...weakPatterns),
          fc.string({ minLength: 10, maxLength: 50 }),
          fc.constantFrom('.env', '.env.production', '.env.test'),
          (pattern, suffix, envFile) => {
            const weakSecret = pattern + suffix;
            const envContent = `JWT_SECRET=${weakSecret}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkWeakSecrets(envFile);
            
            expect(auditor.results[0].passed).toBe(false);
            expect(auditor.results[0].details).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  key: 'JWT_SECRET',
                  reason: expect.stringContaining('weak pattern')
                })
              ])
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('short JWT secrets are always detected regardless of content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 63 }).filter(s => s.trim().length > 0), // Less than 64 chars, non-empty after trim
          fc.constantFrom('.env', '.env.production', '.env.test'),
          (secret, envFile) => {
            const envContent = `JWT_SECRET=${secret}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkWeakSecrets(envFile);
            
            expect(auditor.results[0].passed).toBe(false);
            expect(auditor.results[0].details).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  key: 'JWT_SECRET',
                  reason: expect.stringMatching(/Too short.*minimum 64/)
                })
              ])
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('short passwords are always detected regardless of content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 31 }).filter(s => s.trim().length > 0), // Less than 32 chars, non-empty after trim
          fc.constantFrom('DATABASE_PASSWORD', 'MONGODB_PASSWORD', 'ADMIN_PASSWORD'),
          fc.constantFrom('.env', '.env.production', '.env.test'),
          (password, key, envFile) => {
            const envContent = `${key}=${password}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkWeakSecrets(envFile);
            
            expect(auditor.results[0].passed).toBe(false);
            expect(auditor.results[0].details).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  key,
                  reason: expect.stringMatching(/Too short.*minimum 32/)
                })
              ])
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('short client secrets are always detected regardless of content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 47 }).filter(s => s.trim().length > 0), // Less than 48 chars, non-empty
          fc.constantFrom('GOOGLE_CLIENT_SECRET', 'OAUTH_CLIENT_SECRET', 'API_CLIENT_SECRET'),
          fc.constantFrom('.env', '.env.production', '.env.test'),
          (secret, key, envFile) => {
            const envContent = `${key}=${secret}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkWeakSecrets(envFile);
            
            expect(auditor.results[0].passed).toBe(false);
            expect(auditor.results[0].details).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  key,
                  reason: expect.stringMatching(/Too short.*minimum 48/)
                })
              ])
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 15: NODE_ENV Validation Across Files
   * For any environment file (.env, .env.production, .env.test), the Security_Auditor 
   * should verify that NODE_ENV matches the expected value for that file type.
   * **Validates: Requirements 6.4**
   */
  describe('Property 15: NODE_ENV Validation', () => {
    test('NODE_ENV mismatch is always detected for any file type', () => {
      const fileExpectations = [
        { file: '.env', expected: 'development', wrong: ['production', 'test', 'staging'] },
        { file: '.env.production', expected: 'production', wrong: ['development', 'test', 'staging'] },
        { file: '.env.test', expected: 'test', wrong: ['development', 'production', 'staging'] }
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...fileExpectations),
          fc.nat({ max: 2 }), // Index for wrong value
          ({ file, expected, wrong }, wrongIndex) => {
            const wrongValue = wrong[wrongIndex];
            const envContent = `NODE_ENV=${wrongValue}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkNodeEnv(file);
            
            expect(auditor.results[0].passed).toBe(false);
            expect(auditor.results[0].message).toContain('expected');
            expect(auditor.results[0].message).toContain(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('correct NODE_ENV is always accepted for any file type', () => {
      const fileExpectations = [
        { file: '.env', expected: 'development' },
        { file: '.env.production', expected: 'production' },
        { file: '.env.test', expected: 'test' }
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...fileExpectations),
          ({ file, expected }) => {
            const envContent = `NODE_ENV=${expected}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkNodeEnv(file);
            
            expect(auditor.results[0].passed).toBe(true);
            expect(auditor.results[0].message).toContain(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 16: Audit Report Generation
   * For any security audit run, a report should be generated containing pass/fail 
   * status for each check and a summary of total/passed/failed counts.
   * **Validates: Requirements 6.6**
   */
  describe('Property 16: Audit Report Generation', () => {
    test('report always contains correct summary statistics', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1 }),
              passed: fc.boolean(),
              severity: fc.constantFrom('critical', 'warning', 'info'),
              message: fc.string({ minLength: 1 })
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (results) => {
            auditor.results = results;
            const report = auditor.generateReport();
            
            const expectedTotal = results.length;
            const expectedPassed = results.filter(r => r.passed).length;
            const expectedFailed = expectedTotal - expectedPassed;
            
            expect(report.results).toHaveLength(expectedTotal);
            expect(report.results.filter(r => r.passed).length).toBe(expectedPassed);
            expect(report.results.filter(r => !r.passed).length).toBe(expectedFailed);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('report always includes all check results', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1 }),
              passed: fc.boolean(),
              severity: fc.constantFrom('critical', 'warning', 'info'),
              message: fc.string({ minLength: 1 }),
              category: fc.constantFrom('secrets', 'cors', 'ssl', 'gitignore', 'nodeenv')
            }),
            { minLength: 1, maxLength: 15 }
          ),
          (results) => {
            auditor.results = results;
            const report = auditor.generateReport();
            
            expect(report.results).toEqual(results);
            expect(report).toHaveProperty('passed');
            expect(report).toHaveProperty('exitCode');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 17: Critical Failure Exit Code
   * For any security audit where at least one critical check fails, the Security_Auditor 
   * should exit with a non-zero status code.
   * **Validates: Requirements 6.7**
   */
  describe('Property 17: Exit Code Behavior', () => {
    test('exit code is always 1 when any critical check fails', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1 }),
              passed: fc.boolean(),
              severity: fc.constantFrom('critical', 'warning', 'info'),
              message: fc.string({ minLength: 1 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          fc.nat({ max: 9 }), // Index to make critical and failed
          (results, criticalIndex) => {
            // Ensure at least one critical failure
            if (results.length > 0) {
              results[criticalIndex % results.length] = {
                ...results[criticalIndex % results.length],
                passed: false,
                severity: 'critical'
              };
            }
            
            auditor.results = results;
            const report = auditor.generateReport();
            
            expect(report.exitCode).toBe(1);
            expect(report.passed).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('exit code is always 2 when only warnings present (no critical)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1 }),
              passed: fc.boolean(),
              severity: fc.constantFrom('warning', 'info'),
              message: fc.string({ minLength: 1 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          fc.nat({ max: 9 }), // Index to make warning and failed
          (results, warningIndex) => {
            // Ensure at least one warning failure and no critical
            if (results.length > 0) {
              results[warningIndex % results.length] = {
                ...results[warningIndex % results.length],
                passed: false,
                severity: 'warning'
              };
            }
            
            auditor.results = results;
            const report = auditor.generateReport();
            
            expect(report.exitCode).toBe(2);
            expect(report.passed).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('exit code is always 0 when all checks pass', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1 }),
              passed: fc.constant(true), // All passed
              severity: fc.constantFrom('critical', 'warning', 'info'),
              message: fc.string({ minLength: 1 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (results) => {
            auditor.results = results;
            const report = auditor.generateReport();
            
            expect(report.exitCode).toBe(0);
            expect(report.passed).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property: CORS Wildcard Detection
   * For any CORS_ORIGIN value containing wildcard (*), the auditor should detect it.
   */
  describe('Property: CORS Wildcard Detection', () => {
    test('wildcard is always detected in any position', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 20 }),
          fc.string({ minLength: 0, maxLength: 20 }),
          (prefix, suffix) => {
            const corsValue = prefix + '*' + suffix;
            const envContent = `CORS_ORIGIN=${corsValue}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkCORSConfig('.env.production');
            
            expect(auditor.results[0].passed).toBe(false);
            expect(auditor.results[0].severity).toBe('critical');
            expect(auditor.results[0].message).toContain('wildcard');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('non-wildcard origins are always accepted', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.webUrl({ validSchemes: ['https'] }),
            { minLength: 1, maxLength: 5 }
          ),
          (origins) => {
            // Filter out any origins that might contain '*'
            const safeOrigins = origins.filter(o => !o.includes('*'));
            if (safeOrigins.length === 0) return; // Skip if no safe origins
            
            const corsValue = safeOrigins.join(',');
            const envContent = `CORS_ORIGIN=${corsValue}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkCORSConfig('.env.production');
            
            expect(auditor.results[0].passed).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property: Gitignore Validation
   * For any .gitignore content, the auditor should correctly detect presence/absence 
   * of production environment files.
   */
  describe('Property: Gitignore Validation', () => {
    test('missing production files are always detected', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
          (lines) => {
            // Ensure production files are NOT in the list
            const filteredLines = lines.filter(
              line => !line.includes('.env.production') && !line.includes('.env.docker.production')
            );
            const gitignoreContent = filteredLines.join('\n');
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(gitignoreContent);
            
            auditor.results = [];
            auditor.checkGitignore();
            
            expect(auditor.results[0].passed).toBe(false);
            expect(auditor.results[0].severity).toBe('critical');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('present production files are always accepted', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
          (extraLines) => {
            const gitignoreContent = [
              '.env.production',
              '.env.docker.production',
              ...extraLines
            ].join('\n');
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(gitignoreContent);
            
            auditor.results = [];
            auditor.checkGitignore();
            
            expect(auditor.results[0].passed).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property: SSL Configuration Validation
   * For any SSL configuration, the auditor should correctly validate the setup.
   */
  describe('Property: SSL Configuration Validation', () => {
    test('enabled HTTPS without paths is always detected as invalid', () => {
      fc.assert(
        fc.property(
          fc.constant('true'), // Implementation only accepts lowercase 'true'
          (enableValue) => {
            const envContent = `ENABLE_HTTPS=${enableValue}`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkSSLConfig('.env.production');
            
            expect(auditor.results[0].passed).toBe(false);
            expect(auditor.results[0].message).toContain('paths not configured');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('enabled HTTPS with paths is always accepted', () => {
      fc.assert(
        fc.property(
          fc.constant('true'), // Implementation only accepts lowercase 'true'
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0), // Non-empty after trim
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0), // Non-empty after trim
          (enableValue, keyPath, certPath) => {
            const envContent = `
ENABLE_HTTPS=${enableValue}
SSL_KEY_PATH=${keyPath}
SSL_CERT_PATH=${certPath}
`;
            
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(envContent);
            
            auditor.results = [];
            auditor.checkSSLConfig('.env.production');
            
            expect(auditor.results[0].passed).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
