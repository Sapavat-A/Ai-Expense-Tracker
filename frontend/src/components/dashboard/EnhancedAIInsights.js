import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  BarChart3, 
  PieChart, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Coffee,
  Car,
  RefreshCw,
  Settings,
  ChevronRight,
  Sparkles,
  Activity,
  Eye,
  Download,
  Share2
} from 'lucide-react';

const EnhancedAIInsights = ({ 
  expenses = [], 
  currency = '$', 
  darkMode = false,
  onRefresh 
}) => {
  const [insights, setInsights] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [insightType, setInsightType] = useState('all');

  const insightTypes = [
    { id: 'all', label: 'All Insights', icon: Brain },
    { id: 'spending', label: 'Spending Patterns', icon: TrendingUp },
    { id: 'savings', label: 'Savings Opportunities', icon: Target },
    { id: 'budget', label: 'Budget Analysis', icon: BarChart3 },
    { id: 'prediction', label: 'AI Predictions', icon: Zap }
  ];

  useEffect(() => {
    generateInsights();
  }, [expenses]);

  const generateInsights = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newInsights = [
      {
        id: 1,
        type: 'spending',
        title: 'Spending Spike Detected',
        description: 'Your food expenses increased by 35% this week compared to your average',
        impact: 'high',
        recommendation: 'Consider meal planning and setting a weekly food budget of $200',
        potentialSavings: 150,
        confidence: 92,
        icon: AlertTriangle,
        trend: 'up',
        data: {
          current: 450,
          average: 333,
          percentage: 35,
          category: 'Food'
        }
      },
      {
        id: 2,
        type: 'savings',
        title: 'Smart Savings Opportunity',
        description: 'You could save $120/month by switching to annual subscriptions for entertainment services',
        impact: 'medium',
        recommendation: 'Review your subscriptions and look for annual payment options',
        potentialSavings: 120,
        confidence: 87,
        icon: Lightbulb,
        trend: 'neutral',
        data: {
          monthlyCurrent: 85,
          annualPotential: 45,
          services: ['Netflix', 'Spotify', 'Adobe Creative']
        }
      },
      {
        id: 3,
        type: 'budget',
        title: 'Budget Health Warning',
        description: 'You\'ve used 85% of your monthly budget with 10 days remaining',
        impact: 'high',
        recommendation: 'Reduce daily spending to $50 to stay within budget',
        potentialSavings: 0,
        confidence: 95,
        icon: AlertTriangle,
        trend: 'up',
        data: {
          used: 85,
          remaining: 15,
          dailyRecommended: 50,
          daysLeft: 10
        }
      },
      {
        id: 4,
        type: 'prediction',
        title: 'AI Expense Prediction',
        description: 'Based on your patterns, we predict next month\'s expenses will be $3,450',
        impact: 'low',
        recommendation: 'Start saving an extra $200 now to prepare for higher expenses',
        potentialSavings: 200,
        confidence: 78,
        icon: Brain,
        trend: 'neutral',
        data: {
          predicted: 3450,
          confidence: 78,
          factors: ['Seasonal trends', 'Recent spending increase']
        }
      },
      {
        id: 5,
        type: 'spending',
        title: 'Unusual Transaction Pattern',
        description: 'Detected 3 transactions over $500 on weekends, unusual for your spending habits',
        impact: 'medium',
        recommendation: 'Review weekend spending and consider setting lower limits',
        potentialSavings: 200,
        confidence: 88,
        icon: Activity,
        trend: 'up',
        data: {
          weekendTotal: 1650,
          weekdayAverage: 85,
          transactions: 3
        }
      },
      {
        id: 6,
        type: 'savings',
        title: 'Subscription Optimization',
        description: 'You have 7 active subscriptions totaling $180/month. 2 are underutilized.',
        impact: 'medium',
        recommendation: 'Cancel underutilized services and save $45/month',
        potentialSavings: 45,
        confidence: 91,
        icon: CheckCircle,
        trend: 'down',
        data: {
          total: 180,
          underutilized: 2,
          savings: 45
        }
      }
    ];

    setInsights(newInsights);
    setIsAnalyzing(false);
  };

  const filteredInsights = insightType === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === insightType);

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'from-red-500 to-pink-500';
      case 'medium':
        return 'from-orange-500 to-yellow-500';
      case 'low':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            AI Insights
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Smart analysis powered by machine learning
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Insight Type Filter */}
          <div className="flex items-center gap-2">
            {insightTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setInsightType(type.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${insightType === type.id 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            onClick={generateInsights}
            disabled={isAnalyzing}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${isAnalyzing 
                ? 'opacity-50 cursor-not-allowed' 
                : darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredInsights.map((insight, index) => {
          const Icon = insight.icon;
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
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
              onClick={() => setSelectedInsight(selectedInsight?.id === insight.id ? null : insight)}
              className="group cursor-pointer"
            >
              {/* Glassmorphism Card */}
              <div className={`
                relative h-full p-6 rounded-2xl border backdrop-blur-xl shadow-2xl
                transition-all duration-300
                hover:shadow-3xl
                ${selectedInsight?.id === insight.id 
                  ? 'ring-2 ring-violet-500' 
                  : ''}
                ${darkMode 
                  ? 'bg-gray-900/80 border-gray-700' 
                  : 'bg-white/80 border-gray-200'
                }
              `}>
                {/* Animated Background Gradient */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${getImpactColor(insight.impact)}
                  opacity-0 group-hover:opacity-20
                  transition-opacity duration-500
                `} />
                
                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      p-3 rounded-xl shadow-lg
                      bg-gradient-to-r ${getImpactColor(insight.impact)}
                      text-white transition-all duration-300
                      group-hover:scale-110
                    `}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Confidence Score */}
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-bold
                        ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-900 text-white'}
                      `}>
                        {insight.confidence}% confidence
                      </div>
                      
                      {/* Trend */}
                      <div className="flex items-center gap-1">
                        {getTrendIcon(insight.trend)}
                        <span className={`text-sm font-semibold ${
                          insight.trend === 'up' ? 'text-red-500' : 
                          insight.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {insight.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="space-y-3">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {insight.title}
                    </h3>
                    
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                      {insight.description}
                    </p>
                    
                    {/* Recommendation */}
                    <div className={`
                      mt-4 p-3 rounded-xl
                      ${darkMode ? 'bg-gray-800/50' : 'bg-blue-50'}
                      border ${darkMode ? 'border-gray-700' : 'border-blue-200'}
                    `}>
                      <div className="flex items-start gap-2">
                        <Lightbulb className={`h-4 w-4 mt-0.5 ${
                          insight.impact === 'high' ? 'text-red-500' :
                          insight.impact === 'medium' ? 'text-orange-500' : 'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Recommendation:
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Potential Savings */}
                    {insight.potentialSavings > 0 && (
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Potential savings:
                        </span>
                        <span className={`
                          text-lg font-bold
                          ${darkMode ? 'text-green-400' : 'text-green-600'}
                        `}>
                          {formatCurrency(insight.potentialSavings)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-2 right-2">
                  <div className={`w-2 h-2 rounded-full bg-white/40 animate-pulse`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Insight Detail Modal */}
      {selectedInsight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInsight(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={`
              relative w-full max-w-2xl mx-4 p-6 rounded-2xl border shadow-2xl
              ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
            `}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedInsight.title}
              </h3>
              <button
                onClick={() => setSelectedInsight(null)}
                className={`
                  p-2 rounded-lg transition-all
                  ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`
                  p-4 rounded-xl
                  ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}
                `}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Confidence Score
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedInsight.confidence}%
                  </p>
                </div>
                
                <div className={`
                  p-4 rounded-xl
                  ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}
                `}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Impact Level
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${selectedInsight.impact === 'high' ? 'bg-red-500' :
                        selectedInsight.impact === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}
                    }
                    `} />
                    <span className={`text-lg font-bold capitalize ${
                      selectedInsight.impact === 'high' ? 'text-red-600' :
                        selectedInsight.impact === 'medium' ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {selectedInsight.impact}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Visualization */}
              {selectedInsight.data && (
                <div className={`
                  p-4 rounded-xl
                  ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}
                `}>
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                    Detailed Analysis
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(selectedInsight.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className={`text-sm capitalize ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {key.replace(/([A-Z])/g, ' $1')}:
                        </span>
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {typeof value === 'number' ? formatCurrency(value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}>
                  <Share2 className="h-4 w-4" />
                  Share Insight
                </button>
                <button className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}>
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedAIInsights;
