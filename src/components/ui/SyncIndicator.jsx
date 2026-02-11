import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Cloud, CloudOff } from 'lucide-react';

const SyncIndicator = ({ 
  isSyncing, 
  lastSyncTime, 
  syncStatus, 
  error,
  onSyncNow,
  compact = false 
}) => {
  const formatLastSync = (time) => {
    if (!time) return 'Never';
    
    const now = new Date();
    const diff = Math.floor((now - time) / 1000); // seconds
    
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <motion.button
        onClick={onSyncNow}
        disabled={isSyncing}
        className={`p-2 rounded-lg border transition-all duration-300 ${getStatusColor()} ${
          isSyncing ? 'cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
        }`}
        whileHover={!isSyncing ? { scale: 1.05 } : {}}
        whileTap={!isSyncing ? { scale: 0.95 } : {}}
        title={error || `Last synced: ${formatLastSync(lastSyncTime)}`}
      >
        {getStatusIcon()}
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${getStatusColor()} transition-all duration-300`}
      >
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold">
              {syncStatus === 'syncing' && 'Syncing...'}
              {syncStatus === 'success' && 'Synced'}
              {syncStatus === 'error' && 'Sync Failed'}
              {syncStatus === 'idle' && 'Ready'}
            </span>
            
            {lastSyncTime && syncStatus !== 'syncing' && (
              <span className="text-xs opacity-75">
                {formatLastSync(lastSyncTime)}
              </span>
            )}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-red-600 max-w-xs truncate"
            title={error}
          >
            {error}
          </motion.div>
        )}

        {!isSyncing && onSyncNow && (
          <motion.button
            onClick={onSyncNow}
            className="ml-auto p-1 rounded-lg hover:bg-white/50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Sync now"
          >
            <RefreshCw className="w-3 h-3" />
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SyncIndicator;
