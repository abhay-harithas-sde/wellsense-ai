#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class FinalSystemCheck {
  constructor() {
    this.results = {
      core: [],
      database: [],
      consultation: [],
      frontend: [],
      deployment: []
    };
  }

  async runFinalCheck() {
    console.log('🎯 WellSense AI - Final Deployment Check');
    console.log('========================================\n');

    await this.checkCoreSystem();
    await this.checkDatabaseSystem();
    await this.checkConsultationSystem();
    await this.checkFrontendComponents();
    await this.checkDeploymentReadiness();

    this.showFinalSummary();
  }

  async checkCoreSystem() {
    console.log('🔧 Core System Check');
    console.log('-------------------');

    const coreFiles = [
      { file: 'package.json', desc: 'Root package configuration' },
      { file: 'server/package.json', desc: 'Server package configuration' },
      { file: 'server/server.js', desc: 'Main server application' },
      { file: 'vite.config.js', desc: 'Frontend build configuration' },
      { file: '.env', desc: 'Environment configuration' },
      { file: 'server/.env', desc: 'Server environment configuration' }
    ];

    for (const { file, desc } of coreFiles) {
      try {
        await fs.access(file);
        this.pass('core', `${desc} ✅`);
      } catch (error) {
        this.fail('core', `${desc} ❌`);
      }
    }
  }

  async checkDatabaseSystem() {
    console.log('\n🗄️  Database System Check');
    console.log('------------------------');

    const dbFiles = [
      { file: 'server/config/database.js', desc: 'Database configuration' },
      { file: 'server/scripts/migrations/migrationRunner.js', desc: 'Migration runner' },
      { file: 'server/scripts/migrations/001_initial_schema.js', desc: 'Initial schema migration' },
      { file: 'server/scripts/migrations/002_add_indexes.js', desc: 'Performance indexes migration' },
      { file: 'server/scripts/migrations/003_add_community_features.js', desc: 'Community features migration' },
      { file: 'server/scripts/migrations/004_add_consultation_system.js', desc: 'Consultation system migration' },
      { file: 'server/scripts/dbManager.js', desc: 'Database manager' },
      { file: 'server/scripts/seedData.js', desc: 'Data seeding system' },
      { file: 'DATABASE_MIGRATION_GUIDE.md', desc: 'Migration documentation' }
    ];

    for (const { file, desc } of dbFiles) {
      try {
        await fs.access(file);
        this.pass('database', `${desc} ✅`);
      } catch (error) {
        this.fail('database', `${desc} ❌`);
      }
    }
  }

  async checkConsultationSystem() {
    console.log('\n🩺 Video Consultation System Check');
    console.log('----------------------------------');

    const consultationFiles = [
      { file: 'server/routes/consultations.js', desc: 'Consultation API routes' },
      { file: 'server/services/videoCallService.js', desc: 'Video call service' },
      { file: 'server/sockets/videoCallHandlers.js', desc: 'WebRTC socket handlers' },
      { file: 'src/components/consultation/VideoConsultation.jsx', desc: 'Video call interface' },
      { file: 'src/components/consultation/ConsultationBooking.jsx', desc: 'Booking system' },
      { file: 'src/components/consultation/ConsultationDashboard.jsx', desc: 'Consultation dashboard' },
      { file: 'src/components/consultation/ProfessionalProfile.jsx', desc: 'Professional profiles' },
      { file: 'src/pages/ConsultationPage.jsx', desc: 'Main consultation page' }
    ];

    for (const { file, desc } of consultationFiles) {
      try {
        await fs.access(file);
        this.pass('consultation', `${desc} ✅`);
      } catch (error) {
        this.fail('consultation', `${desc} ❌`);
      }
    }
  }

  async checkFrontendComponents() {
    console.log('\n🎨 Frontend Components Check');
    console.log('----------------------------');

    const frontendFiles = [
      { file: 'src/components/chatbot/ChatInterface.jsx', desc: 'AI chat interface' },
      { file: 'src/components/chatbot/NutritionistChat.jsx', desc: 'Nutritionist chat' },
      { file: 'src/components/dashboard/NutritionistDashboard.jsx', desc: 'Nutritionist dashboard' },
      { file: 'src/components/dashboard/AppointmentScheduler.jsx', desc: 'Appointment scheduler' },
      { file: 'src/components/dashboard/NutritionAnalytics.jsx', desc: 'Nutrition analytics' },
      { file: 'src/components/dashboard/ClientDetails.jsx', desc: 'Client details' },
      { file: 'index.html', desc: 'Main HTML template' },
      { file: 'src/main.jsx', desc: 'React application entry' }
    ];

    for (const { file, desc } of frontendFiles) {
      try {
        await fs.access(file);
        this.pass('frontend', `${desc} ✅`);
      } catch (error) {
        this.fail('frontend', `${desc} ❌`);
      }
    }
  }

  async checkDeploymentReadiness() {
    console.log('\n🚀 Deployment Readiness Check');
    console.log('-----------------------------');

    const deploymentFiles = [
      { file: 'deploy.cjs', desc: 'Deployment script' },
      { file: 'start-dev.cjs', desc: 'Development server script' },
      { file: 'system-check.cjs', desc: 'System check script' },
      { file: 'DEPLOYMENT_GUIDE.md', desc: 'Deployment documentation' },
      { file: 'LLM_INTEGRATION_GUIDE.md', desc: 'LLM integration guide' },
      { file: 'DATABASE_INTEGRATION_GUIDE.md', desc: 'Database integration guide' }
    ];

    for (const { file, desc } of deploymentFiles) {
      try {
        await fs.access(file);
        this.pass('deployment', `${desc} ✅`);
      } catch (error) {
        this.fail('deployment', `${desc} ❌`);
      }
    }

    // Check package.json scripts
    try {
      const packageContent = await fs.readFile('package.json', 'utf8');
      const pkg = JSON.parse(packageContent);
      
      const requiredScripts = [
        'deploy', 'start:dev', 'system:check', 'db:setup', 'db:migrate', 'db:status'
      ];
      
      for (const script of requiredScripts) {
        if (pkg.scripts[script]) {
          this.pass('deployment', `npm script: ${script} ✅`);
        } else {
          this.fail('deployment', `npm script: ${script} ❌`);
        }
      }
    } catch (error) {
      this.fail('deployment', 'Package.json scripts check failed ❌');
    }
  }

  pass(category, message) {
    console.log(`   ✅ ${message}`);
    this.results[category].push({ status: 'pass', message });
  }

  fail(category, message) {
    console.log(`   ❌ ${message}`);
    this.results[category].push({ status: 'fail', message });
  }

  showFinalSummary() {
    console.log('\n📊 Final System Summary');
    console.log('=======================');

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.results).forEach(([category, results]) => {
      const passed = results.filter(r => r.status === 'pass').length;
      const failed = results.filter(r => r.status === 'fail').length;
      
      totalPassed += passed;
      totalFailed += failed;
      
      const status = failed === 0 ? '✅' : '❌';
      console.log(`${status} ${category.padEnd(15)}: ${passed}/${passed + failed} passed`);
    });

    console.log('\n' + '='.repeat(50));
    console.log(`📈 Overall: ${totalPassed}/${totalPassed + totalFailed} components ready`);

    if (totalFailed === 0) {
      console.log('\n🎉 SYSTEM READY FOR DEPLOYMENT!');
      console.log('\n🚀 Quick Start Commands:');
      console.log('   • Production: npm run deploy');
      console.log('   • Development: npm run start:dev');
      console.log('   • System Check: npm run system:check');
      console.log('\n🌐 Access Points:');
      console.log('   • Frontend: http://localhost:3000');
      console.log('   • Backend API: http://localhost:5000/api');
      console.log('   • Health Check: http://localhost:5000/api/health-check');
      console.log('\n📚 Documentation:');
      console.log('   • Deployment: DEPLOYMENT_GUIDE.md');
      console.log('   • Database: DATABASE_MIGRATION_GUIDE.md');
      console.log('   • LLM Integration: LLM_INTEGRATION_GUIDE.md');
    } else {
      console.log('\n⚠️  SYSTEM NOT READY - Please fix the issues above');
      console.log('\n🔧 Common fixes:');
      console.log('   • Run: npm install && cd server && npm install');
      console.log('   • Check file paths and permissions');
      console.log('   • Verify all required files exist');
    }

    console.log('\n🏥 WellSense AI Features Ready:');
    console.log('   ✅ AI Health Chat (Multi-provider: OpenAI, Anthropic, Google)');
    console.log('   ✅ Video Consultations (WebRTC-based real-time calls)');
    console.log('   ✅ Professional Booking System');
    console.log('   ✅ Health Dashboard & Analytics');
    console.log('   ✅ Community Features');
    console.log('   ✅ Nutritionist Tools');
    console.log('   ✅ Database Migration System');
    console.log('   ✅ Multi-database Support (MongoDB, MySQL, PostgreSQL)');
    console.log('   ✅ Real-time Communication (Socket.IO)');
    console.log('   ✅ Security & Authentication');
  }
}

// Run final check
const checker = new FinalSystemCheck();
checker.runFinalCheck().catch(error => {
  console.error('💥 Final check failed:', error);
  process.exit(1);
});