import React, { useState, useEffect } from 'react';
import { Settings, Download, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import autoUpdateService from '../../services/autoUpdateService';

const UpdateSettings = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState(autoUpdateService.settings);
  const [versionInfo, setVersionInfo] = useState(autoUpdateService.getVersionInfo());
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(autoUpdateService.settings);
      setVersionInfo(autoUpdateService.getVersionInfo());
    }
  }, [isOpen]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    autoUpdateService.saveSettings(newSettings);
  };

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      const result = await autoUpdateService.forceUpdateCheck();
      setLastCheckResult(result);
    } catch (error) {
      setLastCheckResult({ error: error.message });
    } finally {
      setIsChecking(false);
    }
  };

  const handleChannelChange = (channel) => {
    handleSettingChange('updateChannel', channel);
    autoUpdateService.setUpdateChannel(channel);
  };

  const handleAutoUpdateToggle = (enabled) => {
    handleSettingChange('autoUpdateEnabled', enabled);
    autoUpdateService.setAutoUpdateEnabled(enabled);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Version Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Current Version
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <div>Version: {versionInfo.current}</div>
              <div>Channel: {versionInfo.channel}</div>
              {versionInfo.lastCheck && (
                <div>Last Check: {new Date(versionInfo.lastCheck).toLocaleString()}</div>
              )}
            </div>
          </div>

          {/* Auto Update Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Automatic Updates
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatically check and install updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoUpdateEnabled}
                onChange={(e) => handleAutoUpdateToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Update Channel */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Update Channel
            </label>
            <div className="space-y-2">
              {[
                { value: 'stable', label: 'Stable', desc: 'Recommended for production use' },
                { value: 'beta', label: 'Beta', desc: 'Early access to new features' },
                { value: 'dev', label: 'Development', desc: 'Latest changes (may be unstable)' }
              ].map((channel) => (
                <label key={channel.value} className="flex items-center">
                  <input
                    type="radio"
                    name="updateChannel"
                    value={channel.value}
                    checked={settings.updateChannel === channel.value}
                    onChange={() => handleChannelChange(channel.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {channel.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {channel.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Notify Before Update
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Show notification before installing updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyBeforeUpdate}
                onChange={(e) => handleSettingChange('notifyBeforeUpdate', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Auto Restart */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900 dark:text-white">
                Auto Restart
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatically restart app after updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoRestart}
                onChange={(e) => handleSettingChange('autoRestart', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Check Interval */}
          <div>
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Check Interval (minutes)
            </label>
            <select
              value={settings.checkInterval}
              onChange={(e) => handleSettingChange('checkInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={180}>3 hours</option>
              <option value={360}>6 hours</option>
              <option value={720}>12 hours</option>
              <option value={1440}>24 hours</option>
            </select>
          </div>

          {/* Manual Check */}
          <div>
            <button
              onClick={handleCheckForUpdates}
              disabled={isChecking}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Checking for Updates...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Check for Updates Now
                </>
              )}
            </button>
          </div>

          {/* Last Check Result */}
          {lastCheckResult && (
            <div className={`p-3 rounded-lg ${
              lastCheckResult.error 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : lastCheckResult.hasUpdate
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-center">
                {lastCheckResult.error ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                ) : (
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                )}
                <p className={`text-sm ${
                  lastCheckResult.error 
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {lastCheckResult.error 
                    ? `Error: ${lastCheckResult.error}`
                    : lastCheckResult.hasUpdate
                    ? `Update available: ${lastCheckResult.version}`
                    : 'You are running the latest version'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSettings;