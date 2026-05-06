import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Wallet, 
  TrendingUp, 
  Target, 
  CreditCard, 
  PieChart, 
  FileText, 
  Settings, 
  HelpCircle,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

const ModernSidebar = ({ activeSection, onSectionChange, isCollapsed, onToggleCollapse }) => {
  const menuItems = [
    {
      id: 'overview',
      icon: Home,
      label: 'Overview',
      badge: null,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'transactions',
      icon: Wallet,
      label: 'Transactions',
      badge: '12',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics',
      badge: null,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'budget',
      icon: Target,
      label: 'Budget',
      badge: null,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'cards',
      icon: CreditCard,
      label: 'Cards',
      badge: null,
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'reports',
      icon: FileText,
      label: 'Reports',
      badge: '3',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'insights',
      icon: PieChart,
      label: 'Insights',
      badge: 'AI',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      badge: null,
      gradient: 'from-gray-500 to-slate-500'
    }
  ];

  const bottomMenuItems = [
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support'
    },
    {
      id: 'security',
      icon: Shield,
      label: 'Security'
    }
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: isCollapsed ? -300 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-16 bottom-0 z-30 w-72 bg-white/10 backdrop-blur-xl border-r border-white/20"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h3 className="font-bold text-gray-900">Expense Tracker</h3>
                  <p className="text-xs text-gray-500">Premium Dashboard</p>
                </div>
              )}
            </div>
            
            {/* Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="p-2 text-gray-600 hover:bg-white/20 rounded-lg transition-all"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'shadow-lg'
                      : 'hover:shadow-md hover:scale-[1.02]'
                  }`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'group-hover:opacity-30'
                  }`} />
                  
                  {/* Content */}
                  <div className="relative flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-white shadow-lg'
                          : 'bg-white/50 group-hover:bg-white'
                      }`}>
                        <Icon className={`h-5 w-5 transition-colors duration-300 ${
                          isActive
                            ? 'text-gray-900'
                            : 'text-gray-600 group-hover:text-gray-900'
                        }`} />
                        
                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute -right-1 -top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </div>
                      
                      {/* Label */}
                      {!isCollapsed && (
                        <div className="text-left">
                          <p className={`font-medium text-sm transition-colors duration-300 ${
                            isActive
                              ? 'text-gray-900'
                              : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {item.label}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Badge */}
                    {!isCollapsed && item.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          item.badge === 'AI'
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        }`}
                      >
                        {item.badge}
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10">
          <nav className="space-y-2">
            {bottomMenuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.4 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-white/20 hover:text-gray-900 transition-all duration-300 group"
                >
                  <Icon className="h-4 w-4 transition-colors duration-300" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Collapsed State Tooltip */}
      {isCollapsed && (
        <div className="absolute left-full top-0 z-40">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <div
                key={item.id}
                className="relative group"
              >
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 ml-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.aside>
  );
};

export default ModernSidebar;
