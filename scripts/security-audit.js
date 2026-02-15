#!/usr/bin/env node

/**
 * Security Audit Tool
 * 
 * Performs automated security checks on environment configuration.
 * Usage:
 *   node scripts/security-audit.js                    # Run all checks
 *   node scripts/security-audit.js --check secrets    # Run specific check
 *   node scripts/security-audit.js --report-only      # Generate report only
 */

const fs = require('fs');
const path = require('path');
const SecretManager = require('../lib/security/secret-manager');
const EnvironmentValidator = require('../lib/security/environment-validator');
const CORSConfigurator = require('../lib/security/cors-configurator');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  check: null,
  reportOnly: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--check' && args[i + 1]) {
    options.check = args[i + 1];
    i++;
  } else if (args[i] === '--report-only') {
    options.reportOnly = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    showHelp();
    process.exit(0);
  }
}

function showHelp() {
  console.log(`
Security Audit Tool

Usage:
  node scripts/security-audit.js [options]

Options:
  --check <name>     Run specific check (secrets, cors, gitignore, ssl, nodeenv)
  --report-only      Generate report without running checks
  --help, -h         Show this help message

Examples:
  node scripts/security-audit.js                    # Run all checks
  node scripts/security-audit.js --check secrets    # Check for weak secrets
  node scripts/security-audit.js --check cors       # Check CORS configuration

Available Checks:
  secrets    - Scan for weak secrets in environment files
  cors       - Check for wildcard CORS in production
  gitignore  - Verify .env.production is in .gitignore
  ssl        - Check SSL configuration
  nodeenv    - Verify NODE_ENV settings
`);
}

class SecurityAuditor {
  constructor() {
    this.secretManager = new SecretManager();
    this.validator = new EnvironmentValidator();
    this.corsConfigurator = new CORSConfigurator();
    this.results = [];
  }

  /**
   * Run all security checks
   */
  async runAllChecks() {
    console.log('\n🔍 Running Security Audit...\n');
    
    await this.checkWeakSecrets('.env');
    await this.checkWeakSecrets('.env.production');
    await this.checkWeakSecrets('.env.test');
    await this.checkCORSConfig('.env.production');
    await this.checkNodeEnv('.env');
    await this.checkNodeEnv('.env.production');
    await this.checkNodeEnv('.env.test');
    await this.checkGitignore();
    await this.checkSSLConfig('.env.production');
    
    return this.generateReport();
  }

  /**
   * Check for weak secrets in environment file
   */
  async checkWeakSecrets(envFile) {
    const checkName = `Weak Secrets - ${envFile}`;
    
    if (!fs.existsSync(envFile)) {
      this.results.push({
        name: checkName,
        category: 'secrets',
        severity: envFile === '.env.production' ? 'critical' : 'info',
        passed: envFile !== '.env.production',
        message: `File not found: ${envFile}`,
        recommendation: envFile === '.env.production' 
          ? 'Create .env.production with strong secrets'
          : 'File is optional'
      });
      return;
    }

    const content = fs.readFileSync(envFile, 'utf-8');
    const lines = content.split('\n');
    const weakSecrets = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');

      if (!value) continue;

      // Check for weak patterns
      if (this.secretManager.isWeakPattern(value)) {
        weakSecrets.push({ key, reason: 'Contains weak pattern' });
      }

      // Check secret length for specific keys
      if (key === 'JWT_SECRET' && value.length < 64) {
        weakSecrets.push({ key, reason: `Too short (${value.length} chars, minimum 64)` });
      }

      if (key.includes('PASSWORD') && value.length < 32) {
        weakSecrets.push({ key, reason: `Too short (${value.length} chars, minimum 32)` });
      }

      if (key.includes('CLIENT_SECRET') && value.length < 48) {
        weakSecrets.push({ key, reason: `Too short (${value.length} chars, minimum 48)` });
      }
    }

