const CORSConfigurator = require('../../../lib/security/cors-configurator');

describe('CORSConfigurator', () => {
  let corsConfigurator;

  beforeEach(() => {
    corsConfigurator = new CORSConfigurator();
  });

  describe('parseAllowedOrigins', () => {
    test('parses single origin', () => {
      const result = corsConfigurator.parseAllowedOrigins('https://example.com');
      expect(result).toEqual(['https://example.com']);
    });

    test('parses multiple comma-separated origins', () => {
      const result = corsConfigurator.parseAllowedOrigins('https://example.com,https://app.example.com');
      expect(result).toEqual(['https://example.com', 'https://app.example.com']);
    });

    test('trims whitespace from origins', () => {
      const result = corsConfigurator.parseAllowedOrigins('https://example.com , https://app.example.com ');
      expect(result).toEqual(['https://example.com', 'https://app.example.com']);
    });

    test('filters out empty strings', () => {
      const result = corsConfigurator.parseAllowedOrigins('https://example.com,,https://app.example.com');
      expect(result).toEqual(['https://example.com', 'https://app.example.com']);
    });

    test('returns empty array for empty string', () => {
      const result = corsConfigurator.parseAllowedOrigins('');
      expect(result).toEqual([]);
    });

    test('returns empty array for null or undefined', () => {
      expect(corsConfigurator.parseAllowedOrigins(null)).toEqual([]);
      expect(corsConfigurator.parseAllowedOrigins(undefined)).toEqual([]);
    });

    test('handles origins with ports', () => {
      const result = corsConfigurator.parseAllowedOrigins('http://localhost:3000,http://localhost:5173');
      expect(result).toEqual(['http://localhost:3000', 'http://localhost:5173']);
    });
  });

  describe('isOriginAllowed', () => {
    test('returns true for origin in allowed list', () => {
      const allowedOrigins = ['https://example.com', 'https://app.example.com'];
      expect(corsConfigurator.isOriginAllowed('https://example.com', allowedOrigins)).toBe(true);
    });

    test('returns false for origin not in allowed list', () => {
      const allowedOrigins = ['https://example.com'];
      expect(corsConfigurator.isOriginAllowed('https://unauthorized.com', allowedOrigins)).toBe(false);
    });

    test('returns false for empty origin', () => {
      const allowedOrigins = ['https://example.com'];
      expect(corsConfigurator.isOriginAllowed('', allowedOrigins)).toBe(false);
    });

    test('returns false for null origin', () => {
      const allowedOrigins = ['https://example.com'];
      expect(corsConfigurator.isOriginAllowed(null, allowedOrigins)).toBe(false);
    });

    test('returns false for non-array allowedOrigins', () => {
      expect(corsConfigurator.isOriginAllowed('https://example.com', null)).toBe(false);
      expect(corsConfigurator.isOriginAllowed('https://example.com', 'not-an-array')).toBe(false);
    });

    test('is case-sensitive', () => {
      const allowedOrigins = ['https://example.com'];
      expect(corsConfigurator.isOriginAllowed('https://Example.com', allowedOrigins)).toBe(false);
    });

    test('requires exact match including protocol', () => {
      const allowedOrigins = ['https://example.com'];
      expect(corsConfigurator.isOriginAllowed('http://example.com', allowedOrigins)).toBe(false);
    });

    test('requires exact match including port', () => {
      const allowedOrigins = ['http://localhost:3000'];
      expect(corsConfigurator.isOriginAllowed('http://localhost:5173', allowedOrigins)).toBe(false);
    });
  });

  describe('hasWildcard', () => {
    test('detects wildcard in CORS_ORIGIN', () => {
      expect(corsConfigurator.hasWildcard('*')).toBe(true);
    });

    test('detects wildcard in comma-separated list', () => {
      expect(corsConfigurator.hasWildcard('https://example.com,*')).toBe(true);
    });

    test('detects wildcard in subdomain', () => {
      expect(corsConfigurator.hasWildcard('https://*.example.com')).toBe(true);
    });

    test('returns false for no wildcard', () => {
      expect(corsConfigurator.hasWildcard('https://example.com')).toBe(false);
    });

    test('returns false for empty string', () => {
      expect(corsConfigurator.hasWildcard('')).toBe(false);
    });

    test('returns false for null or undefined', () => {
      expect(corsConfigurator.hasWildcard(null)).toBe(false);
      expect(corsConfigurator.hasWildcard(undefined)).toBe(false);
    });
  });

  describe('getCORSOptions', () => {
    test('returns CORS options with allowed origins in production', () => {
      const env = { CORS_ORIGIN: 'https://example.com,https://app.example.com' };
      const options = corsConfigurator.getCORSOptions(env, 'production');

      expect(options).toHaveProperty('origin');
      expect(options).toHaveProperty('credentials', true);
      expect(options).toHaveProperty('methods');
      expect(options).toHaveProperty('allowedHeaders');
      expect(options).toHaveProperty('maxAge', 600);
    });

    test('includes localhost origins in development', () => {
      const env = { CORS_ORIGIN: 'https://example.com' };
      const options = corsConfigurator.getCORSOptions(env, 'development');

      // Test the origin function
      const callback = jest.fn();
      options.origin('http://localhost:3000', callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('allows configured origins in production', () => {
      const env = { CORS_ORIGIN: 'https://example.com' };
      const options = corsConfigurator.getCORSOptions(env, 'production');

      const callback = jest.fn();
      options.origin('https://example.com', callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('rejects unauthorized origins in production', () => {
      const env = { CORS_ORIGIN: 'https://example.com' };
      const options = corsConfigurator.getCORSOptions(env, 'production');

      const callback = jest.fn();
      options.origin('https://unauthorized.com', callback);
      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });

    test('allows requests with no origin', () => {
      const env = { CORS_ORIGIN: 'https://example.com' };
      const options = corsConfigurator.getCORSOptions(env, 'production');

      const callback = jest.fn();
      options.origin(undefined, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('includes correct HTTP methods', () => {
      const env = { CORS_ORIGIN: 'https://example.com' };
      const options = corsConfigurator.getCORSOptions(env, 'production');

      expect(options.methods).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']);
    });

    test('includes correct allowed headers', () => {
      const env = { CORS_ORIGIN: 'https://example.com' };
      const options = corsConfigurator.getCORSOptions(env, 'production');

      expect(options.allowedHeaders).toEqual(['Content-Type', 'Authorization', 'X-Requested-With']);
    });

    test('sets preflight cache to 600 seconds', () => {
      const env = { CORS_ORIGIN: 'https://example.com' };
      const options = corsConfigurator.getCORSOptions(env, 'production');

      expect(options.maxAge).toBe(600);
    });

    test('handles empty CORS_ORIGIN in development', () => {
      const env = { CORS_ORIGIN: '' };
      const options = corsConfigurator.getCORSOptions(env, 'development');

      // Should still allow localhost in development
      const callback = jest.fn();
      options.origin('http://localhost:3000', callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('treats missing NODE_ENV as development', () => {
      const env = { CORS_ORIGIN: 'https://example.com' };
      const options = corsConfigurator.getCORSOptions(env, undefined);

      // Should allow localhost when NODE_ENV is undefined
      const callback = jest.fn();
      options.origin('http://localhost:3000', callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('allows all localhost ports in development', () => {
      const env = { CORS_ORIGIN: '' };
      const options = corsConfigurator.getCORSOptions(env, 'development');

      const localhostOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];

      localhostOrigins.forEach(origin => {
        const callback = jest.fn();
        options.origin(origin, callback);
        expect(callback).toHaveBeenCalledWith(null, true);
      });
    });
  });
});
