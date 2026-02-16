// Environment configuration
const config = {
  // API Base URL - uses environment variable or falls back to relative path for production
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000'),
  
  // Video Meeting URL - uses environment variable or production domain
  meetingUrl: import.meta.env.VITE_MEETING_URL || 'https://meet.wellsense.in',
  
  // App URL - current domain
  appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
