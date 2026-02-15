# Security Hardening Guide

## Overview

This guide documents the comprehensive security hardening measures implemented in the WellSense AI application. These measures protect the production environment against common security vulnerabilities including weak cryptographic secrets, unauthorized cross-origin requests, unencrypted data transmission, and configuration errors.

### Security Measures Implemented

- **Strong Secret Generation**: Cryptographically secure secrets with minimum entropy requirements
- **Environment-Specific Configuration**: Isolated configurations for development, test, and production
- **CORS Security**: Strict origin whitelisting in production, preventing unauthorized API access
- **SSL/TLS Encryption**: HTTPS support with automated certificate management
- **Automated Security Auditing**: Pre-deployment validation to catch configuration issues
- **Production Error Sanitization**: Prevents sensitive information leakage through error messages

### Security Standards Compliance

This implementation addresses:
- **OWASP Top 10 (2021)**: Cryptographic Failures, Security Misconfiguration, Authentication Failures
- **CWE**: Hard-coded Passwords, Missing Encryption, Origin Validation, Weak Password Requirements
- **NIST Guidelines**: Digital Identity Guidelines (SP 800-63B), TLS Guidelines (SP 800-52)

---

## Secret Generation

### Overview

All production secrets must be cryptographically strong to prevent brute force and credential stuffing attacks. The Secret Manager component generates secrets that meet industry security standards.

### Secret Requirements

| Secret Type | Minimum Length | Entropy | Character Requirements |
|-------------|----------------|---------|------------------------|
| JWT Secret | 64 characters | 256 bits | Hex or base64 encoded |
| Database Password | 32 characters | 256 bits | Mixed case, numbers, special chars |
| OAuth Client Secret | 48 characters | 256 bits | Hex or base64 encoded |

### Generating Secrets

#### Generate All Secrets

```bash
node scripts/generate-secrets.js
```

Output:
```
🔐 Generated Production Secrets
================================

JWT_SECRET (64 characters, 256 bits entropy):
a7f3c9e2b8d4f1a6c3e9b2d8f4a1c7e3b9d2f8a4c1e7b3d9f2a8c4e1b7d3f9a2

DATABASE_PASSWORD (32 characters, 256 bits entropy):
K9#mP2$vL8@nQ5!wR3^xT7&yU4*zA6

GOOGLE_CLIENT_SECRET (48 characters, 256 bits entropy):
b4d8f2a6c1e7b3d9f2a8c4e1b7d3f9a2c8e4b1d7f3a9c2e8b4d1f7a3c9e2b8d4

⚠️  Store these secrets securely in .env.production
⚠️  Never commit .env.production to version control
```

#### Generate Specific Secret Type

```bash
# JWT secret only
node scripts/generate-secrets.js --type jwt

# Database password only
node scripts/generate-secrets.js --type database

# OAuth secret only
node scripts/generate-secrets.js --type oauth
```

#### Custom Length

```bash
# Generate 128-character JWT secret
node scripts/generate-secrets.js --type jwt --length 128
```

### Adding Secrets to Production Environment

1. Generate secrets using the CLI tool
2. Copy the generated values
3. Add to `.env.production`:

```bash
# JWT Configuration
JWT_SECRET=a7f3c9e2b8d4f1a6c3e9b2d8f4a1c7e3b9d2f8a4c1e7b3d9f2a8c4e1b7d3f9a2
JWT_EXPIRES_IN=7d

# Database Configuration
DATABASE_URL=postgresql://user:K9#mP2$vL8@nQ5!wR3^xT7&yU4*zA6@localhost:5432/wellsense
MONGODB_URI=mongodb://user:K9#mP2$vL8@nQ5!wR3^xT7&yU4*zA6@localhost:27017/wellsense

# OAuth Configuration
GOOGLE_CLIENT_SECRET=b4d8f2a6c1e7b3d9f2a8c4e1b7d3f9a2c8e4b1d7f3a9c2e8b4d1f7a3c9e2b8d4
```

