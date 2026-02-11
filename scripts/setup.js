#!/usr/bin/env node
/**
 * WellSense AI - Setup Script
 * Initializes the project and checks dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 WellSense AI - Setup Script\n');

// Check for .env file
if (!fs.existsSync('.env')) {
  console.log('⚠️  No .env file found. Creating from .env.example...');
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Created .env file');
  } else {
    console.log('❌ .env.example not found');
  }
} else {
  console.log('✅ .env file exists');
}

// Check AAP directory
if (fs.existsSync('AAP')) {
  console.log('✅ AAP backend directory exists');
  
  // Check AAP .env
  if (!fs.existsSync('AAP/.env')) {
    console.log('⚠️  No AAP/.env file found. Creating from AAP/.env.example...');
    if (fs.existsSync('AAP/.env.example')) {
      fs.copyFileSync('AAP/.env.example', 'AAP/.env');
      console.log('✅ Created AAP/.env file');
    }
  } else {
    console.log('✅ AAP/.env file exists');
  }
} else {
  console.log('❌ AAP backend directory not found');
}

console.log('\n📦 Setup complete!');
console.log('\nNext steps:');
console.log('1. Configure your .env files with API keys');
console.log('2. Run: npm run aap:install (to install AAP dependencies)');
console.log('3. Run: npm run start:full (to start both frontend and backend)');
console.log('\nFor more information, see README.md');
