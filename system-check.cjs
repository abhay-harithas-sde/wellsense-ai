#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class SystemChecker {
  constructor() {
    this.checks = [];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  async runAllChecks() {
    console.log('🔍 WellSense AI System Check');
    console.log('============================\n');

    await this.checkNodeVersion();
    await this.checkPackageFiles();
    await this.checkEnvironmentFiles();
    await this.checkDependencies();
    await this.checkDatabaseConfig();
    await this.checkServerFiles();
    await this.checkFrontendFiles();
    await this.checkMigrationSystem();
    await this.checkConsultationSystem();

    this.showSummary();
    return this.results.failed === 0;
  }

  async checkNodeVersion() {
    console.log('📋 Checking Node.js version...');
    
    const version = process.version;
    const majorVersion = parseInt(version.slice(1));
    
    if (majorVersion >= 16) {
      this.pass(`Node.js ${version} ✅`);
    } else {
      this.fail(`Node.js ${version} - Requires v16+ ❌`);
    }
  }

  async checkPackageFiles() {
    console.log('\n📦 Checking package files...');
    
    const files = [
      'package.json',
      'server/package.json'
    ];

    for (const file of files) {
      try {
        await fs.access(file);
        const content = await fs.readFile(file, 'utf8');
        const pkg = JSON.parse(content);
        this.pass(`${file} - ${pkg.name}@${pkg.version} ✅`);
      } catch (error) {
        this.fail(`${file} - Missing or invalid ❌`);
      }
    }
  }

  async checkEnvironmentFiles() {
    console.log('\n🔧 Checking environment configuration...');
    
    const envFiles = [
      { file: '.env', required: false },
      { file: 'server/.env', required: false }
    ];

    for (const { file, required } of envFiles) {
      try {
        await fs.access(file);
        this.pass(`${file} - Found ✅`);
      } catch (error) {
        if (required) {
          this.fail(`${file} - Missing (required) ❌`);
        } else {
          this.warn(`${file} - Not found (using defaults) ⚠️`);
        }
      }
    }
  }

  async checkDependencies() {
    console.log('\n📚 Checking dependencies...');
    
    try {
      // Check root node_modules
      await fs.access('node_modules');
      this.pass('Frontend dependencies - Installed ✅');
    } catch (error) {
      this.fail('Frontend dependencies - Missing ❌');
    }

    try {
      // Check server node_modules
      await fs.access('server/node_modules');
      this.pass('Server dependencies - Installed ✅');
    } catch (error) {
      this.fail('Server dependencies - Missing ❌');
    }
  }

  async checkDatabaseConfig() {
    console.log('\n🗄️  Checking database configuration...');
    
    const dbFiles = [
      'server/config/database.js',
      'server/scripts/migrations/migrationRunner.js',
      'server/scripts/dbManager.js'
    ];

    for (const file of dbFiles) {
      try {
        await fs.access(file);
        this.pass(`${path.basename(file)} - Found ✅`);
      } catch (error) {
        this.fail(`${path.basename(file)} - Missing ❌`);
      }
    }
  }

  async checkServerFiles() {
    console.log('\n🔧 Checking server files...');
    
    const serverFiles = [
      'server/server.js',
      'server/routes/consultations.js',
      'server/services/videoCallService.js',
      'server/sockets/videoCallHandlers.js'
    ];

    for (const file of serverFiles) {
      try {
        await fs.access(file);
        this.pass(`${path.basename(file)} - Found ✅`);
      } catch (error) {
        this.fail(`${path.basename(file)} - Missing ❌`);
      }
    }
  }

  async checkFrontendFiles() {
    console.log('\n🎨 Checking frontend files...');
    
    const frontendFiles = [
      'src/components/consultation/VideoConsultation.jsx',
      'src/components/consultation/ConsultationBooking.jsx',
      'src/components/consultation/ConsultationDashboard.jsx',
      'src/pages/ConsultationPage.jsx'
    ];

    for (const file of frontendFiles) {
      try {
        await fs.access(file);
        this.pass(`${path.basename(file)} - Found ✅`);
      } catch (error) {
        this.fail(`${path.basename(file)} - Missing ❌`);
      }
    }
  }

  async checkMigrationSystem() {
    console.log('\n📋 Checking migration system...');
    
    const migrationFiles = [
      'server/scripts/migrations/001_initial_schema.js',
      'server/scripts/migrations/002_add_indexes.js',
      'server/scripts/migrations/003_add_community_features.js',
      'server/scripts/migrations/004_add_consultation_system.js'
    ];

    for (const file of migrationFiles) {
      try {
        await fs.access(file);
        this.pass(`${path.basename(file)} - Found ✅`);
      } catch (error) {
        this.fail(`${path.basename(file)} - Missing ❌`);
      }
    }
  }

  async checkConsultationSystem() {
    console.log('\n🩺 Checking consultation system...');
    
    // Check if consultation routes are properly integrated
    try {
      const serverContent = await fs.readFile('server/server.js', 'utf8');
      
      if (serverContent.includes('consultationRoutes')) {
        this.pass('Consultation routes - Integrated ✅');
      } else {
        this.fail('Consultation routes - Not integrated ❌');
      }

      if (serverContent.includes('VideoCallHandlers')) {
        this.pass('Video call handlers - Integrated ✅');
      } else {
        this.fail('Video call handlers - Not integrated ❌');
      }
    } catch (error) {
      this.fail('Server integration - Cannot verify ❌');
    }
  }

  pass(message) {
    console.log(`   ✅ ${message}`);
    this.results.passed++;
  }

  fail(message) {
    console.log(`   ❌ ${message}`);
    this.results.failed++;
  }

  warn(message) {
    console.log(`   ⚠️  ${message}`);
    this.results.warnings++;
  }

  showSummary() {
    console.log('\n📊 System Check Summary');
    console.log('======================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 System check passed! Ready for deployment.');
      console.log('\nNext steps:');
      console.log('   • Run: npm run deploy (for production)');
      console.log('   • Run: npm run start:dev (for development)');
    } else {
      console.log('\n⚠️  System check failed. Please fix the issues above.');
      console.log('\nCommon fixes:');
      console.log('   • Run: npm install && cd server && npm install');
      console.log('   • Check file paths and ensure all files exist');
      console.log('   • Verify Node.js version (16+ required)');
    }
  }
}

// Run system check if this file is executed directly
if (require.main === module) {
  const checker = new SystemChecker();
  checker.runAllChecks().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 System check failed:', error);
    process.exit(1);
  });
}

module.exports = SystemChecker;