4. Set file permissions:

```bash
chmod 600 .env.production
```

### Weak Pattern Detection

The system automatically detects and rejects weak secrets containing:
- `your-` (e.g., "your-jwt-secret")
- `change-in-production`
- `test-` (e.g., "test-secret-123")
- `example-` (e.g., "example-password")
- `placeholder-`
- Common words like "secret", "password", "admin"

**Example Error**:
```
❌ Configuration validation failed:
  - JWT_SECRET contains weak pattern: "your-"
  - Generate a new secret using: node scripts/generate-secrets.js --type jwt
```

---

## Environment Configuration

### Environment Files

The application uses separate environment files for each deployment environment:

| File | Purpose | NODE_ENV | Committed to Git |
|------|---------|----------|------------------|
| `.env` | Local development | development | Yes (with weak secrets) |
| `.env.test` | Automated testing | test | Yes (with test fixtures) |
| `.env.production` | Production deployment | production | **NO** (contains real secrets) |
| `.env.production.template` | Production template | - | Yes (with placeholders) |

### Environment File Loading

The application automatically loads the correct environment file based on `NODE_ENV`:

```javascript
// Automatic environment file selection
NODE_ENV=production → loads .env.production
NODE_ENV=development → loads .env
NODE_ENV=test → loads .env.test
```

### Development Environment (.env)

Used for local development. Allows weak secrets with warnings.

```bash
NODE_ENV=development
PORT=3000

# CORS - Allow localhost
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellsense_dev
MONGODB_URI=mongodb://localhost:27017/wellsense_dev
REDIS_URL=redis://localhost:6379

# JWT - Weak secret allowed in development
JWT_SECRET=dev-jwt-secret-not-for-production
JWT_EXPIRES_IN=7d

# SSL - Not required in development
ENABLE_HTTPS=false
```

### Test Environment (.env.test)

Used for automated testing. Minimal validation.

```bash
NODE_ENV=test
PORT=3001

# CORS - Permissive for testing
CORS_ORIGIN=*

# Database - Test databases
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellsense_test
MONGODB_URI=mongodb://localhost:27017/wellsense_test
REDIS_URL=redis://localhost:6380

# JWT - Test fixture
JWT_SECRET=test-jwt-secret-for-automated-tests
JWT_EXPIRES_IN=1h

# SSL - Disabled for testing
ENABLE_HTTPS=false
```

### Production Environment (.env.production)

Used for production deployment. Strict validation enforced.

```bash
NODE_ENV=production
PORT=3000

# CORS - Strict whitelist
CORS_ORIGIN=https://app.wellsense.ai,https://www.wellsense.ai

# Database - Strong passwords required
DATABASE_URL=postgresql://wellsense_user:K9#mP2$vL8@nQ5!wR3^xT7&yU4*zA6@db.example.com:5432/wellsense
MONGODB_URI=mongodb://wellsense_user:K9#mP2$vL8@nQ5!wR3^xT7&yU4*zA6@mongo.example.com:27017/wellsense
REDIS_URL=redis://:K9#mP2$vL8@nQ5!wR3^xT7&yU4*zA6@redis.example.com:6379

# JWT - Strong secret required (64+ characters)
JWT_SECRET=a7f3c9e2b8d4f1a6c3e9b2d8f4a1c7e3b9d2f8a4c1e7b3d9f2a8c4e1b7d3f9a2
JWT_EXPIRES_IN=7d

# OAuth - Strong secrets required (48+ characters)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=b4d8f2a6c1e7b3d9f2a8c4e1b7d3f9a2c8e4b1d7f3a9c2e8b4d1f7a3c9e2b8d4
GOOGLE_CALLBACK_URL=https://app.wellsense.ai/auth/google/callback

# OpenAI
OPENAI_API_KEY=sk-your-actual-openai-api-key

# SSL/TLS Configuration
ENABLE_HTTPS=true
HTTPS_PORT=443
HTTP_PORT=80
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

### Creating Production Environment

1. Copy the template:

```bash
cp .env.production.template .env.production
```

2. Generate strong secrets:

```bash
node scripts/generate-secrets.js
```

3. Edit `.env.production` and replace all placeholder values
4. Set restrictive file permissions:

```bash
chmod 600 .env.production
```

5. Verify configuration:

```bash
npm run security:audit
```

### Validation Behavior

#### Production Mode (NODE_ENV=production)

- **Strict validation**: All secrets must meet minimum requirements
- **No weak patterns**: Secrets with placeholders are rejected
- **CORS validation**: Wildcard origins (`*`) are rejected
- **Startup failure**: Application exits if validation fails

**Example**:
```
❌ Configuration validation failed:
  - JWT_SECRET is too short (32 characters, minimum 64 required)
  - CORS_ORIGIN cannot be wildcard (*) in production
  - DATABASE_URL password does not meet complexity requirements

