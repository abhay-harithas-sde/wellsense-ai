import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

/**
 * Custom hook for real-time database synchronization
 * Automatically syncs data with the backend at specified intervals
 * and provides manual sync capabilities
 */
const useRealTimeSync = (config = {}) => {
  const {
    syncInterval = 5000, // Default: sync every 5 seconds
    autoSync = true,
    onSyncSuccess = null,
    onSyncError = null,
    syncEndpoint = null
  } = config;

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [data, setData] = useState(null);
  
  const syncIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Manual sync function
  const syncNow = useCallback(async () => {
    if (!syncEndpoint || isSyncing) return;

    try {
      setIsSyncing(true);
      setSyncError(null);

      const response = await syncEndpoint();
      
      if (response.success && isMountedRef.current) {
        setData(response.data);
        setLastSyncTime(new Date());
        
        if (onSyncSuccess) {
          onSyncSuccess(response.data);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      if (isMountedRef.current) {
        setSyncError(error.message);
        
        if (onSyncError) {
          onSyncError(error);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsSyncing(false);
      }
    }
  }, [syncEndpoint, isSyncing, onSyncSuccess, onSyncError]);

  // Setup auto-sync
  useEffect(() => {
    if (!autoSync || !syncEndpoint) return;

    // Initial sync
    syncNow();

    // Setup interval for auto-sync
    syncIntervalRef.current = setInterval(() => {
      syncNow();
    }, syncInterval);

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSync, syncEndpoint, syncInterval, syncNow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    data,
    isSyncing,
    lastSyncTime,
    syncError,
    syncNow,
    setData // Allow manual data updates
  };
};

export default useRealTimeSync;
