# SSL/TLS Certificates

This directory should contain your SSL certificates for HTTPS support.

## Required Files

Place the following files in this directory:

1. **private.key** - Your private key
2. **certificate.crt** - Your SSL certificate
3. **ca_bundle.crt** - Certificate Authority bundle (optional)

## Getting SSL Certificates

### Option 1: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be in:
# /etc/letsencrypt/live/yourdomain.com/
```

### Option 2: Commercial SSL Provider

Purchase from providers like:
- DigiCert
- Comodo
- GoDaddy
- Namecheap

### Option 3: Self-Signed (Development Only)

```bash
# Generate self-signed certificate (for testing only)
openssl req -x509 -newkey rsa:4096 -keyout private.key -out certificate.crt -days 365 -nodes

# Move to ssl directory
mv private.key certificate.crt ssl/
```

## File Permissions

Ensure proper permissions:

```bash
chmod 600 ssl/private.key
chmod 644 ssl/certificate.crt
```

## Security Notes

⚠️ **IMPORTANT:**
- Never commit SSL certificates to Git
- Keep private.key secure and private
- Renew certificates before expiration
- Use strong encryption (RSA 2048+ or ECC)

## .gitignore

This directory is already in .gitignore:
```
ssl/*.key
ssl/*.crt
ssl/*.pem
```

## Production Deployment

For production, use environment variables or secrets management:

```env
SSL_KEY_PATH=/path/to/private.key
SSL_CERT_PATH=/path/to/certificate.crt
SSL_CA_PATH=/path/to/ca_bundle.crt
```

## Testing HTTPS Locally

1. Generate self-signed certificate
2. Place in ssl/ directory
3. Start server with HTTPS enabled
4. Access https://localhost:3000
5. Accept browser security warning (self-signed)

## Certificate Renewal

Let's Encrypt certificates expire every 90 days:

```bash
# Renew certificate
sudo certbot renew

# Restart server to load new certificate
pm2 restart wellsense-ai
```

## Troubleshooting

### Certificate not found
- Check file paths
- Verify file permissions
- Ensure files are in ssl/ directory

### Browser security warning
- Normal for self-signed certificates
- Use proper CA-signed certificate for production

### Port 443 permission denied
- Use sudo or configure port forwarding
- Or use higher port (e.g., 8443)

## Resources

- Let's Encrypt: https://letsencrypt.org/
- SSL Labs Test: https://www.ssllabs.com/ssltest/
- Mozilla SSL Config: https://ssl-config.mozilla.org/
