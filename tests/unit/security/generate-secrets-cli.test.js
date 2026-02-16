const SecretManager = require('../../../lib/security/secret-manager');
const { parseArgs, generateJWT, generateDatabase, generateOAuth } = require('../../../scripts/generate-secrets');

describe('Secret Generation CLI', () => {
  let secretManager;
  let consoleLogSpy;

  beforeEach(() => {
    secretManager = new SecretManager();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('parseArgs', () => {
    it('should parse --type argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js', '--type', 'jwt'];
      
      const options = parseArgs();
      expect(options.type).toBe('jwt');
      
      process.argv = originalArgv;
    });

    it('should parse --length argument', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js', '--length', '128'];
      
      const options = parseArgs();
      expect(options.length).toBe(128);
      
      process.argv = originalArgv;
    });

    it('should parse both --type and --length arguments', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js', '--type', 'oauth', '--length', '64'];
      
      const options = parseArgs();
      expect(options.type).toBe('oauth');
      expect(options.length).toBe(64);
      
      process.argv = originalArgv;
    });

    it('should return null for missing arguments', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js'];
      
      const options = parseArgs();
      expect(options.type).toBeNull();
      expect(options.length).toBeNull();
      
      process.argv = originalArgv;
    });
  });

  describe('generateJWT', () => {
    it('should generate valid JWT secret with default length', () => {
      generateJWT();
      
      // Check that console.log was called
      expect(consoleLogSpy).toHaveBeenCalled();
      
      // Extract the secret from console.log calls
      const logCalls = consoleLogSpy.mock.calls;
      const secretLine = logCalls.find(call => call[0] && call[0].startsWith('Secret: '));
      expect(secretLine).toBeDefined();
      
      const secret = secretLine[0].replace('Secret: ', '');
      
      // Validate the secret
      expect(secret.length).toBeGreaterThanOrEqual(64);
      expect(/^[0-9a-f]+$/.test(secret)).toBe(true); // Hex-encoded
      
      const entropy = secretManager.calculateEntropy(secret);
      // Entropy should be high (typically 240-260 bits for 64 hex chars)
      expect(entropy).toBeGreaterThan(200);
    });

    it('should generate valid JWT secret with custom length', () => {
      generateJWT(128);
      
      const logCalls = consoleLogSpy.mock.calls;
      const secretLine = logCalls.find(call => call[0] && call[0].startsWith('Secret: '));
      const secret = secretLine[0].replace('Secret: ', '');
      
      expect(secret.length).toBe(128);
      expect(/^[0-9a-f]+$/.test(secret)).toBe(true);
    });

    it('should display entropy calculation', () => {
      generateJWT();
      
      const logCalls = consoleLogSpy.mock.calls;
      const entropyLine = logCalls.find(call => call[0] && call[0].startsWith('Entropy: '));
      expect(entropyLine).toBeDefined();
      expect(entropyLine[0]).toMatch(/Entropy: \d+\.\d+ bits/);
    });

    it('should include .env.production instructions', () => {
      generateJWT();
      
      const logCalls = consoleLogSpy.mock.calls;
      const envLine = logCalls.find(call => call[0] && call[0].startsWith('JWT_SECRET='));
      expect(envLine).toBeDefined();
    });
  });

  describe('generateDatabase', () => {
    it('should generate valid database password', () => {
      generateDatabase();
      
      const logCalls = consoleLogSpy.mock.calls;
      const secretLine = logCalls.find(call => call[0] && call[0].startsWith('Secret: '));
      const secret = secretLine[0].replace('Secret: ', '');
      
      // Validate password complexity
      expect(secret.length).toBeGreaterThanOrEqual(32);
      expect(/[A-Z]/.test(secret)).toBe(true); // Has uppercase
      expect(/[a-z]/.test(secret)).toBe(true); // Has lowercase
      expect(/[0-9]/.test(secret)).toBe(true); // Has numbers
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(secret)).toBe(true); // Has special chars
    });

    it('should display entropy calculation', () => {
      generateDatabase();
      
      const logCalls = consoleLogSpy.mock.calls;
      const entropyLine = logCalls.find(call => call[0] && call[0].startsWith('Entropy: '));
      expect(entropyLine).toBeDefined();
    });

    it('should include .env.production instructions', () => {
      generateDatabase();
      
      const logCalls = consoleLogSpy.mock.calls;
      const envLine = logCalls.find(call => call[0] && call[0].startsWith('DATABASE_PASSWORD='));
      expect(envLine).toBeDefined();
    });
  });

  describe('generateOAuth', () => {
    it('should generate valid OAuth secret with default length', () => {
      generateOAuth();
      
      const logCalls = consoleLogSpy.mock.calls;
      const secretLine = logCalls.find(call => call[0] && call[0].startsWith('Secret: '));
      const secret = secretLine[0].replace('Secret: ', '');
      
      expect(secret.length).toBeGreaterThanOrEqual(48);
      // Base64 characters: A-Z, a-z, 0-9, +, /, =
      expect(/^[A-Za-z0-9+/=]+$/.test(secret)).toBe(true);
      
      const entropy = secretManager.calculateEntropy(secret);
      // Entropy should be high (typically 220-260 bits for 48 base64 chars)
      expect(entropy).toBeGreaterThan(200);
    });

    it('should generate valid OAuth secret with custom length', () => {
      generateOAuth(64);
      
      const logCalls = consoleLogSpy.mock.calls;
      const secretLine = logCalls.find(call => call[0] && call[0].startsWith('Secret: '));
      const secret = secretLine[0].replace('Secret: ', '');
      
      expect(secret.length).toBe(64);
      expect(/^[A-Za-z0-9+/=]+$/.test(secret)).toBe(true);
    });

    it('should display entropy calculation', () => {
      generateOAuth();
      
      const logCalls = consoleLogSpy.mock.calls;
      const entropyLine = logCalls.find(call => call[0] && call[0].startsWith('Entropy: '));
      expect(entropyLine).toBeDefined();
    });

    it('should include .env.production instructions', () => {
      generateOAuth();
      
      const logCalls = consoleLogSpy.mock.calls;
      const envLine = logCalls.find(call => call[0] && call[0].startsWith('GOOGLE_CLIENT_SECRET='));
      expect(envLine).toBeDefined();
    });
  });

  describe('Custom length parameter', () => {
    it('should respect custom length for JWT secrets', () => {
      generateJWT(96);
      
      const logCalls = consoleLogSpy.mock.calls;
      const secretLine = logCalls.find(call => call[0] && call[0].startsWith('Secret: '));
      const secret = secretLine[0].replace('Secret: ', '');
      
      expect(secret.length).toBe(96);
    });

    it('should respect custom length for OAuth secrets', () => {
      generateOAuth(72);
      
      const logCalls = consoleLogSpy.mock.calls;
      const secretLine = logCalls.find(call => call[0] && call[0].startsWith('Secret: '));
      const secret = secretLine[0].replace('Secret: ', '');
      
      expect(secret.length).toBe(72);
    });

    it('should throw error for JWT secret below minimum length', () => {
      expect(() => {
        const sm = new SecretManager();
        sm.generateJWTSecret(32);
      }).toThrow('JWT secret must be at least 64 characters');
    });

    it('should throw error for OAuth secret below minimum length', () => {
      expect(() => {
        const sm = new SecretManager();
        sm.generateOAuthSecret(32);
      }).toThrow('OAuth secret must be at least 48 characters');
    });
  });

  describe('Output format', () => {
    it('should display secret in copy-paste format', () => {
      generateJWT();
      
      const logCalls = consoleLogSpy.mock.calls;
      const secretLine = logCalls.find(call => call[0] && call[0].startsWith('Secret: '));
      
      // Secret should be on its own line, easy to copy
      expect(secretLine).toBeDefined();
      expect(secretLine[0]).toMatch(/^Secret: [A-Za-z0-9+/=]+$/);
    });

    it('should include length information', () => {
      generateJWT();
      
      const logCalls = consoleLogSpy.mock.calls;
      const lengthLine = logCalls.find(call => call[0] && call[0].startsWith('Length: '));
      
      expect(lengthLine).toBeDefined();
      expect(lengthLine[0]).toMatch(/Length: \d+ characters/);
    });

    it('should include entropy information', () => {
      generateJWT();
      
      const logCalls = consoleLogSpy.mock.calls;
      const entropyLine = logCalls.find(call => call[0] && call[0].startsWith('Entropy: '));
      
      expect(entropyLine).toBeDefined();
      expect(entropyLine[0]).toMatch(/Entropy: \d+\.\d+ bits/);
    });

    it('should include .env.production snippet', () => {
      generateJWT();
      
      const logCalls = consoleLogSpy.mock.calls;
      const envInstructions = logCalls.find(call => call[0] && call[0].includes('Add to .env.production'));
      
      expect(envInstructions).toBeDefined();
    });
  });
});
