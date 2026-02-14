/**
 * Enhanced API Service with Retry Logic and Error Handling
 * 
 * Wraps the existing API service with:
 * - Automatic retry with exponential backoff
 * - User-friendly error messages
 * - Graceful degradation
 * 
 * Requirements: 1.2, 10.3
 */

import apiService from './api.js';
import { retryWithBackoff, shouldRetryHttpError, getUserFriendlyErrorMessage } from '../utils/retryWithBackoff.js';

/**
 * Wrap an API method with retry logic
 * @param {Function} method - API method to wrap
 * @param {string} context - Context for error messages
 * @param {Object} retryOptions - Retry options
 * @returns {Function} Wrapped method
 */
function wrapWithRetry(method, context, retryOptions = {}) {
  return async function(...args) {
    try {
      return await retryWithBackoff(
        () => method.apply(apiService, args),
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          shouldRetry: (error) => {
            // Don't retry authentication errors
            if (error.message?.includes('Unauthorized') || error.message?.includes('login')) {
              return false;
            }
            return shouldRetryHttpError(error);
          },
          onRetry: (attempt, maxRetries, delay, error) => {
            console.log(
              `[API Retry] ${context} - Attempt ${attempt}/${maxRetries} ` +
              `(waiting ${Math.round(delay)}ms): ${error.message}`
            );
          },
          ...retryOptions
        }
      );
    } catch (error) {
      // Enhance error with user-friendly message
      const userMessage = getUserFriendlyErrorMessage(error, context);
      
      // Create enhanced error object
      const enhancedError = new Error(userMessage);
      enhancedError.originalError = error;
      enhancedError.context = context;
      enhancedError.userMessage = userMessage;
      
      console.error(`[API Error] ${context}:`, error);
      
      throw enhancedError;
    }
  };
}

/**
 * Enhanced API service with retry logic
 */
const apiWithRetry = {
  // Pass through non-wrapped methods
  setToken: apiService.setToken.bind(apiService),
  refreshToken: apiService.refreshToken.bind(apiService),
  getHeaders: apiService.getHeaders.bind(apiService),
  clearCache: apiService.clearCache.bind(apiService),
  getFileUrl: apiService.getFileUrl.bind(apiService),
  isAuthenticated: apiService.isAuthenticated.bind(apiService),

  // Auth methods with retry
  register: wrapWithRetry(
    apiService.register.bind(apiService),
    'creating your account'
  ),
  
  login: wrapWithRetry(
    apiService.login.bind(apiService),
    'logging in',
    { maxRetries: 2 } // Fewer retries for auth
  ),
  
  logout: wrapWithRetry(
    apiService.logout.bind(apiService),
    'logging out',
    { maxRetries: 1 }
  ),
  
  getCurrentUser: wrapWithRetry(
    apiService.getCurrentUser.bind(apiService),
    'loading your profile'
  ),
  
  updateProfile: wrapWithRetry(
    apiService.updateProfile.bind(apiService),
    'updating your profile'
  ),
  
  changePassword: wrapWithRetry(
    apiService.changePassword.bind(apiService),
    'changing your password',
    { maxRetries: 2 }
  ),

  // Health methods with retry
  createHealthRecord: wrapWithRetry(
    apiService.createHealthRecord.bind(apiService),
    'saving health data'
  ),
  
  getHealthRecords: wrapWithRetry(
    apiService.getHealthRecords.bind(apiService),
    'loading health records'
  ),
  
  getDashboardData: wrapWithRetry(
    apiService.getDashboardData.bind(apiService),
    'loading dashboard data'
  ),
  
  createGoal: wrapWithRetry(
    apiService.createGoal.bind(apiService),
    'creating your goal'
  ),
  
  getHealthInsights: wrapWithRetry(
    apiService.getHealthInsights.bind(apiService),
    'loading health insights'
  ),

  // Chat methods with retry
  startChatSession: wrapWithRetry(
    apiService.startChatSession.bind(apiService),
    'starting chat session'
  ),
  
  sendMessage: wrapWithRetry(
    apiService.sendMessage.bind(apiService),
    'sending your message',
    { 
      maxRetries: 2,
      timeout: 15000 // Longer timeout for AI responses
    }
  ),
  
  getChatSession: wrapWithRetry(
    apiService.getChatSession.bind(apiService),
    'loading chat history'
  ),
  
  getChatSessions: wrapWithRetry(
    apiService.getChatSessions.bind(apiService),
    'loading chat sessions'
  ),

  // Community methods with retry
  getCommunityPosts: wrapWithRetry(
    apiService.getCommunityPosts.bind(apiService),
    'loading community posts'
  ),
  
  createPost: wrapWithRetry(
    apiService.createPost.bind(apiService),
    'creating your post'
  ),
  
  getPost: wrapWithRetry(
    apiService.getPost.bind(apiService),
    'loading post'
  ),
  
  likePost: wrapWithRetry(
    apiService.likePost.bind(apiService),
    'liking post',
    { maxRetries: 2 }
  ),
  
  addComment: wrapWithRetry(
    apiService.addComment.bind(apiService),
    'adding comment'
  ),
  
  getCategories: wrapWithRetry(
    apiService.getCategories.bind(apiService),
    'loading categories'
  ),
  
  getTrendingContent: wrapWithRetry(
    apiService.getTrendingContent.bind(apiService),
    'loading trending content'
  ),

  // Weight tracking with retry
  getWeightData: wrapWithRetry(
    apiService.getWeightData.bind(apiService),
    'loading weight data'
  ),
  
  addWeightEntry: wrapWithRetry(
    apiService.addWeightEntry.bind(apiService),
    'saving weight entry'
  ),

  // Upload methods with retry
  uploadHealthReport: wrapWithRetry(
    apiService.uploadHealthReport.bind(apiService),
    'uploading health report',
    { 
      maxRetries: 2,
      timeout: 60000 // Longer timeout for file uploads
    }
  ),
  
  uploadVoiceNote: wrapWithRetry(
    apiService.uploadVoiceNote.bind(apiService),
    'uploading voice note',
    { 
      maxRetries: 2,
      timeout: 30000
    }
  ),
  
  uploadProfileImage: wrapWithRetry(
    apiService.uploadProfileImage.bind(apiService),
    'uploading profile image',
    { 
      maxRetries: 2,
      timeout: 30000
    }
  )
};

export default apiWithRetry;
