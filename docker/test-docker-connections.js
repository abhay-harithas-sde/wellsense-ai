#!/usr/bin/env node

// Docker Database Connections Test
// Tests all Docker services and connections

require('dotenv').config({ path: '../.env' });
const { DatabaseIntegrations } = require('../lib/database-integrations');

console.log('\n' + '═'.repeat(80));
console.log('║  WellSense AI - Docker Connections Test');
console.log('═'.repeat(80) + '\n');

async function testConnections() {
  const db = new DatabaseIntegrations();
  let allPassed = true;

  try {
    // Test 1: Connect to all databases
    console.log('Test 1: Connecting to All Databases');
    console.log('─'.repeat(80));
    const connections = await db.connectAll();
    
    console.log('\nConnection Results:');
    console.log(`  PostgreSQL: ${connections.postgresql.status}`);
    console.log(`  MongoDB: ${connections.mongodb.status}`);
    console.log(`  Redis: ${connections.redis.status}`);
    
    if (connections.postgresql.status !== 'connected') {
      console.log(`    ❌ PostgreSQL Error: ${connections.postgresql.error}`);
      allPassed = false;
    }
    
    if (connections.mongodb.status !== 'connected') {
      console.log(`    ⚠️  MongoDB: ${connections.mongodb.error}`);
    }
    
    if (connections.redis.status !== 'connected') {
      console.log(`    ⚠️  Redis: ${connections.redis.error}`);
    }
    
    console.log('');

    // Test 2: Health check
    console.log('Test 2: Health Check All Services');
    console.log('─'.repeat(80));
    const health = await db.healthCheckAll();
    
    console.log('\nHealth Status:');
    console.log(`  PostgreSQL: ${health.postgresql.status} (${health.postgresql.latency || 0}ms)`);
    console.log(`  MongoDB: ${health.mongodb.status} (${health.mongodb.latency || 0}ms)`);
    console.log(`  Redis: ${health.redis.status} (${health.redis.latency || 0}ms)`);
    
    if (health.postgresql.status !== 'healthy') {
      console.log(`    ❌ PostgreSQL unhealthy`);
      allPassed = false;
    }
    
    console.log('');

    // Test 3: Get connection status
    console.log('Test 3: Connection Status');
    console.log('─'.repeat(80));
    const status = db.getConnectionStatus();
    
    console.log('\nConnection Details:');
    Object.entries(status).forEach(([name, info]) => {
      const icon = info.connected ? '✅' : '❌';
      console.log(`  ${icon} ${name.toUpperCase()}`);
      console.log(`     Type: ${info.type}`);
      console.log(`     Port: ${info.port}`);
      console.log(`     Connected: ${info.connected}`);
    });
    
    console.log('');

    // Test 4: PostgreSQL operations
    if (db.connections.postgresql) {
      console.log('Test 4: PostgreSQL Operations');
      console.log('─'.repeat(80));
      
      try {
        // Test query
        const result = await db.prisma.$queryRaw`SELECT current_database(), current_user, version()`;
        console.log('✅ PostgreSQL query successful');
        console.log(`   Database: ${result[0].current_database}`);
        console.log(`   User: ${result[0].current_user}`);
        
        // Test table count
        const tableCount = await db.prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `;
        console.log(`   Tables: ${tableCount[0].count}`);
        
      } catch (error) {
        console.log(`❌ PostgreSQL operations failed: ${error.message}`);
        allPassed = false;
      }
      
      console.log('');
    }

    // Test 5: MongoDB operations
    if (db.connections.mongodb) {
      console.log('Test 5: MongoDB Operations');
      console.log('─'.repeat(80));
      
      try {
        // List collections
        const collections = await db.mongodb.listCollections().toArray();
        console.log('✅ MongoDB query successful');
        console.log(`   Collections: ${collections.length}`);
        if (collections.length > 0) {
          console.log(`   Names: ${collections.map(c => c.name).join(', ')}`);
        }
        
        // Test insert and delete
        const testDoc = { test: true, timestamp: new Date() };
        await db.mongoInsert('test_collection', testDoc);
        await db.mongoDelete('test_collection', { test: true });
        console.log('✅ MongoDB insert/delete successful');
        
      } catch (error) {
        console.log(`⚠️  MongoDB operations: ${error.message}`);
      }
      
      console.log('');
    }

    // Test 6: Redis operations
    if (db.connections.redis) {
      console.log('Test 6: Redis Operations');
      console.log('─'.repeat(80));
      
      try {
        // Test set/get
        await db.redisSet('test_key', 'test_value', 60);
        const value = await db.redisGet('test_key');
        console.log('✅ Redis set/get successful');
        console.log(`   Value: ${value}`);
        
        // Test delete
        await db.redisDel('test_key');
        console.log('✅ Redis delete successful');
        
        // Get database size
        const dbSize = await db.redisClient.dbSize();
        console.log(`   Keys in database: ${dbSize}`);
        
      } catch (error) {
        console.log(`⚠️  Redis operations: ${error.message}`);
      }
      
      console.log('');
    }

    // Test 7: Get statistics
    console.log('Test 7: Database Statistics');
    console.log('─'.repeat(80));
    const stats = await db.getStats();
    
    console.log('\nPostgreSQL Stats:');
    if (stats.postgresql.error) {
      console.log(`  ❌ Error: ${stats.postgresql.error}`);
    } else {
      Object.entries(stats.postgresql).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
    
    if (db.connections.mongodb) {
      console.log('\nMongoDB Stats:');
      if (stats.mongodb.error) {
        console.log(`  ⚠️  Error: ${stats.mongodb.error}`);
      } else {
        console.log(`  Collections: ${stats.mongodb.collections}`);
        if (stats.mongodb.collectionNames) {
          console.log(`  Names: ${stats.mongodb.collectionNames.join(', ')}`);
        }
      }
    }
    
    if (db.connections.redis) {
      console.log('\nRedis Stats:');
      if (stats.redis.error) {
        console.log(`  ⚠️  Error: ${stats.redis.error}`);
      } else {
        console.log(`  Keys: ${stats.redis.keys}`);
        console.log(`  Connected: ${stats.redis.connected}`);
      }
    }
    
    console.log('');

    // Test 8: Cache functionality
    if (db.connections.redis && db.connections.postgresql) {
      console.log('Test 8: Cache Functionality');
      console.log('─'.repeat(80));
      
      try {
        const cacheKey = 'test_cache_key';
        
        // First call (should query database)
        const start1 = Date.now();
        const result1 = await db.cachedQuery(
          cacheKey,
          async () => {
            return { data: 'test', timestamp: new Date() };
          },
          60
        );
        const time1 = Date.now() - start1;
        
        // Second call (should use cache)
        const start2 = Date.now();
        const result2 = await db.cachedQuery(
          cacheKey,
          async () => {
            return { data: 'test', timestamp: new Date() };
          },
          60
        );
        const time2 = Date.now() - start2;
        
        console.log('✅ Cache functionality working');
        console.log(`   First call: ${time1}ms`);
        console.log(`   Cached call: ${time2}ms`);
        console.log(`   Speed improvement: ${Math.round((time1 - time2) / time1 * 100)}%`);
        
        // Cleanup
        await db.redisDel(cacheKey);
        
      } catch (error) {
        console.log(`⚠️  Cache test: ${error.message}`);
      }
      
      console.log('');
    }

    // Disconnect
    await db.disconnectAll();

    // Final summary
    console.log('═'.repeat(80));
    if (allPassed && db.connections.postgresql) {
      console.log('║  ✅ All Critical Tests Passed!');
      console.log('═'.repeat(80));
      console.log('\n✅ Docker database connections are working correctly.');
      console.log('✅ PostgreSQL is connected and operational');
      if (db.connections.mongodb) console.log('✅ MongoDB is connected and operational');
      if (db.connections.redis) console.log('✅ Redis is connected and operational');
      console.log('\nYou can now start your application with: npm run dev\n');
      process.exit(0);
    } else {
      console.log('║  ⚠️  Some Tests Failed');
      console.log('═'.repeat(80));
      console.log('\n⚠️  Some database connections failed.');
      console.log('\nTroubleshooting:');
      console.log('1. Ensure Docker containers are running: docker-compose ps');
      console.log('2. Check container logs: docker-compose logs');
      console.log('3. Verify .env file has correct connection strings');
      console.log('4. Run Docker setup: docker\\docker-complete-setup.bat\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
    
    try {
      await db.disconnectAll();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    
    process.exit(1);
  }
}

// Run tests
testConnections();
