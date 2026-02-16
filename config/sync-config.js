// Real-Time Sync Configuration
// Database sync settings for continuous operation

module.exports = {
  // Backend Database Sync Settings
  backend: {
    enabled: true,
    interval: 1000, // 1 second - REAL-TIME
    autoTurnOff: false, // NEVER auto turn off
    syncTables: ['users', 'healthRecords', 'goals', 'weightRecords', 'exerciseRecords', 'nutritionRecords'],
    
    // Logging settings
    logging: {
      verbose: false, // Reduce console spam
      logEveryNthSync: 10, // Log every 10th sync (every 10 seconds)
      logErrors: true // Always log errors
    },
    
    // Performance settings
    performance: {
      batchSize: 100, // Records per sync
      maxConcurrentSyncs: 3, // Max parallel table syncs
      retryOnError: true,
      retryAttempts: 3,
      retryDelay: 1000 // 1 second
    },
    
    // Health check
    healthCheck: {
      enabled: true,
      interval: 30000, // Check every 30 seconds
      autoRestart: true // Auto restart if sync stops
    }
  },
  
  // Frontend Sync Settings
  frontend: {
    enabled: true,
    interval: 1000, // 1 second - REAL-TIME
    autoSync: true,
    neverStop: true, // NEVER stop syncing
    
    // What to sync
    syncOptions: {
      includeProfile: true,
      includeHealthRecords: true,
      includeWeightData: true,
      includeDashboard: true,
      includeGoals: true,
      includeExercise: true,
      includeNutrition: true
    },
    
    // Caching
    cache: {
      enabled: true,
      ttl: 5000, // 5 seconds cache
      useOfflineCache: true
    },
    
    // Error handling
    errorHandling: {
      retryOnError: true,
      maxRetries: 3,
      retryDelay: 1000,
      fallbackToCache: true
    }
  },
  
  // Monitoring
  monitoring: {
    enabled: true,
    trackSyncCount: true,
    trackSyncDuration: true,
    trackErrors: true,
    alertOnFailure: true,
    
    // Performance thresholds
    thresholds: {
      maxSyncDuration: 500, // ms - warn if sync takes longer
      maxErrorRate: 0.1, // 10% - alert if error rate exceeds
      minSuccessRate: 0.9 // 90% - alert if success rate drops below
    }
  },
  
  // Continuous operation
  continuousOperation: {
    enabled: true,
    preventAutoStop: true,
    restartOnError: true,
    keepAlive: true,
    
    // Watchdog
    watchdog: {
      enabled: true,
      checkInterval: 5000, // Check every 5 seconds
      autoRestart: true,
      maxRestarts: 10,
      restartDelay: 2000
    }
  }
};
