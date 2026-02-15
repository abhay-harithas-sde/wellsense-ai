const SSLManager = require('../../../lib/security/ssl-manager');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('SSLManager', () => {
  let sslManager;
  let tempDir;
  let validKeyPath;
  let validCertPath;

  beforeEach(() => {
    sslManager = new SSLManager();
    
    // Create temporary directory for test certificates
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ssl-test-'));
    validKeyPath = path.join(tempDir, 'test-key.pem');
    validCertPath = path.join(tempDir, 'test-cert.pem');
    
    // Create dummy certificate files
    fs.writeFileSync(validKeyPath, '-----BEGIN PRIVATE KEY-----\ntest-key-content\n-----END PRIVATE KEY-----');
    fs.writeFileSync(validCertPath, '-----BEGIN CERTIFICATE-----\ntest-cert-content\n-----END CERTIFICATE-----');
  });

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('loadCertificates', () => {
    test('should load valid certificate files', () => {
      const result = sslManager.loadCertificates(validKeyPath, validCertPath);
      
      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('cert');
      expect(Buffer.isBuffer(result.key)).toBe(true);
      expect(Buffer.isBuffer(result.cert)).toBe(true);
      expect(result.key.toString()).toContain('BEGIN PRIVATE KEY');
      expect(result.cert.toString()).toContain('BEGIN CERTIFICATE');
    });

    test('should throw error for missing key file', () => {
      const missingKeyPath = path.join(tempDir, 'nonexistent-key.pem');
      
      expect(() => {
        sslManager.loadCertificates(missingKeyPath, validCertPath);
      }).toThrow(/Failed to load SSL certificates/);
    });

    test('should throw error for missing certificate file', () => {
      const missingCertPath = path.join(tempDir, 'nonexistent-cert.pem');
      
      expect(() => {
        sslManager.loadCertificates(validKeyPath, missingCertPath);
      }).toThrow(/Failed to load SSL certificates/);
    });

    test('should throw error with helpful message', () => {
      const missingPath = path.join(tempDir, 'missing.pem');
      
      expect(() => {
        sslManager.loadCertificates(missingPath, validCertPath);
      }).toThrow(/Verify that SSL_KEY_PATH and SSL_CERT_PATH/);
    });
  });

  describe('validateCertificates', () => {
    test('should validate existing certificate files', () => {
      const result = sslManager.validateCertificates(validKeyPath, validCertPath);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should detect missing key file', () => {
      const missingKeyPath = path.join(tempDir, 'nonexistent-key.pem');
      const result = sslManager.validateCertificates(missingKeyPath, validCertPath);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`SSL key file not found: ${missingKeyPath}`);
    });

    test('should detect missing certificate file', () => {
      const missingCertPath = path.join(tempDir, 'nonexistent-cert.pem');
      const result = sslManager.validateCertificates(validKeyPath, missingCertPath);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`SSL certificate file not found: ${missingCertPath}`);
    });

    test('should detect missing key path configuration', () => {
      const result = sslManager.validateCertificates(null, validCertPath);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SSL_KEY_PATH is not configured');
    });

    test('should detect missing certificate path configuration', () => {
      const result = sslManager.validateCertificates(validKeyPath, null);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('SSL_CERT_PATH is not configured');
    });

    test('should detect both missing files', () => {
      const missingKeyPath = path.join(tempDir, 'nonexistent-key.pem');
      const missingCertPath = path.join(tempDir, 'nonexistent-cert.pem');
      const result = sslManager.validateCertificates(missingKeyPath, missingCertPath);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('SSL key file not found');
      expect(result.errors[1]).toContain('SSL certificate file not found');
    });

    test('should detect unreadable key file', () => {
      // Make file unreadable (Unix-like systems only)
      if (process.platform !== 'win32') {
        fs.chmodSync(validKeyPath, 0o000);
        const result = sslManager.validateCertificates(validKeyPath, validCertPath);
        
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('not readable'))).toBe(true);
        
        // Restore permissions for cleanup
        fs.chmodSync(validKeyPath, 0o644);
      }
    });
  });

  describe('isSSLConfigured', () => {
    test('should return true when HTTPS is enabled and paths are provided', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: validKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      expect(sslManager.isSSLConfigured(env)).toBe(true);
    });

    test('should return true when ENABLE_HTTPS is boolean true', () => {
      const env = {
        ENABLE_HTTPS: true,
        SSL_KEY_PATH: validKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      expect(sslManager.isSSLConfigured(env)).toBe(true);
    });

    test('should return false when HTTPS is disabled', () => {
      const env = {
        ENABLE_HTTPS: 'false',
        SSL_KEY_PATH: validKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      expect(sslManager.isSSLConfigured(env)).toBe(false);
    });

    test('should return false when ENABLE_HTTPS is not set', () => {
      const env = {
        SSL_KEY_PATH: validKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      expect(sslManager.isSSLConfigured(env)).toBe(false);
    });

    test('should return false when SSL_KEY_PATH is missing', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_CERT_PATH: validCertPath
      };
      
      expect(sslManager.isSSLConfigured(env)).toBe(false);
    });

    test('should return false when SSL_CERT_PATH is missing', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: validKeyPath
      };
      
      expect(sslManager.isSSLConfigured(env)).toBe(false);
    });

    test('should return false when both paths are missing', () => {
      const env = {
        ENABLE_HTTPS: 'true'
      };
      
      expect(sslManager.isSSLConfigured(env)).toBe(false);
    });

    test('should return false when HTTPS disabled and paths missing', () => {
      const env = {
        ENABLE_HTTPS: 'false'
      };
      
      expect(sslManager.isSSLConfigured(env)).toBe(false);
    });
  });

  describe('getHTTPSOptions', () => {
    test('should return HTTPS options with valid configuration', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: validKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      const options = sslManager.getHTTPSOptions(env);
      
      expect(options).not.toBeNull();
      expect(options).toHaveProperty('key');
      expect(options).toHaveProperty('cert');
      expect(Buffer.isBuffer(options.key)).toBe(true);
      expect(Buffer.isBuffer(options.cert)).toBe(true);
    });

    test('should return null when SSL is not configured', () => {
      const env = {
        ENABLE_HTTPS: 'false',
        SSL_KEY_PATH: validKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      const options = sslManager.getHTTPSOptions(env);
      
      expect(options).toBeNull();
    });

    test('should return null when ENABLE_HTTPS is not set', () => {
      const env = {
        SSL_KEY_PATH: validKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      const options = sslManager.getHTTPSOptions(env);
      
      expect(options).toBeNull();
    });

    test('should throw error for missing certificate files', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: path.join(tempDir, 'missing-key.pem'),
        SSL_CERT_PATH: path.join(tempDir, 'missing-cert.pem')
      };
      
      expect(() => {
        sslManager.getHTTPSOptions(env);
      }).toThrow(/SSL configuration is invalid/);
    });

    test('should throw error with detailed validation errors', () => {
      const missingKeyPath = path.join(tempDir, 'missing-key.pem');
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: missingKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      expect(() => {
        sslManager.getHTTPSOptions(env);
      }).toThrow(/SSL configuration is invalid/);
      
      expect(() => {
        sslManager.getHTTPSOptions(env);
      }).toThrow(/missing-key\.pem/);
    });

    test('should load actual certificate content', () => {
      const env = {
        ENABLE_HTTPS: 'true',
        SSL_KEY_PATH: validKeyPath,
        SSL_CERT_PATH: validCertPath
      };
      
      const options = sslManager.getHTTPSOptions(env);
      
      expect(options.key.toString()).toContain('BEGIN PRIVATE KEY');
      expect(options.cert.toString()).toContain('BEGIN CERTIFICATE');
    });
  });
});
