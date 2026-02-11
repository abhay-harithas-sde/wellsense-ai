// API service that connects to MongoDB backend
import demoApiService from './demoApi.js';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.token = localStorage.getItem('authToken') || localStorage.getItem('token');
    this.isMongoDBMode = localStorage.getItem('mongodbMode') === 'true';
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token); // Also store as 'token' for consistency
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Test MongoDB connection
  async testMongoDBConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/health-check`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.log('MongoDB connection test failed:', error.message);
      return false;
    }
  }

  // Universal method that tries MongoDB first, falls back to demo
  async makeRequest(endpoint, options = {}) {
    try {
      // Try MongoDB backend first
      const response = await fetch(`${this.baseURL}/api${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.isMongoDBMode = true;
        localStorage.setItem('mongodbMode', 'true');
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`MongoDB request failed for ${endpoint}:`, error.message);
      this.isMongoDBMode = false;
      localStorage.setItem('mongodbMode', 'false');
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    try {
      console.log('🔐 Attempting MongoDB login...');
      const result = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (result.success) {
        this.setToken(result.data.token);
        console.log('✅ MongoDB login successful');
        return result;
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for login');
      return await demoApiService.login(credentials);
    }
  }

  async register(userData) {
    try {
      console.log('📝 Attempting MongoDB registration...');
      const result = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (result.success) {
        this.setToken(result.data.token);
        console.log('✅ MongoDB registration successful');
        return result;
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for registration');
      return await demoApiService.register(userData);
    }
  }

  async getCurrentUser() {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/auth/me');
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for getCurrentUser');
    }
    return await demoApiService.getCurrentUser();
  }

  async updateProfile(profileData) {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(profileData)
        });
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for updateProfile');
    }
    return await demoApiService.updateProfile(profileData);
  }

  async logout() {
    try {
      if (this.isMongoDBMode) {
        await this.makeRequest('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.log('Logout request failed, clearing local data');
    }
    
    this.setToken(null);
    localStorage.removeItem('mongodbMode');
    return await demoApiService.logout();
  }

  // Health data methods
  async getDashboardData() {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/health/dashboard');
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for dashboard');
    }
    return await demoApiService.getDashboardData();
  }

  async getHealthRecords(params = {}) {
    try {
      if (this.isMongoDBMode) {
        const queryString = new URLSearchParams(params).toString();
        return await this.makeRequest(`/health/records?${queryString}`);
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for health records');
    }
    return await demoApiService.getHealthRecords(params);
  }

  async createHealthRecord(recordData) {
    console.log('📝 Creating health record:', recordData);
    console.log('🔧 MongoDB mode:', this.isMongoDBMode);
    console.log('🔑 Has token:', !!this.token);
    
    try {
      // Always try MongoDB first, regardless of mode
      console.log('🔄 Attempting MongoDB save...');
      const result = await this.makeRequest('/health/records', {
        method: 'POST',
        body: JSON.stringify(recordData)
      });
      
      console.log('✅ MongoDB save successful:', result);
      return result;
    } catch (error) {
      console.log('❌ MongoDB save failed:', error.message);
      console.log('🔄 Falling back to demo mode for creating health record');
      return await demoApiService.createHealthRecord(recordData);
    }
  }

  async getWeightData() {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/health/weight');
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for weight data');
    }
    return await demoApiService.getWeightData();
  }

  async addWeightEntry(entryData) {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/health/weight', {
          method: 'POST',
          body: JSON.stringify(entryData)
        });
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for weight entry');
    }
    return await demoApiService.addWeightEntry(entryData);
  }

  async getHealthInsights() {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/health/insights');
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for health insights');
    }
    return await demoApiService.getHealthInsights();
  }

  // Chat methods
  async startChatSession(sessionData = {}) {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/chat/start', {
          method: 'POST',
          body: JSON.stringify(sessionData)
        });
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for chat session');
    }
    return await demoApiService.startChatSession(sessionData);
  }

  async sendMessage(sessionId, message) {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest(`/chat/${sessionId}/message`, {
          method: 'POST',
          body: JSON.stringify({ message })
        });
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for sending message');
    }
    return await demoApiService.sendMessage(sessionId, message);
  }

  async getChatSession(sessionId) {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest(`/chat/${sessionId}`);
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for chat session');
    }
    return await demoApiService.getChatSession(sessionId);
  }

  async getChatSessions() {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/chat/sessions');
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for chat sessions');
    }
    return await demoApiService.getChatSessions();
  }

  // Community methods
  async getCommunityPosts(params = {}) {
    try {
      if (this.isMongoDBMode) {
        const queryString = new URLSearchParams(params).toString();
        return await this.makeRequest(`/community/posts?${queryString}`);
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for community posts');
    }
    return await demoApiService.getCommunityPosts(params);
  }

  async createPost(postData) {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/community/posts', {
          method: 'POST',
          body: JSON.stringify(postData)
        });
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for creating post');
    }
    return await demoApiService.createPost(postData);
  }

  async likePost(postId) {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest(`/community/posts/${postId}/like`, {
          method: 'POST'
        });
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for liking post');
    }
    return await demoApiService.likePost(postId);
  }

  async getCategories() {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/community/categories');
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for categories');
    }
    return await demoApiService.getCategories();
  }

  // Goals methods
  async getGoals() {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/health/goals');
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for goals');
    }
    // Return demo goals
    return {
      success: true,
      data: {
        goals: [
          {
            _id: 'goal1',
            type: 'weight_loss',
            target: 'Lose 2kg in 2 months',
            progress: 25,
            status: 'active'
          },
          {
            _id: 'goal2',
            type: 'fitness',
            target: 'Exercise 4 times per week',
            progress: 60,
            status: 'active'
          }
        ]
      }
    };
  }

  async createGoal(goalData) {
    try {
      if (this.isMongoDBMode) {
        return await this.makeRequest('/health/goals', {
          method: 'POST',
          body: JSON.stringify(goalData)
        });
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for creating goal');
    }
    return { success: true, message: 'Goal created (demo mode)' };
  }

  // Utility methods
  async uploadFile(file, type = 'health_report') {
    try {
      if (this.isMongoDBMode) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        return await fetch(`${this.baseURL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: formData
        }).then(res => res.json());
      }
    } catch (error) {
      console.log('🔄 Falling back to demo mode for file upload');
    }
    return { success: true, message: 'File upload simulated (demo mode)' };
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isMongoDBMode: this.isMongoDBMode,
      hasToken: !!this.token,
      baseURL: this.baseURL
    };
  }
}

// Create singleton instance
const apiService = new ApiService();

// Initialize MongoDB mode from localStorage
if (localStorage.getItem('mongodbMode') === 'true') {
  apiService.isMongoDBMode = true;
}

export default apiService;