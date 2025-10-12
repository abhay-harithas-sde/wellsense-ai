#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 WellSense AI - OpenAI Integration Setup\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const step = (number, message) => {
  log(`\n${colors.bright}Step ${number}:${colors.reset} ${colors.cyan}${message}${colors.reset}`);
};

const success = (message) => {
  log(`✅ ${message}`, 'green');
};

const warning = (message) => {
  log(`⚠️  ${message}`, 'yellow');
};

const error = (message) => {
  log(`❌ ${message}`, 'red');
};

const info = (message) => {
  log(`ℹ️  ${message}`, 'blue');
};

// Check if running in correct directory
if (!fs.existsSync('package.json')) {
  error('Please run this script from the project root directory');
  process.exit(1);
}

try {
  step(1, 'Installing frontend dependencies');
  
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    log('Installing frontend packages...');
    execSync('npm install', { stdio: 'inherit' });
    success('Frontend dependencies installed');
  } else {
    info('Frontend dependencies already installed');
  }

  step(2, 'Setting up backend');
  
  // Create server directory if it doesn't exist
  if (!fs.existsSync('server')) {
    fs.mkdirSync('server');
    log('Created server directory');
  }

  // Install backend dependencies
  process.chdir('server');
  
  if (!fs.existsSync('package.json')) {
    warning('Backend package.json not found, creating...');
    // The package.json should already be created by our setup
  }

  if (!fs.existsSync('node_modules')) {
    log('Installing backend packages...');
    execSync('npm install', { stdio: 'inherit' });
    success('Backend dependencies installed');
  } else {
    info('Backend dependencies already installed');
  }

  // Go back to root
  process.chdir('..');

  step(3, 'Creating environment files');

  // Create frontend .env.local
  const frontendEnv = `# WellSense AI Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_OPENAI_API_KEY=demo-mode
REACT_APP_APP_NAME=WellSense AI
REACT_APP_VERSION=1.0.0
`;

  if (!fs.existsSync('.env.local')) {
    fs.writeFileSync('.env.local', frontendEnv);
    success('Created frontend .env.local');
  } else {
    info('Frontend .env.local already exists');
  }

  // Create backend .env
  const backendEnv = `# WellSense AI Backend Configuration

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORG_ID=your_organization_id_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/wellsense-ai

# JWT Configuration
JWT_SECRET=wellsense_ai_super_secret_key_${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10mb
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Configuration
AI_MODEL_PRIMARY=gpt-4
AI_MODEL_SECONDARY=gpt-3.5-turbo
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
`;

  const serverEnvPath = path.join('server', '.env');
  if (!fs.existsSync(serverEnvPath)) {
    fs.writeFileSync(serverEnvPath, backendEnv);
    success('Created backend .env');
  } else {
    info('Backend .env already exists');
  }

  step(4, 'Creating necessary directories');

  const directories = [
    'server/uploads',
    'server/logs',
    'public/uploads'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      success(`Created ${dir} directory`);
    } else {
      info(`${dir} directory already exists`);
    }
  });

  step(5, 'Verifying installation');

  // Check if all required files exist
  const requiredFiles = [
    'package.json',
    'server/package.json',
    'server/server.js',
    'server/services/openaiService.js',
    'src/services/openaiClient.js',
    'src/components/ai/OpenAIDemo.jsx',
    '.env.local',
    'server/.env'
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`${file} ✓`);
    } else {
      error(`${file} ✗`);
      allFilesExist = false;
    }
  });

  if (allFilesExist) {
    success('All required files are present');
  } else {
    warning('Some files are missing. Please check the setup.');
  }

  step(6, 'Setup complete!');

  log('\n' + '='.repeat(60), 'cyan');
  log('🎉 WellSense AI OpenAI Integration Setup Complete!', 'green');
  log('='.repeat(60), 'cyan');

  log('\n📋 Next Steps:', 'bright');
  log('1. Get your OpenAI API key from: https://platform.openai.com/api-keys', 'yellow');
  log('2. Update OPENAI_API_KEY in server/.env file', 'yellow');
  log('3. Install and start MongoDB (or use MongoDB Atlas)', 'yellow');
  log('4. Update MONGODB_URI in server/.env if needed', 'yellow');

  log('\n🚀 To start the application:', 'bright');
  log('   npm run start:full    # Start both frontend and backend', 'cyan');
  log('   OR', 'yellow');
  log('   npm run server       # Start backend only', 'cyan');
  log('   npm run dev          # Start frontend only (in another terminal)', 'cyan');

  log('\n🔗 URLs:', 'bright');
  log('   Frontend: http://localhost:3000', 'cyan');
  log('   Backend:  http://localhost:5000', 'cyan');
  log('   OpenAI Demo: http://localhost:3000/openai-demo', 'cyan');

  log('\n📖 Documentation:', 'bright');
  log('   Setup Guide: OPENAI_SETUP.md', 'cyan');
  log('   API Docs: http://localhost:5000/api/health-check', 'cyan');

  log('\n💡 Features Available:', 'bright');
  log('   • Real-time AI chat with GPT-4', 'green');
  log('   • Food image analysis', 'green');
  log('   • Personalized health plans', 'green');
  log('   • Nutrition advice', 'green');
  log('   • Workout recommendations', 'green');
  log('   • Health trend analysis', 'green');

  log('\n🔧 Troubleshooting:', 'bright');
  log('   • Check console logs for errors', 'yellow');
  log('   • Verify OpenAI API key and credits', 'yellow');
  log('   • Ensure MongoDB is running', 'yellow');
  log('   • Test /api/chat/health-check endpoint', 'yellow');

  log('\n✨ Demo Mode:', 'bright');
  log('   If you don\'t have an OpenAI API key yet, the system will', 'blue');
  log('   run in demo mode with simulated AI responses.', 'blue');

  log('\nHappy coding! 🚀\n', 'green');

} catch (err) {
  error(`Installation failed: ${err.message}`);
  process.exit(1);
}