#!/usr/bin/env node

/**
 * Test Database Connections
 * 
 * Verifies that both PostgreSQL and MongoDB connections are working
 * and displays database statistics
 */

const { getDatabaseConnection } = require('./connection');

async function testDatabaseConnections() {
  console.log('🧪 Testing Database Connections\n');
  console.log('='.repeat(60));
  
  const db = getDatabaseConnection();
  
  try {
    // Connect to all databases
    await db.connectAll();
    
    // Test connections
    console.log('🔍 Testing connection health...\n');
    const healthResults = await db.testConnections();
    
    console.log('PostgreSQL:', healthResults.postgres.status.toUpperCase());
    if (healthResults.postgres.error) {
      console.log('  Error:', healthResults.postgres.error);
    }
    
    console.log('MongoDB:', healthResults.mongodb.status.toUpperCase());
    if (healthResults.mongodb.error) {
      console.log('  Error:', healthResults.mongodb.error);
    }
    
    // Get statistics
    console.log('\n📊 Database Statistics\n');
    const stats = await db.getStats();
    
    console.log('PostgreSQL Tables:');
    for (const [table, count] of Object.entries(stats.postgres)) {
      if (table !== 'error') {
        console.log(`  ${table}: ${count} records`);
      }
    }
    
    console.log('\nMongoDB Collections:');
    if (stats.mongodb.collections) {
      console.log(`  Collections: ${stats.mongodb.collections.join(', ')}`);
      for (const [collection, count] of Object.entries(stats.mongodb)) {
        if (collection !== 'collections' && collection !== 'error') {
          console.log(`  ${collection}: ${count} documents`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database connection test failed:', error.message);
    process.exit(1);
  } finally {
    await db.disconnectAll();
  }
}

// Run if called directly
if (require.main === module) {
  testDatabaseConnections()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnections };
