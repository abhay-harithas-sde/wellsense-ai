// Frontend OpenAI Client Service
class OpenAIClientService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Never check for API key in frontend - it should only be on backend
    this.isDemo = false; // Will be determined by backend health check
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('wellsense_token') || localStorage.getItem('authToken') || localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Check if OpenAI service is available
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/health-check`, {
        headers: this.getAuthHeaders()
      });
      
      const data = await response.json();
      return {
        available: response.ok,
        status: data.status,
        models: data.availableModels || [],
        isDemo: this.isDemo
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        isDemo: true
      };
    }
  }

  // Start a new chat session
  async startChatSession(sessionType = 'health_coaching') {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          sessionType,
          aiPersonality: 'friendly'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start chat session: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        sessionId: data.data.sessionId,
        messages: data.data.messages || []
      };
    } catch (error) {
      console.error('Start chat session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send a message to the AI
  async sendMessage(sessionId, message, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/${sessionId}/message`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          message,
          includeHealthData: options.includeHealthData !== false,
          comprehensiveData: options.comprehensiveData || null,
          context: options.context || null
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.data.message,
        sessionId: data.data.sessionId,
        totalMessages: data.data.totalMessages
      };
    } catch (error) {
      console.error('Send message error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stream chat responses for real-time interaction
  async streamMessage(sessionId, message, onChunk, onComplete, onError, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/stream`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          message,
          sessionId,
          healthData: this.getStoredHealthData(),
          comprehensiveData: options.comprehensiveData || null,
          context: options.context || null
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
                return;
              } else if (data.error) {
                onError(new Error(data.error));
                return;
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      onError(error);
    }
  }

  // Get chat session history
  async getChatHistory(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/${sessionId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get chat history: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        sessionId: data.data.sessionId,
        title: data.data.title,
        messages: data.data.messages,
        sessionType: data.data.sessionType,
        status: data.data.status
      };
    } catch (error) {
      console.error('Get chat history error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all user chat sessions
  async getChatSessions(page = 1, limit = 20) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/sessions?page=${page}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get chat sessions: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        sessions: data.data.sessions,
        pagination: data.data.pagination
      };
    } catch (error) {
      console.error('Get chat sessions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze food image
  async analyzeFoodImage(imageUrl, prompt = 'Analyze this food for nutritional content') {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/analyze-food`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          imageUrl,
          prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Food analysis failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        analysis: data.analysis,
        nutritionalInfo: this.extractNutritionalInfo(data.analysis)
      };
    } catch (error) {
      console.error('Food analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate personalized health plan
  async generateHealthPlan(userProfile, healthGoals, preferences) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/generate-plan`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          userProfile,
          healthGoals,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error(`Health plan generation failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        plan: data.content,
        structured: this.structureHealthPlan(data.content)
      };
    } catch (error) {
      console.error('Health plan generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get nutrition advice
  async getNutritionAdvice(foodLog, userProfile, goals) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/nutrition-advice`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          foodLog,
          userProfile,
          goals
        })
      });

      if (!response.ok) {
        throw new Error(`Nutrition advice failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        advice: data.content,
        recommendations: this.extractRecommendations(data.content)
      };
    } catch (error) {
      console.error('Nutrition advice error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate workout plan
  async generateWorkoutPlan(userProfile, fitnessGoals, preferences) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/workout-plan`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          userProfile,
          fitnessGoals,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error(`Workout plan generation failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        plan: data.content,
        structured: this.structureWorkoutPlan(data.content)
      };
    } catch (error) {
      console.error('Workout plan generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze health trends
  async analyzeHealthTrends(healthData, userProfile) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/analyze-trends`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          healthData,
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error(`Health trends analysis failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        analysis: data.content,
        insights: this.extractInsights(data.content),
        trends: this.extractTrends(data.content)
      };
    } catch (error) {
      console.error('Health trends analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper methods
  getStoredHealthData() {
    try {
      const healthData = localStorage.getItem('healthData');
      return healthData ? JSON.parse(healthData) : null;
    } catch (error) {
      console.error('Error parsing stored health data:', error);
      return null;
    }
  }

  extractNutritionalInfo(analysis) {
    // Extract structured nutritional information from AI response
    const info = {
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      fiber: null
    };

    if (!analysis) return info;

    const text = analysis.toLowerCase();
    
    // Extract calories
    const calorieMatch = text.match(/(\d+)\s*calories?/);
    if (calorieMatch) info.calories = parseInt(calorieMatch[1]);

    // Extract macros
    const proteinMatch = text.match(/(\d+)g?\s*protein/);
    if (proteinMatch) info.protein = parseInt(proteinMatch[1]);

    const carbMatch = text.match(/(\d+)g?\s*carb/);
    if (carbMatch) info.carbs = parseInt(carbMatch[1]);

    const fatMatch = text.match(/(\d+)g?\s*fat/);
    if (fatMatch) info.fat = parseInt(fatMatch[1]);

    return info;
  }

  extractRecommendations(content) {
    if (!content) return [];
    
    const lines = content.split('\n');
    const recommendations = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\./) || trimmed.startsWith('•') || trimmed.startsWith('-')) {
        recommendations.push(trimmed.replace(/^\d+\.\s*|^[•-]\s*/, ''));
      }
    }
    
    return recommendations.slice(0, 8);
  }

  extractInsights(content) {
    if (!content) return [];
    
    const insights = [];
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 20 && (
        trimmed.includes('trend') || 
        trimmed.includes('pattern') || 
        trimmed.includes('improvement') ||
        trimmed.includes('concern')
      )) {
        insights.push(trimmed);
      }
    }
    
    return insights.slice(0, 5);
  }

  extractTrends(content) {
    // Extract trend information from analysis
    const trends = {
      improving: [],
      declining: [],
      stable: []
    };

    if (!content) return trends;

    const text = content.toLowerCase();
    
    if (text.includes('improving') || text.includes('better') || text.includes('increasing')) {
      trends.improving.push('Overall health metrics showing positive trends');
    }
    
    if (text.includes('declining') || text.includes('worse') || text.includes('decreasing')) {
      trends.declining.push('Some metrics may need attention');
    }
    
    if (text.includes('stable') || text.includes('consistent') || text.includes('maintaining')) {
      trends.stable.push('Consistent patterns in health data');
    }

    return trends;
  }

  structureHealthPlan(content) {
    // Structure the health plan into sections
    const sections = {
      nutrition: '',
      exercise: '',
      sleep: '',
      stress: '',
      goals: ''
    };

    if (!content) return sections;

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('meal')) {
        currentSection = 'nutrition';
      } else if (lower.includes('exercise') || lower.includes('workout') || lower.includes('fitness')) {
        currentSection = 'exercise';
      } else if (lower.includes('sleep') || lower.includes('rest')) {
        currentSection = 'sleep';
      } else if (lower.includes('stress') || lower.includes('mental')) {
        currentSection = 'stress';
      } else if (lower.includes('goal') || lower.includes('target')) {
        currentSection = 'goals';
      }

      if (currentSection && line.trim()) {
        sections[currentSection] += line + '\n';
      }
    }

    return sections;
  }

  structureWorkoutPlan(content) {
    // Structure workout plan into days/exercises
    const plan = {
      schedule: '',
      exercises: [],
      progression: '',
      tips: ''
    };

    if (!content) return plan;

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('schedule') || lower.includes('weekly')) {
        currentSection = 'schedule';
      } else if (lower.includes('exercise') || lower.includes('workout')) {
        currentSection = 'exercises';
      } else if (lower.includes('progression') || lower.includes('advance')) {
        currentSection = 'progression';
      } else if (lower.includes('tip') || lower.includes('note')) {
        currentSection = 'tips';
      }

      if (currentSection && line.trim()) {
        if (currentSection === 'exercises') {
          plan.exercises.push(line.trim());
        } else {
          plan[currentSection] += line + '\n';
        }
      }
    }

    return plan;
  }
}

// Export singleton instance
const openaiClient = new OpenAIClientService();
export default openaiClient;