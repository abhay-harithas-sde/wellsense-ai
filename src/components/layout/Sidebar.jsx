import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { trackFeatureUsage } from '../analytics/AnalyticsProvider';
// Dark mode removed - using light theme only
import {
  Home,
  Activity,
  Brain,
  Users,
  User,
  Heart,
  TrendingUp,
  Calendar,
  MessageCircle,
  Apple,
  Target,
  BarChart3,
  Smile,
  Wind,
  Sparkles,
  Zap,
  Star,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

import LogVitalsModal from '../modals/LogVitalsModal';
import ViewProgressModal from '../modals/ViewProgressModal';
import ScheduleModal from '../modals/ScheduleModal';
import AIChatModal from '../modals/AIChatModal';

const Sidebar = ({ isOpen, onClose, sidebarCollapsed, toggleSidebar }) => {
  const [activeModal, setActiveModal] = useState(null);
  // Sidebar state now managed by parent component

  const openModal = (modalType) => {
    setActiveModal(modalType);
    // Track quick action usage
    trackFeatureUsage('quick_action', { action: modalType });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/statistics', icon: BarChart3, label: '📊 Health Statistics', highlight: true },
    { path: '/ai-demo', icon: Brain, label: '🤖 AI Features Demo' },
    { path: '/openai-demo', icon: MessageCircle, label: '🧠 WellSense AI Chat', highlight: true },
    { path: '/health-metrics', icon: Activity, label: 'Health Metrics' },
    { path: '/weight-tracker', icon: TrendingUp, label: 'Weight Tracker' },
    { path: '/ai-nutrition', icon: Apple, label: 'AI Nutrition' },
    { path: '/ai-coaching', icon: Target, label: 'AI Coaching' },
    { path: '/mental-wellness', icon: Smile, label: '🧘‍♀️ Mental Wellness', highlight: true },
    { path: '/meditation-center', icon: Wind, label: '🧘 Meditation Center', highlight: true },
    { path: '/health-tips', icon: Heart, label: 'Health Tips & Videos' },
    { path: '/ai-insights', icon: Brain, label: 'AI Insights' },
    { path: '/consultation', icon: Calendar, label: '👩‍⚕️ Consultation', highlight: true },
    { path: '/community-health', icon: Users, label: 'Community Health' },
    { path: '/community', icon: MessageCircle, label: 'Social Feed' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const quickActions = [
    {
      icon: Heart,
      label: 'Log Vitals',
      color: 'text-red-500',
      action: () => openModal('logVitals')
    },
    {
      icon: TrendingUp,
      label: 'View Progress',
      color: 'text-green-500',
      action: () => openModal('viewProgress')
    },
    {
      icon: Calendar,
      label: 'Schedule',
      color: 'text-blue-500',
      action: () => openModal('schedule')
    },
    {
      icon: MessageCircle,
      label: 'AI Chat',
      color: 'text-purple-500',
      action: () => openModal('aiChat')
    },
  ];

  return (
    <motion.aside
      className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200 z-40 overflow-y-auto transition-all duration-300 pt-[72px] sm:pt-[88px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-16' : 'w-64 sm:w-72 lg:w-64'}`}
      initial={false}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none"></div>

      {/* Collapse/Expand Button */}
      <div className="absolute -right-3 top-8 hidden lg:block">
        <motion.button
          onClick={toggleSidebar}
          className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          )}
        </motion.button>
      </div>

      <div className={`relative transition-all duration-300 ${sidebarCollapsed ? 'p-2' : 'p-4 sm:p-6'}`}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end mb-4">
          <motion.button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>


        {/* Enhanced Navigation */}
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.path}
                onClick={() => onClose && onClose()} // Close sidebar on mobile when item is clicked
                className={({ isActive }) =>
                  `group flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3'} rounded-lg sm:rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                    : item.highlight
                      ? 'text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200/50 backdrop-blur-sm'
                      : 'text-gray-800 hover:bg-gray-50/80 hover:text-gray-900 backdrop-blur-sm'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <div className={`relative z-10 flex items-center w-full ${sidebarCollapsed ? 'justify-center' : 'space-x-2 sm:space-x-3'}`}>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="relative"
                      >
                        <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : item.highlight ? 'text-purple-700' : 'text-gray-800'
                          }`} />

                        {/* Tooltip for collapsed state */}
                        {sidebarCollapsed && (
                          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                            {item.label}
                          </div>
                        )}
                      </motion.div>

                      {!sidebarCollapsed && (
                        <>
                          <span className={`font-medium text-sm sm:text-base ${isActive ? 'text-white' : item.highlight ? 'font-semibold text-purple-700' : 'text-gray-800'
                            }`}>
                            {item.label}
                          </span>
                          {item.highlight && !isActive && (
                            <motion.span
                              className="ml-auto text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full shadow-sm"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              NEW
                            </motion.span>
                          )}
                          {isActive && (
                            <motion.div
                              className="ml-auto"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Star className="w-4 h-4 text-yellow-300 fill-current" />
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Enhanced Quick Actions */}
        <div className="mt-8">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Quick Actions
              </h3>
            </div>
          )}
          <div className={`grid gap-2 ${sidebarCollapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                onClick={action.action}
                className={`flex ${sidebarCollapsed ? 'justify-center p-2' : 'flex-col items-center space-y-1.5 sm:space-y-2 p-2 sm:p-3'} rounded-lg sm:rounded-xl text-gray-800 hover:bg-white/80 hover:shadow-md transition-all duration-300 backdrop-blur-sm border border-gray-100/50 cursor-pointer group relative`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <motion.div
                  className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${action.color === 'text-red-500' ? 'from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20' :
                    action.color === 'text-green-500' ? 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20' :
                      action.color === 'text-blue-500' ? 'from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20' :
                        'from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20'
                    }`}
                  whileHover={{ rotate: 5 }}
                >
                  <action.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${action.color}`} />
                </motion.div>

                {!sidebarCollapsed && (
                  <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {action.label}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Enhanced Health Score Widget */}
        {!sidebarCollapsed && (
          <motion.div
            className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/10 dark:via-blue-900/10 dark:to-purple-900/10 rounded-xl sm:rounded-2xl border border-white/50 dark:border-gray-700/50 backdrop-blur-sm shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Health Score</span>
              </h4>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                ✨
              </motion.div>
            </div>

            <div className="relative mb-3">
              <div className="flex-1 bg-gray-200/50 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                />
              </div>
              <div className="absolute right-0 -top-8">
                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  85%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-800 font-medium">Great progress this week!</p>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600 font-semibold">+5%</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <div className="flex justify-between text-xs text-gray-700">
                <span>Steps: 8,432</span>
                <span>Sleep: 7.5h</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <LogVitalsModal
        isOpen={activeModal === 'logVitals'}
        onClose={closeModal}
      />
      <ViewProgressModal
        isOpen={activeModal === 'viewProgress'}
        onClose={closeModal}
      />
      <ScheduleModal
        isOpen={activeModal === 'schedule'}
        onClose={closeModal}
      />
      <AIChatModal
        isOpen={activeModal === 'aiChat'}
        onClose={closeModal}
      />
    </motion.aside>
  );
};

export default Sidebar;