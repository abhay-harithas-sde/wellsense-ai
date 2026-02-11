// Auto Database Sync - Real-time Database Synchronization
// Automatically syncs data between PostgreSQL, MongoDB, and Redis

const EventEmitter = require('events');

class AutoDatabaseSync extends EventEmitter {
  constructor(dbIntegrations, options = {}) {
    super();
    this.dbIntegrations = dbIntegrations;
    this.enabled = true;
    this.interval = options.interval || 30000; // 30 seconds
    this.syncTables = options.syncTables || ['users', 'healthRecords', 'goals'];
    this.intervalId = null;
    this.lastSyncTime = null;
    this.syncCount = 0;
  }

  /**
   * Start auto database sync
   */
  async start() {
    if (!this.enabled) {
      console.log('⚠️  Auto Database Sync: Disabled');
      return;
    }

    console.log('🔄 Auto Database Sync: Starting...');
    console.log(`   Interval: ${this.interval / 1000}s`);
    console.log(`   Tables: ${this.syncTables.join(', ')}`);
    console.log(`   Schema Auto-Push: Enabled (checks every hour)`);

    // Check and push schema changes on startup
    await this.checkAndPushSchema();

    // Run initial sync
    this.performSync();

    // Schedule periodic sync
    this.intervalId = setInterval(() => {
      this.performSync();
    }, this.interval);

    // Schedule periodic schema check (every hour)
    this.schemaCheckInterval = setInterval(() => {
      this.checkAndPushSchema();
    }, 3600000); // 1 hour

    console.log('✅ Auto Database Sync: Started');
    console.log('   📋 Schema will be checked and pushed automatically');
  }

  /**
   * Check for schema changes and push to database
   */
  async checkAndPushSchema() {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('🔍 AUTO SCHEMA SYNC: Checking for database schema changes...');
    console.log('════════════════════════════════════════════════════════════════');
    
    try {
      const { execSync } = require('child_process');
      
      // First, check if Prisma is available
      try {
        execSync('npx prisma --version', { stdio: 'pipe' });
      } catch (error) {
        console.error('❌ Prisma CLI not available');
        return;
      }

      // Check if schema is in sync
      console.log('📋 Running: npx prisma db push --skip-generate --accept-data-loss');
      
      try {
        const output = execSync('npx prisma db push --skip-generate --accept-data-loss', {
          stdio: 'pipe',
          cwd: process.cwd(),
          encoding: 'utf8'
        });
        
        const outputStr = output.toString();
        
        if (outputStr.includes('already in sync')) {
          console.log('✅ Database schema is already in sync - no changes needed');
        } else if (outputStr.includes('applied') || outputStr.includes('created')) {
          console.log('✅ Schema changes detected and applied successfully!');
          console.log('   📝 Changes pushed to database');
          
          // Generate Prisma client after schema push
          console.log('🔄 Regenerating Prisma client...');
          try {
            execSync('npx prisma generate', {
              stdio: 'pipe',
              cwd: process.cwd()
            });
            console.log('✅ Prisma client regenerated successfully');
            console.log('💡 Server may need restart to use new schema');
          } catch (genError) {
            console.warn('⚠️  Prisma client generation warning');
            console.warn('   Run manually: npx prisma generate');
          }
        } else {
          console.log('✅ Schema check completed');
        }
        
        this.emit('schema-synced', { success: true, timestamp: new Date() });
        
      } catch (error) {
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
        
        // Check if it's actually a success message
        if (errorOutput.includes('already in sync')) {
          console.log('✅ Database schema is already in sync');
          this.emit('schema-synced', { success: true, timestamp: new Date() });
        } else if (errorOutput.includes('applied')) {
          console.log('✅ Schema changes applied successfully');
          this.emit('schema-synced', { success: true, timestamp: new Date() });
          
          // Try to regenerate client
          try {
            execSync('npx prisma generate', { stdio: 'pipe', cwd: process.cwd() });
            console.log('✅ Prisma client regenerated');
          } catch (genError) {
            console.warn('⚠️  Client regeneration needed - run: npx prisma generate');
          }
        } else {
          console.error('❌ Schema push encountered an error:');
          console.error('   ' + errorOutput.split('\n').slice(0, 3).join('\n   '));
          this.emit('schema-error', { error: errorOutput, timestamp: new Date() });
        }
      }
      
    } catch (error) {
      console.error('❌ Schema sync failed:', error.message);
      console.log('💡 Manual fix: npx prisma db push');
      this.emit('schema-error', { error: error.message, timestamp: new Date() });
    }
    
    console.log('════════════════════════════════════════════════════════════════\n');
  }

