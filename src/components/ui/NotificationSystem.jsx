import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Heart,
  Sparkles,
  Trophy,
  Target
} from 'lucide-react';

const NotificationSystem = ({ enableDemoNotifications = false }) => {
  const [notifications, setNotifications] = useState([]);

  // Demo notifications for health app (disabled by default)
  const demoNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Daily Goal Achieved! 🎉',
      message: 'You\'ve completed your 10,000 steps target for today!',
      icon: Trophy,
      duration: 5000
    },
    {
      id: 2,
      type: 'info',
      title: 'Hydration Reminder 💧',
      message: 'Time to drink some water! You\'re 2 glasses behind your goal.',
      icon: Heart,
      duration: 4000
    },
    {
      id: 3,
      type: 'warning',
      title: 'Meditation Time 🧘‍♀️',
      message: 'Your stress levels seem high. Consider a 5-minute breathing exercise.',
      icon: Sparkles,
      duration: 6000
    }
  ];

  useEffect(() => {
    // Only show demo notifications if explicitly enabled
    if (!enableDemoNotifications) {
      return;
    }

    // Show demo notifications with delays
    const timeouts = demoNotifications.map((notification, index) => 
      setTimeout(() => {
        addNotification(notification);
      }, (index + 1) * 2000)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [enableDemoNotifications]);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white/95',
          border: 'border-green-500/30',
          icon: 'text-green-600',
          iconBg: 'bg-green-100',
          accent: 'border-l-green-500',
          progress: 'bg-gradient-to-r from-green-500 to-emerald-500',
          glow: 'shadow-green-500/20'
        };
      case 'error':
        return {
          bg: 'bg-white/95',
          border: 'border-red-500/30',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          accent: 'border-l-red-500',
          progress: 'bg-gradient-to-r from-red-500 to-pink-500',
          glow: 'shadow-red-500/20'
        };
      case 'warning':
        return {
          bg: 'bg-white/95',
          border: 'border-amber-500/30',
          icon: 'text-amber-600',
          iconBg: 'bg-amber-100',
          accent: 'border-l-amber-500',
          progress: 'bg-gradient-to-r from-amber-500 to-orange-500',
          glow: 'shadow-amber-500/20'
        };
      case 'info':
      default:
        return {
          bg: 'bg-white/95',
          border: 'border-blue-500/30',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          accent: 'border-l-blue-500',
          progress: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          glow: 'shadow-blue-500/20'
        };
    }
  };

  const getDefaultIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
      case 'warning':
        return AlertCircle;
      case 'info':
      default:
        return Info;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => {
          const styles = getNotificationStyles(notification.type);
          const IconComponent = notification.icon || getDefaultIcon(notification.type);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 400, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 400, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
              className={`
                ${styles.bg} ${styles.border} ${styles.accent} ${styles.glow}
                backdrop-blur-xl border border-l-4 rounded-2xl p-4 shadow-2xl
                hover:shadow-3xl transition-all duration-300 cursor-pointer
                relative overflow-hidden group pointer-events-auto
              `}
              onClick={() => removeNotification(notification.id)}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" 
                   style={{ transition: 'transform 1s ease-in-out' }} />
              
              <div className="relative z-10 flex items-start space-x-3">
                <motion.div
                  className={`p-2.5 rounded-xl ${styles.iconBg} shadow-sm`}
                  animate={{ 
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <IconComponent className={`w-5 h-5 ${styles.icon}`} strokeWidth={2.5} />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h4 
                    className="text-sm font-bold text-gray-900 mb-1 leading-tight"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {notification.title}
                  </motion.h4>
                  <motion.p 
                    className="text-sm text-gray-700 leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {notification.message}
                  </motion.p>
                  
                  {notification.timestamp && (
                    <motion.p 
                      className="text-xs text-gray-500 mt-2 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {notification.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </motion.p>
                  )}
                </div>
                
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-200/80 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
                </motion.button>
              </div>
              
              {/* Enhanced progress bar for auto-dismiss */}
              {notification.duration && (
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 ${styles.progress} rounded-b-2xl shadow-lg`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ 
                    duration: notification.duration / 1000,
                    ease: "linear"
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);

    if (notification.duration !== false) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration || 5000);
    }

    return newNotification.id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};

// Notification types for easy use
export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export default NotificationSystem;