#!/usr/bin/env node

// Database Setup and Migration Script
// Ensures database schema is up-to-date and properly configured

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n' + '═'.repeat(80));
console.log('║  WellSense AI - Database Setup & Migration');
console.log('═'.repeat(80) + '\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  console.log('Please create a .env file with DATABASE_URL');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env file!');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📊 Database: ${process.env.DATABASE_URL.split('@')[1] || 'configured'}\n`);

// Step 1: Generate Prisma Client
console.log('Step 1: Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client');
  process.exit(1);
}

// Step 2: Run migrations
console.log('Step 2: Running database migrations...');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations completed\n');
} catch (error) {
  console.warn('⚠️  Migration warning (this is normal for first-time setup)');
  console.log('Attempting to create migration...\n');
  
  try {
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('✅ Initial migration created\n');
  } catch (migrationError) {
    console.error('❌ Failed to create migration');
    console.log('\nTry running manually:');
    console.log('  npx prisma migrate dev --name init');
    process.exit(1);
  }
}

// Step 3: Validate schema
console.log('Step 3: Validating Prisma schema...');
try {
  execSync('npx prisma validate', { stdio: 'inherit' });
  console.log('✅ Schema is valid\n');
} catch (error) {
  console.error('❌ Schema validation failed');
  process.exit(1);
}

// Step 4: Test database connection
console.log('Step 4: Testing database connection...');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Get database stats
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
    await prisma.$disconnect();
    
    console.log('\n' + '═'.repeat(80));
    console.log('║  ✅ Database Setup Complete!');
    console.log('═'.repeat(80));
    console.log('\nYou can now start the server with:');
    console.log('  npm start');
    console.log('\nOr run in development mode:');
    console.log('  npm run dev\n');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. Database server is running');
    console.log('2. DATABASE_URL in .env is correct');
    console.log('3. Database exists and is accessible\n');
    await prisma.$disconnect();
    process.exit(1);
  }
})();
