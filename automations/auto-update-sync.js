// Auto Update Sync - Automatic Frontend/Backend Update Synchronization
// Monitors for changes and syncs updates automatically

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar');

class AutoUpdateSync {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.interval = options.interval || 30000; // 30 seconds
    this.watchPaths = options.watchPaths || ['src', 'public', 'AAP'];
    this.buildCommand = options.buildCommand || 'npm run build';
    this.isBuilding = false;
    this.lastBuildTime = null;
    this.watcher = null;
  }

  /**
   * Start auto update sync
   */
  start() {
    if (!this.enabled) {
      console.log('⚠️  Auto Update Sync: Disabled');
      return;
    }

    console.log('🔄 Auto Update Sync: Starting...');
    console.log(`   Watching: ${this.watchPaths.join(', ')}`);
    console.log(`   Interval: ${this.interval / 1000}s`);

    // Watch for file changes
    this.watcher = chokidar.watch(this.watchPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    this.watcher
      .on('change', (path) => this.handleChange(path))
      .on('add', (path) => this.handleChange(path))
      .on('unlink', (path) => this.handleChange(path));

    console.log('✅ Auto Update Sync: Started');
  }

  /**
   * Handle file change
   */
  async handleChange(filePath) {
    console.log(`📝 File changed: ${filePath}`);

    // Debounce builds
    if (this.isBuilding) {
      console.log('⏳ Build in progress, skipping...');
      return;
    }

    // Check if enough time has passed since last build
    if (this.lastBuildTime && Date.now() - this.lastBuildTime < this.interval) {
      console.log('⏳ Too soon since last build, skipping...');
      return;
    }

    await this.triggerBuild();
  }

  /**
   * Trigger build
   */
  async triggerBuild() {
    this.isBuilding = true;
    console.log('🔨 Building frontend...');

    return new Promise((resolve, reject) => {
      exec(this.buildCommand, (error, stdout, stderr) => {
        this.isBuilding = false;
        this.lastBuildTime = Date.now();

        if (error) {
          console.error('❌ Build failed:', error.message);
          reject(error);
          return;
        }

        console.log('✅ Build completed successfully');
        if (stdout) console.log(stdout);
        resolve();
      });
    });
  }

  /**
   * Stop auto update sync
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
      console.log('🛑 Auto Update Sync: Stopped');
    }
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      isBuilding: this.isBuilding,
      lastBuildTime: this.lastBuildTime,
      watchPaths: this.watchPaths,
      interval: this.interval
    };
  }
}

module.exports = { AutoUpdateSync };
