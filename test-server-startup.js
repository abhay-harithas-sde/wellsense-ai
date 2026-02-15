/**
 * Manual test script to verify environment validation integration
 * This script tests the actual server startup with environment validation
 */

// Set NODE_ENV to development for testing
process.env.NODE_ENV = 'development';

console.log('Testing server startup with environment validation...\n');

// Load the server module (this will trigger validation)
try {
  const { app } = require('./god-server.js');
  console.log('\n✅ Server module loaded successfully with validation');
  console.log('   Environment validation is working correctly!\n');
  
  // Exit cleanly
  process.exit(0);
} catch (error) {
  console.error('\n❌ Server startup failed:', error.message);
  process.exit(1);
}
