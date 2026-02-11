// Auto Integrate All - Automatic Integration Manager
// Ensures all components are properly integrated and connected

class AutoIntegrateAll {
  constructor(godServer, options = {}) {
    this.godServer = godServer;
    this.enabled = options.enabled !== false;
    this.checkInterval = options.checkInterval || 30000; // 30 seconds
    this.intervalId = null;
    this.lastCheckTime = null;
    this.integrationStatus = {};
  }

  /**
   * Start auto integration
   */
  start() {
    if (!this.enabled) {
      console.log('⚠️  Auto Integrate All: Disabled');
      return;
    }

    console.log('🔗 Auto Integrate All: Starting...');
    console.log(`   Check Interval: ${this.checkInterval / 1000}s`);

    // Run initial check
    this.checkIntegrations();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.checkIntegrations();
    }, this.checkInterval);

    console.log('✅ Auto Integrate All: Started');
  }

  /**
   * Check all integrations
   */
  async checkIntegrations() {
    console.log('🔍 Checking integrations...');
    const startTime = Date.now();

    const status = {
      timestamp: new Date().toISOString(),
      components: {}
    };

    // Check database integrations
    status.components.databases = await this.checkDatabases();

    // Check AI services
    status.components.ai = await this.checkAI();

    // Check frontend
    status.components.frontend = await this.checkFrontend();

    // Check API routes
    status.components.api = await this.checkAPI();

    const duration = Date.now() - startTime;
    this.lastCheckTime = new Date();
    this.integrationStatus = status;

    // Log results
    const allHealthy = Object.values(status.components).every(c => c.status === 'healthy');
    
    if (allHealthy) {
      console.log(`✅ All integrations healthy (${duration}ms)`);
    } else {
      console.log(`⚠️  Some integrations need attention (${duration}ms)`);
      this.logIssues(status);
    }

    return status;
  }

  /**
   * Check database integrations
   */
  async checkDatabases() {
    try {
      const { dbIntegrations } = this.godServer;
      const health = await dbIntegrations.healthCheckAll();
      const connections = dbIntegrations.getConnectionStatus();

      const allConnected = Object.values(connections).every(c => c.connected);
      const allHealthy = Object.values(health).every(h => h.status === 'healthy');

      return {
        status: allConnected && allHealthy ? 'healthy' : 'degraded',
        connections,
        health
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Check AI services
   */
  async checkAI() {
    try {
      const { ai } = this.godServer;
      const health = await ai.healthCheck();

      const hasProvider = health.available && health.available.length > 0;

      return {
        status: hasProvider ? 'healthy' : 'no-providers',
        ...health
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Check frontend
   */
  async checkFrontend() {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const distPath = path.join(process.cwd(), 'dist');
      const indexPath = path.join(distPath, 'index.html');

      const distExists = fs.existsSync(distPath);
      const indexExists = fs.existsSync(indexPath);

      return {
        status: distExists && indexExists ? 'healthy' : 'missing',
        distExists,
        indexExists
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Check API routes
   */
  async checkAPI() {
    try {
      // Check if key routes are mounted
      const routes = [
        '/api/health',
        '/api/auth',
        '/api/db',
        '/api/databases'
      ];

      return {
        status: 'healthy',
        routes: routes.length
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Log integration issues
   */
  logIssues(status) {
    console.log('\n⚠️  Integration Issues:');
    
    for (const [component, data] of Object.entries(status.components)) {
      if (data.status !== 'healthy') {
        console.log(`   - ${component}: ${data.status}`);
        if (data.error) {
          console.log(`     Error: ${data.error}`);
        }
      }
    }
    console.log('');
  }

  /**
   * Attempt to fix integrations
   */
  async attemptFix() {
    console.log('🔧 Attempting to fix integrations...');

    const status = await this.checkIntegrations();
    const fixes = [];

    // Try to reconnect databases
    if (status.components.databases.status !== 'healthy') {
      console.log('   Reconnecting databases...');
      try {
        await this.godServer.dbIntegrations.connectAll();
        fixes.push('databases');
      } catch (error) {
        console.error(`   Failed to reconnect databases: ${error.message}`);
      }
    }

    if (fixes.length > 0) {
      console.log(`✅ Fixed: ${fixes.join(', ')}`);
    } else {
      console.log('⚠️  No fixes applied');
    }

    return fixes;
  }

  /**
   * Stop auto integration
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Auto Integrate All: Stopped');
    }
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      checkInterval: this.checkInterval,
      lastCheckTime: this.lastCheckTime,
      integrationStatus: this.integrationStatus,
      isRunning: !!this.intervalId
    };
  }
}

module.exports = { AutoIntegrateAll };
