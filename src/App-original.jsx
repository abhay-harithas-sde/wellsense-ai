import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import NotificationSystem from './components/ui/NotificationSystem';
import FloatingActionButton from './components/ui/FloatingActionButton';
import AIFeatureDemo from './pages/AIFeatureDemo';
import HealthMetrics from './pages/HealthMetrics';
import WeightTracker from './pages/WeightTracker';
import AINutrition from './pages/AINutrition';
import AICoaching from './pages/AICoaching';
import HealthTips from './pages/HealthTips';
import AIInsights from './pages/AIInsights';
import CommunityHealth from './pages/CommunityHealth';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import DemoBanner from './components/demo/DemoBanner';
import OpenAIDemo from './components/ai/OpenAIDemo';
import UserStatistics from './pages/UserStatistics';
import MeditationCenter from './pages/MeditationCenter';
import MentalWellness from './pages/MentalWellness';
import './App.css';

// Enhanced theme configuration
const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradient: {
      primary: 'from-blue-600 via-purple-600 to-indigo-700',
      secondary: 'from-cyan-500 via-blue-500 to-indigo-600',
      accent: 'from-purple-500 via-pink-500 to-red-500'
    }
  }
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">W</span>
          </div>
          <p className="text-gray-600">Loading WellSense AI...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Main App Layout
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <DemoBanner />
      <Header />
      <NotificationSystem />
      <FloatingActionButton />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-6 ml-64 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-demo"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AIFeatureDemo />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/openai-demo"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OpenAIDemo />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health-metrics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HealthMetrics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/weight-tracker"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WeightTracker />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-nutrition"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AINutrition />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-coaching"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AICoaching />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health-tips"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HealthTips />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-insights"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AIInsights />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/community-health"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CommunityHealth />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Community />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UserStatistics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/meditation-center"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MeditationCenter />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mental-wellness"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MentalWellness />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;