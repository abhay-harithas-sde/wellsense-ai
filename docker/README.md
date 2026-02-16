# Docker Environment Configuration Guide

This guide explains how to securely configure and deploy the WellSense AI application using Docker.

## Overview

The Docker setup supports both development and production environments with separate configuration files:

- **`docker/.env.docker`** - Development environment (tracked in git)
- **`docker/.env.docker.production`** - Production environment (NOT tracked in git)

## Quick Start

### Development

```bash
# Start all services with development configuration
docker-compose --env-file docker/.env.docker up -d

# Start with admin tools (pgAdmin, Mongo Express)
docker-compose --env-file docker/.env.docker --profile admin-tools up -d
```

### Production

```bash
# Start services with production configuration
docker-compose --env-file docker/.env.docker.production up -d

# Production without admin tools (recommended)
docker-compose --env-file docker/.env.docker.production up -d
```

## Security Architecture

### Database Credentials (Stored in .env files)

The following credentials are stored in Docker environment files:

- PostgreSQL username and password
- MongoDB username and password
- Redis password
- Admin tool credentials (pgAdmin, Mongo Express)

**Production passwords** are cryptographically strong (32+ characters, mixed complexity) and stored in `docker/.env.docker.production` which is excluded from version control.

### Application Secrets (NOT stored in .env files)

The following secrets should **NEVER** be stored in Docker environment files:

- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key
- `SESSION_SECRET` - Session encryption secret
- `CORS_ORIGIN` - Allowed CORS origins

These must be passed using one of the secure methods below.

## Passing Application Secrets

### Method 1: Environment Variables at Runtime (Quick Testing)

Pass secrets directly when starting Docker Compose:

```bash
JWT_SECRET="your-jwt-secret-here" \
GOOGLE_CLIENT_SECRET="your-google-secret-here" \
OPENAI_API_KEY="your-openai-key-here" \
CORS_ORIGIN="https://yourdomain.com" \
docker-compose --env-file docker/.env.docker.production up -d
```

**Pros**: Simple, no additional files
**Cons**: Secrets visible in shell history, not suitable for production

### Method 2: Export Environment Variables (Development)

Export secrets in your shell before running docker-compose:

```bash
# Export secrets
export JWT_SECRET="your-jwt-secret-here"
export GOOGLE_CLIENT_SECRET="your-google-secret-here"
export OPENAI_API_KEY="your-openai-key-here"
export CORS_ORIGIN="https://yourdomain.com"

# Start Docker Compose
docker-compose --env-file docker/.env.docker.production up -d
```

**Pros**: Cleaner command line, secrets not in history
**Cons**: Secrets lost when shell closes, manual export needed

### Method 3: Docker Compose Override File (Recommended for Development)

Create `docker-compose.override.yml` (NOT committed to git):

```yaml
services:
  app:
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CORS_ORIGIN=${CORS_ORIGIN}
```

Then export secrets and run:

```bash
export JWT_SECRET="your-jwt-secret-here"
export GOOGLE_CLIENT_SECRET="your-google-secret-here"
export OPENAI_API_KEY="your-openai-key-here"
export CORS_ORIGIN="https://yourdomain.com"

docker-compose --env-file docker/.env.docker.production up -d
```

**Pros**: Clean separation, reusable configuration
**Cons**: Requires additional file, secrets still in environment

### Method 4: Docker Secrets (Recommended for Production)

Use Docker Swarm secrets for production deployments:

#### Step 1: Create Secrets

```bash
# Create secrets from files
echo "your-jwt-secret-here" | docker secret create jwt_secret -
echo "your-google-secret-here" | docker secret create google_client_secret -
echo "your-openai-key-here" | docker secret create openai_api_key -

# Or from existing files
docker secret create jwt_secret ./secrets/jwt_secret.txt
docker secret create google_client_secret ./secrets/google_client_secret.txt
docker secret create openai_api_key ./secrets/openai_api_key.txt
```

#### Step 2: Update docker-compose.yml

Add secrets configuration to your docker-compose.yml:

```yaml
services:
  app:
    secrets:
      - jwt_secret
      - google_client_secret
      - openai_api_key
    environment:
      # Read secrets from files
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

#### Step 3: Update Application Code

Modify your application to read secrets from files:

```javascript
// lib/config/secrets.js
const fs = require('fs');

function getSecret(envVar, fileVar) {
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
  jwtSecret: getSecret('JWT_SECRET', 'JWT_SECRET_FILE'),
  googleClientSecret: getSecret('GOOGLE_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET_FILE'),
  openaiApiKey: getSecret('OPENAI_API_KEY', 'OPENAI_API_KEY_FILE')
};
```

#### Step 4: Deploy with Docker Swarm

```bash
# Initialize swarm (if not already done)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml wellsense-ai
```

**Pros**: Most secure, secrets encrypted at rest, automatic rotation support
**Cons**: Requires Docker Swarm, more complex setup

### Method 5: Cloud Secret Management (Enterprise Production)

For enterprise deployments, integrate with cloud secret management services:

#### AWS Secrets Manager

```bash
# Install AWS CLI and configure credentials
aws configure

# Store secrets
aws secretsmanager create-secret --name wellsense/jwt-secret --secret-string "your-jwt-secret"
aws secretsmanager create-secret --name wellsense/google-client-secret --secret-string "your-google-secret"

