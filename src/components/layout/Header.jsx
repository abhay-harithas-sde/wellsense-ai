import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Settings, LogOut, ChevronDown, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
// Dark mode removed - using light theme only
import Logo from '../ui/Logo';
import SettingsModal from '../settings/SettingsModal';

const Header = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-xl border-b border-gray-200/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {/* Mobile menu button & Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile menu button */}
            <motion.button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            {/* Enhanced Logo - responsive */}
            <motion.div
              className="flex items-center space-x-2 sm:space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="relative">
                <Logo size="sm" variant="icon" className="sm:hidden" />
                <Logo size="md" variant="full" className="hidden sm:block" />
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Search Bar - responsive */}
          <div className="flex-1 max-w-lg mx-2 sm:mx-4 lg:mx-8">
            {/* Desktop search */}
            <motion.div
              className="relative hidden sm:block"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Ask AI about your health..."
                className="w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2 lg:py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 focus:bg-white/90 transition-all duration-300 text-gray-700 placeholder-gray-400 text-sm lg:text-base"
              />
              <div className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Mobile search button */}
            <motion.button
              onClick={() => setShowSearch(!showSearch)}
              className="sm:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Enhanced User Actions - responsive */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            {/* Notifications - hidden on small screens */}
            <motion.button
              className="hidden sm:flex p-2 lg:p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-300 relative backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              <motion.span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.span>
            </motion.button>

            {/* Settings - hidden on small screens */}
            <motion.button
              onClick={() => setShowSettings(true)}
              className="hidden sm:flex p-2 lg:p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.button>

            {/* Enhanced User Menu - responsive */}
            <div className="relative">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-gray-50/80 to-blue-50/80 hover:from-gray-100/80 hover:to-blue-100/80 backdrop-blur-sm rounded-xl sm:rounded-2xl px-2 sm:px-3 lg:px-4 py-2 sm:py-3 transition-all duration-300 border border-white/20 shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-sm font-semibold text-gray-800 block">
                    {user?.firstName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden sm:block"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 sm:mt-3 w-48 sm:w-56 bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50/50 flex items-center space-x-3 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <User className="w-4 h-4 text-blue-500" />
                      <span>Profile Settings</span>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setShowSettings(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50/50 flex items-center space-x-3 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span>Settings</span>
                    </motion.button>

                    <div className="border-t border-gray-100/50 mt-2 pt-2">
                      <motion.button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 flex items-center space-x-3 transition-colors"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/20 p-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ask AI about your health..."
                  className="w-full pl-10 pr-10 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 focus:bg-white/90 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default Header;