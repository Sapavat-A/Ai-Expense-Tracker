import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Moon, 
  Sun, 
  Settings,
  User,
  LogOut,
  Plus,
  CreditCard,
  TrendingUp,
  Menu,
  X,
  ChevronDown,
  Filter,
  Download,
  Calendar
} from 'lucide-react';
import ModernAuthModal from '../auth/ModernAuthModal';

const ModernNavbar = ({ user, onLogin, onLogout, darkMode, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'budget_alert',
      title: 'Budget Alert',
      message: 'You\'ve used 80% of your Food budget',
      time: '2 min ago',
      read: false,
      icon: 'alert',
      color: 'red'
    },
    {
      id: 2,
      type: 'transaction',
      title: 'New Transaction',
      message: 'Netflix subscription charged',
      time: '15 min ago',
      read: false,
      icon: 'transaction',
      color: 'blue'
    },
    {
      id: 3,
      type: 'insight',
      title: 'AI Insight',
      message: 'Your spending decreased by 15% this month',
      time: '1 hour ago',
      read: true,
      icon: 'insight',
      color: 'green'
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: '30-day streak completed!',
      time: '2 hours ago',
      read: true,
      icon: 'achievement',
      color: 'purple'
    }
  ];

  const handleAuthSuccess = (authData) => {
    onLogin(authData);
    setShowAuthModal(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleProfileClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    onLogout();
  };

  return (
    <>
      {/* Auth Modal */}
      <ModernAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        darkMode={darkMode}
      />

      {/* Modern Navbar */}
      <motion.nav
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo and Search */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    FinTrack Pro
                  </h1>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative hidden md:block flex-1 max-w-md">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isSearchFocused 
                      ? 'text-blue-500' 
                      : darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search transactions, categories, insights..."
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSearchFocused ? 'ring-opacity-100' : 'ring-opacity-0'
                    } transition-all duration-200`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors duration-200 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Center Section - Quick Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Add</span>
              </button>
              
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </button>
            </div>

            {/* Right Section - Notifications, Theme, Profile */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-xl transition-colors duration-200 ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {/* Notification Badge */}
                  {notifications.filter(n => !n.read).length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-bold">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    </motion.span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className={`absolute right-0 top-full mt-2 w-96 rounded-2xl border shadow-2xl backdrop-blur-xl z-50 ${
                        darkMode 
                          ? 'border-gray-700 bg-gray-800' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Notifications
                          </h3>
                          <button className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-blue-500`}>
                            Mark all as read
                          </button>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-start space-x-3 p-3 rounded-xl ${
                                !notification.read 
                                  ? darkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'
                                  : 'bg-transparent'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                notification.color === 'red' ? 'bg-red-500' :
                                notification.color === 'blue' ? 'bg-blue-500' :
                                notification.color === 'green' ? 'bg-green-500' :
                                'bg-purple-500'
                              }`}>
                                {notification.icon === 'alert' && <Bell className="w-4 h-4 text-white" />}
                                {notification.icon === 'transaction' && <CreditCard className="w-4 h-4 text-white" />}
                                {notification.icon === 'insight' && <TrendingUp className="w-4 h-4 text-white" />}
                                {notification.icon === 'achievement' && <div className="text-white text-xs font-bold">🏆</div>}
                              </div>
                              <div className="flex-1 text-left">
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {notification.title}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                                  {notification.time}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={handleProfileClick}
                    className={`flex items-center space-x-2 p-2 rounded-xl transition-all duration-200 ${
                      darkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-500 ring-opacity-50">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl backdrop-blur-xl z-50 ${
                          darkMode 
                            ? 'border-gray-700 bg-gray-800' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="p-4">
                          {/* Profile Header */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.name}
                              </h4>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plan</p>
                              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.subscription || 'Premium'}
                              </p>
                            </div>
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Member</p>
                              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Since {user.memberSince || '2024'}
                              </p>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="space-y-2">
                            <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}>
                              <User className="w-4 h-4" />
                              <div className="text-left">
                                <span>My Profile</span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  Account settings and preferences
                                </p>
                              </div>
                            </button>
                              
                            <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}>
                              <Settings className="w-4 h-4" />
                              <div className="text-left">
                                <span>Settings</span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  App configuration
                                </p>
                              </div>
                            </button>

                            <div className={`h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} my-2`}></div>

                            <button
                              onClick={handleLogout}
                              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                                darkMode 
                                  ? 'hover:bg-gray-700 text-red-400' 
                                  : 'hover:bg-gray-50 text-red-600'
                              }`}
                            >
                              <LogOut className="w-4 h-4" />
                              <div className="text-left">
                                <span>Sign Out</span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  Sign out of your account
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg`}
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors duration-200 ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default ModernNavbar;
