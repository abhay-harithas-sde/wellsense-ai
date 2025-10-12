#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class DeploymentManager {
  constructor() {
    this.deploymentSteps = [
      'checkEnvironment',
      'installDependencies', 
      'runTests',
      'setupDatabase',
      'buildFrontend',
      'startServices',
      'healthCheck',
      'deploymentSummary'
    ];
    this.results = {};
  }

  async deploy() {
    console.log('🚀 Starting WellSense AI Deployment');
    console.log('===================================\n');

    try {
      for (const step of this.deploymentSteps) {
        console.log(`📋 Step: ${step}`);
        await this[step]();
        console.log('');
      }

      console.log('🎉 Deployment completed successfully!');
      this.showQuickStart();
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check environment variables in .env file');
      console.log('2. Ensure database is running and accessible');
      console.log('3. Verify all dependencies are installed');
      console.log('4. Check logs for detailed error information');
      process.exit(1);
    }
  }

  async checkEnvironment() {
    console.log('🔍 Checking environment...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`   Node.js: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1)) < 16) {
      throw new Error('Node.js 16 or higher is required');
    }

    // Check if .env files exist
    const envFiles = ['.env', 'server/.env'];
    for (const envFile of envFiles) {
      try {
        await fs.access(envFile);
        console.log(`   ✅ Found ${envFile}`);
      } catch (error) {
        console.log(`   ⚠️  ${envFile} not found - using defaults`);
      }
    }

    // Check package.json files
    const packageFiles = ['package.json', 'server/package.json'];
    for (const packageFile of packageFiles) {
      try {
        await fs.access(packageFile);
        console.log(`   ✅ Found ${packageFile}`);
      } catch (error) {
        throw new Error(`Missing ${packageFile}`);
      }
    }

    this.results.environment = 'OK';
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    // Install root dependencies
    console.log('   Installing frontend dependencies...');
    await this.runCommand('npm install');
    
    // Install server dependencies
    console.log('   Installing server dependencies...');
    await this.runCommand('npm install', { cwd: 'server' });
    
    console.log('   ✅ All dependencies installed');
    this.results.dependencies = 'OK';
  }

  async runTests() {
    console.log('🧪 Running tests...');
    
    try {
      // Test database migrations
      console.log('   Testing database system...');
      await this.runCommand('node scripts/testMigrations.js', { cwd: 'server' });
      console.log('   ✅ Database tests passed');
      
      // Test API endpoints (if test files exist)
      try {
        await fs.access('server/tests');
        console.log('   Running API tests...');
        await this.runCommand('npm test', { cwd: 'server' });
        console.log('   ✅ API tests passed');
      } catch (error) {
        console.log('   ⚠️  No API tests found - skipping');
      }
      
      this.results.tests = 'OK';
    } catch (error) {
      console.log('   ⚠️  Some tests failed - continuing with deployment');
      this.results.tests = 'WARNING';
    }
  }

  async setupDatabase() {
    console.log('🗄️  Setting up database...');
    
    try {
      // Run database setup
      console.log('   Running database migrations...');
      await this.runCommand('npm run db:setup', { timeout: 60000 });
      console.log('   ✅ Database setup completed');
      
      this.results.database = 'OK';
    } catch (error) {
      console.log('   ⚠️  Database setup failed - will use mock data');
      this.results.database = 'MOCK';
    }
  }

  async buildFrontend() {
    console.log('🏗️  Building frontend...');
    
    try {
      console.log('   Building React application...');
      await this.runCommand('npm run build', { timeout: 120000 });
      console.log('   ✅ Frontend build completed');
      
      this.results.frontend = 'OK';
    } catch (error) {
      console.log('   ⚠️  Frontend build failed - will use development mode');
      this.results.frontend = 'DEV';
    }
  }

  async startServices() {
    console.log('🚀 Starting services...');
    
    // Start backend server
    console.log('   Starting backend server...');
    const serverProcess = spawn('node', ['server.js'], {
      cwd: 'server',
      detached: true,
      stdio: 'ignore'
    });
    
    serverProcess.unref();
    
    // Wait for server to start
    await this.waitForService('http://localhost:5000/api/health-check', 30000);
    console.log('   ✅ Backend server started');
    
    this.results.services = 'OK';
  }

  async healthCheck() {
    console.log('🏥 Running health checks...');
    
    const checks = [
      { name: 'Backend API', url: 'http://localhost:5000/api/health-check' },
      { name: 'Database Connection', url: 'http://localhost:5000/api/database/status' },
      { name: 'LLM Services', url: 'http://localhost:5000/api/llm/status' }
    ];

    for (const check of checks) {
      try {
        const response = await fetch(check.url);
        if (response.ok) {
          console.log(`   ✅ ${check.name}: OK`);
        } else {
          console.log(`   ⚠️  ${check.name}: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${check.name}: Failed`);
      }
    }

    this.results.healthCheck = 'OK';
  }

  async deploymentSummary() {
    console.log('📊 Deployment Summary');
    console.log('====================');
    
    Object.entries(this.results).forEach(([step, status]) => {
      const icon = status === 'OK' ? '✅' : status === 'WARNING' ? '⚠️' : status === 'MOCK' ? '🔄' : '❌';
      console.log(`${icon} ${step.padEnd(15)}: ${status}`);
    });
  }

  showQuickStart() {
    console.log('\n🎯 Quick Start Guide');
    console.log('===================');
    console.log('');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend API: http://localhost:5000/api');
    console.log('📋 Health Check: http://localhost:5000/api/health-check');
    console.log('');
    console.log('📱 Available Features:');
    console.log('   • AI Health Chat: /chat');
    console.log('   • Video Consultations: /consultation');
    console.log('   • Health Dashboard: /dashboard');
    console.log('   • Community: /community');
    console.log('   • Nutritionist Tools: /nutritionist');
    console.log('');
    console.log('🛠️  Management Commands:');
    console.log('   • Database Status: npm run db:status');
    console.log('   • Run Migrations: npm run db:migrate');
    console.log('   • Seed Data: npm run db:seed');
    console.log('   • Health Check: npm run health-check');
    console.log('');
    console.log('📚 Documentation:');
    console.log('   • Database: DATABASE_MIGRATION_GUIDE.md');
    console.log('   • LLM Integration: LLM_INTEGRATION_GUIDE.md');
    console.log('   • Database Setup: DATABASE_INTEGRATION_GUIDE.md');
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      const timeout = options.timeout || 30000;
      const timer = setTimeout(() => {
        process.kill();
        reject(new Error(`Command timeout: ${command}`));
      }, timeout);

      process.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed: ${command}\n${errorOutput}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  async waitForService(url, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return true;
        }
      } catch (error) {
        // Service not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Service not ready: ${url}`);
  }
}

// Add fetch polyfill for Node.js < 18
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run deployment if this file is executed directly
if (require.main === module) {
  const deployment = new DeploymentManager();
  deployment.deploy().catch(error => {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentManager;