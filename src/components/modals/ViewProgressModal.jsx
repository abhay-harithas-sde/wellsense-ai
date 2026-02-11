import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ViewProgressModal = ({ isOpen, onClose }) => {
  const [progressData, setProgressData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('weight');

  useEffect(() => {
    if (isOpen) {
      // Load progress data from localStorage or use demo data
      const demoData = [
        { date: '2024-01-01', weight: 75.2, steps: 8500, heartRate: 72 },
        { date: '2024-01-02', weight: 75.0, steps: 9200, heartRate: 70 },
        { date: '2024-01-03', weight: 74.8, steps: 10100, heartRate: 68 },
        { date: '2024-01-04', weight: 74.6, steps: 9800, heartRate: 69 },
        { date: '2024-01-05', weight: 74.4, steps: 11200, heartRate: 67 },
        { date: '2024-01-06', weight: 74.2, steps: 9500, heartRate: 68 },
        { date: '2024-01-07', weight: 74.0, steps: 10800, heartRate: 66 }
      ];
      setProgressData(demoData);
    }
  }, [isOpen]);

  const metrics = [
    { key: 'weight', label: 'Weight (kg)', color: '#ef4444', target: 72 },
    { key: 'steps', label: 'Daily Steps', color: '#10b981', target: 10000 },
    { key: 'heartRate', label: 'Resting HR', color: '#3b82f6', target: 65 }
  ];

  const currentMetric = metrics.find(m => m.key === selectedMetric);
  const latestValue = progressData[progressData.length - 1]?.[selectedMetric] || 0;
  const previousValue = progressData[progressData.length - 2]?.[selectedMetric] || 0;
  const change = latestValue - previousValue;
  const changePercent = previousValue ? ((change / previousValue) * 100).toFixed(1) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Progress Overview</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Metric Selector */}
            <div className="flex space-x-2 mb-6">
              {metrics.map((metric) => (
                <button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMetric === metric.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>

            {/* Current Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Current</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{latestValue}</p>
                <p className="text-xs text-gray-500">{currentMetric?.label}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Target</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{currentMetric?.target}</p>
                <p className="text-xs text-gray-500">Goal</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Change</span>
                </div>
                <p className={`text-2xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">{changePercent}% vs yesterday</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [value, currentMetric?.label]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke={currentMetric?.color} 
                      strokeWidth={3}
                      dot={{ fill: currentMetric?.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span>Recent Achievements</span>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Step Goal Achieved</p>
                    <p className="text-xs text-gray-500">Reached 10,000+ steps for 3 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">💪</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Consistency Streak</p>
                    <p className="text-xs text-gray-500">7 days of health tracking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewProgressModal;