import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Brain, 
  Zap,
  Camera,
  Mic,
  MicOff,
  Image,
  FileText,
  Heart,
  Activity,
  Apple,
  Target,
  Users,
  Sparkles,
  Bot,
  User,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import aiCollaborationService from '../services/aiCollaboration';

const ChatGPTCollaboration = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionType, setSessionType] = useState('health_coaching');
  const [isTyping, setIsTyping] = useState(false);
  const [multiAIMode, setMultiAIMode] = useState(false);
  const messagesEndRef = useRef(null);

  const sessionTypes = [
    { id: 'health_coaching', name: 'General Health Coach', icon: Heart, color: 'red' },
    { id: 'nutrition_analysis', name: 'Nutrition Expert', icon: Apple, color: 'green' },
    { id: 'fitness_planning', name: 'Fitness Trainer', icon: Activity, color: 'blue' },
    { id: 'mental_wellness', name: 'Wellness Coach', icon: Brain, color: 'purple' },
    { id: 'medical_insights', name: 'Medical Assistant', icon: FileText, color: 'orange' }
  ];

  useEffect(() => {
    initializeChat();
  }, [sessionType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const newSessionId = await aiCollaborationService.initializeSession(user?.id || 'demo-user', sessionType);
      setSessionId(newSessionId);
      
      // Add welcome message
      const welcomeMessages = {
        health_coaching: "Hello! I'm ChatGPT, your AI health coach integrated with WellSense AI. I have access to your health data and I'm here to provide personalized guidance. How can I help you today?",
        nutrition_analysis: "Hi! I'm your AI nutrition expert powered by ChatGPT. I can analyze your meals, create meal plans, and provide evidence-based nutrition advice. What would you like to know about nutrition?",
        fitness_planning: "Hey there! I'm your AI personal trainer using ChatGPT. I can create workout plans, analyze your form, and help you reach your fitness goals safely. Ready to get moving?",
        mental_wellness: "Hello! I'm your AI wellness coach powered by ChatGPT. I'm here to support your mental health and stress management. How are you feeling today?",
        medical_insights: "Hi! I'm your AI medical assistant using ChatGPT. I can help interpret health data and provide educational information. Remember, I'm not a replacement for professional medical care. How can I assist you?"
      };

      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: welcomeMessages[sessionType],
        timestamp: new Date(),
        source: 'ChatGPT-4'
      }]);

    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare health context
      const healthContext = {
        userProfile: {
          age: 30,
          gender: user?.profile?.gender || 'male',
          activityLevel: 'moderately_active'
        },
        recentMetrics: {
          weight: 75,
          heartRate: 72,
          steps: 9500,
          sleep: 7.5
        },
        goals: ['weight_loss', 'muscle_gain', 'better_sleep'],
        preferences: {
          dietType: 'balanced',
          exerciseType: 'mixed'
        }
      };

      let response;
      
      if (multiAIMode) {
        // Get insights from multiple AI models
        response = await aiCollaborationService.getMultiAIInsights(messageToSend, healthContext);
        
        if (response.success) {
          // Add multiple AI responses
          response.insights.forEach((insight, index) => {
            setTimeout(() => {
              const aiMessage = {
                id: Date.now() + index,
                role: 'assistant',
                content: insight.insight,
                timestamp: new Date(),
                source: insight.source,
                confidence: insight.confidence,
                type: insight.type
              };
              setMessages(prev => [...prev, aiMessage]);
            }, (index + 1) * 1000);
          });

          // Add consensus
          if (response.consensus) {
            setTimeout(() => {
              const consensusMessage = {
                id: Date.now() + 100,
                role: 'assistant',
                content: `**AI Consensus:** ${response.consensus.summary}`,
                timestamp: new Date(),
                source: 'Multi-AI Analysis',
                confidence: response.consensus.confidence,
                type: 'consensus'
              };
              setMessages(prev => [...prev, consensusMessage]);
            }, (response.insights.length + 1) * 1000);
          }
        }
      } else {
        // Single ChatGPT response
        response = await aiCollaborationService.sendMessage(sessionId, messageToSend, healthContext);
        
        if (response.success) {
          const aiMessage = {
            id: Date.now(),
            role: 'assistant',
            content: response.response,
            timestamp: new Date(),
            source: 'ChatGPT-4',
            usage: response.usage
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          const errorMessage = {
            id: Date.now(),
            role: 'assistant',
            content: response.fallbackResponse || "I'm having trouble right now, but I'm here to help! Please try again.",
            timestamp: new Date(),
            source: 'Fallback System',
            isError: true
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false);
      setInputMessage("I've been feeling tired lately despite getting good sleep. Any suggestions?");
    }, 3000);
  };

  const uploadImage = () => {
    // Simulate image upload
    const imageMessage = {
      id: Date.now(),
      role: 'user',
      content: "I've uploaded an image of my meal for analysis.",
      timestamp: new Date(),
      hasImage: true,
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop'
    };
    
    setMessages(prev => [...prev, imageMessage]);
    
    // Simulate AI image analysis response
    setTimeout(() => {
      const analysisMessage = {
        id: Date.now(),
        role: 'assistant',
        content: "Great meal choice! I can see grilled chicken, quinoa, and steamed vegetables. This provides approximately 450 calories with excellent macro balance: 35g protein, 40g carbs, 12g fat. The preparation methods are healthy, and the portion sizes look appropriate for your goals. Consider adding a small amount of healthy fats like avocado for better satiety.",
        timestamp: new Date(),
        source: 'ChatGPT Vision',
        type: 'image_analysis'
      };
      setMessages(prev => [...prev, analysisMessage]);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-2">
          <Bot className="w-8 h-8" />
          <h1 className="text-2xl font-bold">ChatGPT AI Collaboration</h1>
        </div>
        <p className="text-green-100">Advanced AI health coaching powered by OpenAI ChatGPT integration</p>
      </motion.div>

      {/* Session Type Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Choose Your AI Specialist</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {sessionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSessionType(type.id)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                sessionType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50`
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                sessionType === type.id ? `text-${type.color}-600` : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                sessionType === type.id ? `text-${type.color}-900` : 'text-gray-700'
              }`}>
                {type.name}
              </span>
            </button>
          ))}
        </div>

        {/* Multi-AI Mode Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="multiAI"
              checked={multiAIMode}
              onChange={(e) => setMultiAIMode(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="multiAI" className="text-sm font-medium text-gray-700">
              Multi-AI Analysis Mode
            </label>
          </div>
          <span className="text-xs text-gray-500">
            Get insights from multiple AI specialists simultaneously
          </span>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {sessionTypes.find(t => t.id === sessionType)?.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Powered by ChatGPT-4 {multiAIMode && '+ Multi-AI'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-xs font-medium opacity-75">
                        {message.source || 'ChatGPT-4'}
                      </span>
                      {message.confidence && (
                        <span className="text-xs opacity-75">
                          ({Math.round(message.confidence * 100)}% confidence)
                        </span>
                      )}
                    </div>
                  )}
                  
                  {message.hasImage && (
                    <img 
                      src={message.imageUrl} 
                      alt="Uploaded meal"
                      className="w-full rounded-lg mb-2"
                    />
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.usage && (
                      <span>{message.usage.total_tokens} tokens</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-gray-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-600">ChatGPT is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <button
                onClick={uploadImage}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Upload image for analysis"
              >
                <Camera className="w-5 h-5" />
              </button>
              
              <button
                onClick={startVoiceRecording}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                title="Voice input"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask your AI ${sessionTypes.find(t => t.id === sessionType)?.name.toLowerCase()} anything...`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                disabled={isTyping}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {isRecording && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm">Recording... Speak now</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick AI Consultations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setInputMessage("Analyze my recent weight loss progress and suggest improvements")}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-semibold text-green-900">Progress Analysis</h4>
            <p className="text-sm text-green-700">Get AI insights on your health journey</p>
          </button>

          <button
            onClick={() => setInputMessage("Create a personalized meal plan for this week based on my goals")}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <Apple className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-semibold text-blue-900">Meal Planning</h4>
            <p className="text-sm text-blue-700">Get personalized nutrition guidance</p>
          </button>

          <button
            onClick={() => setInputMessage("Design a workout routine that fits my schedule and fitness level")}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <Activity className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-semibold text-purple-900">Workout Planning</h4>
            <p className="text-sm text-purple-700">Get AI-designed exercise routines</p>
          </button>

          <button
            onClick={() => setInputMessage("Help me improve my sleep quality and establish better bedtime habits")}
            className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left"
          >
            <Clock className="w-6 h-6 text-indigo-600 mb-2" />
            <h4 className="font-semibold text-indigo-900">Sleep Optimization</h4>
            <p className="text-sm text-indigo-700">Get AI sleep coaching and tips</p>
          </button>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">ChatGPT AI Capabilities</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Natural Conversation</h4>
            <p className="text-sm text-gray-600">Chat naturally about health topics</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Image Analysis</h4>
            <p className="text-sm text-gray-600">Upload food photos for instant analysis</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Personalized Advice</h4>
            <p className="text-sm text-gray-600">Tailored recommendations based on your data</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Multi-AI Insights</h4>
            <p className="text-sm text-gray-600">Combine multiple AI perspectives</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPTCollaboration;