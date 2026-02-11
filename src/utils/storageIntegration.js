// Storage Integration Utilities
// Ensures all data flows properly between localStorage, sessionStorage, and database

import storageService from '../services/storage';
import apiService from '../services/api';

/**
 * Comprehensive storage integration manager
 */
class StorageIntegration {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.listeners = new Map();
  }

  /**
   * Initialize storage integration for a user
   */
  async initialize(userId) {
    console.log('🔧 Initializing storage integration for user:', userId);
    
    try {
      // Load user data from database
      const response = await apiService.getCurrentUser();
      
      if (response.success) {
        const userData = response.data.user;
        
        // Save to storage
        storageService.saveUserData(userId, userData, false);
        
        // Check and sync health data
        if (userData.weight && userData.height && userData.bmi) {
          storageService.setHealthProfileComplete(userId, true);
          storageService.set(`health_data_${userId}`, {
            weight: userData.weight,
            height: userData.height,
            bmi: userData.bmi,
            bmiCategory: userData.bmiCategory,
            age: userData.age
          });
        }
        
        console.log('✅ Storage integration initialized');
        return true;
      }
    } catch (error) {
      console.error('❌ Storage integration initialization failed:', error);
      return false;
    }
  }

  /**
   * Sync all user data to database
   */
  async syncToDatabase(userId) {
    try {
      console.log('🔄 Syncing all data to database...');
      
      // Get all user data from storage
      const userData = storageService.getUserData(userId);
      const healthData = storageService.getHealthData(userId);
      
      if (userData) {
        await apiService.updateProfile(userData);
        console.log('✅ User profile synced to database');
      }
      
      if (healthData) {
        await apiService.updateProfile({
          weight: healthData.weight,
          height: healthData.height,
          age: healthData.age,
          bmi: healthData.bmi,
          bmiCategory: healthData.bmiCategory
        });
        console.log('✅ Health data synced to database');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Database sync failed:', error);
      return false;
    }
  }

  /**
   * Verify storage integrity
   */
  verifyIntegrity(userId) {
    console.log('🔍 Verifying storage integrity...');
    
    const checks = {
      localStorage: false,
      sessionStorage: false,
      consistency: false
    };
    
    try {
      // Check localStorage
      const localData = storageService.getLocal(`user_${userId}`);
      checks.localStorage = localData !== null;
      
      // Check sessionStorage
      const sessionData = storageService.getSession(`user_${userId}`);
      checks.sessionStorage = sessionData !== null;
      
      // Check consistency
      if (localData && sessionData) {
        checks.consistency = JSON.stringify(localData) === JSON.stringify(sessionData);
      }
      
      console.log('📊 Storage integrity check:', checks);
      
      // Auto-fix if inconsistent
      if (checks.localStorage && !checks.sessionStorage) {
        console.log('🔧 Fixing sessionStorage from localStorage');
        storageService.setSession(`user_${userId}`, localData);
        checks.sessionStorage = true;
        checks.consistency = true;
      }
      
      return checks;
    } catch (error) {
      console.error('❌ Storage integrity check failed:', error);
      return checks;
    }
  }

  /**
   * Get storage statistics
   */
  getStats() {
    const size = storageService.getStorageSize();
    const keys = storageService.listKeys();
    
    return {
      size,
      keys,
      totalKeys: keys.localStorage.length + keys.sessionStorage.length
    };
  }

  /**
   * Export all user data
   */
  exportUserData(userId) {
    try {
      const userData = storageService.getUserData(userId);
      const healthData = storageService.getHealthData(userId);
      const healthSetup = storageService.isHealthProfileComplete(userId);
      
      return {
        user: userData,
        health: healthData,
        healthSetupComplete: healthSetup,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Export failed:', error);
      return null;
    }
  }

  /**
   * Import user data
   */
  async importUserData(userId, data) {
    try {
      console.log('📥 Importing user data...');
      
      if (data.user) {
        await storageService.saveUserData(userId, data.user, true);
      }
      
      if (data.health) {
        await storageService.saveHealthData(userId, data.health);
      }
      
      if (data.healthSetupComplete) {
        storageService.setHealthProfileComplete(userId, true);
      }
      
      console.log('✅ Import completed');
      return true;
    } catch (error) {
      console.error('❌ Import failed:', error);
      return false;
    }
  }

  /**
   * Clear all data for a user
   */
  clearUserData(userId) {
    try {
      storageService.clearUserData(userId);
      console.log('✅ User data cleared');
      return true;
    } catch (error) {
      console.error('❌ Clear failed:', error);
      return false;
    }
  }

  /**
   * Add storage event listener
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove storage event listener
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit storage event
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }
}

// Create singleton instance
const storageIntegration = new StorageIntegration();

// Export utilities
export default storageIntegration;

export const initializeStorage = (userId) => storageIntegration.initialize(userId);
export const syncToDatabase = (userId) => storageIntegration.syncToDatabase(userId);
export const verifyStorageIntegrity = (userId) => storageIntegration.verifyIntegrity(userId);
export const getStorageStats = () => storageIntegration.getStats();
export const exportUserData = (userId) => storageIntegration.exportUserData(userId);
export const importUserData = (userId, data) => storageIntegration.importUserData(userId, data);
export const clearUserData = (userId) => storageIntegration.clearUserData(userId);
