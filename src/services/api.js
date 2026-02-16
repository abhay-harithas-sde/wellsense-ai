import demoApiService from './demoApi';

// Use relative path in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Initialize token from localStorage on startup
    this.token = this.getStoredToken();
    this.isDemoMode = false; // Enable real backend
    
    // Simple cache for GET requests
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds cache
  }

  // Get token from localStorage with fallback
  getStoredToken() {
    return localStorage.getItem('wellsense_token') || localStorage.getItem('authToken') || null;
  }

  // Check if backend is available
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/health-check`, {
        method: 'GET',
        timeout: 3000
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend not available, switching to demo mode');
      this.isDemoMode = true;
      return false;
    }
  }

  // Use demo service if backend is not available
  async useDemoIfNeeded(method, ...args) {
    if (this.isDemoMode || !(await this.checkBackendHealth())) {
      this.isDemoMode = true;
      return demoApiService[method](...args);
    }
    return null;
  }

  // Set auth token - stores in localStorage for persistence
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('wellsense_token', token);
      localStorage.setItem('authToken', token); // Keep for backward compatibility
      console.log('✅ Token stored in localStorage');
    } else {
      localStorage.removeItem('wellsense_token');
      localStorage.removeItem('authToken');
      console.log('🗑️ Token removed from localStorage');
    }
  }

  // Refresh token from storage (useful after page reload)
  refreshToken() {
    this.token = this.getStoredToken();
    return this.token;
  }

  // Get auth headers
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method with token refresh handling and caching
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}_${endpoint}`;
    
    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('⚡ Using cached response for', endpoint);
        return cached.data;
      }
    }
    
    // Ensure we have the latest token from storage
    if (!this.token) {
      this.refreshToken();
    }
    
    const config = {
      headers: this.getHeaders(options.contentType),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.warn('⚠️ Token expired or invalid (401)');
        this.setToken(null);
        throw new Error('Unauthorized - please login again');
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Cache GET requests
      if (!options.method || options.method === 'GET') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Auth methods
  async register(userData) {
    const demoResult = await this.useDemoIfNeeded('register', userData);
    if (demoResult) return demoResult;

    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const demoResult = await this.useDemoIfNeeded('login', credentials);
    if (demoResult) {
      if (demoResult.success && demoResult.data.token) {
        this.setToken(demoResult.data.token);
      }
      return demoResult;
    }

    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    const demoResult = await this.useDemoIfNeeded('getCurrentUser');
    if (demoResult) return demoResult;

    return this.request('/api/auth/me');
  }

  async updateProfile(profileData) {
    const demoResult = await this.useDemoIfNeeded('updateProfile', profileData);
    if (demoResult) return demoResult;

    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Google authentication
  async verifyGoogleToken(credential) {
    return this.request('/auth/google/verify', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  }

  // Health methods
  async createHealthRecord(recordData) {
    const demoResult = await this.useDemoIfNeeded('createHealthRecord', recordData);
    if (demoResult) return demoResult;

    return this.request('/api/health/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  async getHealthRecords(params = {}) {
    const demoResult = await this.useDemoIfNeeded('getHealthRecords', params);
    if (demoResult) return demoResult;

    const queryString = new URLSearchParams(params).toString();
    return this.request(`/health/records?${queryString}`);
  }

  async getDashboardData() {
    const demoResult = await this.useDemoIfNeeded('getDashboardData');
    if (demoResult) return demoResult;

    return this.request('/health/dashboard');
  }

  async createGoal(goalData) {
    const demoResult = await this.useDemoIfNeeded('createGoal', goalData);
    if (demoResult) return demoResult;

    return this.request('/health/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async getHealthInsights() {
    const demoResult = await this.useDemoIfNeeded('getHealthInsights');
    if (demoResult) return demoResult;

    return this.request('/health/insights');
  }

  // Chat methods
  async startChatSession(sessionData = {}) {
    const demoResult = await this.useDemoIfNeeded('startChatSession', sessionData);
    if (demoResult) return demoResult;

    return this.request('/chat/start', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async sendMessage(sessionId, message, includeHealthData = true) {
    const demoResult = await this.useDemoIfNeeded('sendMessage', sessionId, message, includeHealthData);
    if (demoResult) return demoResult;

    return this.request(`/chat/${sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message, includeHealthData }),
    });
  }

  async getChatSession(sessionId) {
    const demoResult = await this.useDemoIfNeeded('getChatSession', sessionId);
    if (demoResult) return demoResult;

    return this.request(`/chat/${sessionId}`);
  }

  async getChatSessions(params = {}) {
    const demoResult = await this.useDemoIfNeeded('getChatSessions', params);
    if (demoResult) return demoResult;

    const queryString = new URLSearchParams(params).toString();
    return this.request(`/chat/sessions?${queryString}`);
  }

  async updateSessionStatus(sessionId, status) {
    return this.request(`/chat/${sessionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async submitSessionFeedback(sessionId, feedback) {
    return this.request(`/chat/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  // Community methods
  async getCommunityPosts(params = {}) {
    const demoResult = await this.useDemoIfNeeded('getCommunityPosts', params);
    if (demoResult) return demoResult;

    const queryString = new URLSearchParams(params).toString();
    return this.request(`/community/posts?${queryString}`);
  }

  async createPost(postData) {
    const demoResult = await this.useDemoIfNeeded('createPost', postData);
    if (demoResult) return demoResult;

    return this.request('/community/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPost(postId) {
    const demoResult = await this.useDemoIfNeeded('getPost', postId);
    if (demoResult) return demoResult;

    return this.request(`/community/posts/${postId}`);
  }

  async likePost(postId) {
    const demoResult = await this.useDemoIfNeeded('likePost', postId);
    if (demoResult) return demoResult;

    return this.request(`/community/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async addComment(postId, content) {
    return this.request(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async likeComment(postId, commentId) {
    return this.request(`/community/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  async replyToComment(postId, commentId, content) {
    return this.request(`/community/posts/${postId}/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getCategories() {
    const demoResult = await this.useDemoIfNeeded('getCategories');
    if (demoResult) return demoResult;

    return this.request('/community/categories');
  }

  async getTrendingContent() {
    const demoResult = await this.useDemoIfNeeded('getTrendingContent');
    if (demoResult) return demoResult;

    return this.request('/community/trending');
  }

  async getMyPosts(params = {}) {
    const demoResult = await this.useDemoIfNeeded('getMyPosts', params);
    if (demoResult) return demoResult;

    const queryString = new URLSearchParams(params).toString();
    return this.request(`/community/my-posts?${queryString}`);
  }

  // Upload methods
  async uploadHealthReport(file, reportType, notes) {
    const formData = new FormData();
    formData.append('report', file);
    formData.append('reportType', reportType);
    formData.append('notes', notes);

    return this.request('/upload/health-report', {
      method: 'POST',
      body: formData,
      contentType: null, // Let browser set content-type for FormData
    });
  }

  async uploadVoiceNote(audioBlob, context = 'health_symptoms') {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-note.webm');
    formData.append('context', context);

    return this.request('/upload/voice-note', {
      method: 'POST',
      body: formData,
      contentType: null,
    });
  }

  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return this.request('/upload/profile-image', {
      method: 'POST',
      body: formData,
      contentType: null,
    });
  }

  async deleteFile(filename) {
    return this.request(`/upload/files/${filename}`, {
      method: 'DELETE',
    });
  }

  // Weight tracking methods
  async getWeightData() {
    const demoResult = await this.useDemoIfNeeded('getWeightData');
    if (demoResult) return demoResult;

    return this.request('/health/weight-data');
  }

  async addWeightEntry(entryData) {
    const demoResult = await this.useDemoIfNeeded('addWeightEntry', entryData);
    if (demoResult) return demoResult;

    return this.request('/health/weight-entry', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  // Utility methods
  getFileUrl(filename) {
    return `${this.baseURL}/upload/files/${filename}`;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;