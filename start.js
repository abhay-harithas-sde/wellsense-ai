#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting WellSense AI Application...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
try {
  const packageJson = require(packageJsonPath);
  if (packageJson.name !== 'wellsense-ai') {
    console.error('❌ Please run this script from the WellSense AI root directory');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ package.json not found. Please run this script from the WellSense AI root directory');
  process.exit(1);
}

console.log('📦 Installing dependencies...');

// Install frontend dependencies
const installFrontend = spawn('npm', ['install'], { stdio: 'inherit' });

installFrontend.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to install frontend dependencies');
    process.exit(1);
  }

  console.log('✅ Frontend dependencies installed');
  console.log('📦 Installing backend dependencies...');

  // Install backend dependencies
  const installBackend = spawn('npm', ['install'], { 
    cwd: path.join(process.cwd(), 'server'),
    stdio: 'inherit' 
  });

  installBackend.on('close', (code) => {
    if (code !== 0) {
      console.log('⚠️  Backend dependencies installation failed (this is OK for demo mode)');
    } else {
      console.log('✅ Backend dependencies installed');
    }

    console.log('\n🌟 Starting WellSense AI in demo mode...');
    console.log('📱 Frontend will be available at: http://localhost:3000');
    console.log('🔧 Backend API would be at: http://localhost:5000 (if running)');
    console.log('\n💡 The app will work in demo mode without a backend!\n');

    // Start the frontend
    const startFrontend = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

    startFrontend.on('close', (code) => {
      console.log(`\n👋 WellSense AI stopped with code ${code}`);
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down WellSense AI...');
      startFrontend.kill('SIGINT');
      process.exit(0);
    });
  });
});