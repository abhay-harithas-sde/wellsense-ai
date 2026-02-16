import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';
import storageService from '../services/storage';
import { useAuth } from '../contexts/AuthContext';

/**
 * Comprehensive hook for real-time health data synchronization
 * Syncs all health metrics with the database automatically
 */
const useHealthDataSync = (options = {}) => {
  const {
    syncInterval = 1000, // Sync every 1 second - REAL-TIME
    autoSync = true,
    includeProfile = true,
    includeHealthRecords = true,
    includeWeightData = true,
    includeDashboard = true
  } = options;

  const { user, updateProfile } = useAuth();
  
  const [healthData, setHealthData] = useState({
    profile: null,
    latestVitals: null,
    latestWeight: null,
    dashboardData: null,
    weeklyStats: null
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [error, setError] = useState(null);
  
  const syncIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const pendingUpdatesRef = useRef([]);

  // Sync user profile data
  const syncProfile = useCallback(async () => {
    if (!includeProfile || !user) return null;
    
    try {
      // Try to get from storage first (faster)
      const cachedProfile = storageService.getUserData(user.id);
      
      // Fetch from API
      const response = await apiService.getCurrentUser();
      if (response.success) {
        const profileData = response.data.user;
        
        // Save to storage for offline access
        storageService.saveUserData(user.id, profileData, false);
        
        return {
          profile: profileData
        };
      }
      
      // Fallback to cached data if API fails
      if (cachedProfile) {
        console.log('📦 Using cached profile data');
        return { profile: cachedProfile };
      }
    } catch (err) {
      console.error('Profile sync error:', err);
      
      // Try to use cached data on error
      const cachedProfile = storageService.getUserData(user.id);
      if (cachedProfile) {
        console.log('📦 Using cached profile data (error fallback)');
        return { profile: cachedProfile };
      }
    }
    return null;
  }, [includeProfile, user]);

  // Sync health records (vitals)
  const syncHealthRecords = useCallback(async () => {
    if (!includeHealthRecords) return null;
    
    try {
      const response = await apiService.getHealthRecords({ 
        limit: 1, 
        sortBy: 'recordedAt',
        sortOrder: 'desc'
      });
      
      if (response.success && response.data.records.length > 0) {
        return {
          latestVitals: response.data.records[0]
        };
      }
    } catch (err) {
      console.error('Health records sync error:', err);
    }
    return null;
  }, [includeHealthRecords]);

  // Sync weight data
  const syncWeightData = useCallback(async () => {
    if (!includeWeightData) return null;
    
    try {
      const response = await apiService.getWeightData();
      if (response.success && response.data.length > 0) {
        return {
          latestWeight: response.data[response.data.length - 1],
          weightHistory: response.data
        };
      }
    } catch (err) {
      console.error('Weight data sync error:', err);
    }
    return null;
  }, [includeWeightData]);

  // Sync dashboard data
  const syncDashboard = useCallback(async () => {
    if (!includeDashboard) return null;
    
    try {
      const response = await apiService.getDashboardData();
      if (response && response.success) {
        return {
          dashboardData: response.data,
          weeklyStats: response.data.weeklyStats || {}
        };
      }
      // Return empty data structure if no data available
      return {
        dashboardData: { recentData: { vitals: [] }, summary: {} },
        weeklyStats: {}
      };
    } catch (err) {
      console.error('Dashboard sync error:', err);
      // Return empty data structure on error
      return {
        dashboardData: { recentData: { vitals: [] }, summary: {} },
        weeklyStats: {}
      };
    }
  }, [includeDashboard]);

  // Main sync function - syncs all enabled data sources
  const syncAll = useCallback(async () => {
    if (isSyncing || !user) return;

    try {
      setIsSyncing(true);
      setSyncStatus('syncing');
      setError(null);

      console.log('🔄 Starting real-time health data sync...');

      // Sync all data sources in parallel
      const [profileData, healthRecordsData, weightData, dashboardData] = await Promise.all([
        syncProfile(),
        syncHealthRecords(),
        syncWeightData(),
        syncDashboard()
      ]);

      // Merge all synced data
      const syncedData = {
        ...healthData,
        ...profileData,
        ...healthRecordsData,
        ...weightData,
        ...dashboardData
      };

      if (isMountedRef.current) {
        setHealthData(syncedData);
        setLastSyncTime(new Date());
        setSyncStatus('success');
        
        // Save synced data to storage for offline access
        if (user?.id) {
          storageService.set(`health_sync_${user.id}`, {
            data: syncedData,
            timestamp: new Date().toISOString()
          });
        }
        
        console.log('✅ Health data sync completed:', {
          profile: !!profileData,
          vitals: !!healthRecordsData,
          weight: !!weightData,
          dashboard: !!dashboardData,
          timestamp: new Date().toISOString()
        });

        // Update auth context with latest profile if available
        if (profileData?.profile && updateProfile) {
          updateProfile(profileData.profile);
        }
      }
    } catch (err) {
      console.error('❌ Health data sync failed:', err);
      
      // Try to load from storage on error
      if (user?.id) {
        const cachedSync = storageService.get(`health_sync_${user.id}`);
        if (cachedSync?.data) {
          console.log('📦 Using cached health data');
          setHealthData(cachedSync.data);
          setLastSyncTime(new Date(cachedSync.timestamp));
        }
      }
      
      if (isMountedRef.current) {
        setError(err.message);
        setSyncStatus('error');
      }
    } finally {
      if (isMountedRef.current) {
        setIsSyncing(false);
      }
    }
  }, [isSyncing, user, healthData, syncProfile, syncHealthRecords, syncWeightData, syncDashboard, updateProfile]);

  // Save health data to database
  const saveHealthData = useCallback(async (dataType, data) => {
    try {
      console.log(`💾 Saving ${dataType} to database...`, data);
      
      let response;
      
      switch (dataType) {
        case 'vitals':
          response = await apiService.createHealthRecord({
            heartRate: data.heartRate,
            bloodPressureSystolic: data.bloodPressure?.systolic,
            bloodPressureDiastolic: data.bloodPressure?.diastolic,
            temperature: data.temperature,
            oxygenSaturation: data.oxygenSaturation,
            bloodSugar: data.bloodSugar,
            bmi: data.bmi,
            sleepHours: data.sleepHours,
            sleepQuality: data.sleepQuality,
            mood: data.mood,
            energyLevel: data.energyLevel,
            symptoms: data.symptoms || [],
            notes: data.notes || 'Health metrics logged',
            source: 'MANUAL'
          });
          break;
          
        case 'weight':
          response = await apiService.addWeightEntry({
            weight: data.weight,
            bodyFatPercentage: data.bodyFatPercentage,
            muscleMass: data.muscleMass,
            notes: data.notes || 'Weight logged',
            source: 'MANUAL'
          });
          break;
          
        case 'profile':
          response = await apiService.updateProfile(data);
          break;
          
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      if (response.success) {
        console.log(`✅ ${dataType} saved successfully`);
        
        // Trigger immediate sync to reflect changes
        await syncAll();
        
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Save failed');
      }
    } catch (err) {
      console.error(`❌ Failed to save ${dataType}:`, err);
      return { success: false, error: err.message };
    }
  }, [syncAll]);

  // Queue update for batch processing
  const queueUpdate = useCallback((dataType, data) => {
    pendingUpdatesRef.current.push({ dataType, data, timestamp: Date.now() });
    console.log(`📝 Queued ${dataType} update for batch sync`);
  }, []);

  // Process pending updates
  const processPendingUpdates = useCallback(async () => {
    if (pendingUpdatesRef.current.length === 0) return;

    const updates = [...pendingUpdatesRef.current];
    pendingUpdatesRef.current = [];

    console.log(`🔄 Processing ${updates.length} pending updates...`);

    for (const update of updates) {
      await saveHealthData(update.dataType, update.data);
    }
  }, [saveHealthData]);

  // Setup auto-sync with optimized initial load
  useEffect(() => {
    if (!autoSync || !user) return;

    // Load cached data immediately for instant UI
    if (user?.id) {
      const cachedSync = storageService.get(`health_sync_${user.id}`);
      if (cachedSync?.data) {
        console.log('⚡ Loading cached data for instant display');
        setHealthData(cachedSync.data);
        setLastSyncTime(new Date(cachedSync.timestamp));
        setSyncStatus('success');
      }
    }

    // Then sync fresh data in background
    setTimeout(() => syncAll(), 100);

    // Setup interval for auto-sync
    syncIntervalRef.current = setInterval(() => {
      syncAll();
      processPendingUpdates();
    }, syncInterval);

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSync, user, syncInterval, syncAll, processPendingUpdates]);

  // Sync on visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('👁️ Tab visible, triggering sync...');
        syncAll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, syncAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      // Process any remaining updates before unmounting
      if (pendingUpdatesRef.current.length > 0) {
        processPendingUpdates();
      }
    };
  }, [processPendingUpdates]);

  return {
    // Data
    healthData,
    profile: healthData.profile,
    latestVitals: healthData.latestVitals,
    latestWeight: healthData.latestWeight,
    dashboardData: healthData.dashboardData,
    weeklyStats: healthData.weeklyStats,
    
    // Status
    isSyncing,
    lastSyncTime,
    syncStatus,
    error,
    
    // Actions
    syncNow: syncAll,
    saveHealthData,
    queueUpdate,
    
    // Manual setters for optimistic updates
    setHealthData
  };
};

export default useHealthDataSync;
