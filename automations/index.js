// Automations Manager - Central Hub for All Automations
// Manages and coordinates all automation modules

const { AutoUpdateSync } = require('./auto-update-sync');
const { AutoDatabaseSync } = require('./auto-database-sync');
const { AutoIntegrateAll } = require('./auto-integrate-all');
const { AutoCleanup } = require('./auto-cleanup');
const { AutoRestart } = require('./auto-restart');

class AutomationsManager {
  constructor(godServer, options = {}) {
    this.godServer = godServer;
    this.enabled = options.enabled !== false;
    
    // Initialize automation modules
    this.modules = {
      updateSync: new AutoUpdateSync(options.updateSync || {}),
      databaseSync: new AutoDatabaseSync(
        godServer.dbIntegrations,
        options.databaseSync || {}
      ),
      integrateAll: new AutoIntegrateAll(
        godServer,
        options.integrateAll || {}
      ),
      cleanup: new AutoCleanup(options.cleanup || {}),
      restart: new AutoRestart(options.restart || {})
    };

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

      console.log('\n✅ All automations started successfully\n');
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

module.exports = { AutomationsManager };
