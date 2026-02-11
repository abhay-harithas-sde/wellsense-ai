import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  TrendingDown, 
  Droplets, 
  Apple, 
  Target, 
  Plus,
  Award,
  Activity,
  Zap,
  Star,
  Trophy,
  Heart,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import useHealthDataSync from '../hooks/useHealthDataSync';
import SyncIndicator from '../components/ui/SyncIndicator';

const WeightTracker = () => {
  const { user } = useAuth();
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [loading, setLoading] = useState(true);

  // Real-time weight data sync
  const {
    latestWeight,
    profile,
    isSyncing,
    lastSyncTime,
    syncStatus,
    error: syncError,
    syncNow,
    saveHealthData
  } = useHealthDataSync({
    syncInterval: 10000, // Sync every 10 seconds
    autoSync: true,
    includeWeightData: true,
    includeProfile: true
  });

  // Demo weight reduction data
  const [weightData, setWeightData] = useState([
    { date: '2024-01-01', weight: 85.0, waterIntake: 7.5, dietScore: 70, calories: 2200, bmi: 25.8 },
    { date: '2024-01-08', weight: 84.5, waterIntake: 7.8, dietScore: 75, calories: 2100, bmi: 25.6 },
    { date: '2024-01-15', weight: 84.2, waterIntake: 8.0, dietScore: 80, calories: 2050, bmi: 25.5 },
    { date: '2024-01-22', weight: 83.8, waterIntake: 8.2, dietScore: 82, calories: 2000, bmi: 25.4 },
    { date: '2024-01-29', weight: 83.5, waterIntake: 8.3, dietScore: 85, calories: 1950, bmi: 25.3 },
    { date: '2024-02-05', weight: 83.0, waterIntake: 8.5, dietScore: 88, calories: 1900, bmi: 25.2 },
    { date: '2024-02-12', weight: 82.7, waterIntake: 8.4, dietScore: 90, calories: 1850, bmi: 25.1 },
    { date: '2024-02-19', weight: 82.3, waterIntake: 8.6, dietScore: 87, calories: 1900, bmi: 25.0 },
    { date: '2024-02-26', weight: 82.0, waterIntake: 8.7, dietScore: 92, calories: 1800, bmi: 24.9 },
    { date: '2024-03-05', weight: 81.5, waterIntake: 8.8, dietScore: 95, calories: 1750, bmi: 24.7 },
  ]);

  useEffect(() => {
    // Update from real-time sync
    if (latestWeight) {
      setCurrentWeight(latestWeight.weight || latestWeight.weightKg);
      setLoading(false);
    } else if (profile?.weight) {
      setCurrentWeight(profile.weight);
      setLoading(false);
    } else {
      setLoading(false);
    }
    
    setTargetWeight(78);
  }, [latestWeight, profile]);

  const addWeightEntry = async () => {
    if (!currentWeight) return;

    const weightValue = parseFloat(currentWeight);
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: weightValue,
      waterIntake: 8.5,
      dietScore: 90,
      calories: 1800,
      bmi: (weightValue / (1.75 * 1.75)).toFixed(1)
    };

    // Save to database via real-time sync
    const result = await saveHealthData('weight', {
      weight: weightValue,
      notes: 'Weight logged via tracker'
    });

    if (result.success) {
      setWeightData(prev => [...prev, newEntry]);
      setCurrentWeight('');
      console.log('✅ Weight entry saved and synced');
    } else {
      console.error('❌ Failed to save weight entry:', result.error);
    }
  };

  const calculateProgress = () => {
    if (weightData.length < 2) return 0;
    const startWeight = weightData[0].weight;
    const currentWeightValue = weightData[weightData.length - 1].weight;
    const targetWeightValue = 78;
    
    const totalLoss = startWeight - targetWeightValue;
    const currentLoss = startWeight - currentWeightValue;
    
    return Math.min(100, (currentLoss / totalLoss) * 100);
  };

  const getWeightTrend = () => {
    if (weightData.length < 2) return 0;
    const recent = weightData.slice(-2);
    return recent[1].weight - recent[0].weight;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Loading weight tracker...</p>
          <p className="text-sm text-gray-500 mt-2">Syncing with database...</p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const weightTrend = getWeightTrend();
  const currentWeightValue = weightData[weightData.length - 1]?.weight || latestWeight?.weight || profile?.weight || 0;
  const totalLoss = weightData[0]?.weight - currentWeightValue || 0;

  return (
    <div className="space-y-8">
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
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-green-500 via-blue-600 to-purple-700 rounded-3xl p-8 text-white overflow-hidden"
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
                className="flex items-center space-x-4 mb-3"
              >
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Scale className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Weight Journey</h1>
                  <p className="text-green-100 text-lg">Smart weight management with AI insights</p>
                </div>
              </motion.div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl"
            >
              🎯
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-6 grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-sm font-semibold">Total Lost</p>
              <p className="text-2xl font-bold">{totalLoss.toFixed(1)} kg</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-300" />
              <p className="text-sm font-semibold">Progress</p>
              <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-blue-300" />
              <p className="text-sm font-semibold">BMI</p>
              <p className="text-2xl font-bold">{weightData[weightData.length - 1]?.bmi || 0}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Current Weight',
            value: `${currentWeightValue} kg`,
            change: `${weightTrend.toFixed(1)} kg`,
            icon: Scale,
            color: 'blue',
            trend: weightTrend <= 0 ? 'down' : 'up'
          },
          {
            title: 'Target Weight',
            value: `${targetWeight} kg`,
            change: `${(currentWeightValue - targetWeight).toFixed(1)} kg to go`,
            icon: Target,
            color: 'green',
            trend: 'target'
          },
          {
            title: 'Water Intake',
            value: '8.5 L',
            change: '+0.3L from yesterday',
            icon: Droplets,
            color: 'cyan',
            trend: 'up'
          },
          {
            title: 'Diet Score',
            value: '95%',
            change: '+5% this week',
            icon: Apple,
            color: 'orange',
            trend: 'up'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
              stat.color === 'blue' ? 'from-blue-500 to-cyan-500' :
              stat.color === 'green' ? 'from-green-500 to-emerald-500' :
              stat.color === 'cyan' ? 'from-cyan-500 to-blue-500' :
              'from-orange-500 to-red-500'
            }`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className={`p-4 rounded-2xl bg-gradient-to-br shadow-lg ${
                    stat.color === 'blue' ? 'from-blue-100 to-cyan-100' :
                    stat.color === 'green' ? 'from-green-100 to-emerald-100' :
                    stat.color === 'cyan' ? 'from-cyan-100 to-blue-100' :
                    'from-orange-100 to-red-100'
                  }`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'cyan' ? 'text-cyan-600' :
                    'text-orange-600'
                  }`} />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  className="text-2xl"
                >
                  {stat.color === 'blue' ? '⚖️' : 
                   stat.color === 'green' ? '🎯' : 
                   stat.color === 'cyan' ? '💧' : '🍎'}
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
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      stat.trend === 'down' ? 'bg-green-100 text-green-700' :
                      stat.trend === 'up' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {stat.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3 text-green-600" />
                    ) : stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-blue-600" />
                    ) : (
                      <Target className="w-3 h-3 text-gray-600" />
                    )}
                    <span>{stat.change}</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Weight Progress</h3>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-blue-500"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </div>
          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#weightGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Diet & Water Tracking */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-cyan-100 rounded-xl">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Health Metrics</h3>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-green-500"
            >
              <Heart className="w-5 h-5" />
            </motion.div>
          </div>
          <div className="bg-gradient-to-br from-green-50/50 to-cyan-50/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
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
                  dataKey="dietScore" 
                  fill="url(#greenGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Add Weight Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
            <Plus className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Log New Weight</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Weight (kg)
            </label>
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              placeholder="Enter your weight"
              className="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 focus:bg-white/90 transition-all duration-300"
            />
          </div>
          <motion.button
            onClick={addWeightEntry}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Entry</span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">AI Insights & Recommendations</h3>
          </div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="text-yellow-500"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div 
            className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100/50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">Excellent Progress!</p>
                <p className="text-sm text-green-800">
                  You've lost {totalLoss.toFixed(1)}kg in 10 weeks. Your consistent approach is paying off!
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100/50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Hydration Goal</p>
                <p className="text-sm text-blue-800">
                  Maintain 8.5L daily water intake. It's boosting your metabolism by 15%!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default WeightTracker;