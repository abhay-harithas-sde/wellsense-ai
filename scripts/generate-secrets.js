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

const SecretManager = require('../lib/security/secret-manager');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: null,
    length: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type' && args[i + 1]) {
      options.type = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--length' && args[i + 1]) {
      options.length = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

// Display help message
function showHelp() {
  console.log(`
Secret Generation CLI Tool

Usage:
  node scripts/generate-secrets.js [options]

Options:
  --type <type>     Generate specific secret type (jwt|database|oauth)
  --length <n>      Custom length for JWT/OAuth secrets (minimum: JWT=64, OAuth=48)
  --help, -h        Show this help message

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
function generateJWT(length = null) {
  const secretManager = new SecretManager();
  const secret = length ? secretManager.generateJWTSecret(length) : secretManager.generateJWTSecret();
  
  formatSecret(
    'JWT_SECRET',
    secret,
    'Used for signing and verifying JSON Web Tokens.\nMinimum 64 characters, hex-encoded.'
  );
}

// Generate database password
function generateDatabase(length = null) {
  const secretManager = new SecretManager();
  const secret = length ? secretManager.generateDatabasePassword(length) : secretManager.generateDatabasePassword();
  
  formatSecret(
    'DATABASE_PASSWORD',
    secret,
    'Strong password for database authentication.\nMinimum 32 characters with uppercase, lowercase, numbers, and special characters.'
  );
}

// Generate OAuth secret
function generateOAuth(length = null) {
  const secretManager = new SecretManager();
  const secret = length ? secretManager.generateOAuthSecret(length) : secretManager.generateOAuthSecret();
  
  formatSecret(
    'GOOGLE_CLIENT_SECRET',
    secret,
    'OAuth client secret for Google authentication.\nMinimum 48 characters, base64-encoded.'
  );
}

// Generate all secrets
function generateAll() {
  console.log('\n' + '█'.repeat(80));
  console.log('  PRODUCTION SECRET GENERATION');
  console.log('█'.repeat(80));
  console.log('\nGenerating cryptographically strong secrets for production use...');
  
  generateJWT();
  generateDatabase();
  generateOAuth();
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('EXAMPLE .env.production CONFIGURATION');
  console.log(`${'='.repeat(80)}\n`);
  
  const secretManager = new SecretManager();
  const jwtSecret = secretManager.generateJWTSecret();
  const dbPassword = secretManager.generateDatabasePassword();
  const oauthSecret = secretManager.generateOAuthSecret();
  
  console.log(`# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3000
ENABLE_HTTPS=true
HTTPS_PORT=443
HTTP_PORT=80

# CORS Configuration (replace with your production domains)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Database Configuration (replace with your database URLs)
DATABASE_URL=postgresql://username:${dbPassword}@localhost:5432/wellsense
MONGODB_URI=mongodb://username:${dbPassword}@localhost:27017/wellsense
REDIS_URL=redis://localhost:6379

# OAuth Configuration (replace with your OAuth credentials)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=${oauthSecret}
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# SSL Configuration (replace with your certificate paths)
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt

# OpenAI Configuration (replace with your API key)
OPENAI_API_KEY=sk-your-openai-api-key
`);
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('IMPORTANT SECURITY NOTES');
  console.log(`${'='.repeat(80)}\n`);
  console.log('1. Copy the generated secrets to your .env.production file');
  console.log('2. NEVER commit .env.production to version control');
  console.log('3. Store production secrets securely (use a password manager or vault)');
  console.log('4. Rotate secrets regularly (JWT: 90 days, Database: 180 days)');
  console.log('5. Use different secrets for each environment (dev, staging, production)');
  console.log('6. Set file permissions: chmod 600 .env.production');
  console.log('7. Run security audit before deployment: npm run security:audit\n');
}

// Main execution
function main() {
  try {
    const options = parseArgs();
    
    // Validate type if specified
    if (options.type && !['jwt', 'database', 'oauth'].includes(options.type)) {
      console.error(`\n❌ Error: Invalid secret type "${options.type}"`);
      console.error('Valid types: jwt, database, oauth\n');
      process.exit(1);
    }
    
    // Validate length if specified
    if (options.length !== null) {
      if (isNaN(options.length) || options.length < 1) {
        console.error(`\n❌ Error: Invalid length "${options.length}"`);
        console.error('Length must be a positive number\n');
        process.exit(1);
      }
      
      // Check minimum lengths for specific types
      if (options.type === 'jwt' && options.length < 64) {
        console.error(`\n❌ Error: JWT secret must be at least 64 characters`);
        console.error(`Requested length: ${options.length}\n`);
        process.exit(1);
      }
      
      if (options.type === 'database' && options.length < 32) {
        console.error(`\n❌ Error: Database password must be at least 32 characters`);
        console.error(`Requested length: ${options.length}\n`);
        process.exit(1);
      }
      
      if (options.type === 'oauth' && options.length < 48) {
        console.error(`\n❌ Error: OAuth secret must be at least 48 characters`);
        console.error(`Requested length: ${options.length}\n`);
        process.exit(1);
      }
    }
    
    // Generate secrets based on options
    if (options.type) {
      switch (options.type) {
        case 'jwt':
          generateJWT(options.length);
          break;
        case 'database':
          generateDatabase(options.length);
          break;
        case 'oauth':
          generateOAuth(options.length);
          break;
      }
    } else {
      generateAll();
    }
    
    console.log(''); // Empty line at the end
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = { parseArgs, generateJWT, generateDatabase, generateOAuth, generateAll };
