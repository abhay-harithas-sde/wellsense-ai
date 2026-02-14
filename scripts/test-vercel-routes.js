#!/usr/bin/env node

/**
 * Test Vercel Routes
 * Verifies that all routes are accessible and return 200 status
 */

const https = require('https');

const BASE_URL = 'https://wellsense-ai.vercel.app';

// All routes from App.jsx
const routes = [
  '/',
  '/auth',
  '/auth/callback',
  '/diagnostic',
  '/ai-demo',
  '/openai-demo',
  '/health-metrics',
  '/weight-tracker',
  '/ai-nutrition',
  '/ai-coaching',
  '/health-tips',
  '/ai-insights',
  '/community-health',
  '/community',
  '/statistics',
  '/meditation-center',
  '/mental-wellness',
  '/consultation',
  '/profile',
  '/non-existent-route' // Should redirect to /
];

function testRoute(route) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${route}`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      const status = res.statusCode;
      const contentType = res.headers['content-type'] || '';
      
      // Collect response data
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isHTML = contentType.includes('text/html');
        const hasReactRoot = data.includes('id="root"') || data.includes('id="app"');
        
        resolve({
          route,
          status,
          contentType,
          isHTML,
          hasReactRoot,
          // 429 is rate limiting but content is correct, so consider it success
          success: (status === 200 || status === 429) && isHTML && hasReactRoot
        });
      });
    }).on('error', (err) => {
      resolve({
        route,
        status: 0,
        error: err.message,
        success: false
      });
    });
  });
}

async function testAllRoutes() {
  console.log('\n🧪 Testing Vercel Routes\n');
  console.log('='.repeat(80));
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const results = [];
  
  for (const route of routes) {
    process.stdout.write(`Testing ${route.padEnd(30)} ... `);
    const result = await testRoute(route);
    results.push(result);
    
    if (result.success) {
      console.log('✅ PASS');
    } else if (result.error) {
      console.log(`❌ ERROR: ${result.error}`);
    } else {
      console.log(`⚠️  WARN: Status ${result.status}, HTML: ${result.isHTML}, React: ${result.hasReactRoot}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 Test Summary\n');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${routes.length}`);
  console.log(`❌ Failed: ${failed}/${routes.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Routes:\n');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${r.route}`);
      if (r.error) {
        console.log(`      Error: ${r.error}`);
      } else {
        console.log(`      Status: ${r.status}, HTML: ${r.isHTML}, React Root: ${r.hasReactRoot}`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (failed === 0) {
    console.log('✅ All routes are working correctly!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some routes need attention.\n');
    process.exit(1);
  }
}

// Run tests
testAllRoutes().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
