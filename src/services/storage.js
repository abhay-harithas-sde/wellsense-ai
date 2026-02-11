// Comprehensive Storage Service
// Manages data persistence across localStorage, sessionStorage, and database

import apiService from './api';

class StorageService {
  constructor() {
    this.prefix = 'wellsense_';
    this.syncQueue = [];
    this.isSyncing = false;
  }

  // ==================== LOCAL STORAGE ====================
  
  setLocal(key, value) {
    try {
      const fullKey = `${this.prefix}${key}`;
      localStorage.setItem(fullKey, JSON.stringify({
        value,
        timestamp: new Date().toISOString()
      }));
      console.log(`💾 Saved to localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error('localStorage error:', error);
      return false;
    }
  }

  getLocal(key) {
    try {
      const fullKey = `${this.prefix}${key}`;
      const item = localStorage.getItem(fullKey);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      return parsed.value;
    } catch (error) {
      console.error('localStorage read error:', error);
      return null;
    }
  }

  removeLocal(key) {
    try {
      const fullKey = `${this.prefix}${key}`;
      localStorage.removeItem(fullKey);
      console.log(`🗑️ Removed from localStorage: ${key}`);
      return true;
    } catch (error) {
      console.error('localStorage remove error:', error);
      return false;
    }
  }

  // ==================== SESSION STORAGE ====================
  
  setSession(key, value) {
    try {
      const fullKey = `${this.prefix}${key}`;
      sessionStorage.setItem(fullKey, JSON.stringify({
        value,
        timestamp: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('sessionStorage error:', error);
      return false;
    }
  }

  getSession(key) {
    try {
      const fullKey = `${this.prefix}${key}`;
      const item = sessionStorage.getItem(fullKey);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      return parsed.value;
    } catch (error) {
      console.error('sessionStorage read error:', error);
      return null;
    }
  }

  removeSession(key) {
    try {
      const fullKey = `${this.prefix}${key}`;
      sessionStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('sessionStorage remove error:', error);
      return false;
    }
  }

  // ==================== COMBINED STORAGE ====================
  
  // Store in both local and session storage
  set(key, value, options = {}) {
    const { localOnly = false, sessionOnly = false } = options;
    
    if (!sessionOnly) {
      this.setLocal(key, value);
    }
    
    if (!localOnly) {
      this.setSession(key, value);
    }
    
    return true;
  }

  // Get from session first (faster), fallback to local
  get(key) {
    const sessionValue = this.getSession(key);
    if (sessionValue !== null) return sessionValue;
    
    const localValue = this.getLocal(key);
    if (localValue !== null) {
      // Sync to session for faster access
      this.setSession(key, localValue);
      return localValue;
    }
    
    return null;
  }

  // Remove from both storages
  remove(key) {
    this.removeLocal(key);
    this.removeSession(key);
    return true;
  }

  // ==================== USER DATA MANAGEMENT ====================
  
  // Save user data with database sync
  async saveUserData(userId, data, syncToDb = true) {
    try {
      // Save to local storage
      this.set(`user_${userId}`, data);
      
      // Queue for database sync if needed
      if (syncToDb) {
        await this.syncToDatabase(userId, data);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  // Get user data
  getUserData(userId) {
    return this.get(`user_${userId}`);
  }

  // ==================== HEALTH DATA MANAGEMENT ====================
  
  // Save health profile completion status
  setHealthProfileComplete(userId, isComplete = true) {
    const key = `health_setup_${userId}`;
    this.set(key, isComplete);
    
    if (isComplete) {
      this.set(`${key}_completed_at`, new Date().toISOString());
    }
    
    console.log(`✅ Health profile completion status saved: ${isComplete}`);
    return true;
  }

  // Check if health profile is complete
  isHealthProfileComplete(userId) {
    const key = `health_setup_${userId}`;
    return this.get(key) === true;
  }

  // Save health data with database sync
  async saveHealthData(userId, healthData) {
    try {
      // Save to storage
      this.set(`health_data_${userId}`, healthData);
      
      // Mark profile as complete
      this.setHealthProfileComplete(userId, true);
      
      // Sync to database
      console.log('📤 Syncing health data to database...');
      const response = await apiService.updateProfile({
        weight: healthData.weight,
        height: healthData.height,
        age: healthData.age,
        gender: healthData.gender,
        bmi: healthData.bmi,
        bmiCategory: healthData.bmiCategory
      });
      
      if (response.success) {
        console.log('✅ Health data synced to database');
        
        // Create initial health record
        if (healthData.heartRate || healthData.sleepHours) {
          await apiService.createHealthRecord({
            heartRate: healthData.heartRate,
            sleepHours: healthData.sleepHours,
            bmi: healthData.bmi,
            notes: `Initial health profile setup`,
            mood: 7,
            energyLevel: 7,
            sleepQuality: 7
          });
          console.log('✅ Initial health record created');
        }
        
        return true;
      } else {
        console.error('❌ Failed to sync health data to database');
        return false;
      }
    } catch (error) {
      console.error('Error saving health data:', error);
      return false;
    }
  }

  // Get health data
  getHealthData(userId) {
    return this.get(`health_data_${userId}`);
  }

  // ==================== DATABASE SYNC ====================
  
  async syncToDatabase(userId, data) {
    try {
      console.log('🔄 Syncing to database...');
      
      // Add to sync queue
      this.syncQueue.push({ userId, data, timestamp: Date.now() });
      
      // Process queue if not already syncing
      if (!this.isSyncing) {
        await this.processSyncQueue();
      }
      
      return true;
    } catch (error) {
      console.error('Database sync error:', error);
      return false;
    }
  }

  async processSyncQueue() {
    if (this.syncQueue.length === 0) {
      this.isSyncing = false;
      return;
    }
    
    this.isSyncing = true;
    
    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      
      try {
        await apiService.updateProfile(item.data);
        console.log(`✅ Synced data for user ${item.userId}`);
      } catch (error) {
        console.error(`❌ Failed to sync data for user ${item.userId}:`, error);
        // Re-queue if failed
        this.syncQueue.push(item);
      }
      
      // Small delay between syncs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isSyncing = false;
  }

  // ==================== CLEANUP ====================
  
  // Clear all user data
  clearUserData(userId) {
    const keys = [
      `user_${userId}`,
      `health_setup_${userId}`,
      `health_setup_${userId}_completed_at`,
      `health_data_${userId}`
    ];
    
    keys.forEach(key => this.remove(key));
    console.log(`🗑️ Cleared all data for user ${userId}`);
    return true;
  }

  // Clear all storage
  clearAll() {
    try {
      // Clear localStorage
      const localKeys = Object.keys(localStorage);
      localKeys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      
      console.log('🗑️ Cleared all storage');
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // ==================== UTILITIES ====================
  
  // Get storage size
  getStorageSize() {
    let localSize = 0;
    let sessionSize = 0;
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localSize += localStorage.getItem(key).length;
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionSize += sessionStorage.getItem(key).length;
        }
      });
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    
    return {
      localStorage: `${(localSize / 1024).toFixed(2)} KB`,
      sessionStorage: `${(sessionSize / 1024).toFixed(2)} KB`,
      total: `${((localSize + sessionSize) / 1024).toFixed(2)} KB`
    };
  }

  // List all stored keys
  listKeys() {
    const keys = {
      localStorage: [],
      sessionStorage: []
    };
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          keys.localStorage.push(key.replace(this.prefix, ''));
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          keys.sessionStorage.push(key.replace(this.prefix, ''));
        }
      });
    } catch (error) {
      console.error('Error listing keys:', error);
    }
    
    return keys;
  }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;