Application will not start. Fix configuration errors and try again.
```

#### Development Mode (NODE_ENV=development)

- **Warning mode**: Weak secrets generate warnings but allow startup
- **Permissive CORS**: Localhost origins automatically allowed
- **Helpful messages**: Suggestions for improving security

**Example**:
```
⚠️  Configuration warnings:
  - JWT_SECRET contains weak pattern: "dev-"
  - Consider using a stronger secret for development
  - Generate with: node scripts/generate-secrets.js --type jwt

✅ Application started in development mode
```

---

## CORS Configuration

### Overview

Cross-Origin Resource Sharing (CORS) controls which domains can make requests to your API. Production environments must use strict whitelisting to prevent unauthorized access.

### CORS Settings by Environment

#### Development

```bash
# Allow localhost for local development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
```

Automatically allows:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`

#### Production

```bash
# Strict whitelist of allowed origins
CORS_ORIGIN=https://app.wellsense.ai,https://www.wellsense.ai
```

Only the explicitly listed origins can make requests.

### Multiple Origins

Separate multiple origins with commas:

```bash
CORS_ORIGIN=https://app.example.com,https://www.example.com,https://admin.example.com
```

### CORS Configuration Details

The CORS middleware is configured with:

- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With
- **Credentials**: Enabled only for allowed origins
- **Preflight Cache**: 600 seconds (10 minutes)

### Testing CORS

#### Test Allowed Origin

```bash
curl -H "Origin: https://app.wellsense.ai" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.wellsense.ai/api/health
```

Expected response headers:
```
Access-Control-Allow-Origin: https://app.wellsense.ai
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
```

#### Test Unauthorized Origin

```bash
curl -H "Origin: https://unauthorized-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.wellsense.ai/api/health
```

Expected: No `Access-Control-Allow-Origin` header (request blocked)

### Common CORS Issues

#### Issue: "Origin not allowed by CORS"

**Cause**: The requesting origin is not in the CORS_ORIGIN whitelist

**Solution**: Add the origin to `.env.production`:

```bash
CORS_ORIGIN=https://app.wellsense.ai,https://new-domain.com
```

#### Issue: "Wildcard not allowed in production"

**Cause**: CORS_ORIGIN is set to `*` in production

**Solution**: Replace wildcard with explicit origins:

```bash
# ❌ Not allowed in production
CORS_ORIGIN=*

# ✅ Use explicit whitelist
CORS_ORIGIN=https://app.wellsense.ai,https://www.wellsense.ai
```

---

## SSL/TLS Configuration

### Overview

HTTPS encrypts data in transit, protecting against interception and man-in-the-middle attacks. Production deployments should always use SSL/TLS.

### SSL Environment Variables

```bash
# Enable HTTPS
ENABLE_HTTPS=true

# Port configuration
HTTPS_PORT=443
HTTP_PORT=80

# Certificate paths
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

### Certificate Setup Options

#### Option 1: Let's Encrypt (Recommended for Production)

Let's Encrypt provides free, automated SSL certificates.

1. Install Certbot:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot

# macOS
brew install certbot
```

