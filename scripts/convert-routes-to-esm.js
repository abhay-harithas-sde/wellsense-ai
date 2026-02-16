#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, '../routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log('🚀 Converting route files to ES modules...\n');

for (const file of files) {
  const filePath = path.join(routesDir, file);
  console.log(`🔄 Converting ${file}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Convert require() to import
  content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, "import $1 from '$2';");
  content = content.replace(/const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, "import {$1} from '$2';");
  
  // Convert module.exports to export default
  content = content.replace(/module\.exports\s*=\s*/g, 'export default ');
  
  // Add .js extension to local imports
  content = content.replace(/from\s+['"](\.[^'"]+)['"];/g, (match, p1) => {
    if (!p1.endsWith('.js')) {
      return `from '${p1}.js';`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Converted ${file}`);
}

console.log('\n✅ All route files converted!');
