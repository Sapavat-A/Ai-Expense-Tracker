import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Zap, 
  Activity, 
  Users, 
  CreditCard, 
  PieChart, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Bell,
  Star,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react';

const AnimatedWidgets = ({ 
  currency = '$', 
  darkMode = false,
  expenses = [] 
}) => {
  const [widgetData, setWidgetData] = useState({
    spendingTrend: { current: 3240, previous: 2800, change: 15.7 },
    budgetProgress: { used: 3240, total: 5000, percentage: 64.8 },
    savingsGoal: { current: 750, target: 1000, percentage: 75 },
    recentActivity: [],
    quickStats: { totalTransactions: 156, thisMonth: 45, today: 8 }
  });

  const [expandedWidget, setExpandedWidget] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setWidgetData(prev => ({
        ...prev,
        spendingTrend: {
          current: prev.spendingTrend.current + Math.random() * 100 - 50,
          previous: prev.spendingTrend.current,
          change: prev.spendingTrend.change + (Math.random() - 0.5) * 10
        },
        quickStats: {
          ...prev.quickStats,
          totalTransactions: prev.quickStats.totalTransactions + Math.floor(Math.random() * 3),
          today: prev.quickStats.today + Math.floor(Math.random() * 2)
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  // Widget Components
  const SpendingTrendWidget = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden rounded-2xl border p-6 shadow-lg
        ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}
        backdrop-blur-xl transition-all duration-300
        hover:shadow-2xl
      `}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className={`
          absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20
          ${expandedWidget === 'spending' ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-500
        `} />
        
        {/* Animated Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Spending Trend
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time analysis
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setExpandedWidget(expandedWidget === 'spending' ? null : 'spending')}
            className={`
              p-2 rounded-lg transition-all
              ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {expandedWidget === 'spending' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Month</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(widgetData.spendingTrend.current)}
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2">
                {widgetData.spendingTrend.change > 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-lg font-semibold ${
                  widgetData.spendingTrend.change > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(widgetData.spendingTrend.change).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Previous Month</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(widgetData.spendingTrend.previous)}
              </p>
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        {expandedWidget === 'spending' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <div className="h-32 flex items-end justify-between gap-2">
              {[65, 80, 45, 90, 75, 85, 70, 95].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.8 }}
                  className="flex-1 bg-gradient-to-t from-blue-500/20 to-purple-500/20 rounded-t-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-blue-400/30" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  const BudgetProgressWidget = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden rounded-2xl border p-6 shadow-lg
        ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}
        backdrop-blur-xl transition-all duration-300
        hover:shadow-2xl
      `}
    >
      {/* Animated Ring Progress */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32"
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={darkMode ? "#374151" : "#e5e7eb"}
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#budget-gradient)"
              strokeWidth="8"
              strokeDasharray={`${widgetData.budgetProgress.percentage * 2.83} 283`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="budget-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="mb-4">
          <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {widgetData.budgetProgress.percentage.toFixed(1)}%
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Budget Used
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Spent</span>
            <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(widgetData.budgetProgress.used)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remaining</span>
            <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(widgetData.budgetProgress.total - widgetData.budgetProgress.used)}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Target className={`h-4 w-4 ${widgetData.budgetProgress.percentage > 80 ? 'text-red-500' : 'text-blue-500'}`} />
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {widgetData.budgetProgress.percentage > 80 
                ? `${100 - widgetData.budgetProgress.percentage.toFixed(0)}% budget remaining` 
                : 'On track with budget'
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const QuickStatsWidget = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden rounded-2xl border p-6 shadow-lg
        ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}
        backdrop-blur-xl transition-all duration-300
        hover:shadow-2xl
      `}
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1, 1.2, 1, 1.2, 1, 1, 1],
              opacity: [0.1, 0.2, 0.1, 0.2, 0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${20 + (i % 3) * 30}%`,
              top: `${20 + Math.floor(i / 3) * 30}%`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white mb-2 inline-block">
              <Activity className="h-6 w-6" />
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {widgetData.quickStats.totalTransactions}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Transactions
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white mb-2 inline-block">
              <Calendar className="h-6 w-6" />
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {widgetData.quickStats.thisMonth}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This Month
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-white mb-2 inline-block">
              <Clock className="h-6 w-6" />
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {widgetData.quickStats.today}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Today
            </p>
          </div>
          
          <div className="col-span-2 text-center">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white mb-2 inline-block">
              <Zap className="h-6 w-6" />
            </div>
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Live Data
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time updates
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Spending Trend Widget */}
      <SpendingTrendWidget />
      
      {/* Budget Progress Widget */}
      <BudgetProgressWidget />
      
      {/* Quick Stats Widget */}
      <QuickStatsWidget />
      
      {/* Refresh Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={refreshData}
        disabled={isRefreshing}
        className={`
          lg:col-span-3 flex items-center justify-center gap-3 p-4 rounded-2xl border
          transition-all duration-300
          ${isRefreshing 
            ? 'opacity-50 cursor-not-allowed' 
            : darkMode 
              ? 'bg-gray-900/80 border-gray-700 hover:bg-gray-900/90' 
              : 'bg-white/80 border-gray-200 hover:bg-white/90'
          }
        `}
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5" />
            <span>Refresh All Widgets</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default AnimatedWidgets;
