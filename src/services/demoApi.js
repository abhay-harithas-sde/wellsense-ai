// Demo API service that works without backend
import { demoUser, demoHealthData, demoInsights, demoCommunityPosts, demoChatMessages } from '../components/demo/DemoData';

class DemoApiService {
  constructor() {
    this.isDemo = true;
    this.user = null;
    this.token = localStorage.getItem('demoToken');
    this.chatSessions = new Map();

    // Load saved profile data if exists
    const savedProfile = localStorage.getItem('demoUserProfile');
    if (savedProfile && this.token) {
      try {
        this.user = JSON.parse(savedProfile);
      } catch (error) {
        console.warn('Failed to load saved profile:', error);
      }
    }
  }

  // Simulate API delay
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('demoToken', token);
    } else {
      localStorage.removeItem('demoToken');
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Auth methods
  async register(userData) {
    await this.delay();

    console.log('DemoApi register called with:', userData);

    // DEMO MODE: Accept any registration data
    if (!userData.email || !userData.password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }

    const token = 'demo-token-' + Date.now();
    this.setToken(token);

    // Create user with provided data or defaults
    const emailName = userData.email.split('@')[0];
    const firstName = userData.firstName || emailName.charAt(0).toUpperCase() + emailName.slice(1);

    this.user = {
      ...demoUser,
      email: userData.email,
      profile: {
        ...demoUser.profile,
        firstName: firstName,
        lastName: userData.lastName || 'User',
        ...userData
      }
    };

    // Store user data for persistence
    localStorage.setItem('demoUserProfile', JSON.stringify(this.user));

    console.log('Registration successful, returning user:', this.user);

    return {
      success: true,
      message: 'Registration successful (Demo Mode)',
      data: {
        user: this.user,
        token
      }
    };
  }

  async login(credentials) {
    await this.delay();

    console.log('DemoApi login called with:', credentials);

    // DEMO MODE: Accept ANY email and password
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        message: 'Email and password are required'
      };
    }

    console.log('Demo mode: Accepting any credentials');

    const token = 'demo-token-' + Date.now();
    this.setToken(token);

    // Create user data based on provided email
    const emailName = credentials.email.split('@')[0];
    const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

    this.user = {
      ...demoUser,
      email: credentials.email,
      profile: {
        ...demoUser.profile,
        firstName: firstName,
        lastName: 'User'
      }
    };

    // Store user data for persistence
    localStorage.setItem('demoUserProfile', JSON.stringify(this.user));

    console.log('Login successful, returning user:', this.user);

    return {
      success: true,
      message: 'Login successful (Demo Mode)',
      data: {
        user: this.user,
        token
      }
    };
  }

  async logout() {
    await this.delay(200);
    this.setToken(null);
    this.user = null;
  }

  async getCurrentUser() {
    await this.delay(300);
    if (!this.token) throw new Error('Not authenticated');

    // Load saved profile if not already loaded
    if (!this.user) {
      const savedProfile = localStorage.getItem('demoUserProfile');
      if (savedProfile) {
        try {
          this.user = JSON.parse(savedProfile);
        } catch (error) {
          this.user = demoUser;
        }
      } else {
        this.user = demoUser;
      }
    }

    return {
      success: true,
      data: {
        user: this.user
      }
    };
  }

  async updateProfile(profileData) {
    await this.delay();

    // Update the user object with new profile data
    if (!this.user) {
      this.user = { ...demoUser };
    }

    // Update profile fields
    this.user = {
      ...this.user,
      email: profileData.email || this.user.email,
      profile: {
        ...this.user.profile,
        firstName: profileData.firstName || this.user.profile.firstName,
        lastName: profileData.lastName || this.user.profile.lastName,
        phone: profileData.phone || this.user.profile.phone,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : this.user.profile.dateOfBirth,
        location: profileData.location || this.user.profile.location,
        bio: profileData.bio || this.user.profile.bio
      }
    };

    // Store updated user data in localStorage for persistence
    localStorage.setItem('demoUserProfile', JSON.stringify(this.user));

    return {
      success: true,
      data: {
        user: this.user
      }
    };
  }

  // Health methods
  async getDashboardData() {
    await this.delay();
    return {
      success: true,
      data: {
        healthMetrics: {
          currentWeight: 74.6,
          bmi: 24.3,
          healthScore: 85,
          streakDays: 12,
          totalPoints: 2398
        },
        weeklyStats: {
          avgHeartRate: 74,
          avgSteps: 9186,
          avgSleep: 7.9,
          avgCalories: 2100
        },
        goalProgress: demoUser.goals,
        recentData: {
          vitals: demoHealthData.slice(-5),
          exercise: demoHealthData.slice(-5),
          sleep: demoHealthData.slice(-5),
          nutrition: demoHealthData.slice(-5)
        },
        achievements: demoUser.achievements
      }
    };
  }

  async getHealthRecords(params = {}) {
    await this.delay();
    
    // Get stored health records from localStorage
    const storedRecords = JSON.parse(localStorage.getItem('demoHealthRecords') || '[]');
    
    // Combine with demo data if no stored records
    let records = storedRecords;
    if (records.length === 0) {
      records = demoHealthData.map((data, index) => ({
        _id: `demo-record-${index}`,
        type: 'vital_signs',
        data,
        recordedAt: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000),
        source: 'manual'
      }));
    }
    
    return {
      success: true,
      data: {
        records,
        pagination: {
          current: 1,
          pages: 1,
          total: records.length
        }
      }
    };
  }

  async createHealthRecord(recordData) {
    await this.delay();
    
    console.log('📝 Demo API: Creating health record:', recordData);
    
    // Store the health record in localStorage for persistence
    const existingRecords = JSON.parse(localStorage.getItem('demoHealthRecords') || '[]');
    
    const newRecord = {
      _id: 'record-' + Date.now(),
      userId: this.user?._id || 'demo-user',
      type: recordData.type || 'vital_signs',
      data: recordData.data || {},
      notes: recordData.notes || '',
      source: recordData.source || 'manual',
      recordedAt: new Date(),
      createdAt: new Date()
    };
    
    existingRecords.unshift(newRecord); // Add to beginning
    
    // Keep only last 50 records to avoid localStorage bloat
    if (existingRecords.length > 50) {
      existingRecords.splice(50);
    }
    
    localStorage.setItem('demoHealthRecords', JSON.stringify(existingRecords));
    
    console.log('✅ Demo API: Health record saved locally:', newRecord);
    
    return {
      success: true,
      message: 'Health record created successfully (Demo Mode)',
      data: newRecord
    };
  }

  async getHealthInsights() {
    await this.delay();
    return {
      success: true,
      data: {
        insights: demoInsights
      }
    };
  }

  // Chat methods
  async startChatSession(sessionData = {}) {
    await this.delay();
    const sessionId = 'demo-session-' + Date.now();
    this.chatSessions.set(sessionId, {
      sessionId,
      messages: [demoChatMessages[0]], // Start with AI greeting
      createdAt: new Date()
    });

    return {
      success: true,
      data: {
        sessionId,
        messages: [demoChatMessages[0]]
      }
    };
  }

  async sendMessage(sessionId, message) {
    await this.delay(1000); // Simulate AI thinking time

    const session = this.chatSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    session.messages.push(userMessage);

    // Generate AI response (demo responses)
    const aiResponses = [
      "That's a great question! Based on your health data, I'd recommend focusing on consistency with your current routine. Your progress has been excellent so far.",
      "I understand your concern. Let me analyze your recent health metrics... Your heart rate variability suggests you're managing stress well. Keep up the good work!",
      "Excellent progress! Your sleep quality has improved by 15% this week. Consider maintaining your current bedtime routine for optimal results.",
      "Based on your activity levels, I suggest incorporating more strength training. Your cardiovascular health is great, but building muscle mass could boost your metabolism.",
      "Your nutrition tracking shows good protein intake. To optimize your energy levels, try eating smaller, more frequent meals throughout the day."
    ];

    const aiMessage = {
      role: 'assistant',
      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      timestamp: new Date(),
      metadata: {
        tokens: 150,
        model: 'gpt-4',
        responseTime: 1000,
        confidence: 0.85
      }
    };
    session.messages.push(aiMessage);

    return {
      success: true,
      data: {
        message: aiMessage,
        sessionId,
        totalMessages: session.messages.length
      }
    };
  }

  async getChatSession(sessionId) {
    await this.delay();
    const session = this.chatSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    return {
      success: true,
      data: session
    };
  }

  async getChatSessions() {
    await this.delay();
    return {
      success: true,
      data: {
        sessions: Array.from(this.chatSessions.values()).map(session => ({
          sessionId: session.sessionId,
          title: 'Health Consultation',
          sessionType: 'general_health',
          status: 'active',
          createdAt: session.createdAt,
          lastActivity: session.createdAt
        })),
        pagination: {
          current: 1,
          pages: 1,
          total: this.chatSessions.size
        }
      }
    };
  }

  // Community methods
  async getCommunityPosts(params = {}) {
    await this.delay();
    return {
      success: true,
      data: {
        posts: demoCommunityPosts,
        pagination: {
          current: 1,
          pages: 1,
          total: demoCommunityPosts.length
        }
      }
    };
  }

  async createPost(postData) {
    await this.delay();
    const newPost = {
      id: Date.now(),
      author: { profile: { firstName: 'You', lastName: '' } },
      ...postData,
      likes: [],
      comments: [],
      createdAt: new Date(),
      likeCount: 0,
      commentCount: 0,
      isLikedByUser: false
    };

    demoCommunityPosts.unshift(newPost);

    return {
      success: true,
      message: 'Post created successfully',
      data: newPost
    };
  }

  async likePost(postId) {
    await this.delay(200);
    const post = demoCommunityPosts.find(p => p.id == postId);
    if (post) {
      post.isLikedByUser = !post.isLikedByUser;
      post.likeCount += post.isLikedByUser ? 1 : -1;
    }

    return {
      success: true,
      data: {
        isLiked: post?.isLikedByUser || false,
        likeCount: post?.likeCount || 0
      }
    };
  }

  async getCategories() {
    await this.delay(200);
    return {
      success: true,
      data: [
        { id: 'fitness', name: 'Fitness', description: 'Exercise, workouts, and physical activity' },
        { id: 'nutrition', name: 'Nutrition', description: 'Diet, recipes, and healthy eating' },
        { id: 'mental_health', name: 'Mental Health', description: 'Stress, anxiety, and mental wellness' },
        { id: 'medical', name: 'Medical', description: 'Health conditions and medical advice' },
        { id: 'success_story', name: 'Success Stories', description: 'Share your health achievements' },
        { id: 'question', name: 'Questions', description: 'Ask the community for help' },
        { id: 'general', name: 'General', description: 'General health and wellness topics' }
      ]
    };
  }

  // Weight tracking methods
  async getWeightData() {
    await this.delay();
    const { demoWeightData } = await import('../components/demo/DemoData');
    return {
      success: true,
      data: {
        weightData: demoWeightData,
        currentWeight: demoWeightData[demoWeightData.length - 1].weight,
        targetWeight: 78,
        progress: 65
      }
    };
  }

  async addWeightEntry(entryData) {
    await this.delay();
    
    console.log('⚖️ Demo API: Adding weight entry:', entryData);
    
    // Store weight entry in localStorage
    const existingWeightData = JSON.parse(localStorage.getItem('demoWeightEntries') || '[]');
    
    const newEntry = {
      _id: 'weight-' + Date.now(),
      userId: this.user?._id || 'demo-user',
      weight: entryData.weight,
      bodyFatPercentage: entryData.bodyFatPercentage,
      muscleMass: entryData.muscleMass,
      notes: entryData.notes || '',
      mood: entryData.mood,
      energyLevel: entryData.energyLevel,
      source: entryData.source || 'manual',
      recordedAt: new Date(),
      date: new Date().toISOString().split('T')[0]
    };
    
    existingWeightData.unshift(newEntry);
    
    // Keep only last 100 entries
    if (existingWeightData.length > 100) {
      existingWeightData.splice(100);
    }
    
    localStorage.setItem('demoWeightEntries', JSON.stringify(existingWeightData));
    
    console.log('✅ Demo API: Weight entry saved locally:', newEntry);
    
    return {
      success: true,
      message: 'Weight entry added successfully (Demo Mode)',
      data: newEntry
    };
  }

  // Placeholder methods for other features
  async uploadHealthReport() {
    await this.delay();
    return { success: true, message: 'Demo mode: File upload simulated' };
  }

  async uploadVoiceNote() {
    await this.delay();
    return { success: true, message: 'Demo mode: Voice upload simulated' };
  }

  async changePassword() {
    await this.delay();
    return { success: true, message: 'Password changed successfully' };
  }
}

// Create singleton instance
const demoApiService = new DemoApiService();

export default demoApiService;