import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnalyticsCards from './AnalyticsCards';
import EnhancedCharts from './EnhancedCharts';
import EnhancedTransactionTable from './EnhancedTransactionTable';
import EnhancedAIInsights from './EnhancedAIInsights';
import AnimatedWidgets from './AnimatedWidgets';
import { 
  Settings, 
  LayoutDashboard,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';

const ModernDashboard = ({ 
  totalExpenses = 45820.50, 
  monthlyBudget = 5000,
  thisMonthSpent = 3240.80,
  savingsGoal = 1000,
  currency = '$',
  darkMode = false
}) => {
  const [activeView, setActiveView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const viewOptions = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: PieChart },
    { id: 'insights', label: 'AI Insights', icon: TrendingUp }
  ];

  const sampleExpenses = [
    { id: 1, description: 'Amazon Purchase', category: 'Shopping', amount: 129.99, date: '2024-01-15', trend: 'up' },
    { id: 2, description: 'Grocery Store', category: 'Food', amount: 87.43, date: '2024-01-14', trend: 'neutral' },
    { id: 3, description: 'Gas Station', category: 'Travel', amount: 65.00, date: '2024-01-13', trend: 'down' },
    { id: 4, description: 'Netflix Subscription', category: 'Entertainment', amount: 15.99, date: '2024-01-12', trend: 'neutral' },
    { id: 5, description: 'Restaurant', category: 'Food', amount: 45.60, date: '2024-01-11', trend: 'up' },
    { id: 6, description: 'Whole Foods Market', category: 'Food', amount: 156.78, date: '2024-01-10', trend: 'up' },
    { id: 7, description: 'Uber Ride', category: 'Transport', amount: 32.50, date: '2024-01-09', trend: 'neutral' },
    { id: 8, description: 'Electric Bill', category: 'Bills', amount: 125.00, date: '2024-01-08', trend: 'up' }
  ];

  const sampleCategoryData = [
    { name: 'Food', value: 1240.50, percentage: 38.2, color: 'from-blue-500 to-blue-600' },
    { name: 'Shopping', value: 890.25, percentage: 27.4, color: 'from-green-500 to-green-600' },
    { name: 'Transport', value: 540.00, percentage: 16.6, color: 'from-purple-500 to-purple-600' },
    { name: 'Entertainment', value: 320.05, percentage: 9.9, color: 'from-orange-500 to-orange-600' },
    { name: 'Bills', value: 450.00, percentage: 13.9, color: 'from-red-500 to-pink-600' }
  ];

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Analytics Cards */}
            <AnalyticsCards 
              totalExpenses={totalExpenses}
              monthlyBudget={monthlyBudget}
              thisMonthSpent={thisMonthSpent}
              savingsGoal={savingsGoal}
              currency={currency}
              darkMode={darkMode}
            />
            
            {/* Animated Widgets */}
            <AnimatedWidgets 
              currency={currency}
              expenses={sampleExpenses}
              darkMode={darkMode}
            />
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-8">
            {/* Charts Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analytics & Charts
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search analytics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`
                        w-64 pl-10 pr-4 py-2.5 rounded-xl border
                        ${darkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        }
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition-all
                      `}
                    />
                  </div>
                  <button className={`
                    p-2.5 rounded-xl border transition-all
                    ${darkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                    }
                  `}>
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <EnhancedCharts 
                data={sampleCategoryData}
                currency={currency}
                darkMode={darkMode}
                type="spending"
              />
            </div>
          </div>
        );
      
      case 'transactions':
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Transaction Management
              </h2>
              
              <EnhancedTransactionTable 
                transactions={sampleExpenses}
                currency={currency}
                darkMode={darkMode}
              />
            </div>
          </div>
        );
      
      case 'insights':
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                AI-Powered Insights
              </h2>
              
              <EnhancedAIInsights 
                expenses={sampleExpenses}
                currency={currency}
                darkMode={darkMode}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd' stroke='%239CA3AF' stroke-width='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 p-6">
        {/* View Navigation */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
              AI Expense Tracker
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Premium Financial Dashboard
            </p>
          </div>
          
          {/* View Selector */}
          <div className="flex items-center gap-2">
            {viewOptions.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${activeView === view.id 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{view.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Settings Button */}
          <button className={`
            p-2.5 rounded-xl transition-all
            ${darkMode 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}>
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {renderView()}
        </motion.div>
      </div>
    </div>
  );
};

export default ModernDashboard;
