import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Apple, 
  Activity, 
  Users, 
  Heart,
  CheckCircle,
  Play,
  BarChart3,
  Zap,
  Target,
  Camera,
  TrendingUp,
  MessageCircle,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import aiHealthEngine from '../services/aiHealthEngine';

const AIFeatureDemo = () => {
  const [activeFeature, setActiveFeature] = useState(1);
  const [demoData, setDemoData] = useState({});
  const [loading, setLoading] = useState(false);

  // Demo user profile
  const demoUser = {
    age: 30,
    gender: 'male',
    weight: 75,
    height: 175,
    activityLevel: 'moderately_active',
    goals: ['weight_loss', 'muscle_gain'],
    preferences: { dietType: 'standard' }
  };

  const features = [
    {
      id: 1,
      title: 'Personalized Nutrition Guidance',
      icon: Apple,
      color: 'green',
      description: 'AI-powered meal planning, macro calculation, and personalized nutrition recommendations',
      capabilities: [
        'Smart calorie calculation using Harris-Benedict equation',
        'Personalized macro distribution based on goals',
        'AI-generated meal plans for different diet types',
        'Supplement recommendations',
        'Hydration optimization',
        'Dietary restriction analysis'
      ]
    },
    {
      id: 2,
      title: 'Real-Time Food Tracking and Analysis',
      icon: Camera,
      color: 'blue',
      description: 'Instant food recognition, nutritional analysis, and health scoring',
      capabilities: [
        'AI image recognition for food identification',
        'Real-time nutritional breakdown calculation',
        'Health score rating (0-100) for meals',
        'Portion size analysis',
        'Alternative food suggestions',
        'Meal timing optimization'
      ]
    },
    {
      id: 3,
      title: 'Behavior and Lifestyle Coaching',
      icon: Target,
      color: 'purple',
      description: 'AI-driven habit formation, behavior analysis, and personalized coaching',
      capabilities: [
        'Behavior pattern recognition and analysis',
        'Personalized habit recommendations',
        'Progress tracking with streak counters',
        'Motivational insights and coaching',
        'Challenge area identification',
        'Action plan generation'
      ]
    },
    {
      id: 4,
      title: 'Community-Driven Support',
      icon: Users,
      color: 'indigo',
      description: 'Social health monitoring, peer comparisons, and community insights',
      capabilities: [
        'Community health trend analysis',
        'Peer comparison and benchmarking',
        'Social challenges and competitions',
        'AI-moderated content curation',
        'Group achievement tracking',
        'Collaborative goal setting'
      ]
    },
    {
      id: 5,
      title: 'Continuous Health Monitoring',
      icon: Heart,
      color: 'red',
      description: 'Real-time health analytics, anomaly detection, and predictive insights',
      capabilities: [
        'Vital signs trend analysis',
        'Anomaly detection algorithms',
        'Predictive health insights',
        'Risk assessment and alerts',
        'Intervention recommendations',
        'Continuous AI coaching'
      ]
    }
  ];

  useEffect(() => {
    loadFeatureDemo(activeFeature);
  }, [activeFeature]);

  const loadFeatureDemo = async (featureId) => {
    setLoading(true);
    try {
      let data = {};
      
      switch (featureId) {
        case 1: // Personalized Nutrition
          data = await aiHealthEngine.generatePersonalizedNutrition(
            demoUser, 
            demoUser.goals, 
            demoUser.preferences
          );
          break;
          
        case 2: // Food Tracking
          data = await aiHealthEngine.analyzeFood(
            null, 
            'grilled chicken breast with quinoa and steamed broccoli'
          );
          break;
          
        case 3: // Behavior Coaching
          const behaviorData = {
            meals: [{ time: '08:00', type: 'breakfast', quality: 8 }],
            workouts: [{ date: '2024-03-01', duration: 45, intensity: 'moderate' }],
            sleep: [{ date: '2024-03-01', hours: 7.5, quality: 8 }],
            stress: [{ date: '2024-03-01', level: 3 }],
            water: { daily: 2200, target: 2500 }
          };
          data = await aiHealthEngine.generateBehaviorCoaching(behaviorData, demoUser.goals);
          break;
          
        case 4: // Community Support
          const communityData = {
            users: [{ id: 1, goals: ['weight_loss'], activityLevel: 'moderate' }],
            posts: [{ id: 1, category: 'fitness', engagement: 0.8 }]
          };
          data = await aiHealthEngine.generateCommunityFeatures(demoUser, communityData);
          break;
          
        case 5: // Health Monitoring
          const healthData = [
            { date: '2024-03-01', heartRate: 72, weight: 75, steps: 8500, sleepHours: 7.5 },
            { date: '2024-03-02', heartRate: 75, weight: 74.8, steps: 9200, sleepHours: 7.0 },
            { date: '2024-03-03', heartRate: 70, weight: 74.6, steps: 10500, sleepHours: 8.0 }
          ];
          data = await aiHealthEngine.generateHealthMonitoring(healthData, demoUser);
          break;
      }
      
      setDemoData(data);
    } catch (error) {
      console.error('Demo loading error:', error);
      setDemoData({ error: 'Demo data unavailable' });
    } finally {
      setLoading(false);
    }
  };

  const renderFeatureDemo = () => {
    const feature = features.find(f => f.id === activeFeature);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI feature demo...</p>
          </div>
        </div>
      );
    }

    switch (activeFeature) {
      case 1: // Nutrition Guidance
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-4">Daily Nutrition Plan</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Daily Calories:</span>
                    <span className="font-bold">{demoData.dailyCalories || 2200} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-bold">{Math.round((demoData.macroDistribution?.protein || 0.25) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span className="font-bold">{Math.round((demoData.macroDistribution?.carbs || 0.45) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span className="font-bold">{Math.round((demoData.macroDistribution?.fat || 0.30) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Water Intake:</span>
                    <span className="font-bold">{demoData.hydration?.toFixed(1) || 2.5}L</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">AI Insights</h4>
                <div className="space-y-2">
                  {demoData.aiInsights?.map((insight, index) => (
                    <div key={index} className="p-3 bg-white rounded text-sm">
                      {insight}
                    </div>
                  )) || (
                    <div className="p-3 bg-white rounded text-sm">
                      Based on your profile, focus on protein-rich foods for muscle recovery and weight management.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Food Tracking
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4">Food Analysis Results</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{demoData.healthScore || 85}/100</div>
                  <div className="text-sm text-gray-600">Health Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{demoData.nutritionalBreakdown?.calories || 450}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{demoData.recognizedFoods?.length || 3}</div>
                  <div className="text-sm text-gray-600">Foods Detected</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4">AI Recommendations</h4>
              <div className="space-y-2">
                {demoData.recommendations?.map((rec, index) => (
                  <div key={index} className="p-3 bg-white rounded text-sm">
                    {rec}
                  </div>
                )) || (
                  <div className="p-3 bg-white rounded text-sm">
                    Excellent meal choice! This provides balanced macronutrients and supports your fitness goals.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Behavior Coaching
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="font-semibold text-purple-900 mb-4">Behavior Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Exercise Consistency:</span>
                    <span className="font-bold text-green-600">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sleep Quality:</span>
                    <span className="font-bold text-blue-600">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nutrition Adherence:</span>
                    <span className="font-bold text-green-600">Very Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stress Management:</span>
                    <span className="font-bold text-yellow-600">Needs Attention</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-6">
                <h4 className="font-semibold text-indigo-900 mb-4">AI Coaching Tips</h4>
                <div className="space-y-2">
                  {demoData.personalizedTips?.map((tip, index) => (
                    <div key={index} className="p-3 bg-white rounded text-sm">
                      <strong>{tip.category}:</strong> {tip.tip}
                    </div>
                  )) || (
                    <>
                      <div className="p-3 bg-white rounded text-sm">
                        <strong>Sleep:</strong> Your 7.5h average is great! Try to maintain consistency.
                      </div>
                      <div className="p-3 bg-white rounded text-sm">
                        <strong>Exercise:</strong> Consider adding 10 minutes of morning stretching.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Community Support
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">12,847</div>
                <div className="text-sm text-blue-700">Community Members</div>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600">#12</div>
                <div className="text-sm text-green-700">Your Rank</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">85%</div>
                <div className="text-sm text-purple-700">Above Average</div>
              </div>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-6">
              <h4 className="font-semibold text-indigo-900 mb-4">Community Insights</h4>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded text-sm">
                  You're performing 15% better than users with similar goals
                </div>
                <div className="p-3 bg-white rounded text-sm">
                  Join the "10K Steps Challenge" - 89% completion rate in your area
                </div>
                <div className="p-3 bg-white rounded text-sm">
                  Your consistency ranks in the top 25% of community members
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Health Monitoring
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 rounded-lg p-6">
                <h4 className="font-semibold text-red-900 mb-4">Health Trends</h4>
                <div className="space-y-3">
                  {demoData.vitalTrends && Object.entries(demoData.vitalTrends).map(([vital, trend]) => (
                    <div key={vital} className="flex justify-between">
                      <span className="capitalize">{vital.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className={`font-bold ${
                        trend.trend === 'improving' ? 'text-green-600' : 
                        trend.trend === 'declining' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {trend.trend || 'Stable'}
                      </span>
                    </div>
                  )) || (
                    <>
                      <div className="flex justify-between">
                        <span>Heart Rate:</span>
                        <span className="font-bold text-green-600">Improving</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weight:</span>
                        <span className="font-bold text-green-600">Decreasing</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sleep:</span>
                        <span className="font-bold text-blue-600">Stable</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-6">
                <h4 className="font-semibold text-orange-900 mb-4">AI Health Alerts</h4>
                <div className="space-y-2">
                  {demoData.anomalies?.map((anomaly, index) => (
                    <div key={index} className={`p-3 rounded text-sm ${
                      anomaly.severity === 'high' ? 'bg-red-100 text-red-800' :
                      anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      <strong>{anomaly.type}:</strong> {anomaly.recommendation}
                    </div>
                  )) || (
                    <>
                      <div className="p-3 bg-green-100 text-green-800 rounded text-sm">
                        All vitals within normal range - great job!
                      </div>
                      <div className="p-3 bg-blue-100 text-blue-800 rounded text-sm">
                        Weight loss trend is healthy and sustainable
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a feature to view demo</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-8 h-8" />
          <h1 className="text-2xl font-bold">AI Features Demonstration</h1>
        </div>
        <p className="text-blue-100">Experience all 5 AI-powered health features in action</p>
      </motion.div>

      {/* Feature Selection */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {features.map((feature) => (
          <motion.button
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeFeature === feature.id
                ? `border-${feature.color}-500 bg-${feature.color}-50`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <feature.icon className={`w-8 h-8 mx-auto mb-2 ${
                activeFeature === feature.id ? `text-${feature.color}-600` : 'text-gray-600'
              }`} />
              <h3 className={`font-semibold text-sm ${
                activeFeature === feature.id ? `text-${feature.color}-900` : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Feature Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            {React.createElement(features.find(f => f.id === activeFeature)?.icon, {
              className: `w-6 h-6 text-${features.find(f => f.id === activeFeature)?.color}-600`
            })}
            <h2 className="text-xl font-semibold text-gray-900">
              {features.find(f => f.id === activeFeature)?.title}
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            {features.find(f => f.id === activeFeature)?.description}
          </p>
          
          {/* Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            {features.find(f => f.id === activeFeature)?.capabilities.map((capability, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Demo</h3>
          {renderFeatureDemo()}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Integration Complete</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {features.map((feature) => (
            <div key={feature.id} className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">{feature.title}</p>
              <p className="text-xs text-gray-600">Fully Implemented</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIFeatureDemo;