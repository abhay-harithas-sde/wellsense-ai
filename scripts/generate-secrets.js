#!/usr/bin/env node

/**
 * Secret Generation CLI Tool
 * 
 * Generates cryptographically strong secrets for production use.
 * 
 * Usage:
 *   node scripts/generate-secrets.js                    # Generate all secrets
 *   node scripts/generate-secrets.js --type jwt         # Generate JWT secret only
 *   node scripts/generate-secrets.js --type database    # Generate database password only
 *   node scripts/generate-secrets.js --type oauth       # Generate OAuth secret only
 *   node scripts/generate-secrets.js --length 128       # Custom length for JWT/OAuth
 */

import SecretManager from '../lib/security/secret-manager.js';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: null,
    length: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type' && i + 1 < args.length) {
      options.type = args[i + 1];
      i++;
    } else if (args[i] === '--length' && i + 1 < args.length) {
      options.length = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

// Print help message
function printHelp() {
  console.log(`
Secret Generation CLI Tool

Usage:
  node scripts/generate-secrets.js [options]

Options:
  --type <type>      Generate specific secret type: jwt, database, or oauth
  --length <number>  Custom length for JWT/OAuth secrets (minimum: JWT=64, OAuth=48)
  --help, -h         Show this help message

Examples:
  node scripts/generate-secrets.js                    # Generate all secrets
  node scripts/generate-secrets.js --type jwt         # Generate JWT secret only
  node scripts/generate-secrets.js --type database    # Generate database password
  node scripts/generate-secrets.js --type oauth       # Generate OAuth secret
  node scripts/generate-secrets.js --type jwt --length 128  # Custom length JWT secret
`);
}

// Format secret output with entropy information
function formatSecret(name, secret, description) {
  const secretManager = new SecretManager();
  const entropy = secretManager.calculateEntropy(secret);
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\n${description}\n`);
  console.log(`Secret: ${secret}`);
  console.log(`Length: ${secret.length} characters`);
  console.log(`Entropy: ${entropy.toFixed(2)} bits`);
  console.log(`\nAdd to .env.production:`);
  console.log(`${name}=${secret}`);
}

// Generate JWT secret
function generateJWT(length = 64) {
  const secretManager = new SecretManager();
  const secret = secretManager.generateJWTSecret(length);
  formatSecret(
    'JWT_SECRET',
    secret,
    'Cryptographically secure JWT signing secret (hex-encoded)'
  );
}

// Generate database password
function generateDatabase(length = 32) {
  const secretManager = new SecretManager();
  const secret = secretManager.generateDatabasePassword(length);
  formatSecret(
    'DATABASE_PASSWORD',
    secret,
    'Strong database password with mixed character types'
  );
}

// Generate OAuth secret
function generateOAuth(length = 48) {
  const secretManager = new SecretManager();
  const secret = secretManager.generateOAuthSecret(length);
  formatSecret(
    'GOOGLE_CLIENT_SECRET',
    secret,
    'OAuth client secret for Google authentication (base64-encoded)'
  );
}

// Generate all secrets
function generateAll(options) {
  console.log('\n🔐 Generating Production Secrets');
  console.log('='.repeat(80));
  console.log('\nThese secrets are cryptographically secure and ready for production use.');
  console.log('Store them securely and never commit them to version control.\n');

  generateJWT(options.length || 64);
  generateDatabase(32); // Database password always uses default length
  generateOAuth(options.length || 48);

  console.log(`\n${'='.repeat(80)}`);
  console.log('Example .env.production snippet:');
  console.log(`${'='.repeat(80)}\n`);
  console.log('# Copy the secrets above into your .env.production file');
  console.log('# Replace the placeholder values with the generated secrets\n');
  console.log('NODE_ENV=production');
  console.log('JWT_SECRET=<copy JWT_SECRET from above>');
  console.log('DATABASE_PASSWORD=<copy DATABASE_PASSWORD from above>');
  console.log('GOOGLE_CLIENT_SECRET=<copy GOOGLE_CLIENT_SECRET from above>');
  console.log('');
  console.log('# Additional configuration');
  console.log('CORS_ORIGIN=https://yourdomain.com');
  console.log('DATABASE_URL=postgresql://user:<DATABASE_PASSWORD>@localhost:5432/wellsense');
  console.log('');
  console.log(`${'='.repeat(80)}`);
  console.log('\n✅ Secrets generated successfully!');
  console.log('\n⚠️  Security reminders:');
  console.log('  - Store .env.production securely (never commit to git)');
  console.log('  - Set file permissions: chmod 600 .env.production');
  console.log('  - Rotate secrets regularly (every 90-180 days)');
  console.log('  - Use a secrets manager for production (AWS Secrets Manager, Vault, etc.)');
  console.log('');
}

// Main function
function main() {
  const options = parseArgs();

  try {
    if (options.type) {
      // Generate specific secret type
      switch (options.type.toLowerCase()) {
        case 'jwt':
          console.log('\n🔐 Generating JWT Secret');
          generateJWT(options.length || 64);
          console.log('\n✅ JWT secret generated successfully!\n');
          break;
        case 'database':
          console.log('\n🔐 Generating Database Password');
          generateDatabase(32);
          console.log('\n✅ Database password generated successfully!\n');
          break;
        case 'oauth':
          console.log('\n🔐 Generating OAuth Secret');
          generateOAuth(options.length || 48);
          console.log('\n✅ OAuth secret generated successfully!\n');
          break;
        default:
          console.error(`\n❌ Error: Invalid secret type "${options.type}"`);
          console.error('Valid types: jwt, database, oauth\n');
          process.exit(1);
      }
    } else {
      // Generate all secrets
      generateAll(options);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the CLI
main();

export { parseArgs, generateJWT, generateDatabase, generateOAuth, generateAll };
