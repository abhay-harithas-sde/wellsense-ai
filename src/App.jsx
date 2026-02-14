import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AnalyticsProvider from './components/analytics/AnalyticsProvider';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import NotificationSystem from './components/ui/NotificationSystem';
import UpdateNotification from './components/ui/UpdateNotification';
import AutoUpdateManager from './components/AutoUpdateManager';
import FloatingActionButton from './components/ui/FloatingActionButton';
import DemoBanner from './components/demo/DemoBanner';
import BackupVideoPlayer from './components/demo/BackupVideoPlayer';
import ProfileCompletionChecker from './components/profile/ProfileCompletionChecker';
import './App.css';

// Lazy load pages for better code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AIFeatureDemo = lazy(() => import('./pages/AIFeatureDemo'));
const HealthMetrics = lazy(() => import('./pages/HealthMetrics'));
const WeightTracker = lazy(() => import('./pages/WeightTracker'));
const AINutrition = lazy(() => import('./pages/AINutrition'));
const AICoaching = lazy(() => import('./pages/AICoaching'));
const HealthTips = lazy(() => import('./pages/HealthTips'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const CommunityHealth = lazy(() => import('./pages/CommunityHealth'));
const Community = lazy(() => import('./pages/Community'));
const Profile = lazy(() => import('./pages/Profile'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const OpenAIDemo = lazy(() => import('./components/ai/OpenAIDemo'));
const UserStatistics = lazy(() => import('./pages/UserStatistics'));
const MeditationCenter = lazy(() => import('./pages/MeditationCenter'));
const MentalWellness = lazy(() => import('./pages/MentalWellness'));
const DiagnosticPage = lazy(() => import('./components/DiagnosticPage'));

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <span className="text-white font-bold text-2xl">W</span>
      </div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Main App Layout - Responsive for all devices
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile only - desktop sidebar always visible
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProfileCompletionChecker>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated background elements - responsive */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <DemoBanner />
        <BackupVideoPlayer />
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <NotificationSystem enableDemoNotifications={import.meta.env.VITE_ENABLE_DEMO_NOTIFICATIONS === 'true'} />
        <UpdateNotification />
        <FloatingActionButton />
        
        {/* Responsive layout container */}
        <div className="flex relative z-10">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Main content - responsive margins with sidebar awareness */}
          <main className={`flex-1 p-3 sm:p-4 lg:p-6 pt-20 sm:pt-24 lg:pt-28 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative max-w-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </ProfileCompletionChecker>
  );
};

// App Routes Component with Suspense for lazy loading
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route 
          path="/diagnostic" 
          element={<DiagnosticPage />} 
        />
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />} 
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
          path="/consultation"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ConsultationPage />
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
    </Suspense>
  );
};

function App() {
  try {
    return (
      <AuthProvider>
        <Router>
          <AnalyticsProvider>
            <AppRoutes />
          </AnalyticsProvider>
          <AutoUpdateManager />
        </Router>
      </AuthProvider>
    );
  } catch (error) {
    console.error('App initialization error:', error);
    return <DiagnosticPage />;
  }
}

export default App;