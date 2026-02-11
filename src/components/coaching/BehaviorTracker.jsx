import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Activity, Moon, Droplets, Brain, Heart, Zap } from 'lucide-react';

const BehaviorTracker = ({ onLogBehavior, onClose }) => {
  const [behaviorData, setBehaviorData] = useState({
    behaviorType: 'EXERCISE',
    duration: '',
    intensity: 'MODERATE',
    quality: 5,
    notes: '',
    mood: 5,
    energyLevel: 5,
    stressLevel: 5
  });

  const [loading, setLoading] = useState(false);

  const behaviorTypes = [
    { value: 'EXERCISE', label: 'Exercise', icon: Activity, color: 'blue' },
    { value: 'SLEEP', label: 'Sleep', icon: Moon, color: 'purple' },
    { value: 'HYDRATION', label: 'Hydration', icon: Droplets, color: 'cyan' },
    { value: 'MEDITATION', label: 'Meditation', icon: Brain, color: 'indigo' },
    { value: 'MOOD', label: 'Mood Check', icon: Heart, color: 'pink' },
    { value: 'ENERGY', label: 'Energy', icon: Zap, color: 'yellow' }
  ];

  const intensityLevels = [
    { value: 'LOW', label: 'Low', color: 'green' },
    { value: 'MODERATE', label: 'Moderate', color: 'yellow' },
    { value: 'HIGH', label: 'High', color: 'red' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        ...behaviorData,
        duration: parseInt(behaviorData.duration) || 0,
        quality: parseInt(behaviorData.quality),
        mood: parseInt(behaviorData.mood),
        energyLevel: parseInt(behaviorData.energyLevel),
        stressLevel: parseInt(behaviorData.stressLevel)
      };

      await onLogBehavior(record);
      
      // Reset form
      setBehaviorData({
        behaviorType: 'EXERCISE',
        duration: '',
        intensity: 'MODERATE',
        quality: 5,
        notes: '',
        mood: 5,
        energyLevel: 5,
        stressLevel: 5
      });
    } catch (error) {
      console.error('Failed to log behavior:', error);
      alert('Failed to log behavior. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBehavior = behaviorTypes.find(b => b.value === behaviorData.behaviorType);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedBehavior && <selectedBehavior.icon className={`w-6 h-6 text-${selectedBehavior.color}-600`} />}
            <h2 className="text-xl font-bold text-gray-900">Track Behavior</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Behavior Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Behavior Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {behaviorTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setBehaviorData({ ...behaviorData, behaviorType: type.value })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      behaviorData.behaviorType === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 text-${type.color}-600`} />
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration (for applicable behaviors) */}
          {['EXERCISE', 'SLEEP', 'MEDITATION'].includes(behaviorData.behaviorType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={behaviorData.duration}
                onChange={(e) => setBehaviorData({ ...behaviorData, duration: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Intensity (for exercise) */}
          {behaviorData.behaviorType === 'EXERCISE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensity Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {intensityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setBehaviorData({ ...behaviorData, intensity: level.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      behaviorData.intensity === level.value
                        ? `border-${level.color}-500 bg-${level.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{level.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quality Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Rating: {behaviorData.quality}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={behaviorData.quality}
              onChange={(e) => setBehaviorData({ ...behaviorData, quality: e.target.value })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Mood, Energy, Stress Levels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood: {behaviorData.mood}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={behaviorData.mood}
                onChange={(e) => setBehaviorData({ ...behaviorData, mood: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy: {behaviorData.energyLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={behaviorData.energyLevel}
                onChange={(e) => setBehaviorData({ ...behaviorData, energyLevel: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stress: {behaviorData.stressLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={behaviorData.stressLevel}
                onChange={(e) => setBehaviorData({ ...behaviorData, stressLevel: e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={behaviorData.notes}
              onChange={(e) => setBehaviorData({ ...behaviorData, notes: e.target.value })}
              placeholder="How did you feel? Any observations..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Log Behavior</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BehaviorTracker;
