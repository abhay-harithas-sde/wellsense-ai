import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  Image, 
  Brain, 
  Activity,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Upload
} from 'lucide-react';
import openaiClient from '../../services/openaiClient';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const OpenAIDemo = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [healthStatus, setHealthStatus] = useState(null);
  const [userHealthData, setUserHealthData] = useState(null);
  const [comprehensiveData, setComprehensiveData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkOpenAIConnection();
    loadComprehensiveUserData();
  }, [user]);

  // Load comprehensive user data from all sources
  const loadComprehensiveUserData = async () => {
    try {
      console.log('📊 Loading comprehensive user data...');
      
      const [healthRecords, weightRecords, goals] = await Promise.all([
        apiService.getHealthRecords().catch(() => []),
        apiService.getWeightRecords().catch(() => []),
        apiService.getGoals().catch(() => [])
      ]);

      const latestHealth = healthRecords && healthRecords.length > 0 ? healthRecords[0] : null;
      const latestWeight = weightRecords && weightRecords.length > 0 ? weightRecords[0] : null;
      const activeGoals = goals ? goals.filter(g => g.status === 'ACTIVE') : [];

      const comprehensiveProfile = {
        // User Profile
        profile: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
          firstName: user?.firstName,
          age: user?.age || calculateAge(user?.dateOfBirth),
          gender: user?.gender,
          email: user?.email,
          location: user?.location,
          bio: user?.bio
        },
        
        // Physical Metrics
        physical: {
          weight: user?.weight || latestWeight?.weightKg || latestHealth?.weight,
          height: user?.heightCm || user?.height,
          bmi: user?.bmi || calculateBMI(user?.weight || latestWeight?.weightKg, user?.heightCm),
          bmiCategory: user?.bmiCategory || getBMICategory(user?.bmi),
          bodyFat: latestWeight?.bodyFatPercentage,
          muscleMass: latestWeight?.muscleMass,
          waterPercentage: latestWeight?.waterPercentage
        },
        
        // Vital Signs (Latest)
        vitals: latestHealth ? {
          heartRate: latestHealth.heartRate,
          bloodPressure: {
            systolic: latestHealth.bloodPressureSystolic,
            diastolic: latestHealth.bloodPressureDiastolic
          },
          temperature: latestHealth.temperature,
          oxygenSaturation: latestHealth.oxygenSaturation,
          bloodSugar: latestHealth.bloodSugar
        } : null,
        
        // Mental & Lifestyle
        lifestyle: latestHealth ? {
          mood: latestHealth.mood,
          energyLevel: latestHealth.energyLevel,
          sleepHours: latestHealth.sleepHours,
          sleepQuality: latestHealth.sleepQuality,
          symptoms: latestHealth.symptoms || [],
          stressLevel: latestHealth.stress
        } : null,
        
        // Goals
        goals: activeGoals.map(g => ({
          title: g.title,
          category: g.category,
          targetValue: g.targetValue,
          currentValue: g.currentValue,
          targetDate: g.targetDate,
          progress: g.currentValue && g.targetValue ? 
            ((g.currentValue / g.targetValue) * 100).toFixed(1) : 0
        })),
        
        // Health History
        history: {
          totalHealthRecords: healthRecords?.length || 0,
          totalWeightRecords: weightRecords?.length || 0,
          weightTrend: calculateWeightTrend(weightRecords),
          recentSymptoms: getRecentSymptoms(healthRecords)
        },
        
        // Preferences
        preferences: {
          units: user?.preferredUnits || 'METRIC',
          timezone: user?.timezone,
          language: user?.language
        },
        
        // Calculated Insights
        insights: {
          healthScore: calculateHealthScore(latestHealth, user),
          riskFactors: identifyRiskFactors(latestHealth, user),
          recommendations: generateQuickRecommendations(latestHealth, user, activeGoals)
        }
      };

      setComprehensiveData(comprehensiveProfile);
      setUserHealthData(latestHealth);
      
      console.log('✅ Comprehensive data loaded:', {
        profile: !!comprehensiveProfile.profile.name,
        physical: !!comprehensiveProfile.physical.weight,
        vitals: !!comprehensiveProfile.vitals,
        goals: comprehensiveProfile.goals.length,
        history: comprehensiveProfile.history.totalHealthRecords
      });
      
    } catch (error) {
      console.error('❌ Failed to load comprehensive data:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkOpenAIConnection = async () => {
    setIsLoading(true);
    try {
      const status = await openaiClient.healthCheck();
      setHealthStatus(status);
      setIsConnected(status.available);
    } catch (error) {
      console.error('Health check failed:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = async () => {
    setIsLoading(true);
    try {
      const result = await openaiClient.startChatSession('COACHING');
      if (result.success) {
        setCurrentSession(result.sessionId);
        setMessages(result.messages || []);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      await openaiClient.streamMessage(
        currentSession,
        inputMessage,
        // onChunk
        (chunk) => {
          setStreamingMessage(prev => prev + chunk);
        },
        // onComplete
        (fullResponse, sessionId) => {
          const aiMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
          setStreamingMessage('');
          setIsStreaming(false);
        },
        // onError
        (error) => {
          console.error('Streaming error:', error);
          setIsStreaming(false);
          setStreamingMessage('');
          // Fallback to regular message
          handleFallbackMessage(inputMessage);
        },
        // options with comprehensive data
        {
          comprehensiveData: comprehensiveData,
          context: {
            timestamp: new Date().toISOString(),
            messageCount: messages.length
          }
        }
      );
    } catch (error) {
      console.error('Send message error:', error);
      setIsStreaming(false);
      handleFallbackMessage(inputMessage);
    }
  };

  const handleFallbackMessage = async (message) => {
    try {
      const result = await openaiClient.sendMessage(currentSession, message, {
        includeHealthData: true,
        comprehensiveData: comprehensiveData,
        context: {
          timestamp: new Date().toISOString(),
          messageCount: messages.length
        }
      });
      if (result.success) {
        const aiMessage = {
          role: 'assistant',
          content: result.message.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Fallback message failed:', error);
    }
  };

  const analyzeFoodImage = async () => {
    if (!currentSession) {
      alert('Please start a chat session first');
      return;
    }

    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setSelectedImage(base64Image);

        // Send to AI for analysis
        const result = await openaiClient.analyzeFoodImage(
          base64Image,
          'Analyze this food image and provide detailed nutritional information including calories, macros, and health recommendations.'
        );
        
        if (result.success) {
          const analysisMessage = {
            role: 'assistant',
            content: `🍽️ **Food Analysis Results:**\n\n${result.analysis}\n\n**Nutritional Info:**\n- Calories: ${result.nutritionalInfo?.calories || 'Estimated based on image'}\n- Protein: ${result.nutritionalInfo?.protein || 'N/A'}g\n- Carbs: ${result.nutritionalInfo?.carbs || 'N/A'}g\n- Fat: ${result.nutritionalInfo?.fat || 'N/A'}g\n\n💡 **Recommendations:**\nBased on your profile, this meal ${result.analysis.includes('healthy') ? 'aligns well' : 'could be optimized'} with your health goals.`,
            timestamp: new Date(),
            type: 'food_analysis',
            image: base64Image
          };
          setMessages(prev => [...prev, analysisMessage]);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Food analysis failed:', error);
      alert('Failed to analyze food image. Please try again.');
    } finally {
      setIsLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const generateHealthPlan = async () => {
    if (!currentSession) {
      alert('Please start a chat session first');
      return;
    }

    setIsLoading(true);
    try {
      // Use real user data
      const userProfile = {
        age: user?.age || calculateAge(user?.dateOfBirth) || 30,
        gender: user?.gender?.toLowerCase() || 'not specified',
        weight: user?.weight || userHealthData?.weight || 70,
        height: user?.heightCm || user?.height || 170,
        activityLevel: 'moderately_active', // Could be added to user profile
        bmi: user?.bmi || calculateBMI(user?.weight, user?.heightCm),
        currentHealth: {
          heartRate: userHealthData?.heartRate,
          bloodPressure: userHealthData?.bloodPressureSystolic ? 
            `${userHealthData.bloodPressureSystolic}/${userHealthData.bloodPressureDiastolic}` : null,
          recentSymptoms: userHealthData?.symptoms || []
        }
      };

      // Determine health goals based on BMI and user data
      const healthGoals = [];
      if (userProfile.bmi > 25) healthGoals.push('weight_loss');
      if (userProfile.bmi < 18.5) healthGoals.push('weight_gain');
      healthGoals.push('fitness', 'nutrition');

      const result = await openaiClient.generateHealthPlan(
        userProfile,
        healthGoals,
        { 
          dietType: 'balanced', 
          exerciseType: 'mixed',
          includeCurrentHealth: true
        }
      );

      if (result.success) {
        const planMessage = {
          role: 'assistant',
          content: `🎯 **Personalized Health Plan for ${user?.firstName || 'You'}:**\n\n${result.plan}\n\n📊 **Your Current Stats:**\n- Age: ${userProfile.age} years\n- Weight: ${userProfile.weight}kg\n- Height: ${userProfile.height}cm\n- BMI: ${userProfile.bmi?.toFixed(1) || 'N/A'}\n\n💪 This plan is customized based on your real health data and goals.`,
          timestamp: new Date(),
          type: 'health_plan'
        };
        setMessages(prev => [...prev, planMessage]);
      }
    } catch (error) {
      console.error('Health plan generation failed:', error);
      alert('Failed to generate health plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
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

  const getBMICategory = (bmi) => {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const calculateWeightTrend = (weightRecords) => {
    if (!weightRecords || weightRecords.length < 2) return 'stable';
    const recent = weightRecords.slice(0, 5);
    const oldest = recent[recent.length - 1]?.weightKg;
    const newest = recent[0]?.weightKg;
    if (!oldest || !newest) return 'stable';
    const diff = newest - oldest;
    if (diff > 1) return 'increasing';
    if (diff < -1) return 'decreasing';
    return 'stable';
  };

  const getRecentSymptoms = (healthRecords) => {
    if (!healthRecords || healthRecords.length === 0) return [];
    const recent = healthRecords.slice(0, 5);
    const symptoms = new Set();
    recent.forEach(record => {
      if (record.symptoms && Array.isArray(record.symptoms)) {
        record.symptoms.forEach(s => symptoms.add(s));
      }
    });
    return Array.from(symptoms);
  };

  const calculateHealthScore = (latestHealth, user) => {
    let score = 100;
    
    // BMI check
    const bmi = user?.bmi || calculateBMI(user?.weight, user?.heightCm);
    if (bmi) {
      if (bmi < 18.5 || bmi > 30) score -= 15;
      else if (bmi > 25) score -= 10;
    }
    
    // Vital signs check
    if (latestHealth) {
      if (latestHealth.bloodPressureSystolic > 140 || latestHealth.bloodPressureDiastolic > 90) score -= 10;
      if (latestHealth.heartRate > 100 || latestHealth.heartRate < 60) score -= 5;
      if (latestHealth.sleepHours < 6) score -= 10;
      if (latestHealth.mood < 5) score -= 5;
      if (latestHealth.energyLevel < 5) score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const identifyRiskFactors = (latestHealth, user) => {
    const risks = [];
    
    const bmi = user?.bmi || calculateBMI(user?.weight, user?.heightCm);
    if (bmi > 30) risks.push('High BMI (Obesity)');
    else if (bmi < 18.5) risks.push('Low BMI (Underweight)');
    
    if (latestHealth) {
      if (latestHealth.bloodPressureSystolic > 140) risks.push('High Blood Pressure');
      if (latestHealth.bloodSugar > 126) risks.push('High Blood Sugar');
      if (latestHealth.sleepHours < 6) risks.push('Insufficient Sleep');
      if (latestHealth.symptoms && latestHealth.symptoms.length > 2) risks.push('Multiple Symptoms');
    }
    
    return risks;
  };

  const generateQuickRecommendations = (latestHealth, user, goals) => {
    const recommendations = [];
    
    const bmi = user?.bmi || calculateBMI(user?.weight, user?.heightCm);
    if (bmi > 25) recommendations.push('Focus on weight management through balanced diet');
    if (bmi < 18.5) recommendations.push('Increase caloric intake with nutrient-dense foods');
    
    if (latestHealth) {
      if (latestHealth.sleepHours < 7) recommendations.push('Aim for 7-9 hours of sleep per night');
      if (latestHealth.mood < 6) recommendations.push('Consider stress management techniques');
      if (!latestHealth.heartRate || latestHealth.heartRate > 80) recommendations.push('Regular cardio exercise recommended');
    }
    
    if (goals && goals.length === 0) recommendations.push('Set specific health goals to track progress');
    
    return recommendations.slice(0, 3); // Top 3 recommendations
  };

  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg mb-6">
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      ) : isConnected ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-500" />
      )}
      <div>
        <p className="font-medium">
          WellSense AI Status: {isLoading ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
        </p>
        {healthStatus && (
          <p className="text-sm text-gray-600">
            {healthStatus.isDemo ? 'Running in demo mode' : `Models: ${healthStatus.models?.length || 0} available`}
          </p>
        )}
      </div>
      <button
        onClick={checkOpenAIConnection}
        className="ml-auto px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        disabled={isLoading}
      >
        Refresh
      </button>
    </div>
  );

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        message.role === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {message.type === 'food_analysis' && (
          <div className="flex items-center mb-2">
            <Image className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium">Food Analysis</span>
          </div>
        )}
        {message.type === 'health_plan' && (
          <div className="flex items-center mb-2">
            <Activity className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium">Health Plan</span>
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs opacity-70 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );

  const StreamingBubble = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
        <div className="flex items-center mb-2">
          <Brain className="w-4 h-4 mr-2 animate-pulse" />
          <span className="text-xs font-medium">AI is thinking...</span>
        </div>
        <div className="whitespace-pre-wrap">{streamingMessage}</div>
        {!streamingMessage && (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Brain className="w-8 h-8 mr-3" />
                WellSense AI Chat
              </h2>
              <p className="text-blue-100 mt-2">
                Your AI-powered health coaching companion
              </p>
            </div>
            <Zap className="w-12 h-12 text-yellow-300" />
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-6 border-b">
          <ConnectionStatus />
        </div>

        {/* Actions */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={startNewSession}
              disabled={!isConnected || isLoading}
              className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Chat Session
            </button>
            
            <button
              onClick={analyzeFoodImage}
              disabled={!currentSession || isLoading}
              className="flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 mr-2" />
              Analyze Food
            </button>
            
            <button
              onClick={generateHealthPlan}
              disabled={!currentSession || isLoading}
              className="flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Activity className="w-5 h-5 mr-2" />
              Generate Health Plan
            </button>
          </div>
          
          {/* Hidden file input for food image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Chat Interface */}
        <div className="h-96 overflow-y-auto p-6">
          {messages.length === 0 && !currentSession ? (
            <div className="text-center text-gray-500 mt-20">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Start a chat session to begin</p>
              <p className="text-sm">Experience real-time AI health coaching</p>
            </div>
          ) : (
            <div>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
              </AnimatePresence>
              
              {isStreaming && <StreamingBubble />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentSession && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me about your health, nutrition, or fitness..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isStreaming}
              />
              
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isStreaming}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Session: {currentSession?.slice(-8)}</span>
                <span>Messages: {messages.length}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-gray-400" />
                <span className="text-xs">Voice input coming soon</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Integration Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          🚀 WellSense AI Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-blue-700">Real-time chat with GPT-4</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-blue-700">Streaming responses</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-blue-700">Food image analysis</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-blue-700">Personalized health plans</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-blue-700">Nutrition advice</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-blue-700">Workout recommendations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAIDemo;