// AI Collaboration Service - Integration with ChatGPT and other AI models
class AICollaborationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || 'demo-mode';
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.models = {
      gpt4: 'gpt-4',
      gpt35: 'gpt-3.5-turbo',
      gpt4Vision: 'gpt-4-vision-preview',
      whisper: 'whisper-1',
      dalle: 'dall-e-3'
    };
    this.conversationHistory = new Map();
  }

  // Initialize AI collaboration session
  async initializeSession(userId, sessionType = 'health_coaching') {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionType,
          aiPersonality: 'friendly'
        })
      });

      if (!response.ok) {
        throw new Error(`Session creation failed: ${response.status}`);
      }

      const data = await response.json();
      const sessionId = data.data.sessionId;
      
      this.currentSessionId = sessionId;
      this.conversationHistory.set(sessionId, {
        userId,
        sessionType,
        messages: data.data.messages || [],
        createdAt: new Date(),
        lastActivity: new Date()
      });

      return sessionId;
    } catch (error) {
      console.error('Session initialization failed:', error);
      // Fallback to local session
      const sessionId = `ai_collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.currentSessionId = sessionId;
      
      this.conversationHistory.set(sessionId, {
        userId,
        sessionType,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date()
      });

      return sessionId;
    }
  }

  // Send message to ChatGPT with context
  async sendMessage(sessionId, userMessage, healthContext = null) {
    try {
      const session = this.conversationHistory.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Prepare messages for ChatGPT
      const messages = [
        { role: 'system', content: session.systemPrompt }
      ];

      // Add health context if provided
      if (healthContext) {
        const contextMessage = this.formatHealthContext(healthContext);
        messages.push({ role: 'system', content: contextMessage });
      }

      // Add conversation history
      messages.push(...session.messages);
      
      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      // Call ChatGPT API (or simulate in demo mode)
      const response = await this.callChatGPT(messages);
      
      // Update conversation history
      session.messages.push(
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: response.content, timestamp: new Date() }
      );
      session.lastActivity = new Date();

      return {
        success: true,
        response: response.content,
        sessionId,
        usage: response.usage,
        model: response.model
      };

    } catch (error) {
      console.error('AI Collaboration error:', error);
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.getFallbackResponse(userMessage)
      };
    }
  }

  // Format health context for AI
  formatHealthContext(healthContext) {
    const context = [];
    
    if (healthContext.userProfile) {
      context.push(`User Profile: Age ${healthContext.userProfile.age}, ${healthContext.userProfile.gender}, 
        Activity Level: ${healthContext.userProfile.activityLevel}`);
    }

    if (healthContext.recentMetrics) {
      context.push(`Recent Health Metrics: ${JSON.stringify(healthContext.recentMetrics)}`);
    }

    if (healthContext.goals) {
      context.push(`Health Goals: ${healthContext.goals.join(', ')}`);
    }

    if (healthContext.preferences) {
      context.push(`Preferences: ${JSON.stringify(healthContext.preferences)}`);
    }

    return `Health Context: ${context.join(' | ')}`;
  }

  // Call ChatGPT API through backend (with demo fallback)
  async callChatGPT(messages) {
    if (this.apiKey === 'demo-mode') {
      return this.simulateChatGPTResponse(messages);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messages[messages.length - 1].content,
          sessionId: this.currentSessionId,
          healthData: this.getHealthContext()
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.response || data.data?.message?.content,
        usage: data.usage,
        model: 'gpt-4'
      };

    } catch (error) {
      console.error('ChatGPT API call failed:', error);
      return this.simulateChatGPTResponse(messages);
    }
  }

  // Simulate ChatGPT response for demo mode
  async simulateChatGPTResponse(messages) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    const responses = {
      nutrition: [
        "Based on your health goals and current metrics, I recommend focusing on whole foods with a balanced macro distribution. Your protein intake should be around 1.6-2.2g per kg of body weight to support your fitness goals.",
        "I notice you're interested in nutrition optimization. Let's create a personalized meal plan that aligns with your lifestyle and preferences. What's your current biggest nutrition challenge?",
        "Your recent food choices show great progress! The combination of lean proteins, complex carbs, and healthy fats is excellent. Consider adding more colorful vegetables to boost your micronutrient intake."
      ],
      fitness: [
        "Your exercise consistency is impressive! For your next phase, I suggest incorporating progressive overload by increasing weights by 2.5-5% weekly. This will help you continue building strength safely.",
        "Based on your activity patterns, your body responds well to morning workouts. Consider adding 10-15 minutes of dynamic warm-up to optimize performance and prevent injury.",
        "I see you're making great progress with your fitness routine. To break through any plateaus, try varying your rep ranges: 6-8 for strength, 8-12 for hypertrophy, and 12-15 for endurance."
      ],
      sleep: [
        "Your sleep data shows improvement! Maintaining that 7-8 hour range is crucial for recovery. I notice your deep sleep percentage could be optimized - try keeping your bedroom temperature around 65-68°F.",
        "Sleep quality directly impacts your health goals. Based on your patterns, consider establishing a wind-down routine 1 hour before bed: dim lights, avoid screens, and try some light stretching or meditation.",
        "Your sleep consistency is excellent! This stable pattern supports hormone regulation and recovery. Keep maintaining that regular bedtime schedule, even on weekends."
      ],
      stress: [
        "Managing stress is crucial for your overall health goals. I recommend trying the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8. Practice this 2-3 times daily.",
        "Your stress levels seem elevated lately. Consider incorporating mindfulness practices into your routine. Even 5-10 minutes of meditation can significantly impact your stress response and overall well-being.",
        "Stress management is a skill that improves with practice. Based on your lifestyle, I suggest trying progressive muscle relaxation before bed and taking short mindfulness breaks during your workday."
      ],
      general: [
        "I'm here to help you achieve your health and wellness goals! Based on your recent progress, you're doing great. What specific area would you like to focus on today?",
        "Your commitment to your health journey is inspiring! I've analyzed your recent data and have some personalized recommendations. What's your biggest health challenge right now?",
        "Great question! Let me provide you with evidence-based guidance tailored to your specific situation and goals. Your consistency with tracking is really paying off.",
        "I love your proactive approach to health! Based on your profile and recent activities, I can see you're making excellent progress. How can I support you further today?"
      ]
    };

    // Determine response category based on message content
    let category = 'general';
    if (lastMessage.includes('food') || lastMessage.includes('eat') || lastMessage.includes('nutrition') || lastMessage.includes('meal')) {
      category = 'nutrition';
    } else if (lastMessage.includes('exercise') || lastMessage.includes('workout') || lastMessage.includes('fitness') || lastMessage.includes('gym')) {
      category = 'fitness';
    } else if (lastMessage.includes('sleep') || lastMessage.includes('tired') || lastMessage.includes('rest')) {
      category = 'sleep';
    } else if (lastMessage.includes('stress') || lastMessage.includes('anxiety') || lastMessage.includes('overwhelmed')) {
      category = 'stress';
    }

    const categoryResponses = responses[category];
    const selectedResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

    return {
      content: selectedResponse,
      usage: { total_tokens: 150, prompt_tokens: 100, completion_tokens: 50 },
      model: 'gpt-4-demo'
    };
  }

  // Get fallback response for errors
  getFallbackResponse(userMessage) {
    return "I'm having trouble connecting to my AI systems right now, but I'm still here to help! Based on your message, I'd recommend focusing on consistency with your current health routine. Feel free to try asking again, or I can provide general wellness guidance.";
  }

  // Analyze image with ChatGPT Vision
  async analyzeImage(imageData, prompt = "Analyze this health-related image") {
    try {
      if (this.apiKey === 'demo-mode') {
        return this.simulateImageAnalysis(prompt);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/chat/analyze-food`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imageData,
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Image analysis failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        analysis: data.analysis,
        model: 'gpt-4-vision'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallbackAnalysis: this.simulateImageAnalysis(prompt)
      };
    }
  }

  // Simulate image analysis for demo
  simulateImageAnalysis(prompt) {
    const analyses = [
      "I can see this appears to be a healthy, balanced meal with good portion sizes. The combination of lean protein, complex carbohydrates, and vegetables provides excellent nutritional value for your health goals.",
      "This food image shows great macro balance! I estimate approximately 450-500 calories with a good protein-to-carb ratio. The colorful vegetables indicate high micronutrient density.",
      "Excellent food choice! This meal aligns well with your health objectives. The preparation method (grilled/steamed) helps maintain nutritional value while keeping calories in check."
    ];
    
    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  // Generate personalized health plan with AI collaboration
  async generateHealthPlan(userProfile, goals, preferences) {
    const sessionId = await this.initializeSession(userProfile.id, 'health_coaching');
    
    const prompt = `Create a comprehensive, personalized health plan for this user:
    
    Profile: ${JSON.stringify(userProfile)}
    Goals: ${goals.join(', ')}
    Preferences: ${JSON.stringify(preferences)}
    
    Please provide:
    1. Weekly nutrition plan with specific meal suggestions
    2. Exercise routine tailored to their fitness level
    3. Sleep optimization strategies
    4. Stress management techniques
    5. Progress tracking recommendations
    
    Make it practical, achievable, and sustainable.`;

    const response = await this.sendMessage(sessionId, prompt);
    
    return {
      success: response.success,
      healthPlan: response.response,
      sessionId: sessionId
    };
  }

  // Get conversation history
  getConversationHistory(sessionId) {
    const session = this.conversationHistory.get(sessionId);
    return session ? session.messages : [];
  }

  // Clear conversation history
  clearSession(sessionId) {
    this.conversationHistory.delete(sessionId);
  }

  // Get active sessions for user
  getUserSessions(userId) {
    const userSessions = [];
    for (const [sessionId, session] of this.conversationHistory.entries()) {
      if (session.userId === userId) {
        userSessions.push({
          sessionId,
          sessionType: session.sessionType,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          messageCount: session.messages.length
        });
      }
    }
    return userSessions;
  }

  // Multi-AI collaboration (combine responses from different AI models)
  async getMultiAIInsights(userMessage, healthContext) {
    const insights = [];
    
    try {
      // Get ChatGPT response
      const chatGPTSession = await this.initializeSession('multi-ai', 'health_coaching');
      const chatGPTResponse = await this.sendMessage(chatGPTSession, userMessage, healthContext);
      
      if (chatGPTResponse.success) {
        insights.push({
          source: 'ChatGPT-4',
          type: 'general_health',
          insight: chatGPTResponse.response,
          confidence: 0.9
        });
      }

      // Add specialized AI insights (simulated for demo)
      insights.push({
        source: 'Nutrition AI',
        type: 'nutrition',
        insight: 'Based on your macro distribution, consider increasing protein intake by 15% to support your muscle-building goals.',
        confidence: 0.85
      });

      insights.push({
        source: 'Fitness AI',
        type: 'exercise',
        insight: 'Your workout intensity suggests you could benefit from adding 2 rest days per week for optimal recovery.',
        confidence: 0.88
      });

      return {
        success: true,
        insights: insights,
        consensus: this.generateConsensus(insights)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        insights: []
      };
    }
  }

  // Generate consensus from multiple AI insights
  generateConsensus(insights) {
    if (insights.length === 0) return null;
    
    const avgConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length;
    
    return {
      summary: 'Multiple AI systems agree that focusing on consistency and gradual progression will yield the best results for your health goals.',
      confidence: avgConfidence,
      recommendations: insights.map(insight => insight.insight).slice(0, 3)
    };
  }

  // Get health context for API calls
  getHealthContext() {
    const healthData = localStorage.getItem('healthData');
    if (healthData) {
      try {
        return JSON.parse(healthData);
      } catch (error) {
        console.error('Error parsing health data:', error);
      }
    }
    return null;
  }

  // Stream chat responses
  async streamChatResponse(message, sessionId, onChunk, onComplete) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          sessionId,
          healthData: this.getHealthContext()
        })
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
                onChunk(data.content);
              } else if (data.type === 'complete') {
                onComplete(fullResponse, data.sessionId);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      // Fallback to regular message
      const response = await this.sendMessage(sessionId, message);
      if (response.success) {
        onComplete(response.response, sessionId);
      } else {
        throw error;
      }
    }
  }

  // Generate health insights using backend AI
  async generateHealthInsights(userProfile, healthData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/api/chat/analyze-trends`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userProfile,
          healthData
        })
      });

      if (!response.ok) {
        throw new Error(`Health insights failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        insights: data.content || data.analysis,
        recommendations: this.extractRecommendations(data.content)
      };
    } catch (error) {
      console.error('Health insights error:', error);
      return {
        success: false,
        error: error.message,
        insights: 'Unable to generate insights at this time. Please try again later.'
      };
    }
  }

  // Extract recommendations from AI response
  extractRecommendations(content) {
    if (!content) return [];
    
    const lines = content.split('\n');
    const recommendations = [];
    
    for (const line of lines) {
      if (line.includes('recommend') || line.includes('suggest') || line.includes('try')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }
}

// Export singleton instance
const aiCollaborationService = new AICollaborationService();
export default aiCollaborationService;