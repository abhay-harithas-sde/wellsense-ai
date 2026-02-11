// Auto Cleanup - Automatic Cleanup of Unwanted Files
// Removes temporary files, old logs, and unused assets

const fs = require('fs');
const path = require('path');

class AutoCleanup {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.interval = options.interval || 30000; // 30 seconds
    this.cleanupPaths = options.cleanupPaths || [
      'logs',
      'temp',
      'uploads/temp',
      '.cache'
    ];
    this.filePatterns = options.filePatterns || [
      /\.log$/,
      /\.tmp$/,
      /\.temp$/,
      /~$/,
      /test-.*\.html$/,           // Test HTML files
      /test-.*\.cjs$/,            // Test CJS files
      /test-.*\.js$/,             // Test JS files
      /-test\.js$/,               // Test files ending with -test.js
      /\.test\.js$/,              // Jest/Vitest test files
      /\.spec\.js$/,              // Spec test files
      /test-.*\.bat$/,            // Test batch files
      /.*-report\.html$/,         // Report HTML files
      /.*-report\.json$/,         // Report JSON files
      /.*-report\.xml$/,          // Report XML files
      /coverage-.*\.json$/,       // Coverage reports
      /.*\.report$/               // Generic report files
    ];
    this.maxAge = options.maxAge || 7 * 24 * 60 * 60 * 1000; // 7 days
    this.intervalId = null;
    this.lastCleanupTime = null;
    this.cleanupCount = 0;
  }

  /**
   * Start auto cleanup
   */
  start() {
    if (!this.enabled) {
      console.log('⚠️  Auto Cleanup: Disabled');
      return;
    }

    console.log('🧹 Auto Cleanup: Starting...');
    console.log(`   Interval: ${this.interval / 3600000}h`);
    console.log(`   Max Age: ${this.maxAge / 86400000} days`);

    // Run initial cleanup
    this.performCleanup();

    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.performCleanup();
    }, this.interval);

    console.log('✅ Auto Cleanup: Started');
  }

  /**
   * Perform cleanup
   */
  async performCleanup() {
    console.log('🧹 Starting cleanup...');
    const startTime = Date.now();
    
    const results = {
      filesDeleted: 0,
      bytesFreed: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };

    // Clean temporary files
    await this.cleanTempFiles(results);

    // Clean old logs
    await this.cleanOldLogs(results);

    // Clean cache
    await this.cleanCache(results);

    // Clean old uploads
    await this.cleanOldUploads(results);

    // Clean unwanted test files
    await this.cleanTestFiles(results);

    // Clean unwanted report files
    await this.cleanReportFiles(results);

    // Clean node_modules duplicates (optional)
    if (this.enabled) {
      await this.cleanNodeModulesDuplicates(results);
    }

    const duration = Date.now() - startTime;
    this.lastCleanupTime = new Date();
    this.cleanupCount++;

    console.log(`✅ Cleanup completed in ${duration}ms`);
    console.log(`   Files deleted: ${results.filesDeleted}`);
    console.log(`   Space freed: ${this.formatBytes(results.bytesFreed)}`);
    
    if (results.errors.length > 0) {
      console.log(`   Errors: ${results.errors.length}`);
    }

    return results;
  }

  /**
   * Clean temporary files
   */
  async cleanTempFiles(results) {
    const tempDirs = ['temp', 'tmp', '.temp'];
    
    for (const dir of tempDirs) {
      const dirPath = path.join(process.cwd(), dir);
      
      if (fs.existsSync(dirPath)) {
        await this.cleanDirectory(dirPath, results);
      }
    }
  }

  /**
   * Clean old logs
   */
  async cleanOldLogs(results) {
    const logsDir = path.join(process.cwd(), 'logs');
    
    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir);
      
      for (const file of files) {
        const filePath = path.join(logsDir, file);
        
        try {
          const stats = fs.statSync(filePath);
          const age = Date.now() - stats.mtimeMs;
          
          if (age > this.maxAge) {
            const size = stats.size;
            fs.unlinkSync(filePath);
            results.filesDeleted++;
            results.bytesFreed += size;
            console.log(`   🗑️  Deleted old log: ${file}`);
          }
        } catch (error) {
          results.errors.push({ file, error: error.message });
        }
      }
    }
  }

  /**
   * Clean cache
   */
  async cleanCache(results) {
    const cacheDirs = ['.cache', 'node_modules/.cache'];
    
    for (const dir of cacheDirs) {
      const dirPath = path.join(process.cwd(), dir);
      
      if (fs.existsSync(dirPath)) {
        await this.cleanDirectory(dirPath, results);
      }
    }
  }

  /**
   * Clean old uploads
   */
  async cleanOldUploads(results) {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'temp');
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        
        try {
          const stats = fs.statSync(filePath);
          const age = Date.now() - stats.mtimeMs;
          
          if (age > this.maxAge) {
            const size = stats.size;
            fs.unlinkSync(filePath);
            results.filesDeleted++;
            results.bytesFreed += size;
            console.log(`   🗑️  Deleted old upload: ${file}`);
          }
        } catch (error) {
          results.errors.push({ file, error: error.message });
        }
      }
    }
  }

  /**
   * Clean unwanted test files
   */
  async cleanTestFiles(results) {
    const rootDir = process.cwd();
    const testPatterns = [
      /^test-.*\.html$/,
      /^test-.*\.cjs$/,
      /^test-.*\.js$/,
      /^test-.*\.bat$/,
      /-test\.js$/,
      /\.test\.js$/,
      /\.spec\.js$/
    ];

    try {
      const files = fs.readdirSync(rootDir);
      
      for (const file of files) {
        const shouldDelete = testPatterns.some(pattern => pattern.test(file));
        
        if (shouldDelete) {
          const filePath = path.join(rootDir, file);
          
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              const size = stats.size;
              fs.unlinkSync(filePath);
              results.filesDeleted++;
              results.bytesFreed += size;
              console.log(`   🗑️  Deleted test file: ${file}`);
            }
          } catch (error) {
            results.errors.push({ file, error: error.message });
          }
        }
      }
    } catch (error) {
      results.errors.push({ path: 'root', error: error.message });
    }
  }

  /**
   * Clean unwanted report files
   */
  async cleanReportFiles(results) {
    const rootDir = process.cwd();
    const reportPatterns = [
      /-report\.html$/,
      /-report\.json$/,
      /-report\.xml$/,
      /coverage-.*\.json$/,
      /\.report$/,
      /^report-.*\./,
      /^coverage\./
    ];

    try {
      const files = fs.readdirSync(rootDir);
      
      for (const file of files) {
        const shouldDelete = reportPatterns.some(pattern => pattern.test(file));
        
        if (shouldDelete) {
          const filePath = path.join(rootDir, file);
          
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              const size = stats.size;
              fs.unlinkSync(filePath);
              results.filesDeleted++;
              results.bytesFreed += size;
              console.log(`   🗑️  Deleted report file: ${file}`);
            }
          } catch (error) {
            results.errors.push({ file, error: error.message });
          }
        }
      }
    } catch (error) {
      results.errors.push({ path: 'root', error: error.message });
    }
  }

  /**
   * Clean node_modules duplicates
   */
  async cleanNodeModulesDuplicates(results) {
    // This is a placeholder for more advanced cleanup
    // Could use tools like npm dedupe or yarn dedupe
    console.log('   ℹ️  Node modules cleanup skipped (use npm dedupe manually)');
  }

  /**
   * Clean directory
   */
  async cleanDirectory(dirPath, results) {
    try {
      if (!fs.existsSync(dirPath)) return;
      
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          await this.cleanDirectory(filePath, results);
          
          // Remove empty directory
          if (fs.readdirSync(filePath).length === 0) {
            fs.rmdirSync(filePath);
            console.log(`   🗑️  Removed empty directory: ${file}`);
          }
        } else {
          // Check if file matches cleanup patterns
          const shouldDelete = this.filePatterns.some(pattern => 
            pattern.test(file)
          );
          
          if (shouldDelete) {
            const size = stats.size;
            fs.unlinkSync(filePath);
            results.filesDeleted++;
            results.bytesFreed += size;
            console.log(`   🗑️  Deleted: ${file}`);
          }
        }
      }
    } catch (error) {
      results.errors.push({ path: dirPath, error: error.message });
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Manual cleanup trigger
   */
  async cleanupNow() {
    console.log('🧹 Manual cleanup triggered...');
    return await this.performCleanup();
  }

  /**
   * Stop auto cleanup
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Auto Cleanup: Stopped');
    }
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      interval: this.interval,
      maxAge: this.maxAge,
      lastCleanupTime: this.lastCleanupTime,
      cleanupCount: this.cleanupCount,
      isRunning: !!this.intervalId
    };
  }
}

module.exports = { AutoCleanup };