2. Obtain certificate:

```bash
sudo certbot certonly --standalone -d api.wellsense.ai
```

3. Configure environment:

```bash
ENABLE_HTTPS=true
SSL_KEY_PATH=/etc/letsencrypt/live/api.wellsense.ai/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/api.wellsense.ai/fullchain.pem
```

4. Set up automatic renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet
```

#### Option 2: Self-Signed Certificate (Development/Staging)

For local testing or staging environments:

1. Generate self-signed certificate:

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/certificate.crt -days 365 -nodes
```

2. Configure environment:

```bash
ENABLE_HTTPS=true
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

3. Accept self-signed certificate in browser (for testing only)

#### Option 3: Commercial CA Certificate

For purchased SSL certificates:

1. Obtain certificate from CA (DigiCert, Comodo, etc.)
2. Download private key and certificate files
3. Upload to server in secure location
4. Configure environment:

```bash
ENABLE_HTTPS=true
SSL_KEY_PATH=/etc/ssl/private/wellsense.key
SSL_CERT_PATH=/etc/ssl/certs/wellsense.crt
```

### HTTP to HTTPS Redirect

When SSL is enabled, the application automatically:
1. Starts HTTPS server on port 443
2. Starts HTTP redirect server on port 80
3. Redirects all HTTP requests to HTTPS (301 Permanent Redirect)

```javascript
// Automatic redirect
http://api.wellsense.ai/api/health
  → 301 Redirect →