  /**
   * Perform database sync
   */
  async performSync() {
    if (!this.dbIntegrations.connections.postgresql || 
        !this.dbIntegrations.connections.mongodb) {
      console.log('⚠️  Sync skipped: Required databases not connected');
      return;
    }

    console.log('🔄 Starting database sync...');
    const startTime = Date.now();
    const results = {
      success: [],
      failed: [],
      timestamp: new Date().toISOString()
    };

    for (const table of this.syncTables) {
      try {
        await this.syncTable(table);
        results.success.push(table);
        console.log(`   ✅ Synced: ${table}`);
      } catch (error) {
        results.failed.push({ table, error: error.message });
        console.error(`   ❌ Failed: ${table} - ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    this.lastSyncTime = new Date();
    this.syncCount++;

    console.log(`✅ Sync completed in ${duration}ms`);
    console.log(`   Success: ${results.success.length}, Failed: ${results.failed.length}`);

    this.emit('sync-complete', results);
    return results;
  }

  /**
   * Sync specific table
   */
  async syncTable(tableName) {
    // Get data from PostgreSQL
    let data;
    
    switch (tableName) {
      case 'users':
        data = await this.dbIntegrations.prisma.user.findMany({
          take: 100,
          orderBy: { updatedAt: 'desc' }
        });
        break;
      
      case 'healthRecords':
        data = await this.dbIntegrations.prisma.healthRecord.findMany({
          take: 100,
          orderBy: { recordedAt: 'desc' }
        });
        break;
      
      case 'goals':
        data = await this.dbIntegrations.prisma.goal.findMany({
          take: 100,
          orderBy: { updatedAt: 'desc' }
        });
        break;
      
      default:
        throw new Error(`Unknown table: ${tableName}`);
    }

    // Sync to MongoDB
    if (data && data.length > 0) {
      for (const record of data) {
        await this.dbIntegrations.syncToMongo(tableName, record);
      }
    }

    // Cache recent records in Redis
    if (this.dbIntegrations.connections.redis && data && data.length > 0) {
      const cacheKey = `sync:${tableName}:latest`;
      await this.dbIntegrations.redisSet(
        cacheKey,
        JSON.stringify(data.slice(0, 10)),
        3600 // 1 hour
      );
    }

    return data.length;
  }

  /**
   * Sync specific record immediately
   */
  async syncRecord(tableName, recordId) {
    console.log(`🔄 Syncing record: ${tableName}:${recordId}`);

    try {
      let record;
      
      switch (tableName) {
        case 'users':
          record = await this.dbIntegrations.prisma.user.findUnique({
            where: { id: recordId }
          });
          break;
        
        case 'healthRecords':
          record = await this.dbIntegrations.prisma.healthRecord.findUnique({
            where: { id: recordId }
          });
          break;
        
        case 'goals':
          record = await this.dbIntegrations.prisma.goal.findUnique({
            where: { id: recordId }
          });
          break;
        
        default:
          throw new Error(`Unknown table: ${tableName}`);
      }

      if (record) {
        await this.dbIntegrations.syncToMongo(tableName, record);
        
        // Update cache
        if (this.dbIntegrations.connections.redis) {
          const cacheKey = `${tableName}:${recordId}`;
          await this.dbIntegrations.redisSet(
            cacheKey,
            JSON.stringify(record),
            3600
          );
        }
        
        console.log(`✅ Record synced: ${tableName}:${recordId}`);
        return { success: true, record };
      } else {
        throw new Error('Record not found');
      }
    } catch (error) {
      console.error(`❌ Sync failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manually trigger schema push (can be called via API)
   */
  async pushSchemaNow() {
    console.log('🚀 Manual schema push triggered...');
    await this.checkAndPushSchema();
  }

  /**
   * Stop auto database sync
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.schemaCheckInterval) {
      clearInterval(this.schemaCheckInterval);
      this.schemaCheckInterval = null;
    }
    
    console.log('🛑 Auto Database Sync: Stopped');
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      interval: this.interval,
      syncTables: this.syncTables,
      lastSyncTime: this.lastSyncTime,
      syncCount: this.syncCount,
      isRunning: !!this.intervalId
    };
  }
}

module.exports = { AutoDatabaseSync };
