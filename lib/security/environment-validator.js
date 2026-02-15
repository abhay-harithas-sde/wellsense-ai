const SecretManager = require('./secret-manager');

/**
 * Environment Validator - Validates environment configuration at startup
 * 
 * Provides validation for secrets, CORS, NODE_ENV, and SSL configuration
 * with environment-specific strictness levels.
 */
class EnvironmentValidator {
  constructor() {
    this.secretManager = new SecretManager();
  }

  /**
   * Validate all environment configuration
   * @param {Object} env - Environment variables
   * @param {string} nodeEnv - Current NODE_ENV
   * @returns {Object} - {valid: boolean, errors: string[], warnings: string[]}
   */
  validateAll(env, nodeEnv) {
    const errors = [];
    const warnings = [];

    // Validate NODE_ENV
    const nodeEnvResult = this.validateNodeEnv(nodeEnv);
    errors.push(...nodeEnvResult.errors);
    warnings.push(...nodeEnvResult.warnings);

    // Validate secrets
    const strict = nodeEnv === 'production';
    const secretsResult = this.validateSecrets(env, strict);
    errors.push(...secretsResult.errors);
    warnings.push(...secretsResult.warnings);

    // Validate CORS
    const corsResult = this.validateCORS(env, nodeEnv);
    errors.push(...corsResult.errors);
    warnings.push(...corsResult.warnings);

    // Validate SSL
    const sslResult = this.validateSSL(env, nodeEnv);
    errors.push(...sslResult.errors);
    warnings.push(...sslResult.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate all secrets in environment
   * @param {Object} env - Environment variables
   * @param {boolean} strict - Enforce strict validation (production mode)
   * @returns {Object} - Validation result
   */
  validateSecrets(env, strict) {
    const errors = [];
    const warnings = [];

    // Define secret requirements
    const secretConfigs = [
      {
        name: 'JWT_SECRET',
        value: env.JWT_SECRET,
        requirements: {
          minLength: 64,
          minEntropy: 230 // Practical threshold for 64-char hex (theoretical max is 256)
        }
      },
      {
        name: 'DATABASE_URL',
        value: env.DATABASE_URL,
        requirements: {
          minLength: 32,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        extractPassword: true
      },
      {
        name: 'MONGODB_URI',
        value: env.MONGODB_URI,
        requirements: {
          minLength: 32,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        extractPassword: true
      },
      {
        name: 'GOOGLE_CLIENT_SECRET',
        value: env.GOOGLE_CLIENT_SECRET,
        requirements: {
          minLength: 48,
          minEntropy: 230 // Practical threshold for base64 encoded secrets
        },
        optional: true
      }
    ];

    for (const config of secretConfigs) {
      // Skip optional secrets if not present
      if (config.optional && !config.value) {
        continue;
      }

      // Check if secret exists
      if (!config.value) {
        const message = `${config.name} is not set`;
        if (strict) {
          errors.push(message);
        } else {
          warnings.push(message);
        }
        continue;
      }

      // Extract password from connection strings if needed
      let secretToValidate = config.value;
      if (config.extractPassword) {
        // Match password in connection string: protocol://user:password@host
        // Find the last @ (before host) and work backwards to find the password
        const lastAtIndex = config.value.lastIndexOf('@');
        if (lastAtIndex > 0) {
          const beforeAt = config.value.substring(0, lastAtIndex);
          // Find the colon after the protocol (://)
          const protocolEnd = beforeAt.indexOf('://');
          if (protocolEnd > 0) {
            const afterProtocol = beforeAt.substring(protocolEnd + 3);
            const colonIndex = afterProtocol.indexOf(':');
            if (colonIndex > 0) {
              secretToValidate = afterProtocol.substring(colonIndex + 1);
            }
          }
        }
      }

      // Validate the secret
      const validation = this.secretManager.validateSecret(
        secretToValidate,
        config.requirements
      );

      if (!validation.valid) {
        const messages = validation.errors.map(
          err => `${config.name}: ${err}`
        );
        
        if (strict) {
          errors.push(...messages);
        } else {
          warnings.push(...messages);
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate CORS configuration
   * @param {Object} env - Environment variables
   * @param {string} nodeEnv - Current NODE_ENV
   * @returns {Object} - Validation result
   */
  validateCORS(env, nodeEnv) {
    const errors = [];
    const warnings = [];

    const corsOrigin = env.CORS_ORIGIN;

    // Check if CORS_ORIGIN is set
    if (!corsOrigin) {
      const message = 'CORS_ORIGIN is not set';
      if (nodeEnv === 'production') {
        errors.push(message);
      } else {
        warnings.push(message);
      }
      return { valid: errors.length === 0, errors, warnings };
    }

    // Check for wildcard in production
    if (nodeEnv === 'production') {
      if (corsOrigin === '*' || corsOrigin.includes('*')) {
        errors.push(
          'CORS_ORIGIN cannot be wildcard (*) in production mode. ' +
          'Specify explicit allowed origins (e.g., https://yourdomain.com)'
        );
      }

      // Check for localhost in production
      if (corsOrigin.includes('localhost') || corsOrigin.includes('127.0.0.1')) {
        warnings.push(
          'CORS_ORIGIN contains localhost/127.0.0.1 in production mode. ' +
          'This may be intentional for testing, but ensure it is removed for production deployment.'
        );
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate NODE_ENV setting
   * @param {string} nodeEnv - Current NODE_ENV
   * @returns {Object} - Validation result
   */
  validateNodeEnv(nodeEnv) {
    const errors = [];
    const warnings = [];

    const validEnvironments = ['development', 'production', 'test'];

    if (!nodeEnv) {
      warnings.push(
        'NODE_ENV is not set. Defaulting to development mode. ' +
        'Set NODE_ENV=production for production deployment.'
      );
    } else if (!validEnvironments.includes(nodeEnv)) {
      warnings.push(
        `NODE_ENV is set to "${nodeEnv}" which is not a standard value. ` +
        `Expected: ${validEnvironments.join(', ')}`
      );
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate SSL configuration
   * @param {Object} env - Environment variables
   * @param {string} nodeEnv - Current NODE_ENV
   * @returns {Object} - Validation result
   */
  validateSSL(env, nodeEnv) {
    const errors = [];
    const warnings = [];

    const enableHttps = env.ENABLE_HTTPS === 'true';
    const sslKeyPath = env.SSL_KEY_PATH;
    const sslCertPath = env.SSL_CERT_PATH;

    // If HTTPS is enabled, check for certificate paths
    if (enableHttps) {
      if (!sslKeyPath) {
        errors.push('ENABLE_HTTPS is true but SSL_KEY_PATH is not set');
      }
      if (!sslCertPath) {
        errors.push('ENABLE_HTTPS is true but SSL_CERT_PATH is not set');
      }
    }

    // Warn if SSL is not configured in production
    if (nodeEnv === 'production' && !enableHttps) {
      warnings.push(
        'HTTPS is not enabled in production mode. ' +
        'For production deployment, enable HTTPS by setting ENABLE_HTTPS=true ' +
        'and configuring SSL_KEY_PATH and SSL_CERT_PATH.'
      );
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}

module.exports = EnvironmentValidator;