https://api.wellsense.ai/api/health
```

### Testing SSL Configuration

#### Test HTTPS Connection

```bash
curl -v https://api.wellsense.ai/api/health
```

Look for:
```
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* Server certificate:
*  subject: CN=api.wellsense.ai
*  issuer: C=US; O=Let's Encrypt; CN=R3
```

#### Test HTTP Redirect

```bash
curl -v http://api.wellsense.ai/api/health
```

Expected:
```
< HTTP/1.1 301 Moved Permanently
< Location: https://api.wellsense.ai/api/health
```

#### Verify Certificate

```bash
openssl s_client -connect api.wellsense.ai:443 -servername api.wellsense.ai
```

### SSL Troubleshooting

#### Issue: "Certificate file not found"

```
Error: ENOENT: no such file or directory, open './ssl/certificate.crt'
```

**Solution**: Verify certificate paths and file permissions:

```bash
ls -la ./ssl/
chmod 644 ./ssl/certificate.crt
chmod 600 ./ssl/private.key
```

#### Issue: "Permission denied reading certificate"

**Solution**: Ensure application has read permissions:

```bash
sudo chown appuser:appuser ./ssl/*
chmod 600 ./ssl/private.key
chmod 644 ./ssl/certificate.crt
```

#### Issue: "Certificate expired"

**Solution**: Renew certificate:

```bash
# Let's Encrypt
sudo certbot renew

# Restart application
pm2 restart god-server
```

### Certificate File Permissions

```bash
# Private key: Read-only for owner
chmod 600 ./ssl/private.key

# Certificate: Read-only for all
chmod 644 ./ssl/certificate.crt

# Directory: Restricted access
chmod 700 ./ssl/
```

---

## Security Audit

### Overview

The security audit tool performs automated pre-deployment validation to catch configuration issues before they reach production.

### Running Security Audit

```bash
npm run security:audit
```

### Audit Checks

The audit performs the following checks:

1. **Weak Secrets**: Scans all environment files for weak patterns and short secrets
2. **CORS Configuration**: Verifies no wildcard CORS in production files
3. **NODE_ENV Validation**: Checks NODE_ENV matches expected value for each file
4. **Gitignore Check**: Ensures .env.production is excluded from version control
5. **SSL Configuration**: Verifies SSL settings for production environment

### Audit Report Example

```
🔒 Security Audit Report
========================
Timestamp: 2024-01-15T10:30:00.000Z
Environment: production

✅ PASSED: Weak Secrets Check
   All secrets meet minimum strength requirements

✅ PASSED: CORS Configuration
   No wildcard CORS detected in production

✅ PASSED: NODE_ENV Validation
   All environment files have correct NODE_ENV

✅ PASSED: Gitignore Check
   .env.production is excluded from version control

⚠️  WARNING: SSL Configuration
   SSL not configured for production (ENABLE_HTTPS=false)
   Recommendation: Enable HTTPS for production deployment

Summary:
--------
Total Checks: 5
Passed: 4
Failed: 0
Warnings: 1

✅ Security audit completed successfully
```

### Exit Codes

- **0**: All checks passed (warnings allowed)
- **1**: One or more critical checks failed
- **2**: Warnings present (non-critical)

### Running Specific Checks

```bash
# Check secrets only
node scripts/security-audit.js --check secrets

# Check CORS only
node scripts/security-audit.js --check cors

# Check gitignore only
node scripts/security-audit.js --check gitignore

# Generate report without running checks
node scripts/security-audit.js --report-only
```

### Integrating into CI/CD

Add to your CI/CD pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Run Security Audit
  run: npm run security:audit
  
- name: Fail on Critical Issues
  run: |
    if [ $? -eq 1 ]; then
      echo "Critical security issues detected"
      exit 1
    fi
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run security:audit
if [ $? -eq 1 ]; then
  echo "❌ Security audit failed. Commit aborted."
  exit 1
fi
```

---

## Troubleshooting

### Application Won't Start in Production

#### Symptom

```
❌ Configuration validation failed:
  - JWT_SECRET is too short (32 characters, minimum 64 required)
```

#### Solution

Generate a new JWT secret:

```bash
node scripts/generate-secrets.js --type jwt
```

Update `.env.production` with the generated secret.

---

### CORS Errors

#### Symptom

```
Access to fetch at 'https://api.wellsense.ai/api/users' from origin 
'https://app.example.com' has been blocked by CORS policy
```

#### Solution

Add the origin to CORS_ORIGIN:

```bash
# .env.production
CORS_ORIGIN=https://app.wellsense.ai,https://app.example.com
```

---

### Weak Secret Detected

#### Symptom

```
⚠️  Configuration warnings:
  - JWT_SECRET contains weak pattern: "test-"
```

#### Solution

Generate a cryptographically strong secret:

```bash
node scripts/generate-secrets.js --type jwt
```

Replace the weak secret in your environment file.

---

### SSL Certificate Issues

#### Symptom

```
Error: ENOENT: no such file or directory, open './ssl/certificate.crt'
```

#### Solution

1. Verify certificate files exist:

```bash
ls -la ./ssl/
```

2. Check file permissions:

```bash
chmod 644 ./ssl/certificate.crt
chmod 600 ./ssl/private.key
```

3. Verify paths in `.env.production`:

```bash
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

---

### Database Connection Failures

#### Symptom

```
Error: password authentication failed for user "wellsense_user"
```

#### Solution

1. Verify database password in `.env.production` matches database user password
2. Ensure password meets complexity requirements (32+ characters)
3. Check for special characters that need URL encoding in DATABASE_URL

```bash
# Special characters in passwords must be URL-encoded
# @ → %40
# # → %23
# $ → %24
```

---

### Environment File Not Loading

#### Symptom

Application uses wrong environment configuration

#### Solution

1. Verify NODE_ENV is set correctly:

```bash
echo $NODE_ENV
```

2. Set NODE_ENV before starting:

```bash
NODE_ENV=production npm start
```

3. Check environment file exists:

```bash
ls -la .env.production
```

---

## Security Best Practices

### Secret Rotation

Regularly rotate secrets to minimize impact of potential compromises:

- **JWT Secrets**: Rotate every 90 days
- **Database Passwords**: Rotate every 180 days
- **OAuth Secrets**: Rotate when compromised or annually
- **API Keys**: Rotate according to provider recommendations

#### Rotation Process

1. Generate new secret:

```bash
node scripts/generate-secrets.js --type jwt
```

2. Update `.env.production` with new secret
3. Deploy updated configuration
4. Monitor for authentication errors
5. Update any external systems using the old secret

### Access Control

Protect production secrets with strict access controls:

```bash
# Set restrictive file permissions
chmod 600 .env.production

# Restrict directory access
chmod 700 /path/to/app/

# Use dedicated service account
chown appuser:appuser .env.production
```

### Secret Storage

**Development/Staging**:
- Store in `.env.production` file with restricted permissions
- Use environment variables in deployment scripts

**Production**:
- Use secret management service (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault)
- Inject secrets at runtime via environment variables
- Never commit secrets to version control

#### AWS Secrets Manager Example

```bash
# Store secret
aws secretsmanager create-secret \
  --name wellsense/production/jwt-secret \
  --secret-string "a7f3c9e2b8d4f1a6c3e9b2d8f4a1c7e3b9d2f8a4c1e7b3d9f2a8c4e1b7d3f9a2"

# Retrieve secret in deployment script
JWT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id wellsense/production/jwt-secret \
  --query SecretString \
  --output text)
```

### Monitoring

Monitor security events to detect potential issues:

- **Failed Authentication Attempts**: Alert on repeated failures
- **CORS Rejections**: Monitor for unauthorized access attempts
- **Weak Secret Detection**: Alert when weak secrets detected
- **SSL Certificate Expiration**: Alert 30 days before expiration
- **Configuration Changes**: Log all environment configuration changes

#### Example Monitoring Setup

```javascript
// Log security events
logger.warn('CORS rejection', {
  origin: req.headers.origin,
  ip: req.ip,
  timestamp: new Date()
});

// Alert on repeated failures
if (failedAuthAttempts > 5) {
  alerting.send('Multiple failed auth attempts detected');
}
```

### Audit Trail

Maintain audit logs for compliance and security analysis:

- Run security audit before each deployment
- Keep audit reports for at least 90 days
- Review security logs weekly
- Document all security incidents
- Track secret rotation history

### Deployment Checklist

Before deploying to production:

- [ ] Generate all production secrets
- [ ] Create `.env.production` with strong secrets
- [ ] Obtain SSL certificates
- [ ] Update CORS_ORIGIN with production domains
- [ ] Run security audit (must pass)
- [ ] Test in staging environment
- [ ] Backup current configuration
- [ ] Set file permissions (chmod 600 .env.production)
- [ ] Verify .env.production not in git
- [ ] Document deployment in change log

After deployment:

- [ ] Verify HTTPS works
- [ ] Test CORS with production domains
- [ ] Check database connections
- [ ] Monitor error rates
- [ ] Run security audit again
- [ ] Verify all endpoints functional

---

## Additional Resources

### Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Step-by-step migration instructions
- [SSL Setup Guide](./SSL_SETUP.md) - Detailed SSL/TLS configuration
- [API Documentation](./API_DOCUMENTATION.md) - API security requirements

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web application security risks
- [Let's Encrypt](https://letsencrypt.org/) - Free SSL certificates
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/) - Password security standards
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/) - SSL/TLS best practices

### Support

For security issues or questions:
- Review this guide and troubleshooting section
- Check application logs for detailed error messages
- Run security audit for automated diagnostics
- Consult team security documentation

---

## Conclusion

This security hardening implementation provides comprehensive protection for the WellSense AI production application. By following this guide, you can:

- Generate cryptographically strong secrets
- Configure environment-specific settings
- Implement strict CORS policies
- Enable SSL/TLS encryption
- Perform automated security audits
- Troubleshoot common issues
- Follow security best practices

Regular security audits, secret rotation, and monitoring are essential for maintaining a secure production environment. Always test configuration changes in staging before deploying to production.
