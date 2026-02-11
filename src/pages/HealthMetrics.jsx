import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Thermometer, Droplets, Plus, TrendingUp, Save, CheckCircle } from 'lucide-react';
import useHealthDataSync from '../hooks/useHealthDataSync';
import SyncIndicator from '../components/ui/SyncIndicator';
import { calculateRecommendedWaterIntake } from '../utils/healthCalculations';

const HealthMetrics = () => {
  // Real-time health data sync
  const {
    latestVitals,
    profile,
    isSyncing,
    lastSyncTime,
    syncStatus,
    error: syncError,
    syncNow,
    saveHealthData
  } = useHealthDataSync({
    syncInterval: 5000, // Sync every 5 seconds for real-time updates
    autoSync: true,
    includeHealthRecords: true,
    includeProfile: true
  });

  const [metrics, setMetrics] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    weight: 70,
    hydration: 2.5
  });

  // Update metrics when latest vitals change
  useEffect(() => {
    if (latestVitals) {
      setMetrics(prev => ({
        heartRate: latestVitals.heartRate || prev.heartRate,
        bloodPressure: {
          systolic: latestVitals.bloodPressureSystolic || prev.bloodPressure.systolic,
          diastolic: latestVitals.bloodPressureDiastolic || prev.bloodPressure.diastolic
        },
        temperature: latestVitals.temperature || prev.temperature,
        weight: profile?.weight || prev.weight,
        hydration: latestVitals.waterIntake || prev.hydration
      }));
    }
  }, [latestVitals, profile]);



  const [inputValues, setInputValues] = useState({
    heartRate: '',
    systolic: '',
    diastolic: '',
    temperature: '',
    weight: '',
    hydration: ''
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setInputValues(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSaveSuccess(false);
  };

  const saveHealthMetrics = async () => {
    try {
      setSaving(true);
      setError(null);

      // Prepare health data
      const healthData = {
        heartRate: inputValues.heartRate ? parseInt(inputValues.heartRate) : undefined,
        bloodPressure: (inputValues.systolic && inputValues.diastolic) ? {
          systolic: parseInt(inputValues.systolic),
          diastolic: parseInt(inputValues.diastolic)
        } : undefined,
        temperature: inputValues.temperature ? parseFloat(inputValues.temperature) : undefined,
        oxygenSaturation: inputValues.oxygenSaturation ? parseFloat(inputValues.oxygenSaturation) : undefined,
        sleepHours: inputValues.hydration ? parseFloat(inputValues.hydration) / 0.3 : undefined, // Estimate
        notes: 'Health metrics logged via dashboard'
      };

      // Remove undefined values
      Object.keys(healthData).forEach(key => {
        if (healthData[key] === undefined) {
          delete healthData[key];
        }
      });

      // Only save if there's at least one metric
      if (Object.keys(healthData).length === 0) {
        setError('Please enter at least one health metric');
        return;
      }

      console.log('💾 Saving health data:', healthData);

      // Use real-time sync to save data
      const result = await saveHealthData('vitals', healthData);
      
      if (result.success) {
        // Update local metrics with new values
        const newMetrics = { ...metrics };
        if (inputValues.heartRate) newMetrics.heartRate = parseInt(inputValues.heartRate);
        if (inputValues.systolic && inputValues.diastolic) {
          newMetrics.bloodPressure = {
            systolic: parseInt(inputValues.systolic),
            diastolic: parseInt(inputValues.diastolic)
          };
        }
        if (inputValues.temperature) newMetrics.temperature = parseFloat(inputValues.temperature);
        if (inputValues.weight) newMetrics.weight = parseFloat(inputValues.weight);
        if (inputValues.hydration) newMetrics.hydration = parseFloat(inputValues.hydration);

        setMetrics(newMetrics);
        
        // Clear input values
        setInputValues({
          heartRate: '',
          systolic: '',
          diastolic: '',
          temperature: '',
          weight: '',
          hydration: ''
        });

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        console.log('✅ Health metrics saved and synced successfully');
      } else {
        throw new Error(result.error || 'Failed to save health metrics');
      }
    } catch (err) {
      console.error('❌ Error saving health metrics:', err);
      setError(err.message || 'Failed to save health metrics. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const metricCards = [
    {
      title: 'Heart Rate',
      value: `${metrics.heartRate} BPM`,
      icon: Heart,
      color: 'red',
      trend: '+2%',
      status: 'normal'
    },
    {
      title: 'Blood Pressure',
      value: `${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic}`,
      icon: Activity,
      color: 'blue',
      trend: '-1%',
      status: 'normal'
    },
    {
      title: 'Temperature',
      value: `${metrics.temperature}°F`,
      icon: Thermometer,
      color: 'orange',
      trend: '0%',
      status: 'normal'
    },
    {
      title: 'Hydration',
      value: `${metrics.hydration}L / ${calculateRecommendedWaterIntake(metrics.weight).toFixed(1)}L`,
      icon: Droplets,
      color: 'cyan',
      trend: metrics.hydration >= calculateRecommendedWaterIntake(metrics.weight) ? '+25%' : '-15%',
      status: metrics.hydration >= calculateRecommendedWaterIntake(metrics.weight) ? 'good' : 'needs_attention'
    }
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">Health Metrics</h1>
        <p className="text-blue-100">Track your vital signs and health indicators</p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${
                metric.color === 'red' ? 'from-red-100 to-pink-100' :
                metric.color === 'blue' ? 'from-blue-100 to-cyan-100' :
                metric.color === 'orange' ? 'from-orange-100 to-yellow-100' :
                'from-cyan-100 to-blue-100'
              }`}>
                <metric.icon className={`w-6 h-6 ${
                  metric.color === 'red' ? 'text-red-600' :
                  metric.color === 'blue' ? 'text-blue-600' :
                  metric.color === 'orange' ? 'text-orange-600' :
                  'text-cyan-600'
                }`} />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                metric.status === 'normal' ? 'bg-green-100 text-green-700' :
                metric.status === 'good' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {metric.status}
              </div>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-600 mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className={`w-4 h-4 ${
                metric.trend.startsWith('+') ? 'text-green-600' : 
                metric.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-semibold ${
                metric.trend.startsWith('+') ? 'text-green-600' : 
                metric.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
              }`}>
                {metric.trend} from last week
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add New Metric */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
            <Plus className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Log New Metric</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Heart Rate (BPM)</label>
            <input
              type="number"
              value={inputValues.heartRate}
              onChange={(e) => handleInputChange('heartRate', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
              placeholder={`Current: ${metrics.heartRate}`}
              min="40"
              max="200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Pressure</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={inputValues.systolic}
                onChange={(e) => handleInputChange('systolic', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                placeholder={`${metrics.bloodPressure.systolic}`}
                min="80"
                max="200"
              />
              <span className="flex items-center text-gray-500 font-bold">/</span>
              <input
                type="number"
                value={inputValues.diastolic}
                onChange={(e) => handleInputChange('diastolic', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
                placeholder={`${metrics.bloodPressure.diastolic}`}
                min="40"
                max="120"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              value={inputValues.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
              placeholder={`Current: ${metrics.temperature}°F`}
              min="95"
              max="110"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={inputValues.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
              placeholder={`Current: ${metrics.weight} kg`}
              min="30"
              max="300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Water Intake (Liters)
              <span className="text-xs text-blue-600 ml-2">
                Recommended: {calculateRecommendedWaterIntake(metrics.weight).toFixed(1)}L
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              value={inputValues.hydration}
              onChange={(e) => handleInputChange('hydration', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
              placeholder={`Current: ${metrics.hydration}L`}
              min="0"
              max="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formula: (Body Weight ÷ 10) - 2 liters per day
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </motion.div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 text-sm font-semibold">Health metrics saved successfully!</p>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            onClick={saveHealthMetrics}
            disabled={saving}
            className={`py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } text-white`}
            whileHover={!saving ? { scale: 1.02 } : {}}
            whileTap={!saving ? { scale: 0.98 } : {}}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Metrics</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default HealthMetrics;