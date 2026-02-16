// Sync Watchdog - Ensures database sync never stops
// Monitors sync health and automatically restarts if needed

import EventEmitter from 'events';

class SyncWatchdog extends EventEmitter {
  constructor(autoDatabaseSync, options = {}) {
    super();
    this.autoDatabaseSync = autoDatabaseSync;
    this.enabled = options.enabled !== false;
    this.checkInterval = options.checkInterval || 5000; // Check every 5 seconds
    this.maxRestarts = options.maxRestarts || 10;
    this.restartDelay = options.restartDelay || 2000;
    
    this.watchdogInterval = null;
    this.lastSyncCount = 0;
    this.restartCount = 0;
    this.lastCheckTime = null;
    this.isHealthy = true;
  }

  /**
   * Start the watchdog
   */
  start() {
    if (!this.enabled) {
      console.log('⚠️  Sync Watchdog: Disabled');
      return;
    }

    console.log('🐕 Sync Watchdog: Starting...');
    console.log(`   Check Interval: ${this.checkInterval / 1000}s`);
    console.log(`   Max Restarts: ${this.maxRestarts}`);
    console.log(`   Auto Restart: Enabled`);

    // Initial check
    this.lastSyncCount = this.autoDatabaseSync.syncCount;
    this.lastCheckTime = Date.now();

    // Schedule periodic health checks
    this.watchdogInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);

    console.log('✅ Sync Watchdog: Started');
    console.log('   🔒 Sync will be monitored and auto-restarted if needed');
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    const currentSyncCount = this.autoDatabaseSync.syncCount;
    const currentTime = Date.now();
    const timeSinceLastCheck = currentTime - this.lastCheckTime;

    // Check if sync is running
    const isSyncRunning = this.autoDatabaseSync.intervalId !== null;
    
    // Check if sync count is increasing
    const syncCountIncreased = currentSyncCount > this.lastSyncCount;

    // Expected minimum syncs (should sync at least once per check interval)
    const expectedMinSyncs = Math.floor(timeSinceLastCheck / this.autoDatabaseSync.interval);
    const actualSyncs = currentSyncCount - this.lastSyncCount;

    // Determine health status
    const wasHealthy = this.isHealthy;
    this.isHealthy = isSyncRunning && (syncCountIncreased || actualSyncs >= expectedMinSyncs * 0.5);

    // Log health status (only on status change or every 10 checks)
    if (!this.isHealthy || !wasHealthy) {
      console.log(`\n🐕 Watchdog Health Check:`);
      console.log(`   Sync Running: ${isSyncRunning ? '✅' : '❌'}`);
      console.log(`   Sync Count: ${currentSyncCount} (${actualSyncs} new)`);
      console.log(`   Expected Syncs: ${expectedMinSyncs}`);
      console.log(`   Health Status: ${this.isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    }

    // If unhealthy, attempt restart
    if (!this.isHealthy) {
      console.warn('⚠️  Sync appears to be stopped or stalled!');
      await this.attemptRestart();
    }

    // Update tracking
    this.lastSyncCount = currentSyncCount;
    this.lastCheckTime = currentTime;

    // Emit health status
    this.emit('health-check', {
      isHealthy: this.isHealthy,
      syncCount: currentSyncCount,
      isSyncRunning,
      timestamp: new Date()
    });
  }

  /**
   * Attempt to restart sync
   */
  async attemptRestart() {
    if (this.restartCount >= this.maxRestarts) {
      console.error('❌ Max restart attempts reached!');
      console.error('   Manual intervention required.');
      this.emit('max-restarts-reached', {
        restartCount: this.restartCount,
        timestamp: new Date()
      });
      return;
    }

    this.restartCount++;
    console.log(`🔄 Attempting to restart sync (Attempt ${this.restartCount}/${this.maxRestarts})...`);

    try {
      // Stop current sync
      if (this.autoDatabaseSync.intervalId) {
        this.autoDatabaseSync.stop();
        console.log('   ⏹️  Stopped existing sync');
      }

      // Wait before restart
      await new Promise(resolve => setTimeout(resolve, this.restartDelay));

      // Restart sync
      await this.autoDatabaseSync.start();
      console.log('   ✅ Sync restarted successfully');

      // Reset restart count on successful restart
      setTimeout(() => {
        if (this.isHealthy) {
          this.restartCount = 0;
          console.log('   🎉 Sync stable - reset restart counter');
        }
      }, this.checkInterval * 3); // Wait 3 check intervals

      this.emit('sync-restarted', {
        restartCount: this.restartCount,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Failed to restart sync:', error.message);
      this.emit('restart-failed', {
        error: error.message,
        restartCount: this.restartCount,
        timestamp: new Date()
      });
    }
  }

  /**
   * Stop the watchdog
   */
  stop() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
      console.log('🛑 Sync Watchdog: Stopped');
    }
  }

  /**
   * Get watchdog status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      isHealthy: this.isHealthy,
      checkInterval: this.checkInterval,
      restartCount: this.restartCount,
      maxRestarts: this.maxRestarts,
      lastCheckTime: this.lastCheckTime,
      isRunning: !!this.watchdogInterval,
      syncStatus: {
        syncCount: this.autoDatabaseSync.syncCount,
        lastSyncTime: this.autoDatabaseSync.lastSyncTime,
        isRunning: !!this.autoDatabaseSync.intervalId
      }
    };
  }

  /**
   * Force restart sync
   */
  async forceRestart() {
    console.log('🔧 Force restarting sync...');
    this.restartCount = 0; // Reset counter for manual restart
    await this.attemptRestart();
  }

  /**
   * Reset watchdog
   */
  reset() {
    this.restartCount = 0;
    this.isHealthy = true;
    this.lastSyncCount = this.autoDatabaseSync.syncCount;
    this.lastCheckTime = Date.now();
    console.log('🔄 Watchdog reset');
  }
}

export { SyncWatchdog };
