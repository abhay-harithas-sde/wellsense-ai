import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsProvider = ({ children }) => {
  const location = useLocation();

  // Track page views (local analytics only)
  useEffect(() => {
    const pageName = getPageName(location.pathname);
    console.log('Page view:', {
      page: pageName,
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [location]);

  const getPageName = (pathname) => {
    const routes = {
      '/': 'Dashboard',
      '/auth': 'Authentication',
      '/health-metrics': 'Health Metrics',
      '/weight-tracker': 'Weight Tracker',
      '/ai-nutrition': 'AI Nutrition',
      '/ai-coaching': 'AI Coaching',
      '/ai-insights': 'AI Insights',
      '/health-tips': 'Health Tips',
      '/community': 'Community',
      '/community-health': 'Community Health',
      '/consultation': 'Consultation',
      '/profile': 'Profile',
      '/statistics': 'Statistics',
      '/meditation-center': 'Meditation Center',
      '/mental-wellness': 'Mental Wellness',
      '/ai-demo': 'AI Demo',
      '/openai-demo': 'WellSense AI Chat'
    };
    
    return routes[pathname] || 'Unknown Page';
  };

  return children;
};

// Custom tracking functions for specific events (local logging only)
export const trackUserAction = (action, properties = {}) => {
  console.log('User action:', action, {
    ...properties,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  });
};

export const trackHealthAction = (action, data = {}) => {
  console.log('Health action:', {
    action,
    ...data,
    timestamp: new Date().toISOString()
  });
};

export const trackAIInteraction = (type, details = {}) => {
  console.log('AI interaction:', {
    type,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export const trackFeatureUsage = (feature, context = {}) => {
  console.log('Feature usage:', {
    feature,
    ...context,
    timestamp: new Date().toISOString()
  });
};

export default AnalyticsProvider;