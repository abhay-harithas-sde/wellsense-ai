#!/usr/bin/env node

// Test script to verify weak secret detection in production mode
const fs = require('fs');
const path = require('path');

// Parse .env file manually
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      env[key] = value;
    }
  });
  
  return env;
}

const EnvironmentValidator = require('../lib/security/environment-validator');

console.log('\n🧪 Testing Weak Secret Detection in Production Mode');
console.log('='.repeat(60) + '\n');

// Test with weak secrets
const weakEnv = parseEnvFile('.env.production.weak');
const validator = new EnvironmentValidator();
const result = validator.validateAll(weakEnv, 'production');

console.log('Environment: production');
console.log('Config file: .env.production.weak\n');

if (!result.valid) {
  console.log('✅ TEST PASSED: Weak secrets correctly rejected in production\n');
  console.log('Errors detected:');
  result.errors.forEach(err => console.log(`  ❌ ${err}`));
} else {
  console.log('❌ TEST FAILED: Weak secrets were not detected!\n');
}

if (result.warnings.length > 0) {
  console.log('\nWarnings:');
  result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
}

console.log('\n' + '='.repeat(60));
console.log(result.valid ? '❌ VALIDATION SHOULD HAVE FAILED' : '✅ VALIDATION CORRECTLY FAILED');
console.log('='.repeat(60) + '\n');

process.exit(result.valid ? 1 : 0);
