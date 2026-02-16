#!/usr/bin/env node

/**
 * Vercel Setup Verification Script
 * Checks if all required configurations are in place for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Vercel Setup...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: package.json scripts
console.log('1️⃣  Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts;
  
  const requiredScripts = {
    'build': 'prisma generate && prisma db push && vite build',
    'vercel-build': 'prisma generate && prisma db push && vite build',
    'postinstall': 'prisma generate'
  };
  
  for (const [script, expectedContent] of Object.entries(requiredScripts)) {
    if (!scripts[script]) {
      console.log(`   ❌ Missing script: ${script}`);
      hasErrors = true;
    } else if (!scripts[script].includes('prisma generate')) {
      console.log(`   ⚠️  Script "${script}" doesn't include "prisma generate"`);
      hasWarnings = true;
    } else {
      console.log(`   ✅ ${script}: OK`);
    }
  }
} catch (error) {
  console.log(`   ❌ Error reading package.json: ${error.message}`);
  hasErrors = true;
}

// Check 2: vercel.json configuration
console.log('\n2️⃣  Checking vercel.json...');
try {
  const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (vercelJson.buildCommand && vercelJson.buildCommand.includes('vercel-build')) {
    console.log('   ✅ buildCommand: OK');
  } else {
    console.log('   ⚠️  buildCommand should use "npm run vercel-build"');
    hasWarnings = true;
  }
  
  if (vercelJson.outputDirectory === 'dist') {
    console.log('   ✅ outputDirectory: OK');
  } else {
    console.log('   ❌ outputDirectory should be "dist"');
    hasErrors = true;
  }
} catch (error) {
  console.log(`   ❌ Error reading vercel.json: ${error.message}`);
  hasErrors = true;
}

// Check 3: Prisma schema
console.log('\n3️⃣  Checking Prisma schema...');
try {
  const schemaPath = path.join('prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    if (schema.includes('datasource db')) {
      console.log('   ✅ Datasource configured');
    } else {
      console.log('   ❌ No datasource found in schema');
      hasErrors = true;
    }
    
    if (schema.includes('provider = "postgresql"')) {
      console.log('   ✅ PostgreSQL provider');
    } else {
      console.log('   ⚠️  Non-PostgreSQL provider detected');
      hasWarnings = true;
    }
    
    if (schema.includes('env("DATABASE_URL")')) {
      console.log('   ✅ DATABASE_URL environment variable');
    } else {
      console.log('   ❌ DATABASE_URL not configured');
      hasErrors = true;
    }
  } else {
    console.log('   ❌ schema.prisma not found');
    hasErrors = true;
  }
} catch (error) {
  console.log(`   ❌ Error reading schema.prisma: ${error.message}`);
  hasErrors = true;
}

// Check 4: Environment variables
console.log('\n4️⃣  Checking environment configuration...');
const envFiles = ['.env', '.env.production', '.env.production.example'];
let foundEnvFile = false;

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    foundEnvFile = true;
    try {
      const content = fs.readFileSync(envFile, 'utf8');
      if (content.includes('DATABASE_URL')) {
        console.log(`   ✅ ${envFile} has DATABASE_URL`);
      } else {
        console.log(`   ⚠️  ${envFile} missing DATABASE_URL`);
        hasWarnings = true;
      }
    } catch (error) {
      console.log(`   ⚠️  Could not read ${envFile}`);
    }
  }
}

if (!foundEnvFile) {
  console.log('   ⚠️  No environment files found');
  hasWarnings = true;
}

// Check 5: Dependencies
console.log('\n5️⃣  Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = {
    '@prisma/client': 'dependencies',
    'prisma': 'devDependencies'
  };
  
  for (const [dep, section] of Object.entries(requiredDeps)) {
    if (packageJson[section] && packageJson[section][dep]) {
      console.log(`   ✅ ${dep}: ${packageJson[section][dep]}`);
    } else {
      console.log(`   ❌ Missing ${dep} in ${section}`);
      hasErrors = true;
    }
  }
} catch (error) {
  console.log(`   ❌ Error checking dependencies: ${error.message}`);
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Verification Summary\n');

if (!hasErrors && !hasWarnings) {
  console.log('✅ All checks passed! Your Vercel setup is ready.');
  console.log('\n📝 Next steps:');
  console.log('   1. Set DATABASE_URL in Vercel environment variables');
  console.log('   2. Deploy: git push origin main');
  console.log('   3. Check build logs in Vercel dashboard');
  process.exit(0);
} else if (hasErrors) {
  console.log('❌ Setup has errors that need to be fixed.');
  console.log('\n🔧 Please fix the errors above and run this script again.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Setup has warnings but should work.');
  console.log('\n📝 Consider addressing the warnings for optimal setup.');
  process.exit(0);
}
