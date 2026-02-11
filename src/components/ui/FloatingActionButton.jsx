import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageCircle,
  Heart,
  Activity,
  Brain,
  Target,
  Calendar,
  Camera,
  Mic,
  X
} from 'lucide-react';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      id: 'chat',
      label: 'WellSense AI Chat',
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500',
      action: () => {
        navigate('/openai-demo');
      }
    },
    {
      id: 'vitals',
      label: 'Log Vitals',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      action: () => {
        navigate('/health-metrics');
      }
    },
    {
      id: 'activity',
      label: 'Track Activity',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      action: () => {
        navigate('/weight-tracker');
      }
    },
    {
      id: 'mood',
      label: 'Mood Check',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500',
      action: () => {
        navigate('/mental-wellness');
      }
    },
    {
      id: 'goal',
      label: 'Set Goal',
      icon: Target,
      color: 'from-orange-500 to-yellow-500',
      action: () => {
        navigate('/ai-coaching');
      }
    },
    {
      id: 'appointment',
      label: 'Schedule',
      icon: Calendar,
      color: 'from-teal-500 to-blue-500',
      action: () => {
        navigate('/consultation');
      }
    }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  x: 20,
                  transition: { delay: (actions.length - index) * 0.05 }
                }}
                className="flex items-center space-x-3"
              >
                {/* Label */}
                <motion.div
                  className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-white/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center`}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <action.icon className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={toggleMenu}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 45 : 0,
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #3b82f6, #8b5cf6, #4f46e5)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isOpen ? [0, 1.5] : 0,
            opacity: isOpen ? [0.3, 0] : 0
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Icon */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>

      {/* Quick Actions Hint */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 2 }}
            className="absolute -left-32 top-1/2 transform -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none"
          >
            Quick health actions
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900/80 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mini FAB for specific actions
export const MiniFAB = ({
  icon: Icon,
  label,
  onClick,
  color = 'from-blue-500 to-purple-500',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${color} text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={label}
    >
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <Icon className={`${iconSizes[size]} relative z-10`} />
    </motion.button>
  );
};

export default FloatingActionButton;