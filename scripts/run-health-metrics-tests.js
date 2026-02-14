/**
 * Simple Test Runner for Health Metrics Validation
 * Runs the validateHealthMetrics function and displays results
 * Requirements: 1.1, 6.4
 */

const { validateHealthMetrics } = require('./validate-features');

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Health Metrics Validation Test Runner                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  try {
    console.log('Running validateHealthMetrics()...\n');
    const result = await validateHealthMetrics();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST RESULTS                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`Feature: ${result.name}`);
    console.log(`Status: ${result.status.toUpperCase()}`);
    console.log(`Execution Time: ${result.executionTime.toFixed(2)}s`);
    console.log(`Total Tests: ${result.tests.length}`);
    
    const passedTests = result.tests.filter(t => t.status === 'pass').length;
    const failedTests = result.tests.filter(t => t.status === 'fail').length;
    const warningTests = result.tests.filter(t => t.status === 'warning').length;
    
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Warnings: ${warningTests}`);
    
    console.log('\n--- Test Details ---\n');
    
    result.tests.forEach((test, index) => {
      const statusIcon = test.status === 'pass' ? '✓' : test.status === 'fail' ? '✗' : '⚠';
      console.log(`${index + 1}. ${statusIcon} ${test.name}`);
      console.log(`   Status: ${test.status.toUpperCase()}`);
      console.log(`   Duration: ${test.duration}ms`);
      console.log(`   Details: ${test.details}`);
      console.log('');
    });
    
    if (result.errors.length > 0) {
      console.log('\n--- Errors ---\n');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n--- Warnings ---\n');
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ Enhanced Health Metrics Validation Tests:');
    console.log('   - Weight logging (kg and lbs units)');
    console.log('   - Vitals tracking (normal and edge case values)');
    console.log('   - Exercise tracking (multiple exercise types)');
    console.log('   - Data visualization (UI elements and charts)');
    console.log('   - Data validation (rejects invalid values)');
    console.log('   - Date range filtering');
    console.log('   - Query parameter support\n');
    
    if (result.status === 'pass') {
      console.log('✓ All health metrics validation tests passed!\n');
      process.exit(0);
    } else if (result.status === 'warning') {
      console.log('⚠ Health metrics validation completed with warnings.\n');
      process.exit(0);
    } else {
      console.log('✗ Some health metrics validation tests failed.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n✗ Error running health metrics validation tests:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();
