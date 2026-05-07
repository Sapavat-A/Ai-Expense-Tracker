import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Brain,
  FileText,
  Settings,
  CreditCard,
  PieChart,
  ChevronDown,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Calendar,
  TrendingDown,
  DollarSign,
  Activity
} from 'lucide-react';

const FintechSidebar = ({ 
  user, 
  onLogout, 
  darkMode, 
  toggleTheme, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: Home,
      description: 'Dashboard overview and key metrics',
      color: 'from-blue-500 to-indigo-600',
      badge: null
    },
    {
      id: 'transactions',
      name: 'Transactions',
      icon: CreditCard,
      description: 'Manage and track all expenses',
      color: 'from-green-500 to-emerald-600',
      badge: null
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'Spending insights and trends',
      color: 'from-purple-500 to-pink-600',
      badge: null
    },
    {
      id: 'budget',
      name: 'Budget',
      icon: Target,
      description: 'Budget planning and monitoring',
      color: 'from-orange-500 to-red-600',
      badge: null
    },
    {
      id: 'ai-insights',
      name: 'AI Insights',
      icon: Brain,
      description: 'Smart recommendations and predictions',
      color: 'from-emerald-500 to-teal-600',
      badge: 'AI'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: FileText,
      description: 'Generate detailed reports',
      color: 'from-cyan-500 to-blue-600',
      badge: null
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'User preferences and configuration',
      color: 'from-gray-500 to-slate-600',
      badge: null
    }
  ];

  const handleLogout = () => {
    setIsProfileOpen(false);
    onLogout();
  };

  return (
    <motion.div
      initial={{ x: isCollapsed ? -256 : 0 }}
      animate={{ x: isCollapsed ? -256 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed left-0 top-0 h-full w-64 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-r ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      } shadow-xl z-40`}
    >
      {/* Sidebar Header */}
      <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Expense Tracker
              </h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                AI Powered Personal Finance Manager
              </p>
            </div>
          </div>
          <button
            onClick={onToggleCollapse}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === `/${item.id}` || 
                          (item.id === 'overview' && location.pathname === '/') ||
                          (item.id === 'ai-insights' && location.pathname === '/ai-insights');
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <NavLink
                to={item.id === 'overview' ? '/' : `/${item.id}`}
                className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `text-white bg-gradient-to-r ${item.color} shadow-lg`
                    : darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        item.badge === 'AI' 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white animate-pulse' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {item.description}
                    </p>
                  )}
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 top-1/2 w-2 h-2 bg-white rounded-full"
                    initial={false}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-500 ring-opacity-50">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Users className="w-6 h-6 text-white" />
                )}
              </div>
              {user?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'Guest User'}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {user?.email || 'guest@example.com'}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user?.subscription === 'premium' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {user?.subscription || 'Free'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  darkMode ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
                }`}>
                  {user?.status || 'Active'}
                </span>
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
                className={`absolute bottom-full left-0 mb-2 w-80 rounded-2xl border shadow-2xl backdrop-blur-xl z-50 ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="p-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Balance</p>
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {'$' + Number(user?.balance ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {'$' + Number(user?.monthlySpent ?? 0).toLocaleString()}
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
                      <Users className="w-4 h-4" />
                      <div className="text-left">
                        <span>Profile</span>
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
                      <Bell className="w-4 h-4" />
                      <div className="text-left">
                        <span>Notifications</span>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          Alerts and updates
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
      </div>

      {/* Collapse Button (when expanded) */}
      {!isCollapsed && (
        <button
          onClick={onToggleCollapse}
          className={`absolute top-6 -right-4 p-2 rounded-lg transition-colors duration-200 ${
            darkMode 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
};

export default FintechSidebar;
