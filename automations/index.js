// Automations Manager - Central Hub for All Automations
// Manages and coordinates all automation modules

import { AutoUpdateSync } from './auto-update-sync.js';
import { AutoDatabaseSync } from './auto-database-sync.js';
import { AutoIntegrateAll } from './auto-integrate-all.js';
import { AutoCleanup } from './auto-cleanup.js';
import { AutoRestart } from './auto-restart.js';
import { SyncWatchdog } from './sync-watchdog.js';

class AutomationsManager {
  constructor(godServer, options = {}) {
    this.godServer = godServer;
    this.enabled = options.enabled !== false;
    
    // Initialize automation modules
    this.modules = {
      updateSync: new AutoUpdateSync(options.updateSync || {}),
      databaseSync: new AutoDatabaseSync(
        godServer.dbIntegrations,
        options.databaseSync || { interval: 1000 } // 1 second default
      ),
      integrateAll: new AutoIntegrateAll(
        godServer,
        options.integrateAll || {}
      ),
      cleanup: new AutoCleanup(options.cleanup || {}),
      restart: new AutoRestart(options.restart || {})
    };

    // Initialize watchdog AFTER databaseSync
    this.modules.watchdog = new SyncWatchdog(
      this.modules.databaseSync,
      options.watchdog || { enabled: true }
    );

    this.startTime = null;
  }

  /**
   * Start all automations
   */
  async startAll() {
    if (!this.enabled) {
      console.log('⚠️  Automations: Disabled');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('║' + ' '.repeat(78) + '║');
    console.log('║' + '  🤖 Starting Automations Manager'.padEnd(78) + '║');
    console.log('║' + ' '.repeat(78) + '║');
    console.log('═'.repeat(80) + '\n');

    this.startTime = new Date();

    // Start each automation module
    try {
      // Auto Update Sync
      if (this.modules.updateSync.enabled) {
        this.modules.updateSync.start();
      }

      // Auto Database Sync
      if (this.modules.databaseSync.enabled) {
        this.modules.databaseSync.start();
      }

      // Auto Integrate All
      if (this.modules.integrateAll.enabled) {
        this.modules.integrateAll.start();
      }

      // Auto Cleanup
      if (this.modules.cleanup.enabled) {
        this.modules.cleanup.start();
      }

      // Auto Restart (should be last)
      if (this.modules.restart.enabled) {
        this.modules.restart.start(this.godServer);
      }

      // Start Watchdog (monitors database sync)
      if (this.modules.watchdog.enabled) {
        this.modules.watchdog.start();
      }

      console.log('\n✅ All automations started successfully\n');
      console.log('═'.repeat(80) + '\n');
      console.log('⚡ REAL-TIME MODE: Database syncing every 1 second');
      console.log('🔒 CONTINUOUS MODE: Sync will never auto turn off');
      console.log('🐕 WATCHDOG: Monitoring sync health and auto-restarting if needed\n');
      console.log('═'.repeat(80) + '\n');

    } catch (error) {
      console.error('❌ Failed to start automations:', error);
      throw error;
    }
  }

  /**
   * Stop all automations
   */
  async stopAll() {
    console.log('\n🛑 Stopping all automations...\n');

    for (const [name, module] of Object.entries(this.modules)) {
      try {
        if (module.stop) {
          module.stop();
        }
      } catch (error) {
        console.error(`❌ Error stopping ${name}:`, error.message);
      }
    }

    console.log('✅ All automations stopped\n');
  }

  /**
   * Get status of all automations
   */
  getStatus() {
    const status = {
      enabled: this.enabled,
      startTime: this.startTime,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      modules: {}
    };

    for (const [name, module] of Object.entries(this.modules)) {
      if (module.getStatus) {
        status.modules[name] = module.getStatus();
      }
    }

    return status;
  }

  /**
   * Get specific module
   */
  getModule(name) {
    return this.modules[name];
  }

  /**
   * Trigger manual sync
   */
  async triggerDatabaseSync() {
    if (this.modules.databaseSync) {
      return await this.modules.databaseSync.performSync();
    }
    throw new Error('Database sync module not available');
  }

  /**
   * Trigger manual cleanup
   */
  async triggerCleanup() {
    if (this.modules.cleanup) {
      return await this.modules.cleanup.cleanupNow();
    }
    throw new Error('Cleanup module not available');
  }

  /**
   * Trigger integration check
   */
  async triggerIntegrationCheck() {
    if (this.modules.integrateAll) {
      return await this.modules.integrateAll.checkIntegrations();
    }
    throw new Error('Integration check module not available');
  }

  /**
   * Trigger schema push
   */
  async triggerSchemaPush() {
    if (this.modules.databaseSync) {
      return await this.modules.databaseSync.pushSchemaNow();
    }
    throw new Error('Database sync module not available');
  }

  /**
   * Trigger manual restart
   */
  async triggerRestart(reason = 'manual') {
    if (this.modules.restart) {
      return await this.modules.restart.restartNow(reason);
    }
    throw new Error('Restart module not available');
  }
}

export { AutomationsManager };
