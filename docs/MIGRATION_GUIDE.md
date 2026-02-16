# Production Security Hardening Migration Guide

## Overview

This guide provides step-by-step instructions for migrating your WellSense AI application from the current configuration to a hardened production-ready security configuration. The migration is designed to be performed in phases, allowing you to test each component before proceeding to the next.

**Migration Time**: Approximately 2-4 hours

**Downtime Required**: Minimal (can be done during maintenance window)

**Rollback Time**: 5-10 minutes

---

## Pre-Migration Checklist

Before starting the migration, ensure you have:

- [ ] **Backup current configuration**
  - Copy current `.env` file to `.env.backup`
  - Backup database credentials
  - Document current CORS settings
  
- [ ] **Access to production server**
  - SSH access with appropriate permissions
  - Ability to restart application services
  - Access to modify environment files

- [ ] **SSL Certificate ready** (if enabling HTTPS)
  - Domain name configured
  - SSL certificate and private key files
  - Or ability to generate Let's Encrypt certificate

- [ ] **Staging environment available**
  - Test environment that mirrors production
  - Ability to test changes before production deployment

- [ ] **Team notification**
  - Notify team of planned maintenance window
  - Have rollback plan ready
  - Designate person responsible for monitoring


---

## Migration Overview

The migration is divided into 4 phases:

1. **Phase 1: Preparation** - Install security components and generate secrets (No breaking changes)
2. **Phase 2: Environment Configuration** - Set up production environment files
3. **Phase 3: Security Enforcement** - Enable strict validation and CORS restrictions
4. **Phase 4: SSL/HTTPS** - Enable HTTPS with SSL certificates (Optional but recommended)

Each phase includes testing steps to verify everything works before proceeding.

---

## Phase 1: Preparation (No Breaking Changes)

### Step 1.1: Update Codebase

Pull the latest code with security hardening components:

```bash
# Pull latest changes
git pull origin main

# Install dependencies (if any new ones added)
npm install
```

### Step 1.2: Verify Security Components

Ensure all security components are present:

```bash
# Check for security components
ls -la lib/security/

# Expected files:
# - secret-manager.js
# - environment-validator.js
# - cors-configurator.js
# - ssl-manager.js
```

### Step 1.3: Generate Production Secrets

Generate strong cryptographic secrets for production:

```bash
# Generate all secrets at once
node scripts/generate-secrets.js

# Or generate specific secrets
node scripts/generate-secrets.js --type jwt
node scripts/generate-secrets.js --type database
node scripts/generate-secrets.js --type oauth
```

**Save the generated secrets securely!** You'll need them in the next phase.

Example output:
```
🔐 Generated JWT Secret (64 characters):
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

🔐 Generated Database Password (32 characters):
Xk9#mP2$vL8@nQ5!wR3&tY7*uI1^sO6%

🔐 Generated OAuth Client Secret (48 characters):
ZmFzdC1jaGVjay1wcm9wZXJ0eS1iYXNlZC10ZXN0aW5nLXNlY3JldA==
```


### Step 1.4: Run Security Audit (Baseline)

Run the security audit to see current security status:

```bash
npm run security:audit
```

This will show warnings about weak secrets and configuration issues. This is expected - we'll fix these in the next phases.

### Step 1.5: Test in Development

Verify the application still works with the new security components:

```bash
# Start in development mode
npm run dev

# Application should start with warnings about weak secrets
# This is expected behavior in development mode
```

**Expected output:**
```
⚠️  Configuration warnings:
  - JWT_SECRET contains weak pattern: "your-"
  - Database password is too short (minimum 32 characters)
  
✅ Server started on port 3000
```

### Phase 1 Testing Checklist

- [ ] Security components are present in `lib/security/`
- [ ] Secret generation script works and produces strong secrets
- [ ] Security audit runs and produces a report
- [ ] Application starts in development mode with warnings
- [ ] All existing functionality works (authentication, database, API)

