#!/usr/bin/env node

/**
 * Repository Security Scanner
 * 
 * Scans the repository for exposed secrets, API keys, passwords,
 * and other sensitive information that should not be committed.
 * 
 * Requirements: 4.3
 */

const fs = require('fs');
const path = require('path');

// Patterns to detect sensitive information
const SECURITY_PATTERNS = [
  {
    name: 'API Keys',
    pattern: /(?:api[_-]?key|apikey|api[_-]?secret)[\s]*[=:]["']?([a-zA-Z0-9_\-]{20,})/gi,
    severity: 'HIGH'
  },
  {
    name: 'OpenAI API Keys',
    pattern: /sk-[a-zA-Z0-9]{48}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Firebase Private Keys',
    pattern: /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
    severity: 'CRITICAL'
  },
  {
    name: 'AWS Access Keys',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Generic Secrets',
    pattern: /(?:secret|password|passwd|pwd)[\s]*[=:]["']?([^\s"']{8,})/gi,
    severity: 'HIGH'
  },
  {
    name: 'Database URLs with Credentials',
    pattern: /(?:postgres|mongodb|mysql):\/\/[^:]+:[^@]+@[^\s"']+/gi,
    severity: 'HIGH'
  },
  {
    name: 'JWT Tokens',
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    severity: 'MEDIUM'
  },
  {
    name: 'Private Keys (Generic)',
    pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g,
    severity: 'CRITICAL'
  },
  {
    name: 'OAuth Tokens',
    pattern: /(?:oauth|bearer)[\s]*[=:]["']?([a-zA-Z0-9_\-\.]{20,})/gi,
    severity: 'HIGH'
  },
  {
    name: 'Email/Password Combinations',
    pattern: /(?:email|username)[\s]*[=:]["']?[^\s"']+@[^\s"']+["']?[\s\S]{0,50}(?:password|passwd)[\s]*[=:]["']?[^\s"']{6,}/gi,
    severity: 'HIGH'
  }
];

// Files and directories to exclude from scanning
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.next/,
  /coverage/,
  /\.env\.example/,
  /\.env\.production\.example/,
  /package-lock\.json/,
  /yarn\.lock/,
  /\.log$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.svg$/,
  /\.ico$/,
  /\.woff/,
  /\.ttf/,
  /\.eot/,
  /security-scan\.js$/, // Don't scan this file
  /cached-responses\.json$/ // Demo responses are safe
];

// Files that are allowed to contain certain patterns (with warnings)
const ALLOWED_FILES = {
  '.env.example': ['All patterns allowed (example file)'],
  '.env.production.example': ['All patterns allowed (example file)'],
  '.env.test': ['Database URLs (test environment)'],
  'docker/.env.docker': ['Database URLs (Docker config)'],
  'docker/docker-compose.yml': ['Database URLs (Docker config)'],
  'docs/': ['Documentation may reference patterns'],
  'scripts/': ['Scripts may contain test data']
};

/**
 * Check if file should be excluded from scanning
 * @param {string} filePath - File path to check
 * @returns {boolean} True if file should be excluded
 */
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if file is in allowed list
 * @param {string} filePath - File path to check
 * @returns {string|null} Reason if allowed, null otherwise
 */
function isAllowedFile(filePath) {
  for (const [allowedPath, reasons] of Object.entries(ALLOWED_FILES)) {
    if (filePath.includes(allowedPath)) {
      return reasons.join(', ');
    }
  }
  return null;
}

/**
 * Scan a file for security issues
 * @param {string} filePath - Path to file
 * @returns {Array} Array of security issues found
 */
function scanFile(filePath) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const patternDef of SECURITY_PATTERNS) {
      const matches = content.matchAll(patternDef.pattern);
      
      for (const match of matches) {
        // Find line number
        let lineNumber = 1;
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (charCount > match.index) {
            lineNumber = i + 1;
            break;
          }
        }
        
        // Get context (line content)
        const lineContent = lines[lineNumber - 1] || '';
        
        issues.push({
          file: filePath,
          line: lineNumber,
          type: patternDef.name,
          severity: patternDef.severity,
          match: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : ''),
          context: lineContent.trim().substring(0, 80)
        });
      }
    }
  } catch (error) {
    // Skip files that can't be read (binary files, etc.)
    if (error.code !== 'ENOENT') {
      console.warn(`  ⚠️  Could not read ${filePath}: ${error.message}`);
    }
  }
  
  return issues;
}

/**
 * Recursively scan directory
 * @param {string} dir - Directory to scan
 * @param {Array} issues - Array to collect issues
 */
function scanDirectory(dir, issues = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);
      
      if (shouldExclude(relativePath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, issues);
      } else if (entry.isFile()) {
        const fileIssues = scanFile(fullPath);
        issues.push(...fileIssues);
      }
    }
  } catch (error) {
    console.warn(`  ⚠️  Could not scan directory ${dir}: ${error.message}`);
  }
  
  return issues;
}

/**
 * Check .gitignore for required patterns
 * @returns {Object} Validation results
 */
function validateGitignore() {
  const requiredPatterns = [
    '.env',
    '.env.local',
    '.env.*.local',
    'node_modules',
    '*.log',
    '.DS_Store'
  ];
  
  const results = {
    exists: false,
    missing: [],
    present: []
  };
  
  try {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      results.exists = true;
      const content = fs.readFileSync(gitignorePath, 'utf8');
      
      for (const pattern of requiredPatterns) {
        if (content.includes(pattern)) {
          results.present.push(pattern);
        } else {
          results.missing.push(pattern);
        }
      }
    }
  } catch (error) {
    console.warn('  ⚠️  Could not read .gitignore:', error.message);
  }
  
  return results;
}

/**
 * Check for .env files in git
 * @returns {Array} List of .env files that might be tracked
 */
function checkEnvFilesInGit() {
  const envFiles = [];
  
  try {
    const { execSync } = require('child_process');
    const output = execSync('git ls-files', { encoding: 'utf8' });
    const files = output.split('\n');
    
    for (const file of files) {
      if (file.match(/\.env$/) && !file.includes('example')) {
        envFiles.push(file);
      }
    }
  } catch (error) {
    // Git not available or not a git repository
    console.log('  ℹ️  Git check skipped (not a git repository or git not available)');
  }
  
  return envFiles;
}

/**
 * Main security scan function
 */
