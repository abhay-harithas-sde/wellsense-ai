// HTTPS Server Configuration for Production
// This file provides HTTPS support with SSL/TLS certificates

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Create HTTPS server with SSL certificates
 * @param {Express} app - Express application
 * @param {number} port - Port number (default: 443 for HTTPS)
 * @returns {https.Server} HTTPS server instance
 */
function createHttpsServer(app, port = 443) {
  try {
    // Load SSL certificates
    const sslOptions = {
      key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
      cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt')),
      // Optional: Add CA bundle if you have one
      // ca: fs.readFileSync(path.join(__dirname, 'ssl', 'ca_bundle.crt'))
    };

    // Create HTTPS server
    const httpsServer = https.createServer(sslOptions, app);

    httpsServer.listen(port, () => {
      console.log(`🔒 HTTPS Server running on https://localhost:${port}`);
    });

    return httpsServer;
  } catch (error) {
    console.error('❌ Failed to create HTTPS server:', error.message);
    console.log('ℹ️  SSL certificates not found. Running HTTP server instead.');
    console.log('ℹ️  For production, place SSL certificates in ./ssl/ directory:');
    console.log('   - ssl/private.key');
    console.log('   - ssl/certificate.crt');
    return null;
  }
}

/**
 * Create HTTP to HTTPS redirect server
 * @param {number} httpPort - HTTP port (default: 80)
 * @param {number} httpsPort - HTTPS port (default: 443)
 */
function createHttpRedirectServer(httpPort = 80, httpsPort = 443) {
  const redirectApp = require('express')();
  
  // Redirect all HTTP requests to HTTPS
  redirectApp.use((req, res) => {
    const host = req.headers.host.replace(/:\d+$/, ''); // Remove port
    const httpsUrl = `https://${host}${httpsPort !== 443 ? ':' + httpsPort : ''}${req.url}`;
    res.redirect(301, httpsUrl);
  });

  const httpServer = http.createServer(redirectApp);
  
  httpServer.listen(httpPort, () => {
    console.log(`🔀 HTTP Redirect Server running on http://localhost:${httpPort}`);
    console.log(`   Redirecting to HTTPS port ${httpsPort}`);
  });

  return httpServer;
}

/**
 * Setup production server with HTTPS and HTTP redirect
 * @param {Express} app - Express application
 * @param {Object} options - Configuration options
 */
function setupProductionServer(app, options = {}) {
  const {
    httpsPort = 443,
    httpPort = 80,
    enableHttpRedirect = true
  } = options;

  // Create HTTPS server
  const httpsServer = createHttpsServer(app, httpsPort);

  // Create HTTP redirect server if HTTPS is successful
  if (httpsServer && enableHttpRedirect) {
    createHttpRedirectServer(httpPort, httpsPort);
  }

  return httpsServer;
}

module.exports = {
  createHttpsServer,
  createHttpRedirectServer,
  setupProductionServer
};
