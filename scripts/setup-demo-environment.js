#!/usr/bin/env node

/**
 * Demo Environment Setup Script
 * 
 * This script sets up the complete demo environment on the presentation laptop.
 * It verifies all dependencies, configures services, and tests initialization time.
 * 
 * Requirements: 5.1, 5.2, 5.3
 * Task: 7.1 Set up demo environment on presentation laptop
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions for colored output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Configuration
const REQUIRED_NODE_VERSION = 18;
const TARGET_PORT = 3000;
const MAX_INIT_TIME = 30; // seconds
const DOCKER_SERVICES = ['postgres', 'mongodb', 'redis'];

// Setup report
const setupReport = {
  timestamp: new Date().toISOString(),
  status: 'in_progress',
  checks: {},
  errors: [],
  warnings: [],
  initializationTime: null
};

/**
 * Check if a command exists in the system
 */
function commandExists(command) {
  try {
    execSync(`${process.platform === 'win32' ? 'where' : 'which'} ${command}`, { 
      stdio: 'ignore' 
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get version of a command
 */
function getVersion(command, versionFlag = '--version') {
  try {
    const output = execSync(`${command} ${versionFlag}`, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output.trim();
  } catch {
    return null;
  }
}

/**
 * Check if port is available
 */
function isPortAvailable(port) {
  try {
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;
    
    execSync(command, { stdio: 'ignore' });
    return false; // Port is in use
  } catch {
    return true; // Port is available
  }
}

/**
 * Check Node.js installation and version
 */
function checkNodeJS() {
  log.section('1. Checking Node.js Installation');
  
  if (!commandExists('node')) {
    setupReport.checks.nodejs = { status: 'fail', message: 'Node.js not installed' };
    log.error('Node.js is not installed');
    log.info(`Please install Node.js ${REQUIRED_NODE_VERSION}+ from https://nodejs.org/`);
    return false;
  }
  
  const version = getVersion('node', '--version');
  const majorVersion = parseInt(version.match(/v(\d+)/)?.[1] || '0');
  
  if (majorVersion < REQUIRED_NODE_VERSION) {
    setupReport.checks.nodejs = { 
      status: 'fail', 
      message: `Node.js version ${majorVersion} is too old (requires ${REQUIRED_NODE_VERSION}+)`,
      currentVersion: version
    };
    log.error(`Node.js version ${version} is too old`);
    log.info(`Please upgrade to Node.js ${REQUIRED_NODE_VERSION}+ from https://nodejs.org/`);
    return false;
  }
  
  setupReport.checks.nodejs = { 
    status: 'pass', 
    version,
    majorVersion 
  };
  log.success(`Node.js ${version} installed`);
  return true;
}

/**
 * Check npm installation
 */
function checkNPM() {
  if (!commandExists('npm')) {
    setupReport.checks.npm = { status: 'fail', message: 'npm not installed' };
    log.error('npm is not installed');
    return false;
  }
  
  const version = getVersion('npm');
  setupReport.checks.npm = { status: 'pass', version };
  log.success(`npm ${version} installed`);
  return true;
}

/**
 * Check Docker installation
 */
function checkDocker() {
  log.section('2. Checking Docker Installation');
  
  if (!commandExists('docker')) {
    setupReport.checks.docker = { status: 'fail', message: 'Docker not installed' };
    log.error('Docker is not installed');
    log.info('Please install Docker Desktop from https://www.docker.com/products/docker-desktop');
    return false;
  }
  
  const version = getVersion('docker', '--version');
  setupReport.checks.docker = { status: 'pass', version };
  log.success(`Docker ${version} installed`);
  
  // Check if Docker is running
  try {
    execSync('docker ps', { stdio: 'ignore' });
    log.success('Docker daemon is running');
    return true;
  } catch {
    setupReport.checks.docker.status = 'warning';
    setupReport.checks.docker.message = 'Docker daemon not running';
    log.warning('Docker daemon is not running');
    log.info('Please start Docker Desktop');
    return false;
  }
}

/**
 * Check Docker Compose installation
 */
function checkDockerCompose() {
  if (!commandExists('docker-compose') && !commandExists('docker')) {
    setupReport.checks.dockerCompose = { status: 'fail', message: 'docker-compose not available' };
    log.error('docker-compose is not available');
    return false;
  }
  
  // Try docker-compose command first, then docker compose
  let version;
  try {
    version = getVersion('docker-compose', '--version');
  } catch {
    try {
      version = execSync('docker compose version', { encoding: 'utf-8' }).trim();
    } catch {
      setupReport.checks.dockerCompose = { status: 'fail', message: 'docker-compose not available' };
      log.error('docker-compose is not available');
      return false;
    }
  }
  
  setupReport.checks.dockerCompose = { status: 'pass', version };
  log.success(`docker-compose ${version} available`);
  return true;
}

/**
 * Check if project dependencies are installed
 */
function checkDependencies() {
  log.section('3. Checking Project Dependencies');
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    setupReport.checks.dependencies = { status: 'fail', message: 'node_modules not found' };
    log.error('Project dependencies not installed');
    log.info('Run: npm install');
    return false;
  }
  
  // Check for key dependencies
  const keyDependencies = ['express', 'react', 'prisma', '@prisma/client', 'mongodb', 'redis'];
  const missing = [];
  
  for (const dep of keyDependencies) {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
      missing.push(dep);
    }
  }
  
  if (missing.length > 0) {
    setupReport.checks.dependencies = { 
      status: 'fail', 
      message: 'Missing dependencies',
      missing 
    };
    log.error(`Missing dependencies: ${missing.join(', ')}`);
    log.info('Run: npm install');
    return false;
  }
  
  setupReport.checks.dependencies = { status: 'pass', message: 'All dependencies installed' };
  log.success('All project dependencies installed');
  return true;
}

/**
 * Check environment configuration
 */
function checkEnvironment() {
  log.section('4. Checking Environment Configuration');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    setupReport.checks.environment = { status: 'fail', message: '.env file not found' };
    log.error('.env file not found');
    log.info('Create .env file with required configuration');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = [
    'PORT',
    'DATABASE_URL',
    'MONGODB_URI',
    'REDIS_URL',
    'OPENAI_API_KEY'
  ];
  
  const missing = [];
  for (const varName of requiredVars) {
    if (!envContent.includes(`${varName}=`)) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    setupReport.checks.environment = { 
      status: 'warning', 
      message: 'Missing environment variables',
      missing 
    };
    log.warning(`Missing environment variables: ${missing.join(', ')}`);
    setupReport.warnings.push(`Missing environment variables: ${missing.join(', ')}`);
  } else {
    setupReport.checks.environment = { status: 'pass', message: 'All required variables present' };
    log.success('Environment configuration complete');
  }
  
  return true;
}

/**
 * Check port availability
 */
function checkPort() {
  log.section('5. Checking Port Availability');
  
  if (!isPortAvailable(TARGET_PORT)) {
    setupReport.checks.port = { 
      status: 'warning', 
      message: `Port ${TARGET_PORT} is already in use`,
      port: TARGET_PORT 
    };
    log.warning(`Port ${TARGET_PORT} is already in use`);
    log.info('You may need to stop the existing process or use a different port');
    setupReport.warnings.push(`Port ${TARGET_PORT} already in use`);
    return true; // Not a critical failure
  }
  
  setupReport.checks.port = { status: 'pass', port: TARGET_PORT };
  log.success(`Port ${TARGET_PORT} is available`);
  return true;
}

/**
 * Start Docker services
 */
async function startDockerServices() {
  log.section('6. Starting Docker Services');
  
  const dockerComposePath = path.join(process.cwd(), 'docker', 'docker-compose.yml');
  
  if (!fs.existsSync(dockerComposePath)) {
    setupReport.checks.dockerServices = { 
      status: 'fail', 
      message: 'docker-compose.yml not found' 
    };
    log.error('docker-compose.yml not found in docker/ directory');
    return false;
  }
  
  try {
    log.info('Starting Docker services (PostgreSQL, MongoDB, Redis)...');
    
    // Determine docker-compose command
    const composeCmd = commandExists('docker-compose') ? 'docker-compose' : 'docker compose';
    
    execSync(`${composeCmd} -f ${dockerComposePath} up -d`, {
      stdio: 'inherit',
      cwd: path.dirname(dockerComposePath)
    });
    
    log.success('Docker services started');
    log.info('Waiting 10 seconds for services to initialize...');
    
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check service status
    const psOutput = execSync(`${composeCmd} -f ${dockerComposePath} ps`, {
      encoding: 'utf-8',
      cwd: path.dirname(dockerComposePath)
    });
    
    const runningServices = DOCKER_SERVICES.filter(service => 
      psOutput.includes(service) && psOutput.includes('Up')
    );
    
    setupReport.checks.dockerServices = {
      status: runningServices.length === DOCKER_SERVICES.length ? 'pass' : 'warning',
      running: runningServices,
      expected: DOCKER_SERVICES
    };
    
    if (runningServices.length === DOCKER_SERVICES.length) {
      log.success(`All Docker services running: ${runningServices.join(', ')}`);
      return true;
    } else {
      const notRunning = DOCKER_SERVICES.filter(s => !runningServices.includes(s));
      log.warning(`Some services not running: ${notRunning.join(', ')}`);
      setupReport.warnings.push(`Services not running: ${notRunning.join(', ')}`);
      return true; // Continue anyway
    }
  } catch (error) {
    setupReport.checks.dockerServices = { 
      status: 'fail', 
      message: 'Failed to start Docker services',
      error: error.message 
    };
    log.error('Failed to start Docker services');
    log.error(error.message);
    return false;
  }
}

/**
 * Test service initialization time
 */
async function testInitializationTime() {
  log.section('7. Testing Service Initialization Time');
  
  const startTime = Date.now();
  
  try {
    log.info('Starting application server...');
    
    // Start the server in a child process
    const serverProcess = spawn('node', ['god-server.js'], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    let serverReady = false;
    let initTime = null;
    
    // Listen for server output
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running') || output.includes('listening on port')) {
        serverReady = true;
        initTime = ((Date.now() - startTime) / 1000).toFixed(2);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      // Ignore stderr for now
    });
    
    // Wait up to MAX_INIT_TIME seconds for server to start
    const checkInterval = 500; // ms
    const maxChecks = (MAX_INIT_TIME * 1000) / checkInterval;
    let checks = 0;
    
    while (!serverReady && checks < maxChecks) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      checks++;
    }
    
    // Kill the server process
    serverProcess.kill();
    
    if (serverReady) {
      setupReport.checks.initialization = {
        status: initTime <= MAX_INIT_TIME ? 'pass' : 'warning',
        time: parseFloat(initTime),
        maxTime: MAX_INIT_TIME
      };
      setupReport.initializationTime = parseFloat(initTime);
      
      if (initTime <= MAX_INIT_TIME) {
        log.success(`Server initialized in ${initTime}s (target: <${MAX_INIT_TIME}s)`);
        return true;
      } else {
        log.warning(`Server initialized in ${initTime}s (target: <${MAX_INIT_TIME}s)`);
        setupReport.warnings.push(`Initialization time ${initTime}s exceeds target ${MAX_INIT_TIME}s`);
        return true;
      }
    } else {
      setupReport.checks.initialization = {
        status: 'fail',
        message: `Server did not start within ${MAX_INIT_TIME}s`
      };
      log.error(`Server did not start within ${MAX_INIT_TIME}s`);
      return false;
    }
  } catch (error) {
    setupReport.checks.initialization = {
      status: 'fail',
      message: 'Failed to test initialization',
      error: error.message
    };
    log.error('Failed to test initialization');
    log.error(error.message);
    return false;
  }
}

/**
 * Generate setup report
 */
function generateReport() {
  log.section('Setup Report');
  
  // Determine overall status
  const failedChecks = Object.values(setupReport.checks).filter(c => c.status === 'fail');
  const warningChecks = Object.values(setupReport.checks).filter(c => c.status === 'warning');
  
  if (failedChecks.length > 0) {
    setupReport.status = 'failed';
  } else if (warningChecks.length > 0) {
    setupReport.status = 'warning';
  } else {
    setupReport.status = 'success';
  }
  
  // Save report to file
  const reportDir = path.join(process.cwd(), 'scripts', 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'demo-environment-setup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(setupReport, null, 2));
  
  // Display summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.bright}Demo Environment Setup Report${colors.reset}`);
  console.log('='.repeat(60));
  
  console.log(`\nStatus: ${
    setupReport.status === 'success' ? colors.green + '✓ SUCCESS' :
    setupReport.status === 'warning' ? colors.yellow + '⚠ WARNING' :
    colors.red + '✗ FAILED'
  }${colors.reset}`);
  
  console.log(`\nChecks:`);
  for (const [name, check] of Object.entries(setupReport.checks)) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
    const color = check.status === 'pass' ? colors.green : check.status === 'warning' ? colors.yellow : colors.red;
    console.log(`  ${color}${icon}${colors.reset} ${name}: ${check.message || check.status}`);
  }
  
  if (setupReport.warnings.length > 0) {
    console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
    setupReport.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }
  
  if (setupReport.errors.length > 0) {
    console.log(`\n${colors.red}Errors:${colors.reset}`);
    setupReport.errors.forEach(e => console.log(`  ✗ ${e}`));
  }
  
  if (setupReport.initializationTime !== null) {
    console.log(`\nInitialization Time: ${setupReport.initializationTime}s (target: <${MAX_INIT_TIME}s)`);
  }
  
  console.log(`\nReport saved to: ${reportPath}`);
  console.log('='.repeat(60) + '\n');
  
  return setupReport.status === 'success' || setupReport.status === 'warning';
}

/**
 * Main setup function
 */
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}Demo Environment Setup${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  
  log.info('Starting demo environment setup...');
  log.info(`Target: Port ${TARGET_PORT}, Max init time: ${MAX_INIT_TIME}s\n`);
  
  // Run all checks
  const checks = [
    checkNodeJS(),
    checkNPM(),
    checkDocker(),
    checkDockerCompose(),
    checkDependencies(),
    checkEnvironment(),
    checkPort()
  ];
  
  // If basic checks fail, don't continue
  if (checks.some(c => c === false)) {
    setupReport.status = 'failed';
    setupReport.errors.push('Basic environment checks failed');
    generateReport();
    process.exit(1);
  }
  
  // Start Docker services
  const dockerStarted = await startDockerServices();
  if (!dockerStarted) {
    setupReport.status = 'failed';
    setupReport.errors.push('Failed to start Docker services');
    generateReport();
    process.exit(1);
  }
  
  // Test initialization time
  const initTested = await testInitializationTime();
  
  // Generate final report
  const success = generateReport();
  
  if (success) {
    log.success('Demo environment setup complete!');
    log.info('\nNext steps:');
    log.info('  1. Run: npm start');
    log.info('  2. Open: http://localhost:3000');
    log.info('  3. Test the user journey');
    process.exit(0);
  } else {
    log.error('Demo environment setup failed');
    log.info('Please fix the errors above and try again');
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  main().catch(error => {
    log.error('Unexpected error during setup');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
