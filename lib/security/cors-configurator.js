/**
 * CORS Configurator
 * 
 * Manages Cross-Origin Resource Sharing (CORS) policies based on environment.
 * Provides strict origin whitelisting for production and permissive settings for development.
 */

class CORSConfigurator {
  /**
   * Get CORS middleware configuration for Express
   * @param {Object} env - Environment variables
   * @param {string} nodeEnv - Current NODE_ENV (production, development, test)
   * @returns {Object} - CORS options for Express cors middleware
   */
  getCORSOptions(env, nodeEnv) {
    const isDevelopment = nodeEnv === 'development' || !nodeEnv;
    const corsOrigin = env.CORS_ORIGIN || '';

    // Parse allowed origins
    const allowedOrigins = this.parseAllowedOrigins(corsOrigin);

    // In development, add localhost origins
    if (isDevelopment) {
      const localhostOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];
      
      // Add localhost origins if not already present
      localhostOrigins.forEach(origin => {
        if (!allowedOrigins.includes(origin)) {
          allowedOrigins.push(origin);
        }
      });
    }

    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is allowed
        if (this.isOriginAllowed(origin, allowedOrigins)) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by CORS'));
        }
      },
      credentials: true, // Allow credentials for allowed origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 600 // Preflight cache: 10 minutes (600 seconds)
    };
  }

  /**
   * Parse allowed origins from environment variable
   * @param {string} corsOrigin - CORS_ORIGIN env variable (comma-separated)
   * @returns {string[]} - Array of allowed origins
   */
  parseAllowedOrigins(corsOrigin) {
    if (!corsOrigin || typeof corsOrigin !== 'string') {
      return [];
    }

    // Split by comma and trim whitespace
    return corsOrigin
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
  }

  /**
   * Validate if origin is in the allowed list
   * @param {string} origin - Request origin
   * @param {string[]} allowedOrigins - Array of allowed origins
   * @returns {boolean} - True if origin is allowed
   */
  isOriginAllowed(origin, allowedOrigins) {
    if (!origin || !Array.isArray(allowedOrigins)) {
      return false;
    }

    // Check for exact match
    return allowedOrigins.includes(origin);
  }

  /**
   * Check if CORS configuration contains wildcard
   * @param {string} corsOrigin - CORS_ORIGIN env variable
   * @returns {boolean} - True if wildcard detected
   */
  hasWildcard(corsOrigin) {
    if (!corsOrigin || typeof corsOrigin !== 'string') {
      return false;
    }

    // Check for wildcard character
    return corsOrigin.includes('*');
  }
}

export default CORSConfigurator;
