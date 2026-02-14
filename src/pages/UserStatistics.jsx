import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Scale,
  Clock,
  Target,
  Award,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Share2,
  Filter
} from 'lucide-react';
import useHealthDataSync from '../hooks/useHealthDataSync';
import SyncIndicator from '../components/ui/SyncIndicator';

const UserStatistics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time health data sync
  const {
    dashboardData,
    weeklyStats,
    profile,
    latestVitals,
    isSyncing,
    lastSyncTime,
    syncStatus,
    error: syncError,
    syncNow
  } = useHealthDataSync({
    syncInterval: 10000, // Sync every 10 seconds
    autoSync: true,
    includeDashboard: true,
    includeProfile: true,
    includeHealthRecords: true
  });

  // Handler functions for export and share
  const handleExport = () => {
    // Export statistics data as CSV or PDF
    alert('Exporting statistics... (Feature coming soon)');
  };

  const handleShare = () => {
    // Share statistics via social media or email
    alert('Sharing statistics... (Feature coming soon)');
  };

  // Mock data - replace with real API calls
  const healthMetricsData = [
    { date: '2024-01-01', weight: 70, heartRate: 72, steps: 8500, sleep: 7.5, calories: 2200 },
    { date: '2024-01-02', weight: 69.8, heartRate: 74, steps: 9200, sleep: 8, calories: 2150 },
    { date: '2024-01-03', weight: 69.5, heartRate: 71, steps: 10500, sleep: 7, calories: 2300 },
    { date: '2024-01-04', weight: 69.3, heartRate: 73, steps: 8800, sleep: 7.5, calories: 2100 },
    { date: '2024-01-05', weight: 69.1, heartRate: 70, steps: 11200, sleep: 8.5, calories: 2250 },
    { date: '2024-01-06', weight: 68.9, heartRate: 72, steps: 9800, sleep: 7, calories: 2180 },
    { date: '2024-01-07', weight: 68.7, heartRate: 71, steps: 10200, sleep: 8, calories: 2200 }
  ];

  const activityBreakdown = [
    { name: 'Walking', value: 45, color: '#3B82F6' },
    { name: 'Running', value: 25, color: '#10B981' },
    { name: 'Cycling', value: 15, color: '#F59E0B' },
    { name: 'Swimming', value: 10, color: '#8B5CF6' },
    { name: 'Other', value: 5, color: '#EF4444' }
  ];

  const weeklyProgress = [
    { week: 'Week 1', completed: 85, target: 100 },
    { week: 'Week 2', completed: 92, target: 100 },
    { week: 'Week 3', completed: 78, target: 100 },
    { week: 'Week 4', completed: 95, target: 100 }
  ];

  const monthlyComparison = [
    { month: 'Jan', weight: 70, steps: 9200, sleep: 7.5 },
    { month: 'Feb', weight: 68.5, steps: 9800, sleep: 7.8 },
    { month: 'Mar', weight: 67.2, steps: 10200, sleep: 8.1 },
    { month: 'Apr', weight: 66.8, steps: 10500, sleep: 8.0 },
    { month: 'May', weight: 66.5, steps: 11000, sleep: 8.2 },
    { month: 'Jun', weight: 66.0, steps: 11200, sleep: 8.3 }
  ];

  const achievementData = [
    { category: 'Weight Loss', progress: 75, target: 100, color: '#10B981' },
    { category: 'Fitness', progress: 88, target: 100, color: '#3B82F6' },
    { category: 'Nutrition', progress: 65, target: 100, color: '#F59E0B' },
    { category: 'Sleep', progress: 92, target: 100, color: '#8B5CF6' },
    { category: 'Mindfulness', progress: 58, target: 100, color: '#EF4444' }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Sync Indicator */}
        <div className="flex justify-end mb-4">
          <SyncIndicator
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            syncStatus={syncStatus}
            error={syncError}
            onSyncNow={syncNow}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              Health Statistics & Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive overview of your health journey and progress
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            
            <button 
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Current Weight"
            value={`${profile?.weight || latestVitals?.weight || 70} kg`}
            change="+2.5% this month"
            icon={Scale}
            color="bg-blue-500"
            trend="up"
          />
          <StatCard
            title="Avg Heart Rate"
            value={`${weeklyStats?.avgHeartRate || latestVitals?.heartRate || 72} bpm`}
            change="-3.2% this week"
            icon={Heart}
            color="bg-red-500"
            trend="down"
          />
          <StatCard
            title="Daily Steps"
            value={weeklyStats?.avgSteps?.toLocaleString() || latestVitals?.steps?.toLocaleString() || '0'}
            change="+15% this month"
            icon={Activity}
            color="bg-green-500"
            trend="up"
          />
          <StatCard
            title="Sleep Quality"
            value={`${weeklyStats?.avgSleep || latestVitals?.sleepHours || 0} hrs`}
            change="+0.5 hrs this week"
            icon={Clock}
            color="bg-purple-500"
            trend="up"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weight Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Weight (kg)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
              <PieChartIcon className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Multi-metric Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Health Metrics Trends</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Steps</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Heart Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Sleep Hours</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={healthMetricsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="steps"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="heartRate"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="sleep"
                stackId="3"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Progress and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Goal Progress</h3>
              <Target className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Achievement Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Achievement Progress</h3>
              <Award className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {achievementData.map((achievement, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {achievement.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {achievement.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: achievement.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Insights and Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            AI-Powered Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-green-700 mb-2">🎯 Great Progress!</h4>
              <p className="text-sm text-gray-600">
                Your weight loss is on track. You've lost 4kg in 6 months - excellent consistency!
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-700 mb-2">💪 Activity Boost</h4>
              <p className="text-sm text-gray-600">
                Your daily steps increased by 15% this month. Keep up the great work!
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-purple-700 mb-2">😴 Sleep Quality</h4>
              <p className="text-sm text-gray-600">
                Your sleep duration improved by 30 minutes. This supports your fitness goals!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserStatistics;