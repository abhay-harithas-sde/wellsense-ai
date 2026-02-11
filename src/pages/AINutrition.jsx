import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Apple, 
  Camera, 
  Utensils, 
  TrendingUp, 
  Target,
  Zap,
  Droplets,
  Clock,
  Brain,
  Star,
  Plus,
  Scan
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import useHealthDataSync from '../hooks/useHealthDataSync';
import SyncIndicator from '../components/ui/SyncIndicator';
import aiHealthEngine from '../services/aiHealthEngine';
import NutritionLogger from '../components/nutrition/NutritionLogger';
import axios from 'axios';

const AINutrition = () => {
  const { user } = useAuth();
  const [showLogger, setShowLogger] = useState(false);
  const [nutritionRecords, setNutritionRecords] = useState([]);
  
  // Real-time health data sync
  const {
    latestVitals,
    profile,
    weeklyStats,
    healthRecords,
    isSyncing,
    lastSyncTime,
    syncStatus,
    error: syncError,
    syncNow
  } = useHealthDataSync({
    syncInterval: 30000, // 30 seconds
    autoSync: true,
    includeHealthRecords: true,
    includeProfile: true
  });

  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [foodAnalysis, setFoodAnalysis] = useState(null);
  const [dailyIntake, setDailyIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0
  });
  const [mealInput, setMealInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanningFood, setScanningFood] = useState(false);

  useEffect(() => {
    if (profile || latestVitals) {
      loadNutritionData();
    }
  }, [profile, latestVitals, user]);

  useEffect(() => {
    loadNutritionRecords();
  }, [user]);

  const loadNutritionData = async () => {
    try {
      setLoading(true);
      
      // Generate personalized nutrition plan based on real user data
      const userProfile = {
        age: profile?.age || calculateAge(user?.dateOfBirth) || 30,
        gender: profile?.gender || user?.gender || 'male',
        weight: profile?.weight || latestVitals?.weight || 75,
        height: profile?.heightCm || profile?.height || 175,
        activityLevel: 'moderately_active',
        bmi: profile?.bmi || calculateBMI(profile?.weight, profile?.heightCm)
      };
      
      // Determine health goals based on BMI
      const healthGoals = [];
      if (userProfile.bmi > 25) healthGoals.push('weight_loss');
      if (userProfile.bmi < 18.5) healthGoals.push('weight_gain');
      healthGoals.push('balanced_nutrition');
      
      const preferences = { dietType: 'standard' };
      
      const plan = await aiHealthEngine.generatePersonalizedNutrition(
        userProfile, 
        healthGoals, 
        preferences
      );
      
      setNutritionPlan(plan);
      
      // Calculate daily intake from recent health records
      if (healthRecords && healthRecords.length > 0) {
        const todayRecords = healthRecords.filter(record => {
          const recordDate = new Date(record.timestamp || record.createdAt);
          const today = new Date();
          return recordDate.toDateString() === today.toDateString();
        });
        
        // Estimate daily intake based on activity and weight
        const estimatedCalories = Math.round(userProfile.weight * 30); // Rough estimate
        const estimatedProtein = Math.round(userProfile.weight * 1.2); // 1.2g per kg
        const estimatedCarbs = Math.round(estimatedCalories * 0.45 / 4); // 45% of calories
        const estimatedFat = Math.round(estimatedCalories * 0.30 / 9); // 30% of calories
        
        setDailyIntake({
          calories: estimatedCalories,
          protein: estimatedProtein,
          carbs: estimatedCarbs,
          fat: estimatedFat,
          fiber: 25,
          water: latestVitals?.waterIntake || 2.0
        });
      }
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const loadNutritionRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/nutrition/daily-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const summary = response.data.data;
        setDailyIntake({
          calories: summary.totalCalories || 0,
          protein: summary.totalProtein || 0,
          carbs: summary.totalCarbs || 0,
          fat: summary.totalFat || 0,
          fiber: summary.totalFiber || 0,
          water: (summary.totalWater || 0) / 1000 // Convert ml to L
        });
      }
    } catch (error) {
      console.error('Failed to load nutrition records:', error);
    }
  };

  const handleLogMeal = async (mealData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/nutrition/log', mealData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Reload nutrition data
        await loadNutritionRecords();
        setShowLogger(false);
        alert('Meal logged successfully!');
      }
    } catch (error) {
      console.error('Failed to log meal:', error);
      throw error;
    }
  };

  const analyzeFood = async (foodDescription) => {
    setScanningFood(true);
    try {
      const analysis = await aiHealthEngine.analyzeFood(null, foodDescription);
      setFoodAnalysis(analysis);
    } catch (error) {
      console.error('Food analysis failed:', error);
    } finally {
      setScanningFood(false);
    }
  };

  const handleFoodScan = () => {
    if (mealInput.trim()) {
      analyzeFood(mealInput);
      setMealInput('');
    }
  };

  const macroData = nutritionPlan ? [
    { name: 'Protein', value: Math.round(nutritionPlan.macroDistribution.protein * 100), color: '#10B981' },
    { name: 'Carbs', value: Math.round(nutritionPlan.macroDistribution.carbs * 100), color: '#3B82F6' },
    { name: 'Fat', value: Math.round(nutritionPlan.macroDistribution.fat * 100), color: '#F59E0B' }
  ] : [];

  const dailyProgressData = [
    { name: 'Calories', current: dailyIntake.calories, target: nutritionPlan?.dailyCalories || 2000, unit: 'kcal' },
    { name: 'Protein', current: dailyIntake.protein, target: 120, unit: 'g' },
    { name: 'Carbs', current: dailyIntake.carbs, target: 250, unit: 'g' },
    { name: 'Fat', current: dailyIntake.fat, target: 80, unit: 'g' },
    { name: 'Fiber', current: dailyIntake.fiber, target: 35, unit: 'g' },
    { name: 'Water', current: dailyIntake.water, target: nutritionPlan?.hydration || 2.5, unit: 'L' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">AI is analyzing your nutrition needs...</p>
        </div>
      </div>
    );
  }

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
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-8 h-8" />
          <h1 className="text-2xl font-bold">AI Nutrition Coach</h1>
        </div>
        <p className="text-green-100">Personalized nutrition guidance powered by artificial intelligence</p>
      </motion.div>

      {/* AI Food Scanner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Scan className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Food Analysis</h3>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={mealInput}
              onChange={(e) => setMealInput(e.target.value)}
              placeholder="Describe your meal (e.g., 'grilled chicken with broccoli and rice')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && handleFoodScan()}
            />
          </div>
          <button
            onClick={handleFoodScan}
            disabled={scanningFood || !mealInput.trim()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {scanningFood ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Analyze</span>
              </>
            )}
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Scan Photo</span>
          </button>
        </div>

        {foodAnalysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h4 className="font-semibold text-gray-900 mb-3">AI Analysis Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{foodAnalysis.healthScore}/100</div>
                <div className="text-sm text-gray-600">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {foodAnalysis.nutritionalBreakdown?.calories || 450}
                </div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {foodAnalysis.recognizedFoods?.length || 3}
                </div>
                <div className="text-sm text-gray-600">Foods Detected</div>
              </div>
            </div>
            
            {foodAnalysis.aiInsights && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>AI Insight:</strong> {foodAnalysis.aiInsights[0] || 'This meal provides balanced nutrition for your goals.'}
                </p>
              </div>
            )}
            
            {foodAnalysis.recommendations && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Recommendation:</strong> {foodAnalysis.recommendations[0] || 'Consider adding more vegetables for better micronutrient density.'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Daily Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macro Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Macro Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {macroData.map((macro, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: macro.color }}></div>
                  <span className="text-sm font-medium">{macro.name}</span>
                </div>
                <div className="text-lg font-bold" style={{ color: macro.color }}>{macro.value}%</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
          <div className="space-y-4">
            {dailyProgressData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    item.name === 'Calories' ? 'bg-red-100' :
                    item.name === 'Protein' ? 'bg-green-100' :
                    item.name === 'Carbs' ? 'bg-blue-100' :
                    item.name === 'Fat' ? 'bg-yellow-100' :
                    item.name === 'Fiber' ? 'bg-purple-100' : 'bg-cyan-100'
                  }`}>
                    {item.name === 'Calories' && <Zap className="w-4 h-4 text-red-600" />}
                    {item.name === 'Protein' && <Target className="w-4 h-4 text-green-600" />}
                    {item.name === 'Carbs' && <Apple className="w-4 h-4 text-blue-600" />}
                    {item.name === 'Fat' && <Utensils className="w-4 h-4 text-yellow-600" />}
                    {item.name === 'Fiber' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                    {item.name === 'Water' && <Droplets className="w-4 h-4 text-cyan-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.current}/{item.target} {item.unit}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.current >= item.target ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, (item.current / item.target) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round((item.current / item.target) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Meal Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Star className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Personalized Meal Plan</h3>
        </div>
        
        {nutritionPlan?.mealPlan && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(nutritionPlan.mealPlan).map(([mealType, meal]) => (
              <div key={mealType} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900 capitalize">{mealType}</h4>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Target: {meal.targetCalories} calories
                </div>
                <div className="space-y-2">
                  {meal.suggestions?.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {suggestion}
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                  View More Options
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Insights & Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Nutrition Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nutritionPlan?.aiInsights?.map((insight, index) => (
            <div key={index} className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">{insight}</p>
            </div>
          ))}
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Hydration Goal:</strong> Drink {nutritionPlan?.hydration?.toFixed(1) || 2.5}L of water daily based on your weight and activity level.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Meal Timing:</strong> Eat every 3-4 hours to maintain stable blood sugar and energy levels.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowLogger(true)}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <Plus className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-700">Log Meal</span>
          </button>
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
            <Droplets className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-700">Log Water</span>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
            <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-700">Set Goals</span>
          </button>
          <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center">
            <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-yellow-700">Get Recipe</span>
          </button>
        </div>
      </motion.div>

      {/* Nutrition Logger Modal */}
      {showLogger && (
        <NutritionLogger
          onLogMeal={handleLogMeal}
          onClose={() => setShowLogger(false)}
        />
      )}
    </div>
  );
};

export default AINutrition;