#!/usr/bin/env node

// Comprehensive Health Check for WellSense AI
// Checks all systems, dependencies, and configurations

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n' + '═'.repeat(80));
console.log('║  WellSense AI - Comprehensive Health Check');
console.log('═'.repeat(80) + '\n');

const issues = [];
const warnings = [];
const passed = [];

// Check 1: Environment Variables
console.log('1️⃣  Checking Environment Variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'MONGODB_URI',
  'REDIS_URL',
  'JWT_SECRET',
  'NODE_ENV'
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'GOOGLE_CLIENT_ID',
  'MICROSOFT_CLIENT_ID',
  'FIREBASE_PROJECT_ID'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    issues.push(`Missing required environment variable: ${varName}`);
  } else {
    passed.push(`✅ ${varName} is set`);
  }
});

optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    warnings.push(`Optional environment variable not set: ${varName}`);
  } else {
    passed.push(`✅ ${varName} is set`);
  }
});

console.log(`   ✅ ${requiredEnvVars.filter(v => process.env[v]).length}/${requiredEnvVars.length} required variables set`);
console.log(`   ⚠️  ${optionalEnvVars.filter(v => !process.env[v]).length}/${optionalEnvVars.length} optional variables missing\n`);

// Check 2: Required Files
console.log('2️⃣  Checking Required Files...');
const requiredFiles = [
  'package.json',
  'god-server.js',
  'prisma/schema.prisma',
  '.env',
  'lib/database.js',
  'lib/database-integrations.js',
  'lib/ai.js',
  'lib/auth.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    issues.push(`Missing required file: ${file}`);
  } else {
    passed.push(`✅ ${file} exists`);
  }
});

console.log(`   ✅ ${requiredFiles.filter(f => fs.existsSync(path.join(process.cwd(), f))).length}/${requiredFiles.length} required files present\n`);

// Check 3: Docker Containers
console.log('3️⃣  Checking Docker Containers...');
try {
  const { execSync } = require('child_process');
  const dockerPs = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' });
  const containers = dockerPs.trim().split('\n').filter(Boolean);
  
  const requiredContainers = [
    'wellsense-postgres',
    'wellsense-mongodb',
    'wellsense-redis'
  ];
  
  requiredContainers.forEach(container => {
    if (containers.includes(container)) {
      passed.push(`✅ ${container} is running`);
    } else {
      warnings.push(`Docker container not running: ${container}`);
    }
  });
  
  console.log(`   ✅ ${requiredContainers.filter(c => containers.includes(c)).length}/${requiredContainers.length} required containers running\n`);
} catch (error) {
  warnings.push('Docker is not running or not accessible');
  console.log('   ⚠️  Docker check failed (Docker may not be running)\n');
}

// Check 4: Database Connections
console.log('4️⃣  Checking Database Connections...');
(async () => {
  try {
    const { DatabaseIntegrations } = require('../lib/database-integrations');
    const db = new DatabaseIntegrations();
    
    const connections = await db.connectAll();
    
    if (connections.postgresql.status === 'connected') {
      passed.push('✅ PostgreSQL connected');
      console.log('   ✅ PostgreSQL: Connected');
    } else {
      issues.push(`PostgreSQL connection failed: ${connections.postgresql.error}`);
      console.log('   ❌ PostgreSQL: Failed');
    }
    
    if (connections.mongodb.status === 'connected') {
      passed.push('✅ MongoDB connected');
      console.log('   ✅ MongoDB: Connected');
    } else {
      warnings.push(`MongoDB connection failed: ${connections.mongodb.error}`);
      console.log('   ⚠️  MongoDB: Failed (optional)');
    }
    
    if (connections.redis.status === 'connected') {
      passed.push('✅ Redis connected');
      console.log('   ✅ Redis: Connected');
    } else {
      warnings.push(`Redis connection failed: ${connections.redis.error}`);
      console.log('   ⚠️  Redis: Failed (optional)');
    }
    
    await db.disconnectAll();
    console.log('');
    
    // Check 5: Prisma Schema
    console.log('5️⃣  Checking Prisma Schema...');
    try {
      const { execSync } = require('child_process');
      execSync('npx prisma validate', { stdio: 'pipe' });
      passed.push('✅ Prisma schema is valid');
      console.log('   ✅ Prisma schema is valid\n');
    } catch (error) {
      issues.push('Prisma schema validation failed');
      console.log('   ❌ Prisma schema validation failed\n');
    }
    
    // Check 6: Node Modules
    console.log('6️⃣  Checking Node Modules...');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      passed.push('✅ node_modules directory exists');
      console.log('   ✅ node_modules installed\n');
    } else {
      issues.push('node_modules directory not found - run npm install');
      console.log('   ❌ node_modules not found\n');
    }
    
    // Check 7: Port Availability
    console.log('7️⃣  Checking Port Availability...');
    const net = require('net');
    const checkPort = (port) => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(port);
      });
    };
    
    const port3000Available = await checkPort(3000);
    if (port3000Available) {
      passed.push('✅ Port 3000 is available');
      console.log('   ✅ Port 3000: Available\n');
    } else {
      warnings.push('Port 3000 is already in use');
      console.log('   ⚠️  Port 3000: In use (server may already be running)\n');
    }
    
    // Final Summary
    console.log('═'.repeat(80));
    console.log('║  Health Check Summary');
    console.log('═'.repeat(80) + '\n');
    
    console.log(`✅ Passed: ${passed.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`❌ Issues: ${issues.length}\n`);
    
    if (issues.length > 0) {
      console.log('❌ Critical Issues Found:\n');
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  Warnings (Non-Critical):\n');
      warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
      console.log('');
    }
    
    if (issues.length === 0) {
      console.log('✅ All critical checks passed! System is healthy.\n');
      console.log('🚀 You can start the server with: npm start\n');
      process.exit(0);
    } else {
      console.log('❌ Please fix the critical issues before starting the server.\n');
      console.log('💡 Troubleshooting:');
      console.log('   1. Ensure Docker containers are running: docker-compose up -d');
      console.log('   2. Check .env file has all required variables');
      console.log('   3. Run: npm install');
      console.log('   4. Run: npx prisma generate\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    process.exit(1);
  }
})();
