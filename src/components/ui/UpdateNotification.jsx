import React, { useState, useEffect } from 'react';
import { Download, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import autoUpdateService from '../../services/autoUpdateService';

const UpdateNotification = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = autoUpdateService.onUpdate((event) => {
      switch (event.type) {
        case 'update-available':
          setUpdateInfo(event.data);
          setIsVisible(true);
          setError(null);
          break;
          
        case 'update-started':
          setIsUpdating(true);
          setUpdateStatus('Downloading update...');
          break;
          
        case 'update-completed':
          setIsUpdating(false);
          setUpdateStatus('Update completed successfully!');
          setTimeout(() => {
            setIsVisible(false);
            setUpdateStatus('');
          }, 3000);
          break;
          
        case 'update-failed':
          setIsUpdating(false);
          setError(event.data.error);
          setUpdateStatus('');
          break;
          
        case 'rollback-completed':
          setUpdateStatus('Rolled back to previous version');
          setTimeout(() => {
            setIsVisible(false);
            setUpdateStatus('');
          }, 3000);
          break;
          
        case 'error':
          setError(event.data.message);
          break;
      }
    });

    return unsubscribe;
  }, []);

  const handleInstallUpdate = async () => {
    if (!updateInfo || isUpdating) return;
    
    try {
      await autoUpdateService.performUpdate(updateInfo);
    } catch (error) {
      console.error('Failed to install update:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setError(null);
  };

  const handlePostpone = () => {
    setIsVisible(false);
    // Show again in 1 hour
    setTimeout(() => {
      setIsVisible(true);
    }, 60 * 60 * 1000);
  };

  if (!isVisible && !updateStatus && !error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Update Available Notification */}
      {isVisible && updateInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <Download className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Update Available
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Version {updateInfo.version} is ready to install
                </p>
                {updateInfo.releaseNotes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {updateInfo.releaseNotes}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstallUpdate}
              disabled={isUpdating}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  Installing...
                </div>
              ) : (
                'Install Now'
              )}
            </button>
            <button
              onClick={handlePostpone}
              disabled={isUpdating}
              className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Update Status */}
      {updateStatus && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-2">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-800 dark:text-green-200">
              {updateStatus}
            </p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  Update Check Failed
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  Please check your internet connection and try again.
                </p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300 ml-2"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setError(null);
              autoUpdateService.checkForUpdates();
            }}
            className="mt-3 w-full bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            Retry Update Check
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateNotification;