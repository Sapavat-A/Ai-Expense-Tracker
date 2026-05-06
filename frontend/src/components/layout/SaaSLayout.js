import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Activity, 
  Bell, 
  Plus,
  CreditCard,
  FileText,
  BarChart3,
  PieChart,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  Brain
} from 'lucide-react';
import IntegratedAuth from '../auth/IntegratedAuth';

const SaaSLayout = ({ children, user, onLogout, darkMode, toggleTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const navigationModules = [
    {
      id: 'overview',
      name: 'Overview',
      icon: Home,
      description: 'Dashboard overview and key metrics',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'transactions',
      name: 'Transactions',
      icon: CreditCard,
      description: 'Manage and track all expenses',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'Spending insights and trends',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'budget',
      name: 'Budget',
      icon: Target,
      description: 'Budget planning and monitoring',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'ai-insights',
      name: 'AI Insights',
      icon: Brain,
      description: 'Smart recommendations and predictions',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: FileText,
      description: 'Generate detailed reports',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'User preferences and configuration',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  const handleModuleClick = (moduleId) => {
    setActiveModule(moduleId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    // This will be handled by the parent App component
    setShowAuth(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    AI Expense Tracker
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    SaaS Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.id)}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeModule === module.id
                      ? `text-white bg-gradient-to-r ${module.color} shadow-lg`
                      : darkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <module.icon className="w-4 h-4" />
                  <span className="ml-2">{module.name}</span>
                  {activeModule === module.id && (
                    <motion.div
                      layoutId="module.id"
                      className="absolute -bottom-1 left-1/2 right-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      initial={false}
                      animate={{ width: '100%' }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {darkMode ? (
                  <div className="w-5 h-5">🌙</div>
                ) : (
                  <div className="w-5 h-5">☀️</div>
                )}
              </button>

              {/* Notifications */}
              <button className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                <Bell className="w-5 h-5" />
              </button>

              {/* User Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-500 ring-opacity-50">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.subscription === 'premium' 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {user.subscription || 'Premium'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            darkMode ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
                          }`}>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
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
                        <div className="p-6">
                          {/* Profile Header */}
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                              <User className="w-6 h-6 text-white" />
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

                          {/* User Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Member Since</p>
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subscription</p>
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.subscription || 'Premium'}
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
                                <span>Profile Settings</span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  Manage your account information
                                </p>
                              </div>
                            </button>
                            <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}>
                              <Bell className="w-4 h-4" />
                              <div className="text-left">
                                <span>Notifications</span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  Configure alerts and preferences
                                </p>
                              </div>
                            </button>
                            <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}>
                              <Shield className="w-4 h-4" />
                              <div className="text-left">
                                <span>Security</span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  Password and authentication settings
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
                                <span>Preferences</span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  Theme, currency, and display options
                                </p>
                              </div>
                            </button>
                            <div className={`h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} my-2`}></div>
                            <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}>
                              <DollarSign className="w-4 h-4" />
                              <div className="text-left">
                                <span>Billing & Plans</span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  Subscription and payment methods
                                </p>
                              </div>
                            </button>
                            <div className={`h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} my-2`}></div>
                            <button
                              onClick={onLogout}
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
                  onClick={() => setShowAuth(true)}
                  className={`px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden ${
          darkMode 
            ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`fixed inset-y-0 left-0 z-40 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl md:hidden`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Navigation
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`p-1 rounded-lg ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleModuleClick(module.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeModule === module.id
                        ? `text-white bg-gradient-to-r ${module.color} shadow-lg`
                        : darkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <module.icon className="w-5 h-5 mr-3" />
                    <span>{module.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarOpen ? 'md:ml-64' : ''} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <IntegratedAuth
            darkMode={darkMode}
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setShowAuth(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaaSLayout;
