const fs = require('fs');
const path = require('path');

/**
 * SSL Manager - Manages HTTPS/TLS certificate configuration
 * 
 * Handles loading, validating, and configuring SSL certificates for HTTPS servers.
 * Supports both production CA-signed certificates and self-signed certificates for testing.
 */
class SSLManager {
  /**
   * Load SSL certificates from file paths
   * @param {string} keyPath - Path to private key file
   * @param {string} certPath - Path to certificate file
   * @returns {Object} - {key: Buffer, cert: Buffer}
   * @throws {Error} - If certificate files cannot be read
   */
  loadCertificates(keyPath, certPath) {
    try {
      const key = fs.readFileSync(keyPath);
      const cert = fs.readFileSync(certPath);
      
      return { key, cert };
    } catch (error) {
      throw new Error(
        `Failed to load SSL certificates: ${error.message}. ` +
        `Verify that SSL_KEY_PATH and SSL_CERT_PATH point to valid certificate files.`
      );
    }
  }

  /**
   * Validate SSL certificate files exist and are readable
   * @param {string} keyPath - Path to private key file
   * @param {string} certPath - Path to certificate file
   * @returns {Object} - {valid: boolean, errors: string[]}
   */
  validateCertificates(keyPath, certPath) {
    const errors = [];

    if (!keyPath) {
      errors.push('SSL_KEY_PATH is not configured');
    } else if (!fs.existsSync(keyPath)) {
      errors.push(`SSL key file not found: ${keyPath}`);
    } else {
      try {
        fs.accessSync(keyPath, fs.constants.R_OK);
      } catch (error) {
        errors.push(`SSL key file is not readable: ${keyPath}`);
      }
    }

    if (!certPath) {
      errors.push('SSL_CERT_PATH is not configured');
    } else if (!fs.existsSync(certPath)) {
      errors.push(`SSL certificate file not found: ${certPath}`);
    } else {
      try {
        fs.accessSync(certPath, fs.constants.R_OK);
      } catch (error) {
        errors.push(`SSL certificate file is not readable: ${certPath}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if SSL is configured in environment
   * @param {Object} env - Environment variables
   * @returns {boolean} - True if SSL is configured and enabled
   */
  isSSLConfigured(env) {
    // Check if HTTPS is explicitly enabled
    const httpsEnabled = env.ENABLE_HTTPS === 'true' || env.ENABLE_HTTPS === true;
    
    // Check if certificate paths are provided
    const hasCertPaths = !!(env.SSL_KEY_PATH && env.SSL_CERT_PATH);
    
    return httpsEnabled && hasCertPaths;
  }

  /**
   * Get HTTPS server options
   * @param {Object} env - Environment variables
   * @returns {Object|null} - HTTPS options or null if SSL not configured
   */
  getHTTPSOptions(env) {
    if (!this.isSSLConfigured(env)) {
      return null;
    }

    const keyPath = env.SSL_KEY_PATH;
    const certPath = env.SSL_CERT_PATH;

    // Validate certificates before loading
    const validation = this.validateCertificates(keyPath, certPath);
    if (!validation.valid) {
      throw new Error(
        `SSL configuration is invalid:\n${validation.errors.map(e => `  - ${e}`).join('\n')}`
      );
    }

    // Load certificates
    const { key, cert } = this.loadCertificates(keyPath, certPath);

    return {
      key,
      cert
    };
  }
}

module.exports = SSLManager;
