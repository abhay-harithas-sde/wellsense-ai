import crypto from 'crypto';

/**
 * Secret Manager - Generates and validates cryptographic secrets
 * 
 * Provides methods for generating strong secrets for JWT, database passwords,
 * and OAuth credentials, as well as validation and entropy calculation.
 */
class SecretManager {
  /**
   * Generate a cryptographically secure JWT secret
   * @param {number} length - Minimum 64 characters (default: 64)
   * @returns {string} - Hex-encoded random bytes
   */
  generateJWTSecret(length = 64) {
    if (length < 64) {
      throw new Error('JWT secret must be at least 64 characters');
    }
    // Generate half the length in bytes since hex encoding doubles the length
    const bytes = Math.ceil(length / 2);
    return crypto.randomBytes(bytes).toString('hex').substring(0, length);
  }

  /**
   * Generate a strong database password
   * @param {number} length - Minimum 32 characters (default: 32)
   * @returns {string} - Password with mixed character types
   */
  generateDatabasePassword(length = 32) {
    if (length < 32) {
      throw new Error('Database password must be at least 32 characters');
    }

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + special;

    // Ensure at least one character from each category
    let password = '';
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += special[crypto.randomInt(0, special.length)];

    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += allChars[crypto.randomInt(0, allChars.length)];
    }

    // Shuffle the password to avoid predictable patterns
    return password.split('').sort(() => crypto.randomInt(0, 3) - 1).join('');
  }

  /**
   * Generate an OAuth client secret
   * @param {number} length - Minimum 48 characters (default: 48)
   * @returns {string} - Base64-encoded random bytes
   */
  generateOAuthSecret(length = 48) {
    if (length < 48) {
      throw new Error('OAuth secret must be at least 48 characters');
    }
    // Base64 encoding increases length by ~33%, so calculate required bytes
    const bytes = Math.ceil((length * 3) / 4);
    return crypto.randomBytes(bytes).toString('base64').substring(0, length);
  }

  /**
   * Calculate entropy of a secret using Shannon entropy formula
   * @param {string} secret - Secret to analyze
   * @returns {number} - Entropy in bits
   */
  calculateEntropy(secret) {
    if (!secret || secret.length === 0) {
      return 0;
    }

    // Count character frequencies
    const frequencies = {};
    for (const char of secret) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    // Calculate Shannon entropy
    let entropy = 0;
    const length = secret.length;
    for (const char in frequencies) {
      const probability = frequencies[char] / length;
      entropy -= probability * Math.log2(probability);
    }

    // Return entropy in bits (entropy per character * total characters)
    return entropy * length;
  }

  /**
   * Validate secret strength
   * @param {string} secret - Secret to validate
   * @param {Object} requirements - Validation requirements
   * @param {number} requirements.minLength - Minimum length required
   * @param {number} [requirements.minEntropy] - Minimum entropy in bits
   * @param {boolean} [requirements.requireUppercase] - Require uppercase letters
   * @param {boolean} [requirements.requireLowercase] - Require lowercase letters
   * @param {boolean} [requirements.requireNumbers] - Require numbers
   * @param {boolean} [requirements.requireSpecialChars] - Require special characters
   * @returns {Object} - {valid: boolean, errors: string[]}
   */
  validateSecret(secret, requirements) {
    const errors = [];

    if (!secret) {
      errors.push('Secret is required');
      return { valid: false, errors };
    }

    // Check minimum length
    if (requirements.minLength && secret.length < requirements.minLength) {
      errors.push(`Secret length is ${secret.length} characters, minimum required is ${requirements.minLength}`);
    }

    // Check for weak patterns
    if (this.isWeakPattern(secret)) {
      errors.push('Secret contains weak pattern (your-, change-in-production, test-, example-, placeholder-)');
    }

    // Check minimum entropy
    if (requirements.minEntropy) {
      const entropy = this.calculateEntropy(secret);
      if (entropy < requirements.minEntropy) {
        errors.push(`Secret entropy is ${entropy.toFixed(2)} bits, minimum required is ${requirements.minEntropy} bits`);
      }
    }

    // Check character requirements
    if (requirements.requireUppercase && !/[A-Z]/.test(secret)) {
      errors.push('Secret must contain at least one uppercase letter');
    }

    if (requirements.requireLowercase && !/[a-z]/.test(secret)) {
      errors.push('Secret must contain at least one lowercase letter');
    }

    if (requirements.requireNumbers && !/[0-9]/.test(secret)) {
      errors.push('Secret must contain at least one number');
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(secret)) {
      errors.push('Secret must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if secret matches weak patterns
   * @param {string} secret - Secret to check
   * @returns {boolean} - True if weak pattern detected
   */
  isWeakPattern(secret) {
    if (!secret) {
      return false;
    }

    const weakPatterns = [
      /your-/i,
      /change-in-production/i,
      /test-/i,
      /example-/i,
      /placeholder-/i,
      /secret/i,
      /password/i,
      /admin/i,
      /root/i
    ];

    return weakPatterns.some(pattern => pattern.test(secret));
  }
}

export default SecretManager;
