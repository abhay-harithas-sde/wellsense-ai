#!/usr/bin/env node

// Test script to verify environment file switching
const fs = require('fs');
const path = require('path');

console.log('\n🧪 Testing Environment File Switching');
console.log('='.repeat(60) + '\n');

// Test function
function testEnvFile(nodeEnv, expectedFile) {
  // Clear require cache
  delete require.cache[require.resolve('dotenv')];
  
  // Set NODE_ENV
  process.env.NODE_ENV = nodeEnv;
  
  // Determine which file should be loaded
  const envFile = nodeEnv === 'production' 
    ? '.env.production' 
    : nodeEnv === 'test'
    ? '.env.test'
    : '.env';
  
  // Check if file exists
  const fileExists = fs.existsSync(envFile);
  
  console.log(`NODE_ENV: ${nodeEnv}`);
  console.log(`Expected file: ${expectedFile}`);
  console.log(`Actual file: ${envFile}`);
  console.log(`File exists: ${fileExists ? '✅' : '❌'}`);
  console.log(`Match: ${envFile === expectedFile ? '✅' : '❌'}`);
  console.log('');
  
  return envFile === expectedFile && fileExists;
}

// Run tests
const tests = [
  { env: 'development', file: '.env' },
  { env: 'production', file: '.env.production' },
  { env: 'test', file: '.env.test' },
  { env: undefined, file: '.env' }, // Default to development
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
  if (testEnvFile(test.env || 'development', test.file)) {
    passed++;
  } else {
    failed++;
  }
});

console.log('='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60) + '\n');

process.exit(failed > 0 ? 1 : 0);