**If any test fails, stop and investigate before proceeding to Phase 2.**

---

## Phase 2: Environment Configuration

### Step 2.1: Create Production Environment File

Create a new `.env.production` file based on the template:

```bash
# Copy the template
cp .env.production.template .env.production

# Edit the file with your production values
nano .env.production
```

### Step 2.2: Configure Production Environment Variables

Update `.env.production` with the secrets you generated in Phase 1:

```bash
# Core Settings
NODE_ENV=production
PORT=3000

# CORS Configuration (update with your production domains)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# JWT Configuration (use generated secret from Step 1.3)
JWT_SECRET=<paste-your-generated-jwt-secret-here>
JWT_EXPIRES_IN=7d

# Database Configuration (use generated password from Step 1.3)
DATABASE_URL=postgresql://username:<strong-password>@localhost:5432/wellsense
MONGODB_URI=mongodb://username:<strong-password>@localhost:27017/wellsense
REDIS_URL=redis://localhost:6379

# OAuth Configuration (use generated secret from Step 1.3)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=<paste-your-generated-oauth-secret-here>
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# SSL Configuration (we'll enable this in Phase 4)
ENABLE_HTTPS=false
```

**Important Notes:**
- Replace ALL placeholder values with real production values
- Use the strong secrets generated in Step 1.3
- Update CORS_ORIGIN with your actual production domains
- Do NOT use wildcards (*) in CORS_ORIGIN
- Keep ENABLE_HTTPS=false for now (we'll enable in Phase 4)


### Step 2.3: Update Database Passwords

Update your database passwords to use the strong passwords generated in Step 1.3:

**PostgreSQL:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Update password
ALTER USER your_username WITH PASSWORD 'your-strong-generated-password';
```

**MongoDB:**
```bash
# Connect to MongoDB
mongosh

# Switch to admin database
use admin

# Update password
db.updateUser("your_username", {pwd: "your-strong-generated-password"})
```

### Step 2.4: Secure File Permissions

Set appropriate permissions on the production environment file:

```bash
# Restrict access to owner only
chmod 600 .env.production

# Verify permissions
ls -la .env.production
# Should show: -rw------- (600)
```

### Step 2.5: Verify .gitignore

Ensure `.env.production` is NOT tracked by git:

```bash
# Check if .env.production is in .gitignore
grep ".env.production" .gitignore

# Verify it's not tracked
git status
# .env.production should NOT appear in the list
```

### Step 2.6: Test Production Configuration (Staging)

Test the production configuration in your staging environment:

```bash
# Set NODE_ENV to production
export NODE_ENV=production

# Start the application
npm start

# Application should start without warnings
```

**Expected output:**
```
✅ Configuration validation passed
✅ All secrets meet security requirements
✅ CORS configured for production domains
✅ Server started on port 3000
```

**If you see errors:**
- Check that all secrets meet minimum length requirements
- Verify no placeholder values remain in .env.production
- Ensure CORS_ORIGIN doesn't contain wildcards

### Phase 2 Testing Checklist

- [ ] `.env.production` file created with strong secrets
- [ ] All placeholder values replaced with real production values
- [ ] Database passwords updated to strong passwords
- [ ] File permissions set to 600 on `.env.production`
- [ ] `.env.production` is in `.gitignore` and not tracked by git
- [ ] Application starts successfully in staging with NODE_ENV=production
- [ ] No validation errors or warnings
- [ ] Database connections work with new passwords
- [ ] Authentication works with new JWT secret

**If any test fails, stop and fix the issue before proceeding to Phase 3.**


---

## Phase 3: Security Enforcement

### Step 3.1: Update CORS Configuration

Update your production CORS settings to restrict origins:

**In `.env.production`:**
```bash
# Replace with your actual production domains
CORS_ORIGIN=https://app.yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com
```

**Important:**
- List ALL domains that need to access your API
- Use HTTPS URLs only (not HTTP)
- Separate multiple domains with commas (no spaces)
- Do NOT use wildcards (*)

### Step 3.2: Test CORS Configuration

Test that CORS works correctly:

**Test 1: Allowed Origin (Should Succeed)**
```bash
curl -H "Origin: https://app.yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3000/api/health

# Expected: 200 OK with CORS headers
```

**Test 2: Unauthorized Origin (Should Fail)**
```bash
curl -H "Origin: https://unauthorized-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3000/api/health

# Expected: No CORS headers or 403 Forbidden
```

### Step 3.3: Run Security Audit

Run the security audit to verify all security measures are in place:

```bash
npm run security:audit
```

**Expected output:**
```
🔍 Running Security Audit...

✅ Weak Secrets Check: PASSED
✅ CORS Configuration: PASSED
✅ NODE_ENV Setting: PASSED
✅ .gitignore Check: PASSED
✅ SSL Configuration: WARNING (SSL not enabled)

Summary: 4 passed, 0 failed, 1 warning
```

The SSL warning is expected if you haven't enabled HTTPS yet (Phase 4).

### Step 3.4: Test API Endpoints

Test critical API endpoints to ensure they work with the new configuration:

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test authentication (if applicable)
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass"}'

# Test protected endpoint with JWT
curl http://localhost:3000/api/user/profile \
     -H "Authorization: Bearer <your-jwt-token>"
```

### Phase 3 Testing Checklist

- [ ] CORS_ORIGIN configured with production domains only
- [ ] Allowed origins can access the API
- [ ] Unauthorized origins are rejected
- [ ] Security audit passes (except SSL warning)
- [ ] All API endpoints work correctly
- [ ] Authentication works with new JWT secret
- [ ] Database queries work with new passwords
- [ ] No errors in application logs

**If any test fails, stop and fix the issue before proceeding to Phase 4.**


---

## Phase 4: SSL/HTTPS (Optional but Recommended)

### Step 4.1: Obtain SSL Certificate

Choose one of the following methods to obtain an SSL certificate:

**Option A: Let's Encrypt (Recommended for Production)**

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate for your domain
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Option B: Self-Signed Certificate (For Testing/Staging)**

```bash
# Create ssl directory
mkdir -p ssl

# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/certificate.crt -days 365 -nodes

# Follow prompts to enter certificate information
```

**Option C: Commercial Certificate**

If you purchased a certificate from a CA (Certificate Authority):
1. Download the certificate files from your CA
2. Place them in a secure location (e.g., `/etc/ssl/certs/`)

### Step 4.2: Configure SSL in Environment

Update `.env.production` to enable HTTPS:

```bash
# SSL Configuration
ENABLE_HTTPS=true
HTTPS_PORT=443
HTTP_PORT=80
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

**For self-signed certificates:**
```bash
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

### Step 4.3: Set Certificate Permissions

Ensure the application can read the certificate files:

```bash
# For Let's Encrypt certificates
sudo chmod 644 /etc/letsencrypt/live/yourdomain.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/yourdomain.com/privkey.pem

# For self-signed certificates
chmod 644 ssl/certificate.crt
chmod 600 ssl/private.key
```

### Step 4.4: Update Firewall Rules

Allow HTTPS traffic through your firewall:

```bash
# UFW (Ubuntu)
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
```

### Step 4.5: Start Application with HTTPS

Start the application with HTTPS enabled:

```bash
# Set NODE_ENV to production
export NODE_ENV=production

# Start application (may need sudo for port 443)
sudo npm start

# Or use PM2
sudo pm2 start god-server.js --name wellsense-api
```

**Expected output:**
```
✅ Configuration validation passed
✅ SSL certificates loaded successfully
✅ HTTPS server started on port 443
✅ HTTP redirect server started on port 80
```


### Step 4.6: Test HTTPS

Test that HTTPS is working correctly:

**Test 1: HTTPS Access**
```bash
curl https://yourdomain.com/api/health

# Expected: 200 OK with response data
```

**Test 2: HTTP Redirect**
```bash
curl -I http://yourdomain.com/api/health

# Expected: 301 Moved Permanently
# Location: https://yourdomain.com/api/health
```

**Test 3: Browser Test**
- Open `https://yourdomain.com` in a browser
- Check for the padlock icon in the address bar
- Verify certificate details (click on padlock)

### Step 4.7: Update OAuth Callback URLs

If using OAuth, update callback URLs to use HTTPS:

**Google OAuth Console:**
1. Go to Google Cloud Console
2. Navigate to APIs & Services > Credentials
3. Update Authorized redirect URIs to use `https://`
4. Update `.env.production` with new callback URL:
   ```bash
   GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
   ```

### Step 4.8: Update CORS Origins to HTTPS

Update CORS configuration to use HTTPS URLs:

```bash
# In .env.production
CORS_ORIGIN=https://app.yourdomain.com,https://www.yourdomain.com
```

Restart the application after updating CORS.

### Phase 4 Testing Checklist

- [ ] SSL certificate obtained and installed
- [ ] Certificate files have correct permissions
- [ ] HTTPS server starts successfully on port 443
- [ ] HTTP requests redirect to HTTPS (port 80 → 443)
- [ ] HTTPS endpoints are accessible
- [ ] Browser shows valid SSL certificate (padlock icon)
- [ ] OAuth callback URLs updated to HTTPS
- [ ] CORS origins updated to HTTPS
- [ ] Security audit passes all checks (including SSL)

**If any test fails, see the Troubleshooting section below.**

---

## Post-Migration Verification

After completing all phases, perform these final verification steps:

### Verification Checklist

- [ ] **Application Health**
  - Application starts without errors
  - All services (database, Redis, MongoDB) connected
  - No errors in application logs

- [ ] **Security Validation**
  - Security audit passes all checks
  - No weak secrets detected
  - CORS restricted to production domains
  - HTTPS enabled (if Phase 4 completed)

- [ ] **Functionality Testing**
  - User authentication works
  - API endpoints respond correctly
  - Database operations work
  - File uploads/downloads work (if applicable)
  - OAuth login works (if applicable)

- [ ] **Performance Check**
  - Response times are acceptable
  - No significant performance degradation
  - Memory usage is normal

- [ ] **Monitoring**
  - Application logs are being captured
  - Error tracking is working
  - Uptime monitoring is active

### Run Final Security Audit

```bash
npm run security:audit
```

**Expected output:**
```
🔍 Running Security Audit...

✅ Weak Secrets Check: PASSED
✅ CORS Configuration: PASSED
✅ NODE_ENV Setting: PASSED
✅ .gitignore Check: PASSED
✅ SSL Configuration: PASSED

Summary: 5 passed, 0 failed, 0 warnings

🎉 All security checks passed!
```


---

## Rollback Procedures

If you encounter critical issues during or after migration, follow these rollback procedures:

### Immediate Rollback (Emergency)

If the application is down or experiencing critical issues:

**Step 1: Restore Previous Configuration**
```bash
# Stop the application
pm2 stop wellsense-api
# or
sudo systemctl stop wellsense-api

# Restore backup environment file
cp .env.backup .env

# Restore previous database passwords (if changed)
# Use your database backup/restore procedures
```

**Step 2: Restart with Previous Configuration**
```bash
# Set NODE_ENV to development (bypasses strict validation)
export NODE_ENV=development

# Start application
npm start
# or
pm2 start god-server.js
```

**Step 3: Verify Application is Running**
```bash
curl http://localhost:3000/api/health
```

### Gradual Rollback (Controlled)

If you want to rollback specific components while keeping others:

**Rollback SSL/HTTPS Only:**
```bash
# In .env.production
ENABLE_HTTPS=false

# Restart application
pm2 restart wellsense-api
```

**Rollback CORS Restrictions:**
```bash
# In .env.production (temporary - not recommended for production)
CORS_ORIGIN=*

# Restart application
pm2 restart wellsense-api
```

**Rollback to Development Mode:**
```bash
# Change NODE_ENV
export NODE_ENV=development

# This will:
# - Disable strict secret validation
# - Allow permissive CORS
# - Show detailed error messages

# Restart application
pm2 restart wellsense-api
```

### Post-Rollback Actions

After rolling back:

1. **Document the Issue**
   - What went wrong?
   - What error messages appeared?
   - What was the impact?

2. **Investigate Root Cause**
   - Check application logs
   - Review configuration files
   - Test in staging environment

3. **Plan Remediation**
   - Fix the identified issues
   - Test fixes in staging
   - Schedule new migration attempt

4. **Notify Team**
   - Inform team of rollback
   - Share findings and next steps
   - Update documentation if needed


---

## Common Issues and Solutions

### Issue 1: Application Won't Start - "JWT_SECRET is too short"

**Error Message:**
```
❌ Configuration validation failed:
  - JWT_SECRET is too short (minimum 64 characters required)
```

**Solution:**
```bash
# Generate a new JWT secret
node scripts/generate-secrets.js --type jwt

# Copy the generated secret to .env.production
# Ensure it's at least 64 characters long
```

### Issue 2: CORS Errors - "Origin not allowed"

**Error Message:**
```
Access to fetch at 'https://api.yourdomain.com' from origin 'https://app.yourdomain.com' 
has been blocked by CORS policy
```

**Solution:**
```bash
# Add the origin to CORS_ORIGIN in .env.production
CORS_ORIGIN=https://app.yourdomain.com,https://www.yourdomain.com

# Restart the application
pm2 restart wellsense-api
```

**Common Mistakes:**
- Forgetting to include `https://` protocol
- Adding spaces between domains (use commas only)
- Using HTTP instead of HTTPS
- Using wildcard (*) in production

### Issue 3: Database Connection Failed

**Error Message:**
```
Error: password authentication failed for user "username"
```

**Solution:**
```bash
# Verify the password in .env.production matches the database
# Update database password:

# PostgreSQL
psql -U postgres
ALTER USER your_username WITH PASSWORD 'your-strong-password';

# MongoDB
mongosh
use admin
db.updateUser("your_username", {pwd: "your-strong-password"})

# Restart application
pm2 restart wellsense-api
```

### Issue 4: SSL Certificate Not Found

**Error Message:**
```
Error: ENOENT: no such file or directory, open '/path/to/certificate.crt'
```

**Solution:**
```bash
# Verify certificate paths
ls -la /etc/letsencrypt/live/yourdomain.com/

# Check file permissions
sudo chmod 644 /etc/letsencrypt/live/yourdomain.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Update paths in .env.production
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Issue 5: Permission Denied on Port 443

**Error Message:**
```
Error: listen EACCES: permission denied 0.0.0.0:443
```

**Solution:**
```bash
# Option 1: Run with sudo (not recommended for production)
sudo npm start

# Option 2: Use PM2 with sudo
sudo pm2 start god-server.js --name wellsense-api

# Option 3: Use authbind (recommended)
sudo apt-get install authbind
sudo touch /etc/authbind/byport/443
sudo chmod 500 /etc/authbind/byport/443
sudo chown your-user /etc/authbind/byport/443

# Start with authbind
authbind --deep npm start
```

### Issue 6: OAuth Callback Fails After HTTPS

**Error Message:**
```
redirect_uri_mismatch
```

**Solution:**
```bash
# Update OAuth provider settings:
# 1. Go to OAuth provider console (Google, GitHub, etc.)
# 2. Update Authorized redirect URIs to use HTTPS
# 3. Update .env.production:

GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Restart application
pm2 restart wellsense-api
```

### Issue 7: Security Audit Fails - "Weak pattern detected"

**Error Message:**
```
❌ Weak Secrets Check: FAILED
  - JWT_SECRET contains weak pattern: "your-"
```

**Solution:**
```bash
# Generate a new secret without weak patterns
node scripts/generate-secrets.js --type jwt

# Replace the secret in .env.production
# Ensure it doesn't contain: "your-", "test-", "change-in-production", etc.
```

### Issue 8: Mixed Content Warnings in Browser

**Error Message:**
```
Mixed Content: The page at 'https://yourdomain.com' was loaded over HTTPS, 
but requested an insecure resource 'http://api.yourdomain.com'
```

**Solution:**
```bash
# Update all API URLs in frontend to use HTTPS
# Update CORS_ORIGIN to use HTTPS
CORS_ORIGIN=https://app.yourdomain.com

# Ensure all internal API calls use HTTPS
# Check frontend configuration files
```

### Issue 9: Certificate Expired

**Error Message:**
```
Error: certificate has expired
```

**Solution:**
```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Restart application
pm2 restart wellsense-api

# Set up automatic renewal (if not already done)
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet && pm2 restart wellsense-api
```

### Issue 10: High Memory Usage After Migration

**Symptoms:**
- Application using more memory than before
- Slow response times

**Solution:**
```bash
# Check memory usage
pm2 monit

# If memory is high, check for:
# 1. Memory leaks in new security components
# 2. Too many concurrent connections
# 3. Large SSL certificate chains

# Restart application to clear memory
pm2 restart wellsense-api

# Monitor for recurring issues
pm2 logs wellsense-api
```


---

## Testing Instructions by Phase

### Phase 1 Testing

**Test 1: Secret Generation**
```bash
# Generate secrets
node scripts/generate-secrets.js

# Verify output:
# - JWT secret is 64+ characters
# - Database password is 32+ characters with mixed types
# - OAuth secret is 48+ characters
```

**Test 2: Development Mode Still Works**
```bash
# Start in development
npm run dev

# Expected: Warnings about weak secrets, but application starts
# Test: Make API request to verify functionality
curl http://localhost:3000/api/health
```

**Test 3: Security Audit Runs**
```bash
npm run security:audit

# Expected: Report showing current security status
# May show failures - this is expected before migration
```

### Phase 2 Testing

**Test 1: Production Config Validation**
```bash
export NODE_ENV=production
npm start

# Expected: Application starts without errors
# No warnings about weak secrets
```

**Test 2: Database Connections**
```bash
# Test PostgreSQL connection
psql -U your_username -d wellsense -h localhost

# Test MongoDB connection
mongosh --username your_username --password --authenticationDatabase admin

# Test Redis connection
redis-cli ping
```

**Test 3: Authentication Flow**
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Expected: JWT token returned
# Verify token works with protected endpoints
```

### Phase 3 Testing

**Test 1: CORS Allowed Origin**
```bash
# Test with allowed origin
curl -H "Origin: https://app.yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3000/api/health

# Expected: 200 OK with Access-Control-Allow-Origin header
```

**Test 2: CORS Blocked Origin**
```bash
# Test with unauthorized origin
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3000/api/health

# Expected: No CORS headers or 403 Forbidden
```

**Test 3: Security Audit Passes**
```bash
npm run security:audit

# Expected: All checks pass except SSL (if not enabled yet)
```

### Phase 4 Testing

**Test 1: HTTPS Access**
```bash
# Test HTTPS endpoint
curl https://yourdomain.com/api/health

# Expected: 200 OK with response data
```

**Test 2: HTTP to HTTPS Redirect**
```bash
# Test redirect
curl -I http://yourdomain.com/api/health

# Expected: 301 Moved Permanently
# Location header points to HTTPS URL
```

**Test 3: Certificate Validation**
```bash
# Check certificate details
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Verify:
# - Certificate is valid
# - Not expired
# - Matches domain name
```

**Test 4: Browser Testing**
- Open https://yourdomain.com in browser
- Check for padlock icon (secure connection)
- Click padlock to view certificate details
- Verify no mixed content warnings

**Test 5: OAuth with HTTPS**
```bash
# Test OAuth login flow
# 1. Navigate to login page
# 2. Click "Login with Google" (or other provider)
# 3. Complete OAuth flow
# 4. Verify successful redirect and authentication
```


---

## Production Deployment Checklist

Use this checklist when deploying to production:

### Pre-Deployment

- [ ] **Backup Everything**
  - [ ] Current `.env` file backed up
  - [ ] Database backed up
  - [ ] Application code backed up
  - [ ] SSL certificates backed up (if applicable)

- [ ] **Staging Validation**
  - [ ] All phases tested in staging environment
  - [ ] Security audit passes in staging
  - [ ] Performance testing completed
  - [ ] Load testing completed (if applicable)

- [ ] **Team Preparation**
  - [ ] Team notified of deployment window
  - [ ] Rollback plan reviewed
  - [ ] On-call engineer designated
  - [ ] Monitoring alerts configured

- [ ] **Documentation**
  - [ ] Deployment steps documented
  - [ ] Rollback procedures documented
  - [ ] New secrets stored in secure vault
  - [ ] Team has access to necessary credentials

### Deployment

- [ ] **Environment Setup**
  - [ ] `.env.production` created with strong secrets
  - [ ] File permissions set (chmod 600)
  - [ ] `.env.production` not tracked by git
  - [ ] Database passwords updated

- [ ] **Security Configuration**
  - [ ] CORS_ORIGIN set to production domains only
  - [ ] JWT_SECRET is 64+ characters
  - [ ] All secrets meet strength requirements
  - [ ] No placeholder values remain

- [ ] **SSL/HTTPS** (if enabling)
  - [ ] SSL certificate obtained
  - [ ] Certificate files in correct location
  - [ ] File permissions set correctly
  - [ ] Firewall rules updated (ports 80, 443)
  - [ ] ENABLE_HTTPS=true in .env.production

- [ ] **Application Deployment**
  - [ ] Latest code deployed
  - [ ] Dependencies installed
  - [ ] NODE_ENV=production set
  - [ ] Application started successfully
  - [ ] No errors in startup logs

### Post-Deployment

- [ ] **Verification**
  - [ ] Application is accessible
  - [ ] Health check endpoint responds
  - [ ] Authentication works
  - [ ] Database connections active
  - [ ] CORS working for allowed origins
  - [ ] HTTPS working (if enabled)

- [ ] **Security Validation**
  - [ ] Security audit passes
  - [ ] No weak secrets detected
  - [ ] SSL certificate valid (if enabled)
  - [ ] Unauthorized origins blocked

- [ ] **Monitoring**
  - [ ] Application logs being captured
  - [ ] Error rates normal
  - [ ] Response times acceptable
  - [ ] Memory usage normal
  - [ ] CPU usage normal

- [ ] **Documentation**
  - [ ] Deployment documented
  - [ ] Any issues noted
  - [ ] Team notified of completion
  - [ ] Runbook updated if needed

### 24-Hour Post-Deployment

- [ ] **Stability Check**
  - [ ] No critical errors in logs
  - [ ] Performance metrics stable
  - [ ] User reports reviewed
  - [ ] Error rates within normal range

- [ ] **Security Review**
  - [ ] No security incidents reported
  - [ ] Failed authentication attempts reviewed
  - [ ] CORS rejections reviewed (ensure legitimate)
  - [ ] SSL certificate working correctly

- [ ] **Cleanup**
  - [ ] Backup files can be archived
  - [ ] Temporary files removed
  - [ ] Documentation finalized


---

## Security Best Practices Post-Migration

After completing the migration, follow these best practices to maintain security:

### Secret Management

1. **Regular Rotation**
   - Rotate JWT secrets every 90 days
   - Rotate database passwords every 180 days
   - Rotate OAuth secrets when compromised or annually

2. **Secure Storage**
   - Store production secrets in a secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Never commit `.env.production` to version control
   - Restrict access to production secrets to authorized personnel only

3. **Access Control**
   - Limit who can access production environment files
   - Use role-based access control (RBAC)
   - Audit access to production secrets regularly

### Certificate Management

1. **Renewal**
   - Set up automatic certificate renewal (Let's Encrypt)
   - Monitor certificate expiration dates
   - Test renewal process in staging

2. **Monitoring**
   - Set up alerts for certificate expiration (30 days before)
   - Monitor SSL/TLS errors in logs
   - Regularly test HTTPS endpoints

### CORS Management

1. **Regular Review**
   - Review allowed origins quarterly
   - Remove unused origins
   - Document why each origin is allowed

2. **Monitoring**
   - Monitor CORS rejection logs
   - Investigate unexpected rejections
   - Alert on unusual patterns

### Ongoing Security

1. **Regular Audits**
   - Run security audit before each deployment
   - Schedule monthly security reviews
   - Keep audit reports for compliance

2. **Dependency Updates**
   - Keep dependencies up to date
   - Monitor security advisories
   - Test updates in staging before production

3. **Monitoring and Alerting**
   - Monitor failed authentication attempts
   - Alert on unusual activity patterns
   - Review security logs weekly

4. **Incident Response**
   - Have an incident response plan
   - Know how to quickly rotate compromised secrets
   - Document and learn from security incidents

---

## Additional Resources

### Documentation

- [Security Hardening Guide](./SECURITY_HARDENING.md) - Comprehensive security documentation
- [SSL Setup Guide](./SSL_SETUP.md) - Detailed SSL/TLS configuration
- [API Documentation](./API_DOCUMENTATION.md) - Updated API documentation with security requirements

### Tools

- **Secret Generation**: `node scripts/generate-secrets.js`
- **Security Audit**: `npm run security:audit`
- **Property Tests**: `npm run test:property`

### External Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Support and Troubleshooting

If you encounter issues during migration:

1. **Check the logs**
   ```bash
   # Application logs
   pm2 logs wellsense-api
   
   # System logs
   sudo journalctl -u wellsense-api -f
   ```

2. **Run security audit**
   ```bash
   npm run security:audit
   ```

3. **Review this guide**
   - Check the "Common Issues and Solutions" section
   - Verify you completed all steps in each phase

4. **Test in staging**
   - Replicate the issue in staging environment
   - Test potential fixes before applying to production

5. **Rollback if necessary**
   - Use the rollback procedures if issues are critical
   - Document the issue for later investigation

6. **Contact team**
   - Reach out to the development team
   - Provide error logs and steps to reproduce
   - Share what you've already tried

---

## Conclusion

Congratulations on completing the security hardening migration! Your application is now protected with:

✅ **Strong cryptographic secrets** - All secrets meet minimum security requirements
✅ **Environment isolation** - Separate configurations for development, test, and production
✅ **CORS protection** - Restricted to authorized domains only
✅ **HTTPS encryption** - All traffic encrypted in transit (if Phase 4 completed)
✅ **Automated validation** - Security audit catches issues before deployment

### Next Steps

1. **Monitor the application** for the first 24-48 hours
2. **Review security logs** regularly
3. **Schedule secret rotation** according to best practices
4. **Keep documentation updated** as configuration changes
5. **Train team members** on new security procedures

### Maintenance Schedule

- **Daily**: Monitor application logs and error rates
- **Weekly**: Review security logs and failed authentication attempts
- **Monthly**: Run security audit and review CORS configuration
- **Quarterly**: Review and rotate secrets, update documentation
- **Annually**: Comprehensive security review and penetration testing

Thank you for prioritizing security! 🔒
