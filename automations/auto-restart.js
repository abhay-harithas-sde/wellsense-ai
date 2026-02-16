// Auto Restart - Automatic Server Restart on Errors
// Monitors server health and restarts on critical failures

import EventEmitter from 'events';

class AutoRestart extends EventEmitter {
  constructor(options = {}) {
    super();
    this.enabled = options.enabled !== false;
    this.maxRestarts = options.maxRestarts || 5;
    this.restartWindow = options.restartWindow || 60000; // 1 minute
    this.healthCheckInterval = options.healthCheckInterval || 30000; // 30 seconds
    this.restartDelay = options.restartDelay || 5000; // 5 seconds
    
    this.restartCount = 0;
    this.restartHistory = [];
    this.intervalId = null;
    this.isRestarting = false;
  }

  /**
   * Start auto restart monitoring
   */
  start(godServer) {
    if (!this.enabled) {
      console.log('⚠️  Auto Restart: Disabled');
      return;
    }

    this.godServer = godServer;

    console.log('🔄 Auto Restart: Starting...');
    console.log(`   Max Restarts: ${this.maxRestarts} per ${this.restartWindow / 1000}s`);
    console.log(`   Health Check: Every ${this.healthCheckInterval / 1000}s`);

    // Monitor for uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleCriticalError('uncaughtException', error);
    });

    // Monitor for unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleCriticalError('unhandledRejection', reason);
    });

    // Periodic health checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);

    console.log('✅ Auto Restart: Started');
  }

  /**
   * Handle critical error
   */
  async handleCriticalError(type, error) {
    console.error(`\n❌ Critical Error (${type}):`, error);

    if (!this.enabled || this.isRestarting) {
      return;
    }

    // Check if we've exceeded restart limit
    if (this.shouldRestart()) {
      await this.performRestart(type, error);
    } else {
      console.error('⚠️  Restart limit exceeded. Manual intervention required.');
      this.emit('restart-limit-exceeded', {
        type,
        error,
        restartCount: this.restartCount,
        restartHistory: this.restartHistory
      });
    }
  }

  /**
   * Check if restart is allowed
   */
  shouldRestart() {
    const now = Date.now();
    
    // Clean old restart history
    this.restartHistory = this.restartHistory.filter(
      time => now - time < this.restartWindow
    );

    return this.restartHistory.length < this.maxRestarts;
  }

  /**
   * Perform server restart
   */
  async performRestart(reason, error) {
    if (this.isRestarting) {
      console.log('⏳ Restart already in progress...');
      return;
    }

    this.isRestarting = true;
    this.restartCount++;
    this.restartHistory.push(Date.now());

    console.log(`\n🔄 Initiating server restart (${this.restartCount}/${this.maxRestarts})...`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Waiting ${this.restartDelay / 1000}s before restart...\n`);

    this.emit('restart-initiated', {
      reason,
      error: error?.message || error,
      restartCount: this.restartCount
    });

    // Wait before restarting
    await new Promise(resolve => setTimeout(resolve, this.restartDelay));

    try {
      // Graceful cleanup
      if (this.godServer) {
        console.log('🧹 Cleaning up connections...');
        
        // Disconnect databases
        if (this.godServer.dbIntegrations) {
          await this.godServer.dbIntegrations.disconnectAll();
        }
        
        // Disconnect database integrations
        if (this.godServer.dbIntegrations) {
          await this.godServer.dbIntegrations.disconnectAll();
        }
        
        // Disconnect Prisma
        if (this.godServer.prisma) {
          await this.godServer.prisma.$disconnect();
        }
      }

      console.log('✅ Cleanup complete');
      console.log('🔄 Restarting server...\n');

      // Exit process - PM2 or nodemon will restart
      process.exit(1);
    } catch (cleanupError) {
      console.error('❌ Cleanup error:', cleanupError);
      process.exit(1);
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    if (!this.godServer) return;

    try {
      // Check database connections
      if (this.godServer.dbIntegrations) {
        const health = await this.godServer.dbIntegrations.healthCheckAll();
        
        // Check if critical databases are down
        if (health.postgresql && health.postgresql.status === 'unhealthy') {
          console.warn('⚠️  PostgreSQL unhealthy');
          this.emit('health-warning', { component: 'postgresql', health });
        }
      }

      // Check database integrations
      const dbConnections = this.godServer.dbIntegrations?.getConnectionStatus();
      if (dbConnections && !dbConnections.postgresql.connected) {
        console.warn('⚠️  PostgreSQL disconnected');
        this.emit('health-warning', { component: 'postgresql' });
      }

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.emit('health-check-failed', error);
    }
  }

  /**
   * Manual restart trigger
   */
  async restartNow(reason = 'manual') {
    console.log(`🔄 Manual restart triggered: ${reason}`);
    await this.performRestart(reason, null);
  }

  /**
   * Stop auto restart
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Auto Restart: Stopped');
    }
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      maxRestarts: this.maxRestarts,
      restartWindow: this.restartWindow,
      restartCount: this.restartCount,
      restartHistory: this.restartHistory,
      isRestarting: this.isRestarting,
      isRunning: !!this.intervalId
    };
  }

  /**
   * Reset restart counter
   */
  resetCounter() {
    this.restartCount = 0;
    this.restartHistory = [];
    console.log('✅ Restart counter reset');
  }
}

export { AutoRestart };
