#!/usr/bin/env node

/**
 * Full Rehearsal Validation Script - Task 8
 * 
 * This script validates all technical aspects required for the full rehearsal:
 * - System readiness (all services running)
 * - Demo data availability
 * - Backup systems functional
 * - Presentation materials ready
 * - Timing validation
 * 
 * Run this before conducting the full team rehearsal.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Validation results
const results = {
  timestamp: new Date().toISOString(),
  overallStatus: 'pass',
  checks: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

/**
 * Log colored message
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Add check result
 */
function addCheck(name, status, details = '') {
  results.checks.push({ name, status, details });
  results.summary.total++;
  
  if (status === 'pass') {
    results.summary.passed++;
    log(`✓ ${name}`, colors.green);
  } else if (status === 'fail') {
    results.summary.failed++;
    results.overallStatus = 'fail';
    log(`✗ ${name}`, colors.red);
  } else if (status === 'warning') {
    results.summary.warnings++;
    log(`⚠ ${name}`, colors.yellow);
  }
  
  if (details) {
    log(`  ${details}`, colors.cyan);
  }
}

/**
 * Check if file exists
 */
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  addCheck(
    description,
    exists ? 'pass' : 'fail',
    exists ? `Found: ${filePath}` : `Missing: ${filePath}`
  );
  return exists;
}

/**
 * Check if directory exists and has files
 */
function checkDirectoryHasFiles(dirPath, description, minFiles = 1) {
  if (!fs.existsSync(dirPath)) {
    addCheck(description, 'fail', `Directory not found: ${dirPath}`);
    return false;
  }
  
  const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'));
  const hasFiles = files.length >= minFiles;
  
  addCheck(
    description,
    hasFiles ? 'pass' : 'fail',
    hasFiles ? `Found ${files.length} files` : `Only ${files.length} files (need ${minFiles})`
  );
  
  return hasFiles;
}

/**
 * Check if HTTP endpoint is accessible
 */