# Retrieve in application
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return data.SecretString;
}
```

#### HashiCorp Vault

```bash
# Start Vault server
vault server -dev

# Store secrets
vault kv put secret/wellsense jwt_secret="your-jwt-secret"
vault kv put secret/wellsense google_client_secret="your-google-secret"

# Retrieve in application
const vault = require('node-vault')();
const secrets = await vault.read('secret/data/wellsense');
```

#### Azure Key Vault

```bash
# Create Key Vault
az keyvault create --name wellsense-vault --resource-group myResourceGroup

# Store secrets
az keyvault secret set --vault-name wellsense-vault --name jwt-secret --value "your-jwt-secret"

# Retrieve in application
const { SecretClient } = require('@azure/keyvault-secrets');
const client = new SecretClient(vaultUrl, credential);
const secret = await client.getSecret('jwt-secret');
```

**Pros**: Enterprise-grade security, audit logging, automatic rotation, centralized management
**Cons**: Additional cost, cloud vendor lock-in, more complex setup

## Generating Strong Secrets

Use the secret generation tool to create cryptographically strong secrets:

```bash
# Generate JWT secret (64+ characters)
node scripts/generate-secrets.js --type jwt

# Generate OAuth secret (48+ characters)
node scripts/generate-secrets.js --type oauth

# Generate database password (32+ characters)
node scripts/generate-secrets.js --type database

# Generate all secrets at once
node scripts/generate-secrets.js
```

## Security Best Practices

### 1. File Permissions

Restrict access to production environment files:

```bash
# Set restrictive permissions
chmod 600 docker/.env.docker.production

# Verify permissions
ls -la docker/.env.docker.production
```

### 2. Secret Rotation

Rotate secrets regularly:

- **Database passwords**: Every 180 days
- **Application secrets**: Every 90 days
- **API keys**: When compromised or annually

### 3. Access Control

- Limit who can access production environment files
- Use role-based access control (RBAC)
- Audit access logs regularly
- Use separate credentials for each environment

### 4. Monitoring

- Enable database audit logging
- Monitor failed authentication attempts
- Set up alerts for suspicious activity
- Track secret access patterns

### 5. Backup Security

- Encrypt backups containing secrets
- Use secure backup transmission (SFTP, S3 with encryption)
- Restrict backup access
- Test backup restoration regularly

### 6. Version Control

- Never commit production secrets to git
- Verify with: `git check-ignore docker/.env.docker.production`
- Use `.gitignore` to exclude sensitive files
- Scan commits for accidentally committed secrets

### 7. Admin Tools in Production

- Disable admin tools (pgAdmin, Mongo Express) in production by default
- Only enable with `--profile admin-tools` when needed
- Never expose admin tools to public internet
- Use VPN or SSH tunneling for admin access
- Disable after use

## Troubleshooting

### Issue: Container can't connect to database

**Symptom**: Application fails to start with database connection error

**Solution**: Verify database credentials match between `.env.docker.production` and application configuration

```bash
# Check PostgreSQL connection
docker exec -it wellsense-ai-postgres psql -U postgres -d wellsense_ai

# Check MongoDB connection
docker exec -it wellsense-ai-mongodb mongosh -u admin -p
```

### Issue: Application secrets not available

**Symptom**: Application fails with "JWT_SECRET is not defined"

**Solution**: Ensure secrets are passed using one of the methods above

```bash
# Verify environment variables are set
docker exec -it wellsense-ai-app env | grep JWT_SECRET

# Check if secret file exists (Docker secrets method)
docker exec -it wellsense-ai-app cat /run/secrets/jwt_secret
```

### Issue: Permission denied on .env.docker.production

**Symptom**: Docker Compose can't read environment file

**Solution**: Adjust file permissions

```bash
# Make readable by current user
chmod 600 docker/.env.docker.production

# Verify ownership
ls -la docker/.env.docker.production
```

### Issue: Weak password detected

**Symptom**: Security audit fails with weak password error

**Solution**: Generate new strong password

```bash
# Generate new database password
node scripts/generate-secrets.js --type database

# Update .env.docker.production with new password
# Restart containers
docker-compose --env-file docker/.env.docker.production restart
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Generate strong database passwords (32+ characters)
- [ ] Update `docker/.env.docker.production` with strong passwords
- [ ] Set file permissions: `chmod 600 docker/.env.docker.production`
- [ ] Generate application secrets (JWT, OAuth, etc.)
- [ ] Choose secret passing method (Docker secrets recommended)
- [ ] Configure CORS_ORIGIN with production domains
- [ ] Disable admin tools (don't use `--profile admin-tools`)
- [ ] Enable Redis password authentication
- [ ] Run security audit: `npm run security:audit`
- [ ] Test in staging environment first
- [ ] Set up monitoring and alerting
- [ ] Document secret rotation schedule
- [ ] Configure backup encryption
- [ ] Verify `.env.docker.production` is in `.gitignore`

## Additional Resources

- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Security Hardening Guide](../docs/SECURITY_HARDENING.md)
- [Migration Guide](../docs/MIGRATION_GUIDE.md)
- [SSL Setup Guide](../docs/SSL_SETUP.md)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the security hardening documentation
3. Run security audit: `npm run security:audit`
4. Check application logs: `docker-compose logs app`
5. Contact the development team
