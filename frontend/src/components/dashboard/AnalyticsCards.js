import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Target, 
  PieChart, 
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Activity,
  Users,
  Eye,
  Calendar,
  Briefcase,
  ShoppingCart,
  Home
} from 'lucide-react';

const AnalyticsCards = ({ 
  totalExpenses = 45820.50, 
  monthlyBudget = 5000,
  thisMonthSpent = 3240.80,
  savingsGoal = 1000,
  currency = '$',
  darkMode = false 
}) => {
  const analyticsData = [
    {
      id: 'balance',
      title: 'Total Balance',
      value: 12580.20,
      change: 12.5,
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-blue-600 via-cyan-500 to-teal-600',
      bgColor: darkMode ? 'from-blue-900/20 to-cyan-900/20' : 'from-blue-50 to-cyan-50',
      borderColor: darkMode ? 'border-blue-800/30' : 'border-blue-200',
      textColor: darkMode ? 'text-blue-100' : 'text-blue-900',
      iconBg: darkMode ? 'bg-blue-800' : 'bg-blue-600',
      description: 'Available funds across all accounts'
    },
    {
      id: 'spending',
      title: 'Monthly Spending',
      value: thisMonthSpent,
      change: -8.2,
      trend: 'down',
      icon: CreditCard,
      gradient: 'from-emerald-600 via-green-500 to-teal-600',
      bgColor: darkMode ? 'from-emerald-900/20 to-green-900/20' : 'from-emerald-50 to-green-50',
      borderColor: darkMode ? 'border-emerald-800/30' : 'border-emerald-200',
      textColor: darkMode ? 'text-emerald-100' : 'text-emerald-900',
      iconBg: darkMode ? 'bg-emerald-800' : 'bg-emerald-600',
      description: 'Total expenses this month'
    },
    {
      id: 'budget',
      title: 'Budget Used',
      value: 64.8,
      change: 0,
      trend: 'neutral',
      icon: Target,
      gradient: 'from-orange-600 via-red-500 to-pink-600',
      bgColor: darkMode ? 'from-orange-900/20 to-red-900/20' : 'from-orange-50 to-red-50',
      borderColor: darkMode ? 'border-orange-800/30' : 'border-orange-200',
      textColor: darkMode ? 'text-orange-100' : 'text-orange-900',
      iconBg: darkMode ? 'bg-orange-800' : 'bg-orange-600',
      description: `${monthlyBudget ? currency + monthlyBudget : 'No budget set'}`
    },
    {
      id: 'savings',
      title: 'Savings Goal',
      value: 75.0,
      change: 15.3,
      trend: 'up',
      icon: PieChart,
      gradient: 'from-violet-600 via-purple-500 to-indigo-600',
      bgColor: darkMode ? 'from-violet-900/20 to-purple-900/20' : 'from-violet-50 to-purple-50',
      borderColor: darkMode ? 'border-violet-800/30' : 'border-violet-200',
      textColor: darkMode ? 'text-violet-100' : 'text-violet-900',
      iconBg: darkMode ? 'bg-violet-800' : 'bg-violet-600',
      description: 'Progress towards annual goal'
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {analyticsData.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            whileHover={{ 
              scale: 1.02, 
              y: -4,
              transition: { duration: 0.2 }
            }}
            className="group relative overflow-hidden"
          >
            {/* Glassmorphism Card */}
            <div className={`
              relative h-full rounded-2xl border
              ${card.bgColor} ${card.borderColor}
              backdrop-blur-xl shadow-2xl
              transition-all duration-300
              hover:shadow-3xl
            `}>
              {/* Animated Background Gradient */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${card.gradient}
                opacity-0 group-hover:opacity-20
                transition-opacity duration-500
              `} />
              
              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              
              {/* Content */}
              <div className="relative p-6 z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    p-3 rounded-xl shadow-lg
                    ${card.iconBg}
                    transition-all duration-300
                    group-hover:scale-110
                  `}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(card.trend)}
                      <span className={`text-sm font-semibold ${getTrendColor(card.trend)}`}>
                        {card.change > 0 ? '+' : ''}{Math.abs(card.change)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="space-y-2">
                  <p className={`text-sm font-medium ${card.textColor} opacity-80`}>
                    {card.title}
                  </p>
                  
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${card.textColor}`}>
                      {formatCurrency(card.value)}
                    </span>
                    
                    {card.id === 'budget' && (
                      <span className={`text-lg font-medium ${card.textColor} opacity-70`}>
                        / {formatCurrency(monthlyBudget)}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Bar for Budget */}
                  {card.id === 'budget' && monthlyBudget > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${card.value}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full bg-gradient-to-r ${card.gradient}`}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className={`text-xs ${card.textColor} opacity-70`}>
                          {currency}{(monthlyBudget * card.value / 100).toFixed(0)} used
                        </span>
                        <span className={`text-xs ${card.textColor} opacity-70`}>
                          {currency}{(monthlyBudget * (1 - card.value / 100)).toFixed(0)} remaining
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className={`text-xs ${card.textColor} opacity-60 mt-3`}>
                  {card.description}
                </p>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full bg-white/40 animate-pulse`} />
              </div>
              
              <div className="absolute bottom-2 left-2">
                <div className={`w-1 h-1 rounded-full bg-white/30`} />
              </div>
              
              <div className="absolute top-4 left-4">
                <div className={`w-1 h-1 rounded-full bg-white/20`} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnalyticsCards;