async function checkEndpoint(url, description) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      const accessible = res.statusCode >= 200 && res.statusCode < 500;
      addCheck(
        description,
        accessible ? 'pass' : 'fail',
        `Status: ${res.statusCode}`
      );
      resolve(accessible);
    });
    
    req.on('error', (error) => {
      addCheck(description, 'fail', `Error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      addCheck(description, 'fail', 'Request timeout');
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Check if Docker services are running
 */
function checkDockerServices() {
  try {
    const output = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' });
    const containers = output.trim().split('\n').filter(Boolean);
    
    const hasPostgres = containers.some(c => c.includes('postgres'));
    const hasMongo = containers.some(c => c.includes('mongo'));
    const hasRedis = containers.some(c => c.includes('redis'));
    
    addCheck(
      'PostgreSQL container running',
      hasPostgres ? 'pass' : 'warning',
      hasPostgres ? 'Container found' : 'Container not found (may use local PostgreSQL)'
    );
    
    addCheck(
      'MongoDB container running',
      hasMongo ? 'pass' : 'warning',
      hasMongo ? 'Container found' : 'Container not found'
    );
    
    addCheck(
      'Redis container running',
      hasRedis ? 'pass' : 'warning',
      hasRedis ? 'Container found' : 'Container not found (optional for demo)'
    );
    
    return { hasPostgres, hasMongo, hasRedis };
  } catch (error) {
    addCheck('Docker services check', 'warning', 'Docker not available or not running');
    return { hasPostgres: false, hasMongo: false, hasRedis: false };
  }
}

/**
 * Main validation function
 */
async function runRehearsalValidation() {
  log('\n' + '='.repeat(60), colors.bold);
  log('FULL REHEARSAL VALIDATION - TASK 8', colors.bold + colors.cyan);
  log('='.repeat(60) + '\n', colors.bold);
  
  // Section 1: System Readiness
  log('\n📋 Section 1: System Readiness', colors.blue + colors.bold);
  log('-'.repeat(60), colors.blue);
  
  // Check Docker services
  const dockerStatus = checkDockerServices();
  
  // Check if application is running
  await checkEndpoint('http://localhost:3000', 'Application running on port 3000');
  
  // Check critical files
  checkFileExists('.env', 'Environment configuration (.env)');
  checkFileExists('package.json', 'Package configuration');
  checkFileExists('god-server.js', 'Server entry point');
  
  // Section 2: Demo Data Availability
  log('\n📊 Section 2: Demo Data Availability', colors.blue + colors.bold);
  log('-'.repeat(60), colors.blue);
  
  // Check data population reports
  const populationReportPath = path.join(__dirname, 'reports', 'population-report.json');
  if (checkFileExists(populationReportPath, 'Data population report')) {
    try {
      const report = JSON.parse(fs.readFileSync(populationReportPath, 'utf-8'));
      
      // Check user count
      const userCount = report.entities?.users?.created || 0;
      addCheck(
        'Minimum 10 users created',
        userCount >= 10 ? 'pass' : 'fail',
        `Found ${userCount} users`
      );
      
      // Check health metrics
      const healthMetrics = report.entities?.healthMetrics?.created || 0;
      addCheck(
        'Health metrics data populated',
        healthMetrics >= 10 ? 'pass' : 'warning',
        `Found ${healthMetrics} records`
      );
      
      // Check nutrition plans
      const nutritionPlans = report.entities?.nutritionPlans?.created || 0;
      addCheck(
        'Nutrition plans generated',
        nutritionPlans >= 10 ? 'pass' : 'warning',
        `Found ${nutritionPlans} plans`
      );
      
    } catch (error) {
      addCheck('Parse population report', 'warning', 'Could not parse report file');
    }
  }
  
  // Check placeholder validation
  const placeholderReportPath = path.join(__dirname, 'reports', 'placeholder-validation-report.json');
  if (checkFileExists(placeholderReportPath, 'Placeholder validation report')) {
    try {
      const report = JSON.parse(fs.readFileSync(placeholderReportPath, 'utf-8'));
      const hasPlaceholders = report.summary?.totalIssues > 0;
      
      addCheck(
        'No placeholder text in data',
        !hasPlaceholders ? 'pass' : 'fail',
        hasPlaceholders ? `Found ${report.summary.totalIssues} placeholder issues` : 'All data is realistic'
      );
    } catch (error) {
      addCheck('Parse placeholder report', 'warning', 'Could not parse report file');
    }
  }
  
  // Section 3: Backup Systems
  log('\n💾 Section 3: Backup Systems', colors.blue + colors.bold);
  log('-'.repeat(60), colors.blue);
  
  // Check cached responses
  checkFileExists(
    path.join(__dirname, '..', 'backup', 'cached-responses.json'),
    'OpenAI cached responses'
  );
  
  // Check backup directory
  checkDirectoryHasFiles(
    path.join(__dirname, '..', 'backup'),
    'Backup directory has files',
    2
  );
  
  // Check if demo video exists (optional)
  const demoVideoPath = path.join(__dirname, '..', 'backup', 'demo-video.mp4');
  if (fs.existsSync(demoVideoPath)) {
    const stats = fs.statSync(demoVideoPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    addCheck('Demo video backup', 'pass', `Found (${sizeMB} MB)`);
  } else {
    addCheck('Demo video backup', 'warning', 'Not found - should be created before demo day');
  }
  
  // Section 4: Presentation Materials
  log('\n🎬 Section 4: Presentation Materials', colors.blue + colors.bold);
  log('-'.repeat(60), colors.blue);
  
  // Check presentation directory
  checkDirectoryHasFiles(
    path.join(__dirname, '..', 'presentation'),
    'Presentation materials directory',
    3
  );
  
  // Check speaking notes
  checkFileExists(
    path.join(__dirname, '..', 'presentation', 'speaking-notes.md'),
    'Speaking notes document'
  );
  
  // Check slide deck structure
  checkFileExists(
    path.join(__dirname, '..', 'presentation', 'slide-deck-structure.md'),
    'Slide deck structure'
  );
  
  // Check if README is comprehensive
  const readmePath = path.join(__dirname, '..', 'README.md');
  if (checkFileExists(readmePath, 'README.md exists')) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const hasInstallation = readmeContent.includes('Installation') || readmeContent.includes('Setup');
    const hasTechStack = readmeContent.includes('Tech Stack') || readmeContent.includes('Technologies');
    
    addCheck(
      'README has installation instructions',
      hasInstallation ? 'pass' : 'warning',
      hasInstallation ? 'Found' : 'Missing installation section'
    );
    
    addCheck(
      'README has tech stack documentation',
      hasTechStack ? 'pass' : 'warning',
      hasTechStack ? 'Found' : 'Missing tech stack section'
    );
  }
  
  // Section 5: Security & Repository
  log('\n🔒 Section 5: Security & Repository', colors.blue + colors.bold);
  log('-'.repeat(60), colors.blue);
  
  // Check security scan report
  const securityReportPath = path.join(__dirname, 'reports', 'security-scan-report.json');
  if (checkFileExists(securityReportPath, 'Security scan report')) {
    try {
      const report = JSON.parse(fs.readFileSync(securityReportPath, 'utf-8'));
      const criticalIssues = report.summary?.critical || 0;
      const highIssues = report.summary?.high || 0;
      
      addCheck(
        'No critical security issues',
        criticalIssues === 0 ? 'pass' : 'fail',
        criticalIssues > 0 ? `Found ${criticalIssues} critical issues` : 'No critical issues'
      );
      
      addCheck(
        'No high-severity security issues',
        highIssues === 0 ? 'pass' : 'warning',
        highIssues > 0 ? `Found ${highIssues} high-severity issues` : 'No high-severity issues'
      );
    } catch (error) {
      addCheck('Parse security report', 'warning', 'Could not parse report file');
    }
  }
  
  // Check .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (checkFileExists(gitignorePath, '.gitignore exists')) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    const hasNodeModules = gitignoreContent.includes('node_modules');
    const hasEnv = gitignoreContent.includes('.env');
    
    addCheck(
      '.gitignore includes node_modules',
      hasNodeModules ? 'pass' : 'fail',
      hasNodeModules ? 'Found' : 'Missing'
    );
    
    addCheck(
      '.gitignore includes .env',
      hasEnv ? 'pass' : 'fail',
      hasEnv ? 'Found' : 'Missing'
    );
  }
  
  // Section 6: Feature Validation
  log('\n✅ Section 6: Feature Validation', colors.blue + colors.bold);
  log('-'.repeat(60), colors.blue);
  
  // Check if validation script exists
  const validationScriptPath = path.join(__dirname, 'validate-features.js');
  if (checkFileExists(validationScriptPath, 'Feature validation script')) {
    addCheck(
      'Feature validation available',
      'pass',
      'Run: node scripts/validate-features.js'
    );
  }
  
  // Check for validation reports
  const validationReportPath = path.join(__dirname, 'reports', 'validation-report.json');
  if (fs.existsSync(validationReportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(validationReportPath, 'utf-8'));
      const allPassed = report.features?.every(f => f.status === 'pass');
      
      addCheck(
        'All features validated successfully',
        allPassed ? 'pass' : 'warning',
        allPassed ? 'All features passing' : 'Some features may need attention'
      );
    } catch (error) {
      addCheck('Feature validation results', 'warning', 'Run validation script to generate report');
    }
  } else {
    addCheck('Feature validation results', 'warning', 'Run: node scripts/validate-features.js');
  }
  
  // Final Summary
  log('\n' + '='.repeat(60), colors.bold);
  log('VALIDATION SUMMARY', colors.bold + colors.cyan);
  log('='.repeat(60), colors.bold);
  
  log(`\nTotal Checks: ${results.summary.total}`, colors.cyan);
  log(`✓ Passed: ${results.summary.passed}`, colors.green);
  log(`✗ Failed: ${results.summary.failed}`, colors.red);
  log(`⚠ Warnings: ${results.summary.warnings}`, colors.yellow);
  
  log(`\nOverall Status: ${results.overallStatus.toUpperCase()}`, 
    results.overallStatus === 'pass' ? colors.green : colors.red);
  
  // Recommendations
  log('\n' + '='.repeat(60), colors.bold);
  log('REHEARSAL READINESS RECOMMENDATIONS', colors.bold + colors.cyan);
  log('='.repeat(60) + '\n', colors.bold);
  
  if (results.summary.failed > 0) {
    log('❌ NOT READY FOR REHEARSAL', colors.red + colors.bold);
    log('\nCritical issues must be resolved before rehearsal:', colors.red);
    results.checks
      .filter(c => c.status === 'fail')
      .forEach(c => log(`  • ${c.name}: ${c.details}`, colors.red));
  } else if (results.summary.warnings > 0) {
    log('⚠️  READY WITH WARNINGS', colors.yellow + colors.bold);
    log('\nRecommended actions before demo day:', colors.yellow);
    results.checks
      .filter(c => c.status === 'warning')
      .forEach(c => log(`  • ${c.name}: ${c.details}`, colors.yellow));
  } else {
    log('✅ READY FOR REHEARSAL!', colors.green + colors.bold);
    log('\nAll systems are operational. You can proceed with the full team rehearsal.', colors.green);
  }
  
  // Next steps
  log('\n' + '='.repeat(60), colors.bold);
  log('NEXT STEPS FOR TASK 8', colors.bold + colors.cyan);
  log('='.repeat(60) + '\n', colors.bold);
  
  log('1. Gather all team members for rehearsal', colors.cyan);
  log('2. Run through complete presentation (10 minutes)', colors.cyan);
  log('3. Time each section:', colors.cyan);
  log('   - Introduction: 1 minute', colors.cyan);
  log('   - Solution: 2 minutes', colors.cyan);
  log('   - Architecture: 2 minutes', colors.cyan);
  log('   - Live Demo: 5 minutes', colors.cyan);
  log('4. Practice speaker transitions', colors.cyan);
  log('5. Test backup video switching (Ctrl+B)', colors.cyan);
  log('6. Practice emergency procedures', colors.cyan);
  log('7. Note any issues or improvements needed', colors.cyan);
  log('8. Adjust timing if presentation runs over/under', colors.cyan);
  
  log('\n' + '='.repeat(60) + '\n', colors.bold);
  
  // Save results
  const reportPath = path.join(__dirname, 'reports', 'rehearsal-validation-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`Report saved: ${reportPath}\n`, colors.cyan);
  
  // Exit with appropriate code
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

// Run validation
runRehearsalValidation().catch(error => {
  log(`\nFatal error: ${error.message}`, colors.red);
  process.exit(1);
});