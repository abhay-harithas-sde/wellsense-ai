/**
 * Notification Configuration
 * Control notification behavior across the application
 */

const notificationConfig = {
  // Enable/disable login notifications
  enableLoginNotifications: import.meta.env.VITE_ENABLE_LOGIN_NOTIFICATIONS === 'true',
  
  // Enable/disable demo notifications
  enableDemoNotifications: import.meta.env.VITE_ENABLE_DEMO_NOTIFICATIONS === 'true',
  
  // Enable/disable registration notifications
  enableRegistrationNotifications: import.meta.env.VITE_ENABLE_REGISTRATION_NOTIFICATIONS === 'true',
  
  // Enable/disable logout notifications
  enableLogoutNotifications: import.meta.env.VITE_ENABLE_LOGOUT_NOTIFICATIONS === 'true',
  
  // Default notification duration (milliseconds)
  defaultDuration: 5000,
  
  // Notification position
  position: 'top-right', // top-right, top-left, bottom-right, bottom-left
  
  // Maximum number of notifications to show at once
  maxNotifications: 3,
  
  // Auto-dismiss notifications
  autoDismiss: true,
};

export default notificationConfig;

// Notification helper functions
export const shouldShowLoginNotification = () => {
  return notificationConfig.enableLoginNotifications;
};

export const shouldShowDemoNotifications = () => {
  return notificationConfig.enableDemoNotifications;
};

export const shouldShowRegistrationNotification = () => {
  return notificationConfig.enableRegistrationNotifications;
};

export const shouldShowLogoutNotification = () => {
  return notificationConfig.enableLogoutNotifications;
};
