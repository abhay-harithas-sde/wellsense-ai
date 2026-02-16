#!/usr/bin/env node

/**
 * Convert CommonJS files to ES Modules
 * Handles require() -> import and module.exports -> export
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to convert
const filesToConvert = [
  '../god-server.js',
  '../lib/database.js',
  '../lib/database-integrations.js',
  '../lib/ai.js',
  '../lib/firebase.js',
  '../lib/auth.js',
  '../lib/logger.js',
  '../lib/validation.js',
  '../lib/openai-fallback.js',
  '../lib/database-crud.js',
  '../middleware/auth.js',
  '../middleware/errorHandler.js',
  '../automations/index.js'
];

function convertFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }
  
  console.log(`🔄 Converting ${filePath}...`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Convert require() to import
  // Handle: const X = require('Y');
  content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, "import $1 from '$2';");
  
  // Handle: const { X, Y } = require('Z');
  content = content.replace(/const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, "import {$1} from '$2';");
  
  // Convert module.exports to export default
  content = content.replace(/module\.exports\s*=\s*/g, 'export default ');
  
  // Add .js extension to local imports if missing
  content = content.replace(/from\s+['"](\.[^'"]+)['"];/g, (match, p1) => {
    if (!p1.endsWith('.js') && !p1.includes('node_modules')) {
      return `from '${p1}.js';`;
    }
    return match;
  });
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Converted ${filePath}`);
}

console.log('🚀 Starting ES Module conversion...\n');

for (const file of filesToConvert) {
  try {
    convertFile(file);
  } catch (error) {
    console.error(`❌ Error converting ${file}:`, error.message);
  }
}

console.log('\n✅ Conversion complete!');
console.log('\n⚠️  Manual review required for:');
console.log('   - Dynamic requires');
console.log('   - Conditional imports');
console.log('   - __dirname and __filename usage');
