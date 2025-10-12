const fs = require('fs');
const path = require('path');
const axios = require('axios');

class AIIntegrationSetup {
  constructor() {
    this.envPath = '.env';
    this.serverEnvPath = 'server/.env';
    this.config = {};
    this.testResults = {};
  }

  async run() {
    console.log('🤖 WellSense AI - AI Integration Setup');
    console.log('=====================================\n');

    try {
      await this.checkEnvironment();
      await this.installDependencies();
      await this.setupEnvironmentFiles();
      await this.testAIProviders();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkEnvironment() {
    console.log('📋 Checking environment...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`   Node.js version: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1)) < 16) {
      throw new Error('Node.js 16 or higher is required');
    }

    // Check if we're in the right directory
    if (!fs.existsSync('package.json') || !fs.existsSync('server/package.json')) {
      throw new Error('Please run this script from the WellSense AI root directory');
    }

    console.log('✅ Environment check passed\n');
  }

  async installDependencies() {
    console.log('📦 Installing AI integration dependencies...');
    
    const { spawn } = require('child_process');
    
    // Install backend dependencies
    console.log('   Installing backend AI dependencies...');
    await this.runCommand('npm', ['install', '@google/generative-ai', '@anthropic-ai/sdk', 'axios'], 'server');
    
    console.log('✅ Dependencies installed\n');
  }

  async setupEnvironmentFiles() {
    console.log('⚙️  Setting up environment configuration...');
    
    // Read existing .env or create from example
    let envContent = '';
    if (fs.existsSync(this.envPath)) {
      envContent = fs.readFileSync(this.envPath, 'utf8');
      console.log('   Found existing .env file');
    } else if (fs.existsSync('.env.example')) {
      envContent = fs.readFileSync('.env.example', 'utf8');
      fs.writeFileSync(this.envPath, envContent);
      console.log('   Created .env from .env.example');
    }

    // Parse environment variables
    this.parseEnvFile(envContent);
    
    console.log('✅ Environment files configured\n');
  }

  parseEnvFile(content) {
    const lines = content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        this.config[key] = value;
      }
    });
  }

  async testAIProviders() {
    console.log('🧪 Testing AI providers...');
    
    const providers = [
      { name: 'OpenAI', key: 'OPENAI_API_KEY', test: this.testOpenAI.bind(this) },
      { name: 'Google AI', key: 'GOOGLE_AI_API_KEY', test: this.testGoogleAI.bind(this) },
      { name: 'Anthropic Claude', key: 'ANTHROPIC_API_KEY', test: this.testAnthropic.bind(this) },
      { name: 'Cohere', key: 'COHERE_API_KEY', test: this.testCohere.bind(this) },
      { name: 'Hugging Face', key: 'HUGGING_FACE_TOKEN', test: this.testHuggingFace.bind(this) }
    ];

    for (const provider of providers) {
      console.log(`   Testing ${provider.name}...`);
      
      if (!this.config[provider.key] || this.config[provider.key].includes('your_')) {
        this.testResults[provider.name] = {
          status: 'not_configured',
          message: 'API key not configured'
        };
        console.log(`   ⚠️  ${provider.name}: Not configured`);
        continue;
      }

      try {
        const result = await provider.test();
        this.testResults[provider.name] = {
          status: 'success',
          message: 'Connection successful',
          details: result
        };
        console.log(`   ✅ ${provider.name}: Working`);
      } catch (error) {
        this.testResults[provider.name] = {
          status: 'error',
          message: error.message
        };
        console.log(`   ❌ ${provider.name}: ${error.message}`);
      }
    }

    console.log('');
  }

  async testOpenAI() {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: this.config.OPENAI_API_KEY,
      organization: this.config.OPENAI_ORG_ID
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, this is a test.' }],
      max_tokens: 10
    });

    return {
      model: response.model,
      usage: response.usage
    };
  }

  async testGoogleAI() {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.config.GOOGLE_AI_API_KEY);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello, this is a test.');
    const response = await result.response;
    
    return {
      model: 'gemini-pro',
      response_length: response.text().length
    };
  }

  async testAnthropic() {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: this.config.ANTHROPIC_API_KEY
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello, this is a test.' }]
    });

    return {
      model: response.model,
      usage: response.usage
    };
  }

  async testCohere() {
    const response = await axios.post('https://api.cohere.ai/v1/generate', {
      model: 'command',
      prompt: 'Hello, this is a test.',
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      model: 'command',
      generations: response.data.generations.length
    };
  }

  async testHuggingFace() {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      { inputs: 'Hello, this is a test.' },
      {
        headers: {
          'Authorization': `Bearer ${this.config.HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      model: 'DialoGPT-medium',
      response_length: response.data.length
    };
  }

  async generateReport() {
    console.log('📊 AI Integration Report');
    console.log('========================\n');

    const workingProviders = Object.entries(this.testResults)
      .filter(([_, result]) => result.status === 'success')
      .map(([name, _]) => name);

    const configuredProviders = Object.entries(this.testResults)
      .filter(([_, result]) => result.status !== 'not_configured')
      .map(([name, _]) => name);

    console.log(`✅ Working providers: ${workingProviders.length}`);
    console.log(`⚙️  Configured providers: ${configuredProviders.length}`);
    console.log(`📋 Total providers: ${Object.keys(this.testResults).length}\n`);

    console.log('Provider Status:');
    Object.entries(this.testResults).forEach(([name, result]) => {
      const icon = result.status === 'success' ? '✅' : 
                   result.status === 'error' ? '❌' : '⚠️';
      console.log(`   ${icon} ${name}: ${result.message}`);
    });

    console.log('\n🎯 Recommendations:');
    
    if (workingProviders.length === 0) {
      console.log('   • Configure at least one AI provider for full functionality');
      console.log('   • The system will use fallback responses without AI providers');
      console.log('   • Start with OpenAI for the best experience');
    } else if (workingProviders.length === 1) {
      console.log('   • Great! You have one working AI provider');
      console.log('   • Consider adding more providers for redundancy');
      console.log('   • Multiple providers improve reliability and features');
    } else {
      console.log('   • Excellent! Multiple AI providers configured');
      console.log('   • Your system has high reliability and redundancy');
      console.log('   • All AI features will work optimally');
    }

    console.log('\n🚀 Next Steps:');
    console.log('   1. Start the backend server: npm run server');
    console.log('   2. Start the frontend: npm run dev');
    console.log('   3. Test AI features in the application');
    console.log('   4. Check AI status at: /api/chat/ai-status');

    // Save detailed report
    const reportPath = 'ai-integration-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_providers: Object.keys(this.testResults).length,
        working_providers: workingProviders.length,
        configured_providers: configuredProviders.length
      },
      providers: this.testResults,
      recommendations: this.generateRecommendations(workingProviders.length)
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  generateRecommendations(workingCount) {
    if (workingCount === 0) {
      return [
        'Configure at least one AI provider (OpenAI recommended)',
        'System will use fallback responses without AI providers',
        'Visit provider websites to get API keys'
      ];
    } else if (workingCount === 1) {
      return [
        'Consider adding more AI providers for redundancy',
        'Multiple providers improve reliability',
        'Different providers excel at different tasks'
      ];
    } else {
      return [
        'Excellent configuration with multiple providers',
        'System has high reliability and redundancy',
        'All AI features will work optimally'
      ];
    }
  }

  runCommand(command, args, cwd = '.') {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const process = spawn(command, args, { 
        cwd, 
        stdio: 'pipe',
        shell: true 
      });

      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(error || `Command failed with code ${code}`));
        }
      });
    });
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  const setup = new AIIntegrationSetup();
  setup.run().catch(console.error);
}

module.exports = AIIntegrationSetup;