async function runSecurityScan() {
  console.log('🔒 Starting Security Scan...\n');
  console.log('=' .repeat(60));
  
  const report = {
    timestamp: new Date().toISOString(),
    status: 'success',
    summary: {
      filesScanned: 0,
      issuesFound: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    issues: [],
    gitignore: {},
    envFilesInGit: []
  };
  
  // Scan repository
  console.log('📂 Scanning repository for exposed secrets...\n');
  const issues = scanDirectory(process.cwd());
  
  // Categorize issues
  const categorized = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    warnings: []
  };
  
  for (const issue of issues) {
    const allowedReason = isAllowedFile(issue.file);
    
    if (allowedReason) {
      categorized.warnings.push({ ...issue, allowedReason });
    } else {
      categorized[issue.severity.toLowerCase()].push(issue);
    }
  }
  
  report.issues = categorized;
  report.summary.critical = categorized.critical.length;
  report.summary.high = categorized.high.length;
  report.summary.medium = categorized.medium.length;
  report.summary.low = categorized.low.length;
  report.summary.issuesFound = report.summary.critical + report.summary.high + 
                                report.summary.medium + report.summary.low;
  
  // Validate .gitignore
  console.log('📝 Validating .gitignore...\n');
  report.gitignore = validateGitignore();
  
  // Check for .env files in git
  console.log('🔍 Checking for .env files in git...\n');
  report.envFilesInGit = checkEnvFilesInGit();
  
  // Generate report
  console.log('='.repeat(60));
  console.log('📋 SECURITY SCAN REPORT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}\n`);
  
  // Summary
  console.log('Summary:');
  console.log(`  Total Issues: ${report.summary.issuesFound}`);
  console.log(`  Critical: ${report.summary.critical}`);
  console.log(`  High: ${report.summary.high}`);
  console.log(`  Medium: ${report.summary.medium}`);
  console.log(`  Low: ${report.summary.low}`);
  console.log(`  Warnings: ${categorized.warnings.length}\n`);
  
  // Critical issues
  if (categorized.critical.length > 0) {
    console.log('🚨 CRITICAL ISSUES:');
    for (const issue of categorized.critical) {
      console.log(`  ❌ ${issue.file}:${issue.line}`);
      console.log(`     Type: ${issue.type}`);
      console.log(`     Match: ${issue.match}`);
      console.log(`     Context: ${issue.context}\n`);
    }
  }
  
  // High severity issues
  if (categorized.high.length > 0) {
    console.log('⚠️  HIGH SEVERITY ISSUES:');
    for (const issue of categorized.high) {
      console.log(`  ⚠️  ${issue.file}:${issue.line}`);
      console.log(`     Type: ${issue.type}`);
      console.log(`     Match: ${issue.match}`);
      console.log(`     Context: ${issue.context}\n`);
    }
  }
  
  // Warnings (allowed files)
  if (categorized.warnings.length > 0) {
    console.log('ℹ️  WARNINGS (Allowed Files):');
    for (const issue of categorized.warnings.slice(0, 5)) {
      console.log(`  ℹ️  ${issue.file}:${issue.line}`);
      console.log(`     Type: ${issue.type}`);
      console.log(`     Reason: ${issue.allowedReason}\n`);
    }
    if (categorized.warnings.length > 5) {
      console.log(`  ... and ${categorized.warnings.length - 5} more warnings\n`);
    }
  }
  
  // .gitignore validation
  console.log('.gitignore Validation:');
  if (report.gitignore.exists) {
    console.log(`  ✓ .gitignore exists`);
    console.log(`  ✓ Present patterns: ${report.gitignore.present.length}`);
    if (report.gitignore.missing.length > 0) {
      console.log(`  ⚠️  Missing patterns: ${report.gitignore.missing.join(', ')}`);
    }
  } else {
    console.log(`  ❌ .gitignore not found!`);
  }
  console.log('');
  
  // .env files in git
  if (report.envFilesInGit.length > 0) {
    console.log('❌ .env Files in Git:');
    for (const file of report.envFilesInGit) {
      console.log(`  ❌ ${file} (should not be tracked!)`);
    }
    console.log('');
  }
  
  // Final status
  if (report.summary.critical > 0 || report.summary.high > 0) {
    console.log('❌ SECURITY SCAN FAILED');
    console.log('   Critical or high severity issues found!');
    console.log('   Please review and fix these issues before demo day.\n');
    report.status = 'failed';
  } else if (report.summary.medium > 0) {
    console.log('⚠️  SECURITY SCAN PASSED WITH WARNINGS');
    console.log('   Medium severity issues found.');
    console.log('   Consider reviewing these issues.\n');
    report.status = 'warning';
  } else {
    console.log('✅ SECURITY SCAN PASSED');
    console.log('   No critical or high severity issues found!\n');
    report.status = 'success';
  }
  
  // Save report
  const reportPath = path.join(__dirname, 'reports', 'security-scan-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}`);
  
  return report;
}

// Run if called directly
if (require.main === module) {
  runSecurityScan()
    .then((report) => {
      process.exit(report.status === 'failed' ? 1 : 0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  runSecurityScan,
  scanFile,
  scanDirectory,
  validateGitignore,
  checkEnvFilesInGit
};
