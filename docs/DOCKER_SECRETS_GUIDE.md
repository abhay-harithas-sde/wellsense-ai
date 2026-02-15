# Docker Secrets Management Guide

This guide explains how to securely pass application secrets (JWT_SECRET, OAuth credentials, API keys) to Docker containers without storing them in environment files.

## Table of Contents

1. [Overview](#overview)
2. [What NOT to Store in .env.docker Files](#what-not-to-store)
3. [Method 1: Environment Variables at Runtime](#method-1-environment-variables)
4. [Method 2: Docker Compose Override](#method-2-docker-compose-override)
5. [Method 3: Docker Secrets (Production)](#method-3-docker-secrets)
6. [Method 4: Mounted Secret Files](#method-4-mounted-secret-files)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**Database credentials** (PostgreSQL, MongoDB, Redis passwords) are stored in:
- `docker/.env.docker` - Development environment
- `docker/.env.docker.production` - Production environment (gitignored)

**Application secrets** should NEVER be stored in these files. Instead, pass them securely using one of the methods below.

---

## What NOT to Store

The following secrets should NOT be stored in `.env.docker` or `.env.docker.production`:

- `JWT_SECRET` - JSON Web Token signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL
- `OPENAI_API_KEY` - OpenAI API key
- Any other application-level secrets or API keys

**Why?** These secrets are application-specific and should be managed separately from infrastructure configuration. This separation allows:
- Different secrets for different deployments
- Easier secret rotation
- Better security through secret management systems
- Reduced risk of accidental exposure

---

## Method 1: Environment Variables at Runtime

**Best for:** Development, testing, CI/CD pipelines

### Option A: Inline with docker-compose command

```bash
# Pass secrets directly in the command
JWT_SECRET=your-jwt-secret \
GOOGLE_CLIENT_SECRET=your-google-secret \
OPENAI_API_KEY=your-openai-key \
docker-compose --env-file docker/.env.docker up
```

### Option B: Export environment variables

```bash
# Export secrets in your shell session
export JWT_SECRET="your-jwt-secret-here"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
export OPENAI_API_KEY="your-openai-api-key"

# Then run docker-compose
docker-compose --env-file docker/.env.docker up
```

### Option C: Load from a separate secrets file

```bash
# Create a secrets file (add to .gitignore!)
cat > docker/.env.secrets <<EOF
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_SECRET=your-google-secret
OPENAI_API_KEY=your-openai-key
EOF

# Load both files
docker-compose --env-file docker/.env.docker --env-file docker/.env.secrets up
```

**Pros:**
- Simple and straightforward
- Good for development and testing
- Easy to change secrets

**Cons:**
- Secrets visible in shell history
- Secrets visible in process list
- Not suitable for production

---

## Method 2: Docker Compose Override

**Best for:** Local development with persistent secrets

### Step 1: Create docker-compose.override.yml

```bash
# Create override file (add to .gitignore!)
cat > docker/docker-compose.override.yml <<EOF
services:
  app:
    environment:
      - JWT_SECRET=\${JWT_SECRET}
      - GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=\${GOOGLE_CALLBACK_URL}
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - CORS_ORIGIN=\${CORS_ORIGIN}
EOF
```

### Step 2: Add to .gitignore

```bash
echo "docker/docker-compose.override.yml" >> .gitignore
```

### Step 3: Export secrets and run

```bash
export JWT_SECRET="your-jwt-secret"
export GOOGLE_CLIENT_SECRET="your-google-secret"
docker-compose up
```

**Pros:**
- Keeps secrets out of main docker-compose.yml
- Override file is automatically loaded
- Good for local development

**Cons:**
- Still requires environment variables
- Override file must be gitignored
- Not suitable for production

---

## Method 3: Docker Secrets (Production)

**Best for:** Production deployments with Docker Swarm

Docker Secrets is the most secure method for production environments. Secrets are encrypted at rest and in transit, and only accessible to authorized containers.

### Step 1: Initialize Docker Swarm (if not already done)

```bash
docker swarm init
```

### Step 2: Create secrets

```bash
# Generate strong secrets first
node scripts/generate-secrets.js

# Create Docker secrets
echo "your-jwt-secret-here" | docker secret create jwt_secret -
echo "your-google-client-secret" | docker secret create google_client_secret -
echo "your-openai-api-key" | docker secret create openai_api_key -
```

### Step 3: Update docker-compose.yml for production

Create a `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  app:
    image: wellsense-ai:latest
    secrets:
      - jwt_secret
      - google_client_secret
      - openai_api_key
    environment:
      # Point to secret files
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - GOOGLE_CLIENT_SECRET_FILE=/run/secrets/google_client_secret
      - OPENAI_API_KEY_FILE=/run/secrets/openai_api_key

secrets:
  jwt_secret:
    external: true
  google_client_secret:
    external: true
  openai_api_key:
    external: true
```

### Step 4: Update application to read from secret files

```javascript
// lib/config/secrets.js
const fs = require('fs');

function readSecret(envVar, fileVar) {
  // Try to read from file first (Docker secrets)
  if (process.env[fileVar]) {
    try {
      return fs.readFileSync(process.env[fileVar], 'utf8').trim();
    } catch (err) {
      console.error(`Failed to read secret from ${process.env[fileVar]}:`, err);
    }
  }
  
  // Fall back to environment variable
  return process.env[envVar];
}

module.exports = {
  jwtSecret: readSecret('JWT_SECRET', 'JWT_SECRET_FILE'),
  googleClientSecret: readSecret('GOOGLE_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET_FILE'),
  openaiApiKey: readSecret('OPENAI_API_KEY', 'OPENAI_API_KEY_FILE')
};
```

### Step 5: Deploy with secrets

```bash
docker stack deploy -c docker-compose.yml -c docker-compose.production.yml wellsense-ai
```

**Pros:**
- Most secure method
- Secrets encrypted at rest and in transit
- Secrets only accessible to authorized containers
- Automatic secret rotation support
- Industry best practice for production

**Cons:**
- Requires Docker Swarm
- More complex setup
- Requires application code changes

---

## Method 4: Mounted Secret Files

**Best for:** Kubernetes, cloud platforms, or custom secret management

### Step 1: Create secrets directory

```bash
mkdir -p secrets
chmod 700 secrets

# Add to .gitignore
echo "secrets/" >> .gitignore
```

### Step 2: Create secret files

```bash
# Generate and save secrets
node scripts/generate-secrets.js --type jwt > secrets/jwt_secret
node scripts/generate-secrets.js --type oauth > secrets/google_client_secret
echo "your-openai-api-key" > secrets/openai_api_key

# Secure the files
chmod 600 secrets/*
```

### Step 3: Mount secrets in docker-compose.yml

```yaml
services:
  app:
    volumes:
      - ./secrets:/app/secrets:ro  # Read-only mount
    environment:
      - JWT_SECRET_FILE=/app/secrets/jwt_secret
      - GOOGLE_CLIENT_SECRET_FILE=/app/secrets/google_client_secret
      - OPENAI_API_KEY_FILE=/app/secrets/openai_api_key
```

### Step 4: Read secrets in application (same as Method 3)

Use the `readSecret()` function from Method 3 to read from mounted files.

**Pros:**
- Works without Docker Swarm
- Compatible with Kubernetes and cloud platforms
- Secrets stored in files, not environment variables
- Good for production

**Cons:**
- Requires file system access
- Must secure secret files properly
- Requires application code changes

---

## Best Practices

### 1. Never Commit Secrets

```bash
# Add to .gitignore
echo "docker/.env.docker.production" >> .gitignore
echo "docker/.env.secrets" >> .gitignore
echo "docker/docker-compose.override.yml" >> .gitignore
echo "secrets/" >> .gitignore
```

### 2. Use Strong Secrets

```bash
# Generate cryptographically strong secrets
node scripts/generate-secrets.js --type jwt
node scripts/generate-secrets.js --type oauth
```

### 3. Rotate Secrets Regularly

- JWT secrets: Every 90 days
- OAuth secrets: When compromised or annually
- API keys: According to provider recommendations

### 4. Restrict Access

```bash
# Secure secret files
chmod 600 .env.docker.production
chmod 600 secrets/*
chmod 700 secrets/
```

### 5. Use Different Secrets for Each Environment

- Development: Can use weaker secrets for convenience
- Staging: Use production-strength secrets
- Production: Use strongest secrets, rotate regularly

### 6. Monitor Secret Usage

- Log failed authentication attempts
- Monitor for unusual API usage
- Set up alerts for secret access

### 7. Use Secret Management Systems

For production, consider using:
- **AWS Secrets Manager** - For AWS deployments
- **HashiCorp Vault** - For multi-cloud or on-premise
- **Azure Key Vault** - For Azure deployments
- **Google Secret Manager** - For GCP deployments

---

## Troubleshooting

### Problem: Application can't find secrets

**Symptoms:**
```
Error: JWT_SECRET is not defined
Error: GOOGLE_CLIENT_SECRET is required
```

**Solutions:**

1. **Check environment variables are set:**
   ```bash
   docker-compose exec app env | grep JWT_SECRET
   ```

2. **Verify secrets are passed to container:**
   ```bash
   docker-compose config
   ```

3. **Check secret files exist and are readable:**
   ```bash
   docker-compose exec app ls -la /run/secrets/
   docker-compose exec app cat /run/secrets/jwt_secret
   ```

### Problem: Secrets visible in docker-compose config

**Symptoms:**
```bash
docker-compose config
# Shows actual secret values
```

**Solution:**
This is expected behavior. The `config` command resolves all variables. Never run this in production or share the output.

### Problem: Docker secrets not working

**Symptoms:**
```
Error: secret not found: jwt_secret
```

**Solutions:**

1. **Verify Docker Swarm is initialized:**
   ```bash
   docker info | grep Swarm
   # Should show: Swarm: active
   ```

2. **Check secrets exist:**
   ```bash
   docker secret ls
   ```

3. **Recreate secrets if needed:**
   ```bash
   docker secret rm jwt_secret
   echo "new-secret" | docker secret create jwt_secret -
   ```

### Problem: Permission denied reading secret files

**Symptoms:**
```
Error: EACCES: permission denied, open '/app/secrets/jwt_secret'
```

**Solutions:**

1. **Check file permissions:**
   ```bash
   ls -la secrets/
   ```

2. **Fix permissions:**
   ```bash
   chmod 600 secrets/*
   ```

3. **Check container user:**
   ```bash
   docker-compose exec app whoami
   # Ensure user has read access to mounted secrets
   ```

---

## Quick Reference

### Development Setup

```bash
# 1. Use .env.docker for database credentials
docker-compose --env-file docker/.env.docker up

# 2. Pass application secrets via environment
export JWT_SECRET="dev-jwt-secret"
export GOOGLE_CLIENT_SECRET="dev-google-secret"
docker-compose up
```

### Production Setup (Docker Secrets)

```bash
# 1. Initialize Swarm
docker swarm init

# 2. Create secrets
echo "prod-jwt-secret" | docker secret create jwt_secret -

# 3. Deploy stack
docker stack deploy -c docker-compose.yml -c docker-compose.production.yml wellsense-ai
```

### Production Setup (Environment Variables)

```bash
# 1. Use .env.docker.production for database credentials
# 2. Pass application secrets via environment
JWT_SECRET=xxx GOOGLE_CLIENT_SECRET=yyy \
docker-compose --env-file docker/.env.docker.production up -d
```

---

## Additional Resources

- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Security Hardening Guide](../docs/SECURITY_HARDENING.md)
- [Secret Generation Script](../scripts/generate-secrets.js)

---

**Last Updated:** 2024
**Maintained By:** WellSense AI Security Team
