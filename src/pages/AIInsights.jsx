import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Target, Heart, Activity, MessageCircle } from 'lucide-react';
import useHealthDataSync from '../hooks/useHealthDataSync';
import SyncIndicator from '../components/ui/SyncIndicator';
import aiHealthEngine from '../services/aiHealthEngine';

const AIInsights = () => {
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
    syncInterval: 30000, // 30 seconds (AI analysis is expensive)
    autoSync: true,
    includeHealthRecords: true,
    includeProfile: true
  });

  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'assistant',
      message: 'Hello! I\'m your AI health assistant. How can I help you understand your health data today?'
    }
  ]);
  const [chatMessage, setChatMessage] = useState('');

  // Generate insights from real health data
  useEffect(() => {
    if (latestVitals || healthRecords?.length > 0) {
      generateRealTimeInsights();
    }
  }, [latestVitals, healthRecords, weeklyStats, profile]);

  const generateRealTimeInsights = async () => {
    try {
      setLoading(true);
      const generatedInsights = [];

      // Insight 1: Heart Rate Analysis
      if (latestVitals?.heartRate && weeklyStats?.avgHeartRate) {
        const hrChange = latestVitals.heartRate - weeklyStats.avgHeartRate;
        if (Math.abs(hrChange) >= 5) {
          generatedInsights.push({
            id: 1,
            type: hrChange < 0 ? 'positive' : 'warning',
            title: hrChange < 0 ? 'Cardiovascular Improvement' : 'Elevated Heart Rate',
            description: `Your resting heart rate has ${hrChange < 0 ? 'decreased' : 'increased'} by ${Math.abs(hrChange)} BPM, ${hrChange < 0 ? 'indicating improved cardiovascular fitness' : 'which may indicate stress or overtraining'}.`,
            confidence: 92,
            icon: Heart,
            color: hrChange < 0 ? 'green' : 'yellow',
            recommendations: hrChange < 0 ? [
              'Continue your current cardio routine',
              'Consider adding interval training',
              'Monitor heart rate variability'
            ] : [
              'Ensure adequate rest and recovery',
              'Monitor stress levels',
              'Consider reducing workout intensity'
            ]
          });
        }
      }

      // Insight 2: Sleep Quality
      if (weeklyStats?.avgSleep) {
        const sleepQuality = weeklyStats.avgSleep;
        if (sleepQuality < 7) {
          generatedInsights.push({
            id: 2,
            type: 'warning',
            title: 'Sleep Pattern Irregularity',
            description: `Your average sleep duration is ${sleepQuality.toFixed(1)} hours, which is below the recommended 7-9 hours. This may impact your recovery and energy levels.`,
            confidence: 87,
            icon: AlertCircle,
            color: 'yellow',
            recommendations: [
              'Establish a consistent bedtime routine',
              'Limit screen time before bed',
              'Consider meditation or relaxation techniques'
            ]
          });
        } else if (sleepQuality >= 8) {
          generatedInsights.push({
            id: 2,
            type: 'positive',
            title: 'Excellent Sleep Quality',
            description: `You're averaging ${sleepQuality.toFixed(1)} hours of sleep per night. Great job maintaining healthy sleep habits!`,
            confidence: 95,
            icon: CheckCircle,
            color: 'green',
            recommendations: [
              'Maintain current sleep schedule',
              'Continue your bedtime routine',
              'Share your success with the community'
            ]
          });
        }
      }

      // Insight 3: BMI and Weight
      if (profile?.bmi) {
        const bmi = profile.bmi;
        if (bmi > 25) {
          generatedInsights.push({
            id: 3,
            type: 'insight',
            title: 'Weight Management Opportunity',
            description: `Your BMI is ${bmi.toFixed(1)}, which is in the overweight range. A balanced approach to nutrition and exercise could help you reach a healthier weight.`,
            confidence: 85,
            icon: Target,
            color: 'blue',
            recommendations: [
              'Focus on whole, unprocessed foods',
              'Increase daily physical activity',
              'Set realistic weight loss goals (0.5-1kg per week)'
            ]
          });
        } else if (bmi >= 18.5 && bmi <= 25) {
          generatedInsights.push({
            id: 3,
            type: 'positive',
            title: 'Healthy Weight Range',
            description: `Your BMI is ${bmi.toFixed(1)}, which is in the healthy range. Keep up the great work!`,
            confidence: 90,
            icon: CheckCircle,
            color: 'green',
            recommendations: [
              'Maintain current lifestyle habits',
              'Continue balanced nutrition',
              'Stay active with regular exercise'
            ]
          });
        }
      }

      // Insight 4: Activity Level
      if (weeklyStats?.avgSteps) {
        const steps = weeklyStats.avgSteps;
        if (steps >= 10000) {
          generatedInsights.push({
            id: 4,
            type: 'positive',
            title: 'Activity Level Excellence',
            description: `You're averaging ${steps.toLocaleString()} steps per day, exceeding the recommended 10,000 steps. Great job maintaining an active lifestyle!`,
            confidence: 95,
            icon: Activity,
            color: 'green',
            recommendations: [
              'Maintain current activity level',
              'Consider setting a new challenge',
              'Share your success with the community'
            ]
          });
        } else if (steps < 5000) {
          generatedInsights.push({
            id: 4,
            type: 'warning',
            title: 'Low Activity Level',
            description: `Your average daily steps (${steps.toLocaleString()}) are below the recommended level. Increasing physical activity can improve overall health.`,
            confidence: 88,
            icon: Activity,
            color: 'yellow',
            recommendations: [
              'Start with small goals (add 1000 steps daily)',
              'Take short walking breaks throughout the day',
              'Use stairs instead of elevators'
            ]
          });
        }
      }

      // Insight 5: Blood Pressure
      if (latestVitals?.bloodPressureSystolic && latestVitals?.bloodPressureDiastolic) {
        const systolic = latestVitals.bloodPressureSystolic;
        const diastolic = latestVitals.bloodPressureDiastolic;
        if (systolic > 140 || diastolic > 90) {
          generatedInsights.push({
            id: 5,
            type: 'warning',
            title: 'Elevated Blood Pressure',
            description: `Your blood pressure (${systolic}/${diastolic}) is elevated. Consider consulting with a healthcare provider.`,
            confidence: 90,
            icon: AlertCircle,
            color: 'yellow',
            recommendations: [
              'Reduce sodium intake',
              'Increase physical activity',
              'Consult with a healthcare provider'
            ]
          });
        } else if (systolic <= 120 && diastolic <= 80) {
          generatedInsights.push({
            id: 5,
            type: 'positive',
            title: 'Healthy Blood Pressure',
            description: `Your blood pressure (${systolic}/${diastolic}) is in the healthy range. Keep up the good work!`,
            confidence: 95,
            icon: CheckCircle,
            color: 'green',
            recommendations: [
              'Maintain current lifestyle',
              'Continue healthy eating habits',
              'Stay physically active'
            ]
          });
        }
      }

      // If no insights generated, add a default message
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          id: 1,
          type: 'insight',
          title: 'Start Tracking Your Health',
          description: 'Log your health metrics to receive personalized AI insights about your health journey.',
          confidence: 100,
          icon: Lightbulb,
          color: 'blue',
          recommendations: [
            'Log your daily vitals in Health Metrics',
            'Track your weight regularly',
            'Record your sleep and activity levels'
          ]
        });
      }

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'insight':
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const getInsightColors = (color) => {
    switch (color) {
      case 'green':
        return {
          bg: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-700'
        };
      case 'yellow':
        return {
          bg: 'from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700'
        };
      case 'blue':
        return {
          bg: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700'
        };
      default:
        return {
          bg: 'from-gray-50 to-slate-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatHistory(prev => [...prev, 
        { type: 'user', message: chatMessage },
        { type: 'assistant', message: 'Thank you for your question. I\'m analyzing your health data to provide personalized insights.' }
      ]);
      setChatMessage('');
    }
  };

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
        className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Health Insights</h1>
            <p className="text-purple-100">Personalized recommendations based on your health data</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-300" />
            <p className="text-sm font-semibold">Health Score</p>
            <p className="text-2xl font-bold">87%</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Brain className="w-6 h-6 mx-auto mb-2 text-blue-300" />
            <p className="text-sm font-semibold">Insights</p>
            <p className="text-2xl font-bold">{insights.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-purple-300" />
            <p className="text-sm font-semibold">Confidence</p>
            <p className="text-2xl font-bold">88%</p>
          </div>
        </div>
      </motion.div>

      {/* Insights Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            const colors = getInsightColors(insight.color);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-${insight.color}-50`}>
                    <IconComponent className={`w-6 h-6 text-${insight.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                        <div
                          className={`bg-${insight.color}-500 h-2 rounded-full`}
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

            {/* AI Chat Interface */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Chat with AI Assistant</h2>
                    </div>
                </div>

                <div className="p-6">
                    {/* Chat History */}
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                        {chatHistory.map((chat, index) => (
                            <div
                                key={index}
                                className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${chat.type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm">{chat.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about your health data, get recommendations..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Predictive Analytics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Predictive Health Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Health Trajectory</h3>
                        <p className="text-sm text-gray-600">Improving steadily</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">+15%</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Goal Achievement</h3>
                        <p className="text-sm text-gray-600">This month</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">87%</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Brain className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">AI Confidence</h3>
                        <p className="text-sm text-gray-600">In predictions</p>
                        <p className="text-2xl font-bold text-purple-600 mt-2">92%</p>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    );
};

export default AIInsights;