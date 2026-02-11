import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  TrendingUp,
  Calendar,
  Brain,
  Target,
  Sparkles,
  Zap,
  Star,
  Trophy,
  Sun,
  Moon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import useHealthDataSync from '../hooks/useHealthDataSync';
import SyncIndicator from '../components/ui/SyncIndicator';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    // Optimized: Show dashboard immediately with loading state
    // Data will populate as it arrives from the sync hook
    const quickTimeout = setTimeout(() => {
      setLoading(false);
    }, 300); // Show UI after 300ms regardless of data
    
    if (syncError) {
      setError('Failed to load dashboard data');
    }
    
    return () => clearTimeout(quickTimeout);
  }, [syncError]);

  // Removed blocking loading screen - show UI immediately with skeleton states

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={syncNow}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const healthData = dashboardData?.recentData?.vitals || [];
  const statsCards = [
    {
      title: 'Daily Steps',
      value: weeklyStats?.avgSteps?.toLocaleString() || '0',
      change: '+12%',
      icon: Activity,
      color: 'blue'
    },
    {
      title: 'Heart Rate',
      value: `${weeklyStats?.avgHeartRate || latestVitals?.heartRate || 0} BPM`,
      change: '-3%',
      icon: Heart,
      color: 'red'
    },
    {
      title: 'Sleep Quality',
      value: `${weeklyStats?.avgSleep || latestVitals?.sleepHours || 0}h`,
      change: '+5%',
      icon: Calendar,
      color: 'purple'
    },
    {
      title: 'Health Score',
      value: `${dashboardData?.healthMetrics?.healthScore || 0}%`,
      change: '+8%',
      icon: TrendingUp,
      color: 'green'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sync Indicator */}
      <div className="flex justify-end">
        <SyncIndicator
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          syncStatus={syncStatus}
          error={syncError}
          onSyncNow={syncNow}
        />
      </div>
      {/* Enhanced Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse delay-1000"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 mb-3"
              >
                <Sun className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h1 className="text-4xl font-bold">
                  Good morning, {profile?.firstName || user?.firstName || 'there'}!
                </h1>
              </motion.div>
              <motion.p
                className="text-blue-100 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You're crushing your health goals! Here's your personalized overview.
              </motion.p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-6xl"
            >
              ✨
            </motion.div>
          </div>

          <motion.div
            className="mt-6 flex items-center space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold">Health Champion</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold">5-Day Streak</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${stat.color === 'blue' ? 'from-blue-500 to-cyan-500' :
              stat.color === 'red' ? 'from-red-500 to-pink-500' :
                stat.color === 'purple' ? 'from-purple-500 to-indigo-500' :
                  'from-green-500 to-emerald-500'
              }`}></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className={`p-4 rounded-2xl bg-gradient-to-br shadow-lg ${stat.color === 'blue' ? 'from-blue-100 to-cyan-100' :
                    stat.color === 'red' ? 'from-red-100 to-pink-100' :
                      stat.color === 'purple' ? 'from-purple-100 to-indigo-100' :
                        'from-green-100 to-emerald-100'
                    }`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'red' ? 'text-red-600' :
                      stat.color === 'purple' ? 'text-purple-600' :
                        'text-green-600'
                    }`} />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  className="text-2xl"
                >
                  {stat.color === 'blue' ? '💙' :
                    stat.color === 'red' ? '❤️' :
                      stat.color === 'purple' ? '💜' : '💚'}
                </motion.div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {stat.title}
                </p>
                <motion.p
                  className="text-3xl font-bold text-gray-900 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {stat.value}
                </motion.p>
                <div className="flex items-center space-x-2">
                  <motion.div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${stat.change.startsWith('+')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <TrendingUp className={`w-3 h-3 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600 rotate-180'
                      }`} />
                    <span>{stat.change}</span>
                  </motion.div>
                  <span className="text-xs text-gray-500">from yesterday</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steps Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Weekly Steps</h3>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-blue-500"
            >
              <Zap className="w-5 h-5" />
            </motion.div>
          </div>
          <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="steps"
                  stroke="url(#blueGradient)"
                  strokeWidth={4}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#1D4ED8' }}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sleep Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                <Moon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sleep Pattern</h3>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-purple-500"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </div>
          <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar
                  dataKey="sleep"
                  fill="url(#purpleGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Enhanced AI Insights & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-purple-500"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div
              className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100/50"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Sleep Quality Boost</p>
                  <p className="text-sm text-blue-800">
                    Your sleep quality improved by 15% this week. Consider maintaining your current bedtime routine.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100/50"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">Cardio Champion</p>
                  <p className="text-sm text-green-800">
                    Great job on exceeding your step goal 5 days this week! Your cardiovascular health is improving.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100/50"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-1">Energy Optimization</p>
                  <p className="text-sm text-yellow-800">
                    Try a 10-minute morning walk to boost your energy levels by 25% throughout the day.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Today's Goals</h3>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-green-500"
            >
              <Trophy className="w-5 h-5" />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">Daily Steps</span>
                </div>
                <span className="text-sm font-bold text-gray-900">8,500/10,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              <p className="text-xs text-gray-500">1,500 steps to go! 🚶‍♂️</p>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">Water Intake</span>
                </div>
                <span className="text-sm font-bold text-gray-900">6/8 glasses</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500">2 more glasses to go! 💧</p>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-700">Active Minutes</span>
                </div>
                <span className="text-sm font-bold text-gray-900">30/30 min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
              <p className="text-xs text-green-600 font-semibold">Goal completed! 🎉</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;