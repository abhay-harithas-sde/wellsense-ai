# Migration Guide: Security Hardening

This guide provides step-by-step instructions for migrating from the current configuration to the hardened security configuration.

## Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Phases](#migration-phases)
4. [Post-Migration Verification](#post-migration-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Common Issues](#common-issues)

## Overview

This migration introduces:
- Strong cryptographic secrets
- Environment-specific configuration files
- Strict CORS policies for production
- SSL/HTTPS support
- Automated security validation

**Estimated Time:** 2-4 hours  
**Downtime Required:** Minimal (< 5 minutes for production deployment)  
**Risk Level:** Low (backward compatible with existing development workflows)

## Pre-Migration Checklist

Before starting the migration, ensure you have:

- [ ] Backup of current `.env` file
- [ ] Access to production server
- [ ] Database credentials
- [ ] OAuth provider credentials (Google, Microsoft)
- [ ] OpenAI API key
- [ ] SSL certificates (if enabling HTTPS)
- [ ] List of production domains for CORS
- [ ] Tested in staging environment
- [ ] Scheduled maintenance window (if needed)
- [ ] Rollback plan ready

## Migration Phases

### Phase 1: Preparation (No Breaking Changes)

**Duration:** 30-60 minutes  
**Impact:** None (development continues normally)

#### Step 1.1: Backup Current Configuration

```bash
# Backup current .env file
cp .env .env.backup

# Backup current god-server.js (if modified)
cp god-server.js god-server.js.backup
```

#### Step 1.2: Verify Security Components

Check that all security components are in place:

```bash
# Verify security components exist
ls -la lib/security/

# Expected files:
# - secret-manager.js
# - environment-validator.js
# - cors-configurator.js
# - ssl-manager.js
```

#### Step 1.3: Verify Scripts

Check that security scripts are available:

```bash
# Verify scripts exist
ls -la scripts/generate-secrets.js
ls -la scripts/security-audit.js

# Test secret generation
node scripts/generate-secrets.js --help

# Test security audit
node scripts/security-audit.js --help
```

#### Step 1.4: Update .gitignore

Ensure production files are ignored:

```bash
# Verify .gitignore includes:
# .env.production
# docker/.env.docker.production

cat .gitignore | grep -E "\.env\.production|\.env\.docker\.production"
```

### Phase 2: Development Environment (Non-Breaking)

**Duration:** 30-45 minutes  
**Impact:** None (existing .env continues to work)

#### Step 2.1: Update Development .env

Ensure NODE_ENV is set in `.env`:

```bash
# Add or verify NODE_ENV in .env
echo "NODE_ENV=development" >> .env
```

#### Step 2.2: Test Development Mode

Start the server and verify it works:

```bash
# Start server
npm start

# Check health endpoint
curl http://localhost:3000/api/health

# Verify environment validation logs
# Should see: "✅ Configuration validation passed"
```

#### Step 2.3: Review Warnings

Check for any security warnings in development:

```bash
# Look for warnings in server output
# Example: "⚠️  Configuration warnings:"
# These are non-blocking in development
```

### Phase 3: Production Configuration

**Duration:** 45-60 minutes  
**Impact:** None until deployment

#### Step 3.1: Generate Production Secrets

Generate all required secrets:

```bash
# Generate all secrets
node scripts/generate-secrets.js

# Save the output securely (password manager, vault)
```

Example output:
```
================================================================================
JWT Secret:
================================================================================

a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

Length:  64 characters
Entropy: 256.00 bits
================================================================================
```

#### Step 3.2: Create Production Environment File

```bash
# Copy template
cp .env.production.template .env.production

# Edit .env.production
nano .env.production  # or your preferred editor
```

Update the following in `.env.production`:

1. **NODE_ENV:**
```bash
NODE_ENV=production
```

2. **CORS_ORIGIN:**
```bash
CORS_ORIGIN=https://app.yourdomain.com,https://www.yourdomain.com
```

3. **Database URLs:**
```bash
DATABASE_URL="postgresql://postgres:STRONG_PASSWORD@your-db-host:5432/wellsense_ai"
MONGODB_URI="mongodb://admin:STRONG_PASSWORD@your-mongo-host:27017/wellsense_ai?authSource=admin"
REDIS_URL="redis://your-redis-host:6379"
```

4. **JWT Secret:**
```bash
JWT_SECRET=<generated-jwt-secret-from-step-3.1>
```

5. **OAuth Secrets:**
```bash
GOOGLE_CLIENT_SECRET=<generated-oauth-secret-from-step-3.1>
```

6. **SSL Configuration (if enabling HTTPS):**
```bash
ENABLE_HTTPS=true
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

#### Step 3.3: Secure Production File

Set restrictive permissions:

```bash
# Set file permissions (Unix/Linux/Mac)
chmod 600 .env.production

# Verify permissions
ls -la .env.production
# Should show: -rw------- (owner read/write only)
```

#### Step 3.4: Run Security Audit

Validate the production configuration:

```bash
# Run full security audit
npm run security:audit

# Expected output:
# ✅ All security checks passed!
```

If the audit fails:
1. Review the error messages
2. Fix the issues
3. Run the audit again

### Phase 4: SSL/HTTPS Setup (Optional but Recommended)

**Duration:** 30-60 minutes  
**Impact:** None until enabled

See [SSL_SETUP.md](./SSL_SETUP.md) for detailed instructions.

Quick steps:

1. **Obtain SSL certificates:**
```bash
# Using Let's Encrypt (recommended)
sudo certbot certonly --standalone -d yourdomain.com
```

2. **Copy certificates:**
```bash
# Create ssl directory
mkdir -p ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/private.key
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/certificate.crt

# Set permissions
chmod 600 ssl/private.key
chmod 644 ssl/certificate.crt
```

3. **Update .env.production:**
```bash
ENABLE_HTTPS=true
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

### Phase 5: Staging Deployment

**Duration:** 30-45 minutes  
**Impact:** Staging environment only

#### Step 5.1: Deploy to Staging

```bash
# Copy .env.production to staging server
scp .env.production user@staging-server:/path/to/app/

# Copy SSL certificates (if using HTTPS)
scp -r ssl/ user@staging-server:/path/to/app/

# SSH to staging server
ssh user@staging-server

# Navigate to app directory
cd /path/to/app

# Set NODE_ENV
export NODE_ENV=production

# Start server
npm run start:production
```

#### Step 5.2: Verify Staging

Test all functionality:

```bash
# Health check
curl https://staging.yourdomain.com/api/health

# Test authentication
# Test API endpoints
# Test CORS from allowed origins
# Test CORS rejection from unauthorized origins
```

#### Step 5.3: Monitor Logs

Watch for any errors or warnings:

```bash
# View server logs
tail -f logs/app.log

# Look for:
# - ✅ Configuration validation passed
# - 🔒 CORS: Production mode - X origin(s) whitelisted
# - ✅ GOD Server Started Successfully
```

### Phase 6: Production Deployment

**Duration:** 15-30 minutes  
**Downtime:** < 5 minutes

#### Step 6.1: Pre-Deployment Checklist

- [ ] Staging tests passed
- [ ] Security audit passed
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Maintenance window scheduled (if needed)

#### Step 6.2: Deploy to Production

```bash
# Copy .env.production to production server
scp .env.production user@production-server:/path/to/app/

# Copy SSL certificates (if using HTTPS)
scp -r ssl/ user@production-server:/path/to/app/

# SSH to production server
ssh user@production-server

# Navigate to app directory
cd /path/to/app

# Backup current configuration
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Set NODE_ENV
export NODE_ENV=production

# Stop current server
pm2 stop god-server  # or your process manager

# Start with new configuration
pm2 start god-server.js --name god-server --env production

# Or using npm
npm run start:production
```

#### Step 6.3: Verify Production

```bash
# Health check
curl https://yourdomain.com/api/health

# Check server logs
pm2 logs god-server

# Verify HTTPS redirect (if enabled)
curl -I http://yourdomain.com
# Should return: 301 Moved Permanently
# Location: https://yourdomain.com
```

#### Step 6.4: Monitor

Monitor for 30-60 minutes:

```bash
# Watch logs
pm2 logs god-server --lines 100

# Monitor error rates
# Monitor response times
# Check database connections
# Verify authentication works
```

## Post-Migration Verification

### Verification Checklist

- [ ] Server starts successfully
- [ ] Health endpoint responds
- [ ] HTTPS works (if enabled)
- [ ] HTTP redirects to HTTPS (if enabled)
- [ ] Authentication works
- [ ] Database connections work
- [ ] CORS allows authorized origins
- [ ] CORS blocks unauthorized origins
- [ ] Error responses are sanitized (no stack traces)
- [ ] All API endpoints work
- [ ] No security warnings in logs

### Test CORS

```bash
# Test allowed origin (should succeed)
curl -H "Origin: https://app.yourdomain.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://yourdomain.com/api/health

# Test unauthorized origin (should fail)
curl -H "Origin: https://unauthorized.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://yourdomain.com/api/health
```

### Test Error Handling

```bash
# Trigger an error and verify response is sanitized
curl https://yourdomain.com/api/nonexistent

# Should return generic error without stack trace
```

### Run Security Audit

```bash
# Run audit on production server
npm run security:audit

# Should pass all checks
```

## Rollback Procedures

If issues occur, follow these rollback steps:

### Quick Rollback (< 2 minutes)

```bash
# SSH to server
ssh user@production-server

# Stop current server
pm2 stop god-server

# Restore backup
cp .env.backup.YYYYMMDD_HHMMSS .env

# Restart server
pm2 start god-server

# Verify
curl http://localhost:3000/api/health
```

### Gradual Rollback

If you need to rollback specific features:

1. **Disable SSL:**
```bash
# In .env.production
ENABLE_HTTPS=false
```

2. **Relax CORS temporarily:**
```bash
# In .env.production (emergency only!)
NODE_ENV=development
```

3. **Keep secret validation:**
```bash
# Don't rollback secret validation
# Fix weak secrets instead
```

### Complete Rollback

```bash
# Restore original files
cp god-server.js.backup god-server.js
cp .env.backup .env

# Restart server
pm2 restart god-server

# Verify
curl http://localhost:3000/api/health
```

## Common Issues

### Issue: Server Won't Start

**Symptom:** Server exits immediately after start

**Diagnosis:**
```bash
# Check logs
pm2 logs god-server --lines 50

# Look for validation errors
```

**Solution:**
```bash
# Run security audit to identify issues
npm run security:audit

# Fix identified issues
# Regenerate weak secrets if needed
node scripts/generate-secrets.js
```

### Issue: CORS Errors

**Symptom:** Frontend can't connect to API

**Diagnosis:**
```bash
# Check CORS configuration
grep CORS_ORIGIN .env.production

# Check server logs for CORS rejections
pm2 logs god-server | grep CORS
```

**Solution:**
```bash
# Add missing origin to CORS_ORIGIN
CORS_ORIGIN=https://app.yourdomain.com,https://www.yourdomain.com

# Restart server
pm2 restart god-server
```

### Issue: SSL Certificate Errors

**Symptom:** HTTPS not working, certificate errors

**Diagnosis:**
```bash
# Check certificate files
ls -la ssl/

# Verify certificate validity
openssl x509 -in ssl/certificate.crt -text -noout
```

**Solution:**
```bash
# Renew certificate
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/private.key
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/certificate.crt

# Restart server
pm2 restart god-server
```

### Issue: Database Connection Fails

**Symptom:** Can't connect to database

**Diagnosis:**
```bash
# Test database connection
psql -h your-db-host -U postgres -d wellsense_ai

# Check DATABASE_URL format
echo $DATABASE_URL
```

**Solution:**
```bash
# Verify password is URL-encoded
# Special characters must be encoded:
# @ = %40
# # = %23
# $ = %24

# Example:
# Password: Pass@123
# Encoded: Pass%40123

# Update DATABASE_URL with encoded password
```

## Support

If you encounter issues during migration:

1. Check this guide's troubleshooting section
2. Review server logs
3. Run security audit
4. Check [SECURITY_HARDENING.md](./SECURITY_HARDENING.md)
5. Contact the development team

**Remember:** Never share production secrets when seeking support!

## Next Steps

After successful migration:

1. **Monitor:** Watch logs and metrics for 24-48 hours
2. **Document:** Update runbooks with new procedures
3. **Train:** Ensure team knows new security practices
4. **Schedule:** Plan secret rotation (90-180 days)
5. **Review:** Conduct security review in 30 days

## Additional Resources

- [Security Hardening Guide](./SECURITY_HARDENING.md)
- [SSL Setup Guide](./SSL_SETUP.md)
- [API Documentation](./API_DOCUMENTATION.md)
