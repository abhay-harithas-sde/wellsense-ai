/**
 * Auto Update Service for WellSense AI
 * Handles automatic updates, version checking, and rollback functionality
 */

class AutoUpdateService {
  constructor() {
    this.currentVersion = '1.0.0';
    this.updateCheckInterval = 30 * 1000; // 30 seconds
    this.updateEndpoint = '/api/updates/check';
    this.isUpdating = false;
    this.updateCallbacks = [];
    this.settings = this.loadSettings();
    
    // Check for updates immediately on initialization
    this.checkForUpdates();
    
    // Start auto-update checking if enabled
    if (this.settings.autoUpdateEnabled) {
      this.startAutoUpdateCheck();
    }
    
    // Check for updates when page becomes visible
    this.setupVisibilityListener();
    
    // Check for updates on network reconnection
    this.setupOnlineListener();
  }

  /**
   * Load update settings from localStorage
   */
  loadSettings() {
    const defaultSettings = {
      autoUpdateEnabled: true,
      updateChannel: 'stable', // stable, beta, dev
      notifyBeforeUpdate: true,
      autoRestart: true, // Auto-reload when updates detected
      checkInterval: 0.5, // minutes (0.5 = 30 seconds)
      checkOnLoad: true, // Check every time app loads
      checkOnFocus: true // Check when tab becomes visible
    };

    try {
      const saved = localStorage.getItem('wellsense_update_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (error) {
      console.warn('Failed to load update settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Save update settings to localStorage
   */
  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('wellsense_update_settings', JSON.stringify(this.settings));
    
    // Restart update checking with new interval
    if (this.settings.autoUpdateEnabled) {
      this.stopAutoUpdateCheck();
      this.startAutoUpdateCheck();
    }
  }

  /**
   * Start automatic update checking
   */
  startAutoUpdateCheck() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    const interval = this.settings.checkInterval * 60 * 1000;
    this.updateTimer = setInterval(() => {
      this.checkForUpdates();
    }, interval);

    // Check immediately on start
    console.log('🔄 Auto-update enabled: Checking every 30 seconds');
    setTimeout(() => this.checkForUpdates(), 2000); // Check after 2 seconds
  }

  /**
   * Setup visibility change listener to check updates when tab becomes visible
   */
  setupVisibilityListener() {
    if (!this.settings.checkOnFocus) return;
    
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('🔄 Tab became visible, checking for updates...');
        this.checkForUpdates();
      }
    });
  }

  /**
   * Setup online listener to check updates when network reconnects
   */
  setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('🔄 Network reconnected, checking for updates...');
      this.checkForUpdates();
    });
  }

  /**
   * Stop automatic update checking
   */
  stopAutoUpdateCheck() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Check for available updates
   */
  async checkForUpdates() {
    if (this.isUpdating) return null;

    try {
      const lastCheck = localStorage.getItem('wellsense_last_update_check');
      const url = `${this.updateEndpoint}?channel=${this.settings.updateChannel}&current=${this.currentVersion}${lastCheck ? `&lastCheck=${lastCheck}` : ''}`;
      
      console.log('🔄 Checking for updates...');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Update check failed: ${response.status}`);
      }

      const updateInfo = await response.json();
      
      // Store last check timestamp
      localStorage.setItem('wellsense_last_update_check', new Date().toISOString());
      
      if (updateInfo.hasUpdate) {
        console.log('🎉 Update available:', updateInfo.latestVersion);
        this.notifyUpdateAvailable(updateInfo);
        
        // Auto-reload if build timestamp is newer
        if (updateInfo.buildTimestamp && this.settings.autoRestart) {
          console.log('🔄 Auto-reloading to apply updates...');
          setTimeout(() => window.location.reload(true), 2000);
        }
      } else {
        console.log('✅ Update check complete: No updates available');
      }

      return updateInfo;
    } catch (error) {
      console.error('Update check failed:', error);
      this.notifyError('Failed to check for updates', error);
      return null;
    }
  }

  /**
   * Perform the actual update
   */
  async performUpdate(updateInfo) {
    if (this.isUpdating) {
      throw new Error('Update already in progress');
    }

    this.isUpdating = true;
    this.notifyUpdateStarted(updateInfo);

    try {
      // Create backup of current version
      await this.createBackup();

      // Download and apply update
      await this.downloadUpdate(updateInfo);
      await this.applyUpdate(updateInfo);

      // Verify update success
      const verified = await this.verifyUpdate(updateInfo);
      
      if (!verified) {
        throw new Error('Update verification failed');
      }

      // Update current version
      this.currentVersion = updateInfo.version;
      localStorage.setItem('wellsense_current_version', this.currentVersion);

      this.notifyUpdateCompleted(updateInfo);

      // Auto-restart if enabled
      if (this.settings.autoRestart) {
        setTimeout(() => window.location.reload(), 3000);
      }

      return true;
    } catch (error) {
      console.error('Update failed:', error);
      await this.rollbackUpdate();
      this.notifyUpdateFailed(error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Download update files
   */
  async downloadUpdate(updateInfo) {
    const { downloadUrl, files } = updateInfo;
    
    for (const file of files) {
      const response = await fetch(`${downloadUrl}/${file.path}`);
      
      if (!response.ok) {
        throw new Error(`Failed to download ${file.path}`);
      }

      const content = await response.text();
      
      // Store in temporary location
      sessionStorage.setItem(`update_${file.path}`, content);
    }
  }

  /**
   * Apply downloaded updates
   */
  async applyUpdate(updateInfo) {
    const { files } = updateInfo;
    
    // This would typically involve service worker cache updates
    // For now, we'll prepare the files for the next page load
    
    for (const file of files) {
      const content = sessionStorage.getItem(`update_${file.path}`);
      if (content) {
        // In a real implementation, this would update the service worker cache
        console.log(`Prepared update for ${file.path}`);
      }
    }
  }

  /**
   * Verify update was successful
   */
  async verifyUpdate(updateInfo) {
    try {
      // Check if new version files are accessible
      const healthCheck = await fetch('/api/health-check');
      return healthCheck.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create backup of current version
   */
  async createBackup() {
    const backup = {
      version: this.currentVersion,
      timestamp: Date.now(),
      settings: this.settings
    };
    
    localStorage.setItem('wellsense_backup', JSON.stringify(backup));
  }

  /**
   * Rollback to previous version
   */
  async rollbackUpdate() {
    try {
      const backup = localStorage.getItem('wellsense_backup');
      if (backup) {
        const backupData = JSON.parse(backup);
        this.currentVersion = backupData.version;
        localStorage.setItem('wellsense_current_version', this.currentVersion);
        
        // Clear failed update data
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('update_')) {
            sessionStorage.removeItem(key);
          }
        });
        
        this.notifyRollbackCompleted();
      }
    } catch (error) {
      console.error('Rollback failed:', error);
    }
  }

  /**
   * Force check for updates
   */
  async forceUpdateCheck() {
    return this.checkForUpdates();
  }

  /**
   * Get current version info
   */
  getVersionInfo() {
    return {
      current: this.currentVersion,
      channel: this.settings.updateChannel,
      lastCheck: localStorage.getItem('wellsense_last_update_check'),
      isUpdating: this.isUpdating
    };
  }

  /**
   * Subscribe to update events
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify about update availability
   */
  notifyUpdateAvailable(updateInfo) {
    const event = {
      type: 'update-available',
      data: updateInfo
    };
    
    this.updateCallbacks.forEach(callback => callback(event));
    
    // Show console message
    console.log('📦 New build available! Reload to get latest changes.');
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('WellSense AI Update Available', {
        body: `New build available. Reload to apply changes.`,
        icon: '/favicon.ico'
      });
    }
    
    // If auto-restart is enabled, reload after a short delay
    if (this.settings.autoRestart) {
      console.log('🔄 Auto-reloading in 3 seconds...');
      setTimeout(() => {
        console.log('🔄 Reloading to apply updates...');
        window.location.reload(true);
      }, 3000);
    }
  }

  /**
   * Notify update started
   */
  notifyUpdateStarted(updateInfo) {
    const event = {
      type: 'update-started',
      data: updateInfo
    };
    
    this.updateCallbacks.forEach(callback => callback(event));
  }

  /**
   * Notify update completed
   */
  notifyUpdateCompleted(updateInfo) {
    const event = {
      type: 'update-completed',
      data: updateInfo
    };
    
    this.updateCallbacks.forEach(callback => callback(event));
  }

  /**
   * Notify update failed
   */
  notifyUpdateFailed(error) {
    const event = {
      type: 'update-failed',
      data: { error: error.message }
    };
    
    this.updateCallbacks.forEach(callback => callback(event));
  }

  /**
   * Notify rollback completed
   */
  notifyRollbackCompleted() {
    const event = {
      type: 'rollback-completed',
      data: { version: this.currentVersion }
    };
    
    this.updateCallbacks.forEach(callback => callback(event));
  }

  /**
   * Notify error
   */
  notifyError(message, error) {
    const event = {
      type: 'error',
      data: { message, error: error?.message }
    };
    
    this.updateCallbacks.forEach(callback => callback(event));
  }

  /**
   * Enable/disable auto updates
   */
  setAutoUpdateEnabled(enabled) {
    this.saveSettings({ autoUpdateEnabled: enabled });
    
    if (enabled) {
      this.startAutoUpdateCheck();
    } else {
      this.stopAutoUpdateCheck();
    }
  }

  /**
   * Change update channel
   */
  setUpdateChannel(channel) {
    if (['stable', 'beta', 'dev'].includes(channel)) {
      this.saveSettings({ updateChannel: channel });
    }
  }

  /**
   * Cleanup on app shutdown
   */
  destroy() {
    this.stopAutoUpdateCheck();
    this.updateCallbacks = [];
  }
}

// Create singleton instance
const autoUpdateService = new AutoUpdateService();

export default autoUpdateService;