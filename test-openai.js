#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing OpenAI Integration Setup\n');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, 'green');
const error = (message) => log(`❌ ${message}`, 'red');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');
const info = (message) => log(`ℹ️  ${message}`, 'blue');

// Test 1: Check required files
log('Test 1: Checking required files...', 'cyan');
const requiredFiles = [
  'server/services/openaiService.js',
  'server/routes/chat.js',
  'server/middleware/auth.js',
  'src/services/openaiClient.js',
  'src/components/ai/OpenAIDemo.jsx',
  'server/.env',
  '.env.local'
];

let filesOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success(`${file}`);
  } else {
    error(`Missing: ${file}`);
    filesOk = false;
  }
});

// Test 2: Check environment variables
log('\nTest 2: Checking environment configuration...', 'cyan');
const serverEnvPath = 'server/.env';
if (fs.existsSync(serverEnvPath)) {
  const envContent = fs.readFileSync(serverEnvPath, 'utf8');
  
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
  ];

  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(`${envVar}=`)) {
      success(`${envVar} configured`);
    } else {
      error(`Missing: ${envVar}`);
    }
  });

  if (envContent.includes('OPENAI_API_KEY=your_openai_api_key_here')) {
    warning('OpenAI API key not set (using placeholder)');
    info('Update OPENAI_API_KEY in server/.env with your actual key');
  }
} else {
  error('server/.env file not found');
}

// Test 3: Check package dependencies
log('\nTest 3: Checking dependencies...', 'cyan');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const serverPackageJson = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));

  // Check frontend dependencies
  const frontendDeps = ['react', 'react-router-dom', 'framer-motion'];
  frontendDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      success(`Frontend: ${dep}`);
    } else {
      error(`Missing frontend dependency: ${dep}`);
    }
  });

  // Check backend dependencies
  const backendDeps = ['express', 'openai', 'mongoose', 'jsonwebtoken'];
  backendDeps.forEach(dep => {
    if (serverPackageJson.dependencies[dep]) {
      success(`Backend: ${dep}`);
    } else {
      error(`Missing backend dependency: ${dep}`);
    }
  });
} catch (err) {
  error(`Error checking dependencies: ${err.message}`);
}

// Test 4: Check service implementations
log('\nTest 4: Checking service implementations...', 'cyan');
try {
  const openaiServicePath = 'server/services/openaiService.js';
  if (fs.existsSync(openaiServicePath)) {
    const serviceContent = fs.readFileSync(openaiServicePath, 'utf8');
    
    const requiredMethods = [
      'createHealthChatCompletion',
      'analyzeFoodImage',
      'generateHealthPlan',
      'generateNutritionAdvice'
    ];

    requiredMethods.forEach(method => {
      if (serviceContent.includes(method)) {
        success(`OpenAI Service: ${method}`);
      } else {
        error(`Missing method: ${method}`);
      }
    });
  }

  const clientServicePath = 'src/services/openaiClient.js';
  if (fs.existsSync(clientServicePath)) {
    const clientContent = fs.readFileSync(clientServicePath, 'utf8');
    
    const requiredClientMethods = [
      'startChatSession',
      'sendMessage',
      'streamMessage',
      'analyzeFoodImage'
    ];

    requiredClientMethods.forEach(method => {
      if (clientContent.includes(method)) {
        success(`Client Service: ${method}`);
      } else {
        error(`Missing client method: ${method}`);
      }
    });
  }
} catch (err) {
  error(`Error checking services: ${err.message}`);
}

// Test 5: Check routes
log('\nTest 5: Checking API routes...', 'cyan');
try {
  const chatRoutesPath = 'server/routes/chat.js';
  if (fs.existsSync(chatRoutesPath)) {
    const routesContent = fs.readFileSync(chatRoutesPath, 'utf8');
    
    const requiredRoutes = [
      'POST /start',
      'POST /:sessionId/message',
      'POST /stream',
      'POST /analyze-food',
      'POST /generate-plan'
    ];

    const routePatterns = [
      /router\.post\(['"`]\/start['"`]/,
      /router\.post\(['"`]\/:sessionId\/message['"`]/,
      /router\.post\(['"`]\/stream['"`]/,
      /router\.post\(['"`]\/analyze-food['"`]/,
      /router\.post\(['"`]\/generate-plan['"`]/
    ];

    routePatterns.forEach((pattern, index) => {
      if (pattern.test(routesContent)) {
        success(`Route: ${requiredRoutes[index]}`);
      } else {
        error(`Missing route: ${requiredRoutes[index]}`);
      }
    });
  }
} catch (err) {
  error(`Error checking routes: ${err.message}`);
}

// Summary
log('\n' + '='.repeat(50), 'cyan');
log('🧪 Test Summary', 'cyan');
log('='.repeat(50), 'cyan');

if (filesOk) {
  success('All required files are present');
} else {
  error('Some required files are missing');
}

log('\n📋 Next Steps:', 'blue');
log('1. If tests passed: Run "npm run setup:openai" to complete setup');
log('2. Get OpenAI API key from https://platform.openai.com/api-keys');
log('3. Update server/.env with your API key');
log('4. Start MongoDB service');
log('5. Run "npm run start:full" to start the application');

log('\n🔗 Test the integration at:', 'blue');
log('   http://localhost:3000/openai-demo');

log('\n💡 Tips:', 'yellow');
log('• The system works in demo mode without an API key');
log('• Check browser console for detailed error messages');
log('• Use /api/chat/health-check to test backend connectivity');

console.log();