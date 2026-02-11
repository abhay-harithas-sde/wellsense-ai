import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import storageService from '../services/storage';
import { initializeStorage } from '../utils/storageIntegration';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Refresh token from localStorage in case it was updated
      apiService.refreshToken();
      
      if (apiService.isAuthenticated()) {
        console.log('🔍 Checking authentication status...');
        const response = await apiService.getCurrentUser();
        if (response.success) {
          console.log('✅ User authenticated:', response.data.user.email);
          setUser(response.data.user);
          
          // Initialize storage integration
          await initializeStorage(response.data.user.id);
        } else {
          // Token might be invalid
          console.warn('⚠️ Token invalid, clearing authentication');
          apiService.setToken(null);
          setUser(null);
        }
      } else {
        console.log('ℹ️ No authentication token found');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      // Only clear token if it's a 401 error (unauthorized)
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        apiService.setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔐 Attempting login with:', credentials.email);
      const response = await apiService.login(credentials);
      console.log('📥 Login response:', response);
      
      if (response.success) {
        // Fetch fresh user data from server to ensure we have complete profile
        try {
          const userResponse = await apiService.getCurrentUser();
          if (userResponse.success) {
            setUser(userResponse.data.user);
            console.log('✅ Login successful, user data loaded:', userResponse.data.user);
          } else {
            // Fallback to response data if getCurrentUser fails
            setUser(response.data.user);
            console.log('✅ Login successful, using response user data:', response.data.user);
          }
        } catch (err) {
          // Fallback to response data if getCurrentUser fails
          setUser(response.data.user);
          console.log('✅ Login successful, using response user data (fallback):', response.data.user);
        }
        return { success: true };
      } else {
        setError(response.message);
        console.log('❌ Login failed:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      console.error('❌ Login error:', error);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('📝 Attempting registration with:', userData.email);
      const response = await apiService.register(userData);
      
      if (response.success) {
        // Auto-login after registration
        apiService.setToken(response.data.token);
        
        // Fetch fresh user data from server
        try {
          const userResponse = await apiService.getCurrentUser();
          if (userResponse.success) {
            setUser(userResponse.data.user);
            console.log('✅ Registration successful, user data loaded:', userResponse.data.user);
          } else {
            setUser(response.data.user);
            console.log('✅ Registration successful, using response user data:', response.data.user);
          }
        } catch (err) {
          setUser(response.data.user);
          console.log('✅ Registration successful, using response user data (fallback):', response.data.user);
        }
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state
      setUser(null);
      setError(null);
      
      // Use storage service to clear all user data
      if (user?.id) {
        storageService.clearUserData(user.id);
      } else {
        // Fallback: clear all storage
        storageService.clearAll();
      }
      
      console.log('✅ Logout complete, all data cleared');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      
      const response = await apiService.updateProfile(profileData);
      
      if (response.success) {
        // Update user state with new data from server
        setUser(prevUser => ({
          ...prevUser,
          ...response.data.user,
          profile: {
            ...prevUser?.profile,
            ...profileData
          }
        }));
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setError(null);
      
      const response = await apiService.changePassword(passwordData);
      
      if (response.success) {
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};