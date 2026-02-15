const { execSync } = require('child_process');
const path = require('path');

describe('Generate Secrets CLI', () => {
  const cliPath = path.join(__dirname, '../../../scripts/generate-secrets.js');

  function runCLI(args = '') {
    try {
      const output = execSync(`node ${cliPath} ${args}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return { output, exitCode: 0 };
    } catch (error) {
      return { output: error.stdout || error.stderr, exitCode: error.status };
    }
  }

  describe('Help command', () => {
    test('displays help message with --help flag', () => {
      const { output, exitCode } = runCLI('--help');
      expect(exitCode).toBe(0);
      expect(output).toContain('Secret Generation CLI Tool');
      expect(output).toContain('Usage:');
      expect(output).toContain('--type');
      expect(output).toContain('--length');
    });

    test('displays help message with -h flag', () => {
      const { output, exitCode } = runCLI('-h');
      expect(exitCode).toBe(0);
      expect(output).toContain('Secret Generation CLI Tool');
    });
  });

  describe('Generate all secrets', () => {
    test('generates all secret types when no arguments provided', () => {
      const { output, exitCode } = runCLI();
      expect(exitCode).toBe(0);
      expect(output).toContain('🔐 Generating Production Secrets');
      expect(output).toContain('JWT Secret:');
      expect(output).toContain('Database Password:');
      expect(output).toContain('OAuth Client Secret:');
      expect(output).toContain('📋 Add to .env.production:');
    });

    test('displays entropy calculation for each secret', () => {
      const { output, exitCode } = runCLI();
      expect(exitCode).toBe(0);
      expect(output).toMatch(/Entropy:\s+\d+\.\d+\s+bits/);
    });

    test('provides .env.production snippet', () => {
      const { output, exitCode } = runCLI();
      expect(exitCode).toBe(0);
      expect(output).toContain('JWT_SECRET=');
      expect(output).toContain('DATABASE_PASSWORD=');
      expect(output).toContain('GOOGLE_CLIENT_SECRET=');
    });

    test('includes security tips', () => {
      const { output, exitCode } = runCLI();
      expect(exitCode).toBe(0);
      expect(output).toContain('💡 Tips:');
      expect(output).toContain('Store these secrets securely');
      expect(output).toContain('Never commit .env.production');
      expect(output).toContain('Rotate secrets regularly');
    });
  });

  describe('Generate JWT secret', () => {
    test('generates valid JWT secret with --type jwt', () => {
      const { output, exitCode } = runCLI('--type jwt');
      expect(exitCode).toBe(0);
      expect(output).toContain('🔐 Generating JWT Secret');
      expect(output).toContain('JWT Secret:');
      expect(output).toContain('Length:  64 characters');
      expect(output).toMatch(/Entropy:\s+\d+\.\d+\s+bits/);
    });

    test('JWT secret is hex-encoded', () => {
      const { output } = runCLI('--type jwt');
      const secretMatch = output.match(/JWT Secret:\n={80}\n\n([0-9a-f]+)\n/);
      expect(secretMatch).toBeTruthy();
      expect(secretMatch[1]).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(secretMatch[1])).toBe(true);
    });
  });

  describe('Generate database password', () => {
    test('generates valid database password with --type database', () => {
      const { output, exitCode } = runCLI('--type database');
      expect(exitCode).toBe(0);
      expect(output).toContain('🔐 Generating DATABASE Secret');
      expect(output).toContain('Database Password:');
      expect(output).toContain('Length:  32 characters');
      expect(output).toMatch(/Entropy:\s+\d+\.\d+\s+bits/);
    });

    test('database password contains mixed character types', () => {
      const { output } = runCLI('--type database');
      const secretMatch = output.match(/Database Password:\n={80}\n\n(.+)\n/);
      expect(secretMatch).toBeTruthy();
      const password = secretMatch[1];
      expect(password).toHaveLength(32);
      expect(/[A-Z]/.test(password)).toBe(true); // uppercase
      expect(/[a-z]/.test(password)).toBe(true); // lowercase
      expect(/[0-9]/.test(password)).toBe(true); // numbers
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true); // special chars
    });
  });

  describe('Generate OAuth secret', () => {
    test('generates valid OAuth secret with --type oauth', () => {
      const { output, exitCode } = runCLI('--type oauth');
      expect(exitCode).toBe(0);
      expect(output).toContain('🔐 Generating OAUTH Secret');
      expect(output).toContain('OAuth Client Secret:');
      expect(output).toContain('Length:  48 characters');
      expect(output).toMatch(/Entropy:\s+\d+\.\d+\s+bits/);
    });

    test('OAuth secret is base64-encoded', () => {
      const { output } = runCLI('--type oauth');
      const secretMatch = output.match(/OAuth Client Secret:\n={80}\n\n([A-Za-z0-9+/]+)\n/);
      expect(secretMatch).toBeTruthy();
      expect(secretMatch[1]).toHaveLength(48);
    });
  });

  describe('Custom length parameter', () => {
    test('generates JWT secret with custom length', () => {
      const { output, exitCode } = runCLI('--type jwt --length 128');
      expect(exitCode).toBe(0);
      expect(output).toContain('Length:  128 characters');
    });

    test('generates database password with custom length', () => {
      const { output, exitCode } = runCLI('--type database --length 64');
      expect(exitCode).toBe(0);
      expect(output).toContain('Length:  64 characters');
    });

    test('generates OAuth secret with custom length', () => {
      const { output, exitCode } = runCLI('--type oauth --length 96');
      expect(exitCode).toBe(0);
      expect(output).toContain('Length:  96 characters');
    });
  });

  describe('Error handling', () => {
    test('displays error for unknown secret type', () => {
      const { output, exitCode } = runCLI('--type invalid');
      expect(exitCode).toBe(1);
      expect(output).toContain('❌ Error: Unknown secret type');
      expect(output).toContain('Valid types: jwt, database, oauth');
    });

    test('handles invalid length gracefully', () => {
      const { output, exitCode } = runCLI('--type jwt --length 32');
      expect(exitCode).toBe(1);
      expect(output).toContain('❌ Error:');
      expect(output).toContain('at least 64 characters');
    });
  });

  describe('Output format', () => {
    test('displays secrets in copy-paste format', () => {
      const { output } = runCLI('--type jwt');
      expect(output).toContain('='.repeat(80));
      expect(output).toMatch(/JWT Secret:\n={80}\n\n[0-9a-f]+\n/);
    });

    test('includes instructions for adding to .env.production', () => {
      const { output } = runCLI('--type jwt');
      expect(output).toContain('💡 Add this to your .env.production file');
    });
  });
});
