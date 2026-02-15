# SSL/HTTPS Setup Guide

This guide provides detailed instructions for setting up SSL/TLS certificates and enabling HTTPS for the WellSense AI application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Let's Encrypt (Recommended)](#lets-encrypt-recommended)
4. [Self-Signed Certificates (Testing)](#self-signed-certificates-testing)
5. [Commercial CA Certificates](#commercial-ca-certificates)
6. [Configuration](#configuration)
7. [Certificate Renewal](#certificate-renewal)
8. [Troubleshooting](#troubleshooting)

## Overview

HTTPS provides:
- **Encryption:** Data encrypted in transit
- **Authentication:** Verify server identity
- **Integrity:** Prevent data tampering
- **Trust:** Browser security indicators

The application supports:
- Let's Encrypt (free, automated)
- Self-signed certificates (testing only)
- Commercial CA certificates (production)

## Prerequisites

Before setting up SSL:

- [ ] Domain name pointing to your server
- [ ] Server with public IP address
- [ ] Ports 80 and 443 open in firewall
- [ ] Root or sudo access to server
- [ ] DNS records configured (A or AAAA record)

## Let's Encrypt (Recommended)

Let's Encrypt provides free, automated SSL certificates.

### Step 1: Install Certbot

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot
```

**CentOS/RHEL:**
```bash
sudo yum install certbot
```

**macOS:**
```bash
brew install certbot
```

### Step 2: Obtain Certificate

**Standalone Mode** (server must be stopped):
```bash
# Stop your application
pm2 stop god-server

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to Terms of Service
# - Choose whether to share email with EFF
```

**Webroot Mode** (server can stay running):
```bash
# Create webroot directory
mkdir -p /var/www/html/.well-known/acme-challenge

# Obtain certificate
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d yourdomain.com \
  -d www.yourdomain.com
```

**DNS Challenge** (for wildcard certificates):
```bash
sudo certbot certonly --manual \
  --preferred-challenges dns \
  -d yourdomain.com \
  -d *.yourdomain.com
```

### Step 3: Locate Certificates

Certificates are stored in:
```
/etc/letsencrypt/live/yourdomain.com/
├── privkey.pem       # Private key
├── fullchain.pem     # Certificate + chain
├── cert.pem          # Certificate only
└── chain.pem         # Chain only
```

### Step 4: Copy Certificates

```bash
# Create ssl directory in your app
mkdir -p /path/to/app/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/app/ssl/private.key
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/app/ssl/certificate.crt

# Set ownership
sudo chown youruser:yourgroup /path/to/app/ssl/*

# Set permissions
chmod 600 /path/to/app/ssl/private.key
chmod 644 /path/to/app/ssl/certificate.crt
```

### Step 5: Configure Application

Update `.env.production`:
```bash
ENABLE_HTTPS=true
HTTPS_PORT=443
HTTP_PORT=80
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

### Step 6: Start Server

```bash
# Start with HTTPS
npm run start:production

# Or with PM2
pm2 start god-server.js --name god-server --env production
```

### Step 7: Verify HTTPS

```bash
# Test HTTPS
curl -I https://yourdomain.com/api/health

# Test HTTP redirect
curl -I http://yourdomain.com
# Should return: 301 Moved Permanently
# Location: https://yourdomain.com

# Check certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

## Self-Signed Certificates (Testing)

**WARNING:** Self-signed certificates should NEVER be used in production!

### Generate Self-Signed Certificate

```bash
# Create ssl directory
mkdir -p ssl

# Generate private key and certificate
openssl req -x509 -newkey rsa:4096 \
  -keyout ssl/private.key \
  -out ssl/certificate.crt \
  -days 365 \
  -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set permissions
chmod 600 ssl/private.key
chmod 644 ssl/certificate.crt
```

### Configure for Testing

Update `.env` (development):
```bash
ENABLE_HTTPS=true
HTTPS_PORT=3443
HTTP_PORT=3080
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

### Test Locally

```bash
# Start server
npm start

# Test (ignore certificate warning)
curl -k https://localhost:3443/api/health

# In browser, you'll see a security warning
# Click "Advanced" → "Proceed to localhost (unsafe)"
```

## Commercial CA Certificates

If you purchased a certificate from a commercial CA (DigiCert, Comodo, etc.):

### Step 1: Generate CSR

```bash
# Generate private key
openssl genrsa -out ssl/private.key 2048

# Generate CSR
openssl req -new -key ssl/private.key -out ssl/certificate.csr

# Follow prompts to enter:
# - Country
# - State
# - City
# - Organization
# - Common Name (your domain)
# - Email
```

### Step 2: Submit CSR

1. Copy CSR content:
```bash
cat ssl/certificate.csr
```

2. Submit to your CA's website
3. Complete domain validation
4. Download certificate files

### Step 3: Install Certificate

```bash
# You'll receive:
# - yourdomain.crt (your certificate)
# - intermediate.crt (intermediate certificate)
# - root.crt (root certificate)

# Create certificate chain
cat yourdomain.crt intermediate.crt root.crt > ssl/certificate.crt

# Copy private key (if not already in place)
cp private.key ssl/private.key

# Set permissions
chmod 600 ssl/private.key
chmod 644 ssl/certificate.crt
```

### Step 4: Configure and Start

Same as Let's Encrypt steps 5-7.

## Configuration

### Environment Variables

```bash
# Enable HTTPS
ENABLE_HTTPS=true

# HTTPS port (default: 443)
# Use 443 for production, higher port for development
HTTPS_PORT=443

# HTTP port for redirect (default: 80)
HTTP_PORT=80

# Certificate paths (relative to app root)
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
```

### File Structure

```
your-app/
├── ssl/
│   ├── private.key      # Private key (600 permissions)
│   └── certificate.crt  # Certificate + chain (644 permissions)
├── .env.production
└── god-server.js
```

### Permissions

**Critical:** Set correct file permissions!

```bash
# Private key: owner read/write only
chmod 600 ssl/private.key

# Certificate: owner read/write, others read
chmod 644 ssl/certificate.crt

# Directory: owner full access
chmod 700 ssl/
```

### Port Configuration

**Production:**
- HTTPS: Port 443 (standard)
- HTTP: Port 80 (redirect only)

**Development:**
- HTTPS: Port 3443 (non-privileged)
- HTTP: Port 3080 (non-privileged)

**Note:** Ports below 1024 require root/sudo or port forwarding.

### Port Forwarding (Linux)

If running as non-root user:

```bash
# Forward port 443 to 3443
sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 3443

# Forward port 80 to 3080
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3080

# Save rules
sudo iptables-save > /etc/iptables/rules.v4
```

## Certificate Renewal

### Let's Encrypt Auto-Renewal

Let's Encrypt certificates expire after 90 days.

**Setup Auto-Renewal:**

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup cron job for auto-renewal
sudo crontab -e

# Add this line (runs twice daily):
0 0,12 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

**Manual Renewal:**

```bash
# Renew certificate
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/app/ssl/private.key
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/app/ssl/certificate.crt

# Restart application
pm2 restart god-server
```

### Certificate Expiration Monitoring

**Check Expiration:**

```bash
# Check certificate expiration date
openssl x509 -in ssl/certificate.crt -noout -enddate

# Check days until expiration
openssl x509 -in ssl/certificate.crt -noout -checkend 2592000
# Returns 0 if expires within 30 days
```

**Setup Monitoring:**

Create a monitoring script:

```bash
#!/bin/bash
# check-cert-expiry.sh

CERT_FILE="/path/to/app/ssl/certificate.crt"
DAYS_WARNING=30

# Get expiration date
EXPIRY=$(openssl x509 -in "$CERT_FILE" -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt $DAYS_WARNING ]; then
    echo "WARNING: SSL certificate expires in $DAYS_LEFT days!"
    # Send alert (email, Slack, etc.)
fi
```

Add to cron:
```bash
# Run daily at 9 AM
0 9 * * * /path/to/check-cert-expiry.sh
```

## Troubleshooting

### Certificate Not Loading

**Error:** `ENOENT: no such file or directory`

**Solution:**
```bash
# Verify files exist
ls -la ssl/

# Check paths in .env.production
cat .env.production | grep SSL_

# Verify paths are relative to app root
# Correct: ./ssl/private.key
# Incorrect: /ssl/private.key
```

### Permission Denied

**Error:** `EACCES: permission denied`

**Solution:**
```bash
# Check file permissions
ls -la ssl/

# Fix permissions
chmod 600 ssl/private.key
chmod 644 ssl/certificate.crt

# Check ownership
sudo chown youruser:yourgroup ssl/*
```

### Port 443 Already in Use

**Error:** `EADDRINUSE: address already in use :::443`

**Solution:**
```bash
# Find process using port 443
sudo lsof -i :443

# Stop the process
sudo kill <PID>

# Or use a different port
HTTPS_PORT=3443
```

### Certificate Validation Failed

**Error:** `unable to verify the first certificate`

**Solution:**
```bash
# Ensure you're using fullchain.pem, not cert.pem
# fullchain.pem includes intermediate certificates

# Verify certificate chain
openssl verify -CAfile ssl/certificate.crt ssl/certificate.crt

# If using commercial CA, ensure intermediate certificates are included
cat yourdomain.crt intermediate.crt > ssl/certificate.crt
```

### Browser Shows "Not Secure"

**Causes:**
1. Self-signed certificate (expected)
2. Certificate expired
3. Domain mismatch
4. Mixed content (HTTP resources on HTTPS page)

**Solution:**
```bash
# Check certificate details
openssl x509 -in ssl/certificate.crt -text -noout

# Verify:
# - Not expired (Validity dates)
# - Correct domain (Subject CN or Subject Alternative Name)
# - Issued by trusted CA

# For mixed content, ensure all resources use HTTPS
```

### Let's Encrypt Rate Limits

**Error:** `too many certificates already issued`

**Solution:**
- Let's Encrypt limits: 50 certificates per domain per week
- Use staging environment for testing:
```bash
certbot certonly --staging --standalone -d yourdomain.com
```
- Wait for rate limit to reset (1 week)
- Use wildcard certificates to reduce certificate count

### HTTP Not Redirecting to HTTPS

**Issue:** HTTP requests don't redirect to HTTPS

**Solution:**
```bash
# Verify HTTP_PORT is set
echo $HTTP_PORT

# Check server logs for HTTP redirect server
pm2 logs god-server | grep "HTTP Redirect"

# Test redirect
curl -I http://yourdomain.com
# Should return: 301 Moved Permanently
```

## Best Practices

### Security

- **Never commit private keys** to version control
- **Use strong key sizes** (minimum 2048-bit RSA)
- **Enable HSTS** (HTTP Strict Transport Security)
- **Use TLS 1.2+** (disable older versions)
- **Monitor certificate expiration**
- **Rotate certificates** before expiration

### Performance

- **Enable HTTP/2** for better performance
- **Use certificate caching**
- **Optimize cipher suites**
- **Enable OCSP stapling**

### Maintenance

- **Automate renewal** (Let's Encrypt)
- **Monitor expiration** (alerts 30 days before)
- **Test renewals** regularly
- **Document procedures**
- **Keep backups** of certificates

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Security Hardening Guide](./SECURITY_HARDENING.md)
- [Migration Guide](./MIGRATION_GUIDE.md)

## Support

For SSL/HTTPS issues:
1. Check this troubleshooting section
2. Verify certificate with SSL Labs
3. Check server logs
4. Review [SECURITY_HARDENING.md](./SECURITY_HARDENING.md)
5. Contact the development team

**Never share private keys when seeking support!**
