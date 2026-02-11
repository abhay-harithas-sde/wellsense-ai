import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Heart,
  Award,
  Clock,
  Star,
  ChevronRight,
  Lightbulb,
  Target,
  Users,
  Apple,
  Activity,
  TrendingUp,
  Calendar,
  Camera,
  Mic,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Upload,
  Loader2
} from 'lucide-react';
import openaiClient from '../../services/openaiClient';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const NutritionistChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [nutritionistProfile, setNutritionistProfile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [userHealthData, setUserHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize nutritionist profile and session
  useEffect(() => {
    initializeSession();
    loadUserHealthData();
  }, []);

  // Load user's health data for personalized responses
  const loadUserHealthData = async () => {
    try {
      const response = await apiService.getHealthRecords();
      if (response && response.length > 0) {
        setUserHealthData(response[0]); // Get latest health record
      }
    } catch (error) {
      console.error('Failed to load health data:', error);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSession = async () => {
    // Set nutritionist profile
    setNutritionistProfile({
      name: "WellSense AI Nutrition Coach",
      title: "AI-Powered Nutritionist & Wellness Coach",
      experience: "Powered by GPT-4",
      specialties: ["Food Analysis", "Meal Planning", "Health Plans", "Dietary Advice"],
      rating: 4.9,
      consultations: 1250,
      avatar: "🤖",
      status: "online"
    });

    try {
      // Create real OpenAI chat session
      const result = await openaiClient.startChatSession('nutrition_coaching');
      if (result.success) {
        setCurrentSession({
          id: result.sessionId,
          startTime: new Date(),
          type: 'nutrition_consultation'
        });

        // Welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'nutritionist',
          content: `Hello ${user?.firstName || 'there'}! I'm your AI Nutrition Coach powered by advanced AI. I can help you with:\n\n🍽️ **Food Analysis** - Upload food images for nutritional insights\n💪 **Health Plans** - Get personalized nutrition and fitness plans\n🎯 **Dietary Advice** - Ask me anything about nutrition\n\nWhat would you like to explore today?`,
          timestamp: new Date(),
          suggestions: [
            "Analyze my food",
            "Create a health plan",
            "Nutrition advice",
            "Meal planning tips"
          ]
        };

        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      // Fallback to basic session
      setCurrentSession({
        id: `nutrition-session-${Date.now()}`,
        startTime: new Date(),
        type: 'nutrition_consultation'
      });
    }
  };

  const nutritionistResponses = [
    {
      keywords: ['meal plan', 'diet plan', 'planning'],
      response: "I'd be happy to help you create a personalized meal plan! To get started, could you tell me about your current goals? Are you looking to lose weight, gain muscle, manage a health condition, or maintain your current weight?"
    },
    {
      keywords: ['weight loss', 'lose weight', 'diet'],
      response: "Weight loss is about creating a sustainable caloric deficit while maintaining proper nutrition. I recommend focusing on whole foods, portion control, and regular meal timing. What's your current activity level and any dietary restrictions I should know about?"
    },
    {
      keywords: ['protein', 'muscle', 'workout'],
      response: "Protein is essential for muscle building and recovery! I generally recommend 0.8-1.2g per kg of body weight for active individuals. Great sources include lean meats, fish, eggs, legumes, and dairy. Are you following a specific workout routine?"
    },
    {
      keywords: ['calories', 'calorie', 'intake'],
      response: "Calorie needs vary based on age, gender, activity level, and goals. For most adults, it ranges from 1,800-2,400 calories daily. I can help you calculate your specific needs. What are your current stats and activity level?"
    },
    {
      keywords: ['supplements', 'vitamins', 'minerals'],
      response: "Supplements can be helpful, but food-first is always my approach! Common beneficial supplements include Vitamin D, B12 (especially for vegetarians), and Omega-3s. What specific supplements are you considering or currently taking?"
    },
    {
      keywords: ['vegetarian', 'vegan', 'plant-based'],
      response: "Plant-based diets can be incredibly healthy! Key nutrients to focus on include protein combining, B12, iron, zinc, and omega-3s. I can help you create a balanced plant-based meal plan. How long have you been following this lifestyle?"
    },
    {
      keywords: ['diabetes', 'blood sugar', 'glucose'],
      response: "Managing blood sugar through nutrition is crucial for diabetes care. Focus on complex carbs, fiber-rich foods, and consistent meal timing. I always recommend working with your healthcare team. Are you Type 1 or Type 2, and are you on any medications?"
    },
    {
      keywords: ['recipes', 'cooking', 'meal prep'],
      response: "I love helping with healthy recipes and meal prep! Batch cooking proteins, pre-cutting vegetables, and having healthy snacks ready are game-changers. What type of cuisine do you enjoy, and how much time can you dedicate to meal prep weekly?"
    },
    {
      keywords: ['snacks', 'snacking', 'hungry'],
      response: "Smart snacking can actually support your goals! I recommend combining protein with fiber - like apple with almond butter, Greek yogurt with berries, or hummus with vegetables. What times of day do you find yourself most hungry?"
    },
    {
      keywords: ['water', 'hydration', 'drink'],
      response: "Hydration is so important for metabolism, energy, and overall health! Aim for at least 8 glasses daily, more if you're active. Adding lemon, cucumber, or mint can make it more enjoyable. How much water do you typically drink per day?"
    }
  ];

  const generateNutritionistResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check if user wants a health plan
    if (message.includes('health plan') || message.includes('meal plan') || message.includes('fitness plan') || message.includes('create plan')) {
      return await generateHealthPlan();
    }

    // Use real OpenAI for other queries
    try {
      const result = await openaiClient.sendMessage(currentSession.id, userMessage, {
        includeHealthData: true
      });

      if (result.success) {
        return result.message.content;
      }
    } catch (error) {
      console.error('AI response error:', error);
    }

    // Fallback responses
    const message_lower = userMessage.toLowerCase();
    
    // Find matching response based on keywords
    const matchedResponse = nutritionistResponses.find(response =>
      response.keywords.some(keyword => message_lower.includes(keyword))
    );

    if (matchedResponse) {
      return matchedResponse.response;
    }

    // Default responses for general queries
    const defaultResponses = [
      "That's a great question! Let me provide you with personalized advice based on your profile and the latest nutrition science.",
      "I appreciate you bringing this up! Based on current research and your individual needs, here's what I recommend...",
      "Excellent point! Nutrition is very individual. Let me tailor my advice specifically for you.",
      "That's something many people ask about! Let me break this down for you with actionable steps.",
      "Great question! Let me provide you with evidence-based guidance that fits your lifestyle."
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const generateHealthPlan = async () => {
    setIsLoading(true);
    
    try {
      // Use real user data
      const userProfile = {
        age: user?.age || calculateAge(user?.dateOfBirth) || 30,
        gender: user?.gender?.toLowerCase() || 'not specified',
        weight: user?.weight || userHealthData?.weight || 70,
        height: user?.heightCm || user?.height || 170,
        activityLevel: 'moderately_active',
        bmi: user?.bmi || calculateBMI(user?.weight, user?.heightCm),
        currentHealth: {
          heartRate: userHealthData?.heartRate,
          bloodPressure: userHealthData?.bloodPressureSystolic ? 
            `${userHealthData.bloodPressureSystolic}/${userHealthData.bloodPressureDiastolic}` : null,
          recentSymptoms: userHealthData?.symptoms || []
        }
      };

      // Determine health goals based on BMI
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
        return `🎯 **Personalized Health & Nutrition Plan for ${user?.firstName || 'You'}:**\n\n${result.plan}\n\n📊 **Your Current Stats:**\n- Age: ${userProfile.age} years\n- Weight: ${userProfile.weight}kg\n- Height: ${userProfile.height}cm\n- BMI: ${userProfile.bmi?.toFixed(1) || 'N/A'}\n\n💪 This plan is customized based on your real health data and goals. Follow it consistently for best results!`;
      }
    } catch (error) {
      console.error('Health plan generation failed:', error);
      return "I'd be happy to create a personalized health plan for you! To provide the best recommendations, could you tell me more about your current goals and any dietary preferences or restrictions?";
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      // Get AI response
      const responseContent = await generateNutritionistResponse(messageToSend);
      
      const nutritionistResponse = {
        id: Date.now() + 1,
        type: 'nutritionist',
        content: responseContent,
        timestamp: new Date(),
        suggestions: Math.random() > 0.5 ? [
          "Tell me more",
          "Analyze my food",
          "Create a health plan",
          "More tips"
        ] : null
      };

      setMessages(prev => [...prev, nutritionistResponse]);
    } catch (error) {
      console.error('Message error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'nutritionist',
        content: "I apologize for the technical difficulty. Please try asking your question again, or try uploading a food image for analysis!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file for food analysis');
      return;
    }

    setIsLoading(true);
    
    // Show user message
    const fileMessage = {
      id: Date.now(),
      type: 'user',
      content: `📸 Uploaded food image: ${file.name}`,
      timestamp: new Date(),
      fileType: 'image'
    };
    setMessages(prev => [...prev, fileMessage]);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        // Send to AI for real analysis
        const result = await openaiClient.analyzeFoodImage(
          base64Image,
          `Analyze this food image and provide detailed nutritional information including calories, macros (protein, carbs, fat), vitamins, and health recommendations based on the user's profile.`
        );
        
        if (result.success) {
          const analysisMessage = {
            id: Date.now() + 1,
            type: 'nutritionist',
            content: `🍽️ **Food Analysis Results:**\n\n${result.analysis}\n\n**Nutritional Breakdown:**\n- Calories: ${result.nutritionalInfo?.calories || 'Estimated from image'}\n- Protein: ${result.nutritionalInfo?.protein || 'N/A'}g\n- Carbs: ${result.nutritionalInfo?.carbs || 'N/A'}g\n- Fat: ${result.nutritionalInfo?.fat || 'N/A'}g\n\n💡 **Personalized Recommendations:**\n${user?.firstName ? `Based on your profile, ${user.firstName}, ` : ''}this meal ${result.analysis.toLowerCase().includes('healthy') ? 'aligns well' : 'could be optimized'} with your health goals. ${user?.bmi > 25 ? 'Consider portion control for weight management.' : user?.bmi < 18.5 ? 'This looks good - make sure to eat enough throughout the day.' : 'Great choice for maintaining your current health!'}`,
            timestamp: new Date(),
            image: base64Image,
            suggestions: [
              "How can I make this healthier?",
              "What should I eat next?",
              "Create a meal plan",
              "More nutrition tips"
            ]
          };
          setMessages(prev => [...prev, analysisMessage]);
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Food analysis failed:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'nutritionist',
        content: "I apologize, but I encountered an issue analyzing that image. Please try again or ask me any nutrition questions!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }

    // Reset file input
    e.target.value = '';
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      setIsRecording(false);
      const voiceMessage = {
        id: Date.now(),
        type: 'user',
        content: "🎤 Voice message: 'I've been struggling with late-night cravings and would love some advice on healthy evening snacks.'",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, voiceMessage]);

      // Nutritionist response to voice message
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          type: 'nutritionist',
          content: "I heard your concern about late-night cravings - this is so common! Try having a small protein-rich snack 2-3 hours before bed, like Greek yogurt with a few nuts. Also, make sure you're eating enough during the day to prevent evening hunger.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }, 3000);
  };

  const quickActions = [
    { icon: Upload, label: 'Analyze Food', action: () => fileInputRef.current?.click() },
    { icon: Target, label: 'Health Plan', action: () => handleSuggestionClick("Create a personalized health plan for me") },
    { icon: Activity, label: 'Nutrition Advice', action: () => handleSuggestionClick("Give me nutrition advice based on my profile") },
    { icon: Calendar, label: 'Meal Schedule', action: () => handleSuggestionClick("Create a weekly meal schedule for me") }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header with Nutritionist Profile */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-green-200/50 p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl">
              {nutritionistProfile?.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{nutritionistProfile?.name}</h3>
            <p className="text-sm text-gray-600">{nutritionistProfile?.title}</p>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs text-gray-600">{nutritionistProfile?.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-600">{nutritionistProfile?.consultations}+ consultations</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">{nutritionistProfile?.status}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Session: {currentSession?.id?.slice(-8)}</div>
            <div className="text-xs text-gray-500">
              {currentSession?.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="mt-3 flex flex-wrap gap-2">
          {nutritionistProfile?.specialties?.map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`p-2 rounded-full ${
                message.type === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-white text-sm">{nutritionistProfile?.avatar}</span>
                )}
              </div>
              <div className={`p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-green-200/50'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 space-y-1">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                <span className="text-white text-sm">{nutritionistProfile?.avatar}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-green-200/50">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showSuggestions && messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-sm text-gray-600 mb-2">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 p-3 bg-white/60 hover:bg-white/80 rounded-xl border border-green-200/50 transition-all"
              >
                <action.icon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-green-200/50 p-4">
        {isLoading && (
          <div className="mb-2 flex items-center space-x-2 text-green-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analyzing with AI...</span>
          </div>
        )}
        <div className="flex items-end space-x-2">
          {/* File Upload - Food Analysis */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="Upload food image for analysis"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Voice Recording */}
          <button
            onClick={startVoiceRecording}
            disabled={isRecording}
            className={`p-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-100 text-red-600' 
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about nutrition, meal planning, dietary advice..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
          <Info className="w-3 h-3" />
          <span>This is a demo nutritionist chat. For medical advice, consult a healthcare professional.</span>
        </p>
      </div>
    </div>
  );
};

export default NutritionistChat;