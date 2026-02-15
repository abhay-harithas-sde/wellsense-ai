const fc = require('fast-check');
const CORSConfigurator = require('../../../lib/security/cors-configurator');

describe('CORS Configuration Properties', () => {
  let corsConfigurator;

  beforeEach(() => {
    corsConfigurator = new CORSConfigurator();
  });

  describe('Property 11: Production Origin Restriction', () => {
    test('**Validates: Requirements 3.1** - unauthorized origins are always rejected in production', () => {
      // Define a fixed set of allowed origins
      const allowedOrigins = ['https://app.example.com', 'https://www.example.com'];
      const env = { CORS_ORIGIN: allowedOrigins.join(',') };

      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https', 'http'] }),
          (origin) => {
            // Only test unauthorized origins
            fc.pre(!allowedOrigins.includes(origin));

            // Get CORS options for production
            const corsOptions = corsConfigurator.getCORSOptions(env, 'production');

            // Test that unauthorized origin is rejected
            const callback = jest.fn();
            corsOptions.origin(origin, callback);

            // Should be called with an error
            expect(callback).toHaveBeenCalledWith(expect.any(Error));
            expect(callback.mock.calls[0][0].message).toContain('Origin not allowed by CORS');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('authorized origins are always allowed in production', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 1, maxLength: 5 }),
          (allowedOrigins) => {
            // Filter out URLs that contain commas (edge case that breaks comma-separated parsing)
            const safeOrigins = allowedOrigins.filter(url => !url.includes(','));
            fc.pre(safeOrigins.length > 0);
            
            // Ensure unique origins
            const uniqueOrigins = [...new Set(safeOrigins)];
            const env = { CORS_ORIGIN: uniqueOrigins.join(',') };

            // Get CORS options for production
            const corsOptions = corsConfigurator.getCORSOptions(env, 'production');

            // Test each allowed origin
            uniqueOrigins.forEach(origin => {
              const callback = jest.fn();
              corsOptions.origin(origin, callback);

              // Should be called with null error and true
              expect(callback).toHaveBeenCalledWith(null, true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Multiple Origin Support', () => {
    test('**Validates: Requirements 3.2** - all comma-separated origins are allowed to make requests', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 1, maxLength: 10 }),
          (origins) => {
            // Filter out URLs that contain commas (edge case that breaks comma-separated parsing)
            const safeOrigins = origins.filter(url => !url.includes(','));
            fc.pre(safeOrigins.length > 0);
            
            // Ensure unique origins
            const uniqueOrigins = [...new Set(safeOrigins)];
            const corsOriginString = uniqueOrigins.join(',');

            // Parse the origins
            const parsedOrigins = corsConfigurator.parseAllowedOrigins(corsOriginString);

            // All origins should be parsed correctly
            expect(parsedOrigins).toHaveLength(uniqueOrigins.length);
            uniqueOrigins.forEach(origin => {
              expect(parsedOrigins).toContain(origin);
            });

            // All parsed origins should be allowed
            const env = { CORS_ORIGIN: corsOriginString };
            const corsOptions = corsConfigurator.getCORSOptions(env, 'production');

            parsedOrigins.forEach(origin => {
              const callback = jest.fn();
              corsOptions.origin(origin, callback);
              expect(callback).toHaveBeenCalledWith(null, true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('parsing handles various whitespace configurations', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 2, maxLength: 5 }),
          fc.constantFrom('', ' ', '  ', '\t'),
          (origins, whitespace) => {
            // Filter out URLs that contain commas (edge case that breaks comma-separated parsing)
            const safeOrigins = origins.filter(url => !url.includes(','));
            fc.pre(safeOrigins.length >= 2);
            
            // Create comma-separated string with random whitespace
            const corsOriginString = safeOrigins.join(`,${whitespace}`);

            // Parse the origins
            const parsedOrigins = corsConfigurator.parseAllowedOrigins(corsOriginString);

            // Should parse all origins correctly despite whitespace
            expect(parsedOrigins).toHaveLength(safeOrigins.length);
            safeOrigins.forEach(origin => {
              expect(parsedOrigins).toContain(origin);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Credentials for Allowed Origins Only', () => {
    test('**Validates: Requirements 3.6** - credentials are only included for explicitly allowed origins', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 1, maxLength: 5 }),
          fc.webUrl({ validSchemes: ['https', 'http'] }),
          (allowedOrigins, unauthorizedOrigin) => {
            // Filter out URLs that contain commas (edge case that breaks comma-separated parsing)
            const safeOrigins = allowedOrigins.filter(url => !url.includes(','));
            fc.pre(safeOrigins.length > 0);
            
            // Ensure unauthorized origin is not in allowed list and doesn't contain comma
            fc.pre(!safeOrigins.includes(unauthorizedOrigin) && !unauthorizedOrigin.includes(','));

            const uniqueOrigins = [...new Set(safeOrigins)];
            const env = { CORS_ORIGIN: uniqueOrigins.join(',') };

            // Get CORS options for production
            const corsOptions = corsConfigurator.getCORSOptions(env, 'production');

            // Credentials should be enabled in options
            expect(corsOptions.credentials).toBe(true);

            // Test allowed origins - should succeed
            uniqueOrigins.forEach(origin => {
              const callback = jest.fn();
              corsOptions.origin(origin, callback);
              expect(callback).toHaveBeenCalledWith(null, true);
            });

            // Test unauthorized origin - should fail
            const unauthorizedCallback = jest.fn();
            corsOptions.origin(unauthorizedOrigin, unauthorizedCallback);
            expect(unauthorizedCallback).toHaveBeenCalledWith(expect.any(Error));
          }
        ),
        { numRuns: 100 }
      );
    });

    test('credentials setting is consistent across all CORS configurations', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          fc.constantFrom('production', 'development', 'test'),
          (origin, nodeEnv) => {
            const env = { CORS_ORIGIN: origin };
            const corsOptions = corsConfigurator.getCORSOptions(env, nodeEnv);

            // Credentials should always be true
            expect(corsOptions.credentials).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Wildcard Detection', () => {
    test('wildcard is always detected in CORS_ORIGIN strings', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 0, maxLength: 3 }),
          fc.constantFrom('*', 'https://*.example.com', '*.com'),
          (origins, wildcardPattern) => {
            // Insert wildcard at random position
            const allOrigins = [...origins, wildcardPattern];
            const corsOriginString = allOrigins.join(',');

            // Should detect wildcard
            expect(corsConfigurator.hasWildcard(corsOriginString)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('no false positives for wildcard detection', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 1, maxLength: 5 }),
          (origins) => {
            // Filter out any origins that might contain asterisk
            const safeOrigins = origins.filter(o => !o.includes('*'));
            fc.pre(safeOrigins.length > 0);

            const corsOriginString = safeOrigins.join(',');

            // Should not detect wildcard
            expect(corsConfigurator.hasWildcard(corsOriginString)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Development Localhost Support', () => {
    test('localhost origins are always allowed in development mode', () => {
      const localhostOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...localhostOrigins),
          fc.oneof(
            fc.constant(''),
            fc.webUrl({ validSchemes: ['https'] })
          ),
          (localhostOrigin, corsOrigin) => {
            const env = { CORS_ORIGIN: corsOrigin };
            const corsOptions = corsConfigurator.getCORSOptions(env, 'development');

            // Localhost should always be allowed in development
            const callback = jest.fn();
            corsOptions.origin(localhostOrigin, callback);
            expect(callback).toHaveBeenCalledWith(null, true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Origin Validation Consistency', () => {
    test('isOriginAllowed is consistent with getCORSOptions origin validation', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl({ validSchemes: ['https'] }), { minLength: 1, maxLength: 5 }),
          fc.webUrl({ validSchemes: ['https', 'http'] }),
          (allowedOrigins, testOrigin) => {
            const uniqueOrigins = [...new Set(allowedOrigins)];
            const env = { CORS_ORIGIN: uniqueOrigins.join(',') };

            // Check with isOriginAllowed
            const isAllowed = corsConfigurator.isOriginAllowed(testOrigin, uniqueOrigins);

            // Check with getCORSOptions
            const corsOptions = corsConfigurator.getCORSOptions(env, 'production');
            const callback = jest.fn();
            corsOptions.origin(testOrigin, callback);

            // Results should be consistent
            if (isAllowed) {
              expect(callback).toHaveBeenCalledWith(null, true);
            } else {
              expect(callback).toHaveBeenCalledWith(expect.any(Error));
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: CORS Methods and Headers', () => {
    test('CORS options always include required HTTP methods', () => {
      const requiredMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          fc.constantFrom('production', 'development', 'test'),
          (origin, nodeEnv) => {
            const env = { CORS_ORIGIN: origin };
            const corsOptions = corsConfigurator.getCORSOptions(env, nodeEnv);

            // Should include all required methods
            expect(corsOptions.methods).toEqual(requiredMethods);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('CORS options always include required headers', () => {
      const requiredHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'];

      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          fc.constantFrom('production', 'development', 'test'),
          (origin, nodeEnv) => {
            const env = { CORS_ORIGIN: origin };
            const corsOptions = corsConfigurator.getCORSOptions(env, nodeEnv);

            // Should include all required headers
            expect(corsOptions.allowedHeaders).toEqual(requiredHeaders);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('preflight cache is always set to 600 seconds', () => {
      fc.assert(
        fc.property(
          fc.webUrl({ validSchemes: ['https'] }),
          fc.constantFrom('production', 'development', 'test'),
          (origin, nodeEnv) => {
            const env = { CORS_ORIGIN: origin };
            const corsOptions = corsConfigurator.getCORSOptions(env, nodeEnv);

            // maxAge should always be 600
            expect(corsOptions.maxAge).toBe(600);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
