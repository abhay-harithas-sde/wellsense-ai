#!/usr/bin/env node
// Setup test database for running tests

require('dotenv').config({ path: '.env.test' });
const { execSync } = require('child_process');

console.log('🔧 Setting up test database...\n');

try {
  // Generate Prisma client
  console.log('1. Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to test database
  console.log('\n2. Pushing schema to test database...');
  execSync('npx prisma db push --skip-generate', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });

  console.log('\n✅ Test database setup complete!');
  console.log('\nYou can now run tests with: npm test');
} catch (error) {
  console.error('\n❌ Test database setup failed:', error.message);
  process.exit(1);
}
