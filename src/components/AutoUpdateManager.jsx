import { useEffect, useState } from 'react';
import autoUpdateService from '../services/autoUpdateService';

/**
 * Auto Update Manager Component
 * Automatically starts with the app and manages updates in the background
 */
const AutoUpdateManager = () => {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    console.log('🔄 Auto Update Manager started');

    // Subscribe to update events
    const unsubscribe = autoUpdateService.onUpdate((event) => {
      console.log('Update event:', event.type, event.data);
      
      switch (event.type) {
        case 'update-available':
          setUpdateStatus({
            type: 'available',
            version: event.data.version,
            releaseNotes: event.data.releaseNotes
          });
          setShowNotification(true);
          break;
          
        case 'update-started':
          setUpdateStatus({
            type: 'installing',
            version: event.data.version
          });
          break;
          
        case 'update-completed':
          setUpdateStatus({
            type: 'completed',
            version: event.data.version
          });
          setShowNotification(true);
          break;
          
        case 'update-failed':
          setUpdateStatus({
            type: 'failed',
            error: event.data.error
          });
          setShowNotification(true);
          break;
          
        case 'rollback-completed':
          setUpdateStatus({
            type: 'rollback',
            version: event.data.version
          });
          break;
          
        default:
          break;
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      console.log('🔄 Auto Update Manager stopped');
    };
  }, []);

  const handleInstallUpdate = () => {
    if (updateStatus?.type === 'available') {
      autoUpdateService.performUpdate(updateStatus);
      setShowNotification(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!showNotification || !updateStatus) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {updateStatus.type === 'available' && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-2xl p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                Update Available
              </h3>
              <p className="text-sm text-blue-100 mb-2">
                Version {updateStatus.version} is ready to install
              </p>
              {updateStatus.releaseNotes && updateStatus.releaseNotes.length > 0 && (
                <ul className="text-xs text-blue-100 mb-3 space-y-1">
                  {updateStatus.releaseNotes.slice(0, 3).map((note, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span>•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleInstallUpdate}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Install Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {updateStatus.type === 'installing' && (
        <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                Installing Update
              </h3>
              <p className="text-sm text-gray-600">
                Version {updateStatus.version}
              </p>
            </div>
          </div>
        </div>
      )}

      {updateStatus.type === 'completed' && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                Update Installed
              </h3>
              <p className="text-sm text-green-100 mb-3">
                Version {updateStatus.version} is ready. Reload to apply changes.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReload}
                  className="px-4 py-2 bg-white text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  Reload Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white hover:text-green-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {updateStatus.type === 'failed' && (
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                Update Failed
              </h3>
              <p className="text-sm text-red-100 mb-3">
                {updateStatus.error || 'An error occurred during the update'}
              </p>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Dismiss
              </button>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white hover:text-red-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoUpdateManager;