    const passed = weakSecrets.length === 0;
    this.results.push({
      name: checkName,
      category: 'secrets',
      severity: envFile === '.env.production' ? 'critical' : 'warning',
      passed,
      message: passed 
        ? 'No weak secrets detected'
        : `Found ${weakSecrets.length} weak secret(s)`,
      details: weakSecrets,
      recommendation: passed 
        ? null
        : 'Run: node scripts/generate-secrets.js to generate strong secrets'
    });
  }

  /**
   * Check CORS configuration
   */
  async checkCORSConfig(envFile) {
    const checkName = `CORS Configuration - ${envFile}`;
    
    if (!fs.existsSync(envFile)) {
      this.results.push({
        name: checkName,
        category: 'cors',
        severity: 'warning',
        passed: false,
        message: `File not found: ${envFile}`,
        recommendation: 'Create .env.production with proper CORS configuration'
      });
      return;
    }

    const content = fs.readFileSync(envFile, 'utf-8');
    const corsOriginMatch = content.match(/CORS_ORIGIN=(.+)/);
    
    if (!corsOriginMatch) {
      this.results.push({
        name: checkName,
        category: 'cors',
        severity: 'warning',
        passed: false,
        message: 'CORS_ORIGIN not configured',
        recommendation: 'Set CORS_ORIGIN to your production domain(s)'
      });
      return;
    }

    const corsOrigin = corsOriginMatch[1].trim();
    const hasWildcard = this.corsConfigurator.hasWildcard(corsOrigin);

    this.results.push({
      name: checkName,
      category: 'cors',
      severity: hasWildcard ? 'critical' : 'info',
      passed: !hasWildcard,
      message: hasWildcard 
        ? 'CORS_ORIGIN contains wildcard (*) - security risk!'
        : 'CORS configuration is secure',
      recommendation: hasWildcard 
        ? 'Replace wildcard with specific allowed origins'
        : null
    });
  }

  /**
   * Check NODE_ENV setting
   */
  async checkNodeEnv(envFile) {
    const checkName = `NODE_ENV - ${envFile}`;
    
    if (!fs.existsSync(envFile)) {
      this.results.push({
        name: checkName,
        category: 'nodeenv',
        severity: 'info',
        passed: true,
        message: `File not found: ${envFile}`,
        recommendation: null
      });
      return;
    }

    const content = fs.readFileSync(envFile, 'utf-8');
    const nodeEnvMatch = content.match(/NODE_ENV=(.+)/);
    
    const expectedEnv = envFile === '.env.production' ? 'production'
      : envFile === '.env.test' ? 'test'
      : 'development';

    if (!nodeEnvMatch) {
      this.results.push({
        name: checkName,
        category: 'nodeenv',
        severity: 'warning',
        passed: false,
        message: 'NODE_ENV not set',
        recommendation: `Add NODE_ENV=${expectedEnv} to ${envFile}`
      });
      return;
    }

    const nodeEnv = nodeEnvMatch[1].trim();
    const passed = nodeEnv === expectedEnv;

    this.results.push({
      name: checkName,
      category: 'nodeenv',
      severity: passed ? 'info' : 'warning',
      passed,
      message: passed 
        ? `NODE_ENV correctly set to '${nodeEnv}'`
        : `NODE_ENV is '${nodeEnv}', expected '${expectedEnv}'`,
      recommendation: passed 
        ? null
        : `Change NODE_ENV to '${expectedEnv}' in ${envFile}`
    });
  }

  /**
   * Check .gitignore for sensitive files
   */
  async checkGitignore() {
    const checkName = 'Gitignore Configuration';
    
    if (!fs.existsSync('.gitignore')) {
      this.results.push({
        name: checkName,
        category: 'gitignore',
        severity: 'critical',
        passed: false,
        message: '.gitignore file not found',
        recommendation: 'Create .gitignore and add .env.production'
      });
      return;
    }

    const content = fs.readFileSync('.gitignore', 'utf-8');
    const hasEnvProduction = content.includes('.env.production');
    const hasEnvDockerProduction = content.includes('.env.docker.production');

    const passed = hasEnvProduction && hasEnvDockerProduction;

    this.results.push({
      name: checkName,
      category: 'gitignore',
      severity: passed ? 'info' : 'critical',
      passed,
      message: passed 
        ? 'Production environment files are properly ignored'
        : 'Production environment files not in .gitignore',
      details: {
        '.env.production': hasEnvProduction,
        '.env.docker.production': hasEnvDockerProduction
      },
      recommendation: passed 
        ? null
        : 'Add .env.production and .env.docker.production to .gitignore'
    });
  }

  /**
   * Check SSL configuration
   */
  async checkSSLConfig(envFile) {
    const checkName = `SSL Configuration - ${envFile}`;
    
    if (!fs.existsSync(envFile)) {
      this.results.push({
        name: checkName,
        category: 'ssl',
        severity: 'warning',
        passed: false,
        message: `File not found: ${envFile}`,
        recommendation: 'Create .env.production with SSL configuration'
      });
      return;
    }

    const content = fs.readFileSync(envFile, 'utf-8');
    const enableHttps = content.match(/ENABLE_HTTPS=(.+)/);
    const sslKeyPath = content.match(/SSL_KEY_PATH=(.+)/);
    const sslCertPath = content.match(/SSL_CERT_PATH=(.+)/);

    const isEnabled = enableHttps && enableHttps[1].trim() === 'true';
    const hasPaths = sslKeyPath && sslCertPath;

    if (!isEnabled) {
      this.results.push({
        name: checkName,
        category: 'ssl',
        severity: 'warning',
        passed: false,
        message: 'HTTPS not enabled (recommended for production)',
        recommendation: 'Set ENABLE_HTTPS=true and configure SSL certificates'
      });
      return;
    }

    if (!hasPaths) {
      this.results.push({
        name: checkName,
        category: 'ssl',
        severity: 'warning',
        passed: false,
        message: 'SSL certificate paths not configured',
        recommendation: 'Set SSL_KEY_PATH and SSL_CERT_PATH'
      });
      return;
    }

    this.results.push({
      name: checkName,
      category: 'ssl',
      severity: 'info',
      passed: true,
      message: 'SSL configuration present',
      recommendation: 'Verify certificate files exist and are valid'
    });
  }

  /**
   * Generate audit report
   */
  generateReport() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const critical = this.results.filter(r => !r.passed && r.severity === 'critical').length;
    const warnings = this.results.filter(r => !r.passed && r.severity === 'warning').length;

    console.log('\n' + '='.repeat(80));
    console.log('SECURITY AUDIT REPORT');
    console.log('='.repeat(80) + '\n');

    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Total Checks: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`  - Critical: ${critical}`);
    console.log(`  - Warnings: ${warnings}\n`);

    console.log('='.repeat(80));
    console.log('CHECK RESULTS');
    console.log('='.repeat(80) + '\n');

    for (const result of this.results) {
      const icon = result.passed ? '✅' : '❌';
      const severity = result.passed ? '' : ` [${result.severity.toUpperCase()}]`;
      
      console.log(`${icon} ${result.name}${severity}`);
      console.log(`   ${result.message}`);
      
      if (result.details && Array.isArray(result.details) && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`   - ${detail.key}: ${detail.reason}`);
        });
      }
      
      if (result.recommendation) {
        console.log(`   💡 ${result.recommendation}`);
      }
      
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80) + '\n');

    if (critical > 0) {
      console.log(`❌ CRITICAL: ${critical} critical issue(s) found!`);
      console.log('   Fix these issues before deploying to production.\n');
      return { passed: false, exitCode: 1, results: this.results };
    }

    if (warnings > 0) {
      console.log(`⚠️  WARNING: ${warnings} warning(s) found.`);
      console.log('   Review and address these issues.\n');
      return { passed: false, exitCode: 2, results: this.results };
    }

    console.log('✅ All security checks passed!');
    console.log('   Your configuration is secure for production deployment.\n');
    return { passed: true, exitCode: 0, results: this.results };
  }
}

// Main execution
async function main() {
  try {
    const auditor = new SecurityAuditor();
    
    if (options.reportOnly) {
      console.log('Report-only mode not yet implemented');
      process.exit(0);
    }

    if (options.check) {
      // Run specific check
      const validChecks = ['secrets', 'cors', 'gitignore', 'ssl', 'nodeenv'];
      if (!validChecks.includes(options.check)) {
        console.error(`❌ Error: Unknown check '${options.check}'`);
        console.error(`   Valid checks: ${validChecks.join(', ')}\n`);
        process.exit(1);
      }

      console.log(`\n🔍 Running ${options.check} check...\n`);
      
      switch (options.check) {
        case 'secrets':
          await auditor.checkWeakSecrets('.env');
          await auditor.checkWeakSecrets('.env.production');
          await auditor.checkWeakSecrets('.env.test');
          break;
        case 'cors':
          await auditor.checkCORSConfig('.env.production');
          break;
        case 'gitignore':
          await auditor.checkGitignore();
          break;
        case 'ssl':
          await auditor.checkSSLConfig('.env.production');
          break;
        case 'nodeenv':
          await auditor.checkNodeEnv('.env');
          await auditor.checkNodeEnv('.env.production');
          await auditor.checkNodeEnv('.env.test');
          break;
      }
      
      const report = auditor.generateReport();
      process.exit(report.exitCode);
    } else {
      // Run all checks
      const report = await auditor.runAllChecks();
      process.exit(report.exitCode);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SecurityAuditor;
