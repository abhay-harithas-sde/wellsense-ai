# Secret Generation CLI Tool

## Overview

The Secret Generation CLI Tool generates cryptographically secure secrets for production use. It creates strong JWT secrets, database passwords, and OAuth client secrets that meet security best practices.

## Installation

No installation required. The tool uses Node.js built-in `crypto` module.

## Usage

### Generate All Secrets

Generate all required secrets at once:

```bash
node scripts/generate-secrets.js
```

This will generate:
- JWT_SECRET (64 characters, hex-encoded)
- DATABASE_PASSWORD (32 characters, mixed character types)
- GOOGLE_CLIENT_SECRET (48 characters, base64-encoded)

### Generate Specific Secret Type

Generate only the secret you need:

```bash
# Generate JWT secret node
node scripts/generate-secrets.js --type jwt

# Generate database password
node scripts/generate-secrets.js --type database

# Generate OAuth secret
node scripts/generate-secrets.js --type oauth
```

### Custom Length

Specify a custom length for JWT or OAuth secrets:

```bash
# Generate 128-character JWT secret
node scripts/generate-secrets.js --type jwt --length 128

# Generate 64-character OAuth secret
node scripts/generate-secrets.js --type oauth --length 64
```

**Note**: Minimum lengths are enforced:
- JWT secrets: 64 characters minimum
- OAuth secrets: 48 characters minimum
- Database passwords: 32 characters (fixed)

### Help

Display usage information:

```bash
node scripts/generate-secrets.js --help
```

## Output Format

The tool displays:
- **Secret**: The generated secret value (ready to copy)
- **Length**: Number of characters
- **Entropy**: Calculated entropy in bits (higher is better)
- **Instructions**: How to add the secret to `.env.production`

Example output:

```
================================================================================
JWT_SECRET
================================================================================

Cryptographically secure JWT signing secret (hex-encoded)

Secret: 9ec15268077f0e754971b992ce31961740573aa118040723bbba6fe5311c0338
Length: 64 characters
Entropy: 243.19 bits

Add to .env.production:
JWT_SECRET=9ec15268077f0e754971b992ce31961740573aa118040723bbba6fe5311c0338
```

## Security Features

### Cryptographic Strength

All secrets are generated using Node.js `crypto.randomBytes()`, which provides cryptographically secure random values suitable for production use.

### Secret Types

1. **JWT Secrets**
   - Hex-encoded random bytes
   - Minimum 64 characters (256+ bits entropy)
   - Used for signing JSON Web Tokens

2. **Database Passwords**
   - Mixed character types (uppercase, lowercase, numbers, special characters)
   - Minimum 32 characters
   - Guaranteed to include at least one character from each type
   - Shuffled to avoid predictable patterns

3. **OAuth Secrets**
   - Base64-encoded random bytes
   - Minimum 48 characters (256+ bits entropy)
   - Used for OAuth client authentication

### Entropy Calculation

The tool calculates Shannon entropy for each generated secret:
- **High entropy** (240-260+ bits): Excellent security
- **Medium entropy** (180-240 bits): Good security
- **Low entropy** (<180 bits): Consider regenerating with longer length

## Best Practices

### Storage

1. **Never commit secrets to version control**
   ```bash
   # Ensure .env.production is in .gitignore
   echo ".env.production" >> .gitignore
   ```

2. **Set restrictive file permissions** (Unix/Linux/Mac)
   ```bash
   chmod 600 .env.production
   ```

3. **Use a secrets manager in production**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Google Cloud Secret Manager

### Rotation

Rotate secrets regularly:
- **JWT secrets**: Every 90 days
- **Database passwords**: Every 180 days
- **OAuth secrets**: When compromised or every 180 days

### Usage

1. Generate secrets using this tool
2. Copy secrets to `.env.production`
3. Store `.env.production` securely (never commit)
4. Deploy to production with secrets in place
5. Verify application starts successfully
6. Delete local copy of `.env.production` after deployment

## Integration with .env.production

After generating secrets, add them to your `.env.production` file:

```bash
# Production Environment Configuration
NODE_ENV=production

# Security - Generated Secrets
JWT_SECRET=<copy JWT_SECRET from tool output>
JWT_EXPIRES_IN=7d

# Database - Generated Password
DATABASE_URL=postgresql://user:<DATABASE_PASSWORD>@localhost:5432/wellsense
MONGODB_URI=mongodb://user:<DATABASE_PASSWORD>@localhost:27017/wellsense
REDIS_URL=redis://localhost:6379

# OAuth - Generated Secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=<copy GOOGLE_CLIENT_SECRET from tool output>
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# SSL Configuration (optional)
ENABLE_HTTPS=true
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
HTTPS_PORT=443
HTTP_PORT=80
```

## Troubleshooting

### Error: "JWT secret must be at least 64 characters"

You specified a custom length below the minimum. Use at least 64 characters for JWT secrets:

```bash
node scripts/generate-secrets.js --type jwt --length 64
```

### Error: "OAuth secret must be at least 48 characters"

You specified a custom length below the minimum. Use at least 48 characters for OAuth secrets:

```bash
node scripts/generate-secrets.js --type oauth --length 48
```

### Error: "Invalid secret type"

You specified an invalid type. Valid types are: `jwt`, `database`, `oauth`

```bash
node scripts/generate-secrets.js --type jwt
```

## Testing

The CLI tool includes comprehensive unit tests:

```bash
# Run CLI tests
npm test -- tests/unit/security/generate-secrets-cli.test.js

# Run all security tests
npm run test:security
```

## Related Documentation

- [Security Hardening Guide](./SECURITY_HARDENING.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [SSL Setup Guide](./SSL_SETUP.md)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Security Hardening Guide](./SECURITY_HARDENING.md)
3. Contact the security team
