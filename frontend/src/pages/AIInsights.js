import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Eye,
  Settings,
  Calendar,
  DollarSign,
  Activity,
  Bell,
  Lightbulb,
  Shield,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Sparkles,
  TrendingUp as TrendUpIcon,
  AlertCircle,
  AlertTriangle as Warning,
  CreditCard,
  Smartphone,
  Lock,
  Search,
  TrendingDown as TrendDownIcon,
  UserCheck,
  ShieldAlert,
  Radar
} from "lucide-react";

const AIInsights = ({ darkMode, currency = "$" }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [insightType, setInsightType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);

  // Smart financial suggestions
  const [smartSuggestions, setSmartSuggestions] = useState([
    {
      id: 1,
      type: "savings",
      title: "Optimize Emergency Fund",
      description: "AI analysis shows you need 3 more months of expenses in emergency fund. Increase by $450/month.",
      impact: "High",
      potential: 450,
      confidence: 92,
      timeframe: "6 months",
      actionItems: ["Set up automatic transfer", "Review high-yield savings", "Reduce discretionary spending"],
      icon: Shield,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 2,
      type: "spending",
      title: "Reduce Food Waste",
      description: "Your food spending is 23% above demographic average. Meal planning could save $280/month.",
      impact: "Medium",
      potential: 280,
      confidence: 87,
      timeframe: "1 month",
      actionItems: ["Plan weekly meals", "Buy in bulk", "Use grocery comparison apps"],
      icon: Target,
      color: "from-orange-500 to-red-600"
    },
    {
      id: 3,
      type: "investment",
      title: "Diversify Portfolio",
      description: "AI recommends increasing index fund allocation by 15% for better risk-adjusted returns.",
      impact: "Medium",
      potential: 1200,
      confidence: 78,
      timeframe: "3 months",
      actionItems: ["Research index funds", "Consult financial advisor", "Rebalance quarterly"],
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600"
    }
  ]);

  // Spending anomaly detection
  const [anomalies, setAnomalies] = useState([
    {
      id: 1,
      type: "unusual_spending",
      title: "Unusual Entertainment Expense",
      description: "$450 spent on entertainment yesterday - 300% above your daily average",
      amount: 450,
      average: 112.50,
      deviation: 300,
      date: "2024-05-06",
      severity: "high",
      category: "Entertainment",
      recommendation: "Review if this was intentional or consider setting daily limits",
      icon: AlertTriangle,
      color: "from-red-500 to-pink-600"
    },
    {
      id: 2,
      type: "duplicate_charge",
      title: "Potential Duplicate Charge",
      description: "Two identical charges of $89.50 at Walmart within 2 hours",
      amount: 89.50,
      merchant: "Walmart",
      times: 2,
      date: "2024-05-05",
      severity: "medium",
      recommendation: "Contact merchant to verify charges",
      icon: CreditCard,
      color: "from-yellow-500 to-orange-600"
    },
    {
      id: 3,
      type: "subscription_spike",
      title: "Subscription Cost Increase",
      description: "Netflix subscription increased from $15.99 to $18.99 (18.8% increase)",
      oldAmount: 15.99,
      newAmount: 18.99,
      increase: 18.8,
      date: "2024-05-01",
      severity: "medium",
      recommendation: "Consider alternative streaming services or negotiate rate",
      icon: Smartphone,
      color: "from-purple-500 to-indigo-600"
    }
  ]);

  // Expense prediction
  const [predictions, setPredictions] = useState([
    {
      id: 1,
      type: "monthly_expense",
      title: "Next Month Expense Forecast",
      predicted: 2850,
      confidence: 89,
      range: { min: 2600, max: 3100 },
      factors: ["Seasonal patterns", "Upcoming bills", "Historical spending"],
      breakdown: {
        food: 950,
        transportation: 420,
        entertainment: 380,
        shopping: 680,
        bills: 420
      },
      icon: BarChart3,
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: 2,
      type: "category_trend",
      title: "Food Spending Trend",
      current: 950,
      predicted: 1050,
      change: 10.5,
      confidence: 82,
      timeframe: "Next 30 days",
      reasoning: "Increased dining out frequency and grocery price inflation",
      icon: TrendingUp,
      color: "from-orange-500 to-red-600"
    }
  ]);

  // AI-generated saving tips
  const [savingTips, setSavingTips] = useState([
    {
      id: 1,
      category: "daily_habits",
      title: "Automate Small Savings",
      description: "Save $5 daily by making coffee at home instead of buying out",
      daily: 5,
      monthly: 150,
      yearly: 1825,
      difficulty: "Easy",
      impact: "High",
      icon: Lightbulb,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 2,
      category: "subscription_optimization",
      title: "Review Unused Subscriptions",
      description: "Cancel 3 unused subscriptions to save $45/month",
      subscriptions: 3,
      monthly: 45,
      yearly: 540,
      difficulty: "Easy",
      impact: "Medium",
      icon: CreditCard,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 3,
      category: "energy_efficiency",
      title: "Reduce Utility Bills",
      description: "AI detected 15% potential savings through energy optimization",
      current: 285,
      potential: 43,
      monthly: 43,
      yearly: 516,
      difficulty: "Medium",
      impact: "Medium",
      icon: Zap,
      color: "from-yellow-500 to-orange-600"
    }
  ]);

  // Personalized recommendations
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([
    {
      id: 1,
      type: "behavioral",
      title: "Weekend Spending Pattern",
      description: "You spend 40% more on weekends. Consider setting weekend budget limits.",
      pattern: "Weekend spike",
      weekday_avg: 85,
      weekend_avg: 119,
      increase: 40,
      recommendation: "Set $100 weekend budget limit",
      confidence: 91,
      icon: Activity,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      type: "seasonal",
      title: "Holiday Spending Alert",
      description: "Your holiday spending increases by 60% annually. Start saving now.",
      normal_month: 2200,
      holiday_month: 3520,
      increase: 60,
      recommendation: "Save $200/month for holiday fund",
      confidence: 88,
      icon: Calendar,
      color: "from-red-500 to-pink-600"
    }
  ]);

  // Subscription detection
  const [detectedSubscriptions, setDetectedSubscriptions] = useState([
    {
      id: 1,
      name: "Netflix",
      amount: 18.99,
      frequency: "monthly",
      category: "Entertainment",
      status: "active",
      lastCharge: "2024-05-01",
      yearlyCost: 227.88,
      usage: "High",
      recommendation: "Keep - good value for usage",
      icon: Smartphone,
      color: "from-red-500 to-pink-600"
    },
    {
      id: 2,
      name: "Spotify",
      amount: 9.99,
      frequency: "monthly",
      category: "Entertainment",
      status: "active",
      lastCharge: "2024-05-01",
      yearlyCost: 119.88,
      usage: "Medium",
      recommendation: "Consider family plan to save 20%",
      icon: Smartphone,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 3,
      name: "Gym Membership",
      amount: 29.99,
      frequency: "monthly",
      category: "Health",
      status: "active",
      lastCharge: "2024-05-01",
      yearlyCost: 359.88,
      usage: "Low",
      recommendation: "Consider pause or cancellation - low usage detected",
      icon: Activity,
      color: "from-orange-500 to-red-600"
    }
  ]);

  // Smart alerts
  const [smartAlerts, setSmartAlerts] = useState([
    {
      id: 1,
      type: "budget_warning",
      title: "Budget Alert",
      message: "Food category reached 85% of monthly budget",
      severity: "warning",
      time: "2 hours ago",
      category: "Food & Dining",
      percentage: 85,
      remaining: 225,
      icon: AlertTriangle,
      color: "from-yellow-500 to-orange-600"
    },
    {
      id: 2,
      type: "savings_opportunity",
      title: "Savings Opportunity",
      message: "AI detected $150 potential savings in unused subscriptions",
      severity: "info",
      time: "1 day ago",
      potential: 150,
      icon: Lightbulb,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 3,
      type: "fraud_alert",
      title: "Unusual Transaction",
      message: "Large online purchase detected in new location",
      severity: "critical",
      time: "3 hours ago",
      amount: 850,
      location: "Unknown",
      icon: ShieldAlert,
      color: "from-red-500 to-pink-600"
    }
  ]);

  // Risk analysis
  const [riskAnalysis, setRiskAnalysis] = useState({
    overall: "Medium",
    score: 65,
    factors: [
      {
        name: "Spending Volatility",
        level: "Medium",
        score: 60,
        description: "Moderate variation in monthly spending"
      },
      {
        name: "Savings Rate",
        level: "Good",
        score: 75,
        description: "Healthy savings-to-income ratio"
      },
      {
        name: "Debt Load",
        level: "Low",
        score: 85,
        description: "Low debt-to-income ratio"
      },
      {
        name: "Investment Risk",
        level: "Medium",
        score: 55,
        description: "Moderate portfolio risk concentration"
      }
    ]
  });

  // Financial behavior insights
  const [behaviorInsights, setBehaviorInsights] = useState([
    {
      id: 1,
      category: "spending_patterns",
      title: "Impulse Buying Pattern",
      description: "AI detects 40% of shopping purchases are made after 9 PM",
      pattern: "Late-night shopping",
      frequency: "3-4 times per week",
      impact: "$180/month",
      recommendation: "Set shopping curfew at 9 PM",
      confidence: 89,
      icon: Clock,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 2,
      category: "payment_behavior",
      title: "Credit Card Dependency",
      description: "78% of transactions are on credit vs 22% debit",
      pattern: "High credit usage",
      risk: "Medium",
      recommendation: "Increase debit usage for better spending control",
      confidence: 92,
      icon: CreditCard,
      color: "from-orange-500 to-red-600"
    },
    {
      id: 3,
      category: "savings_behavior",
      title: "Inconsistent Saving",
      description: "Savings vary by 60% month-to-month",
      pattern: "Irregular savings habits",
      average: 450,
      variance: 270,
      recommendation: "Set up automatic monthly transfer",
      confidence: 85,
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600"
    }
  ]);

  const periodOptions = [
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "quarter", label: "Last 90 Days" },
    { value: "year", label: "Last 365 Days" },
  ];
  const insightTypes = [
    { value: "all", label: "All Insights", icon: Brain },
    { value: "recommendations", label: "Recommendations", icon: Lightbulb },
    { value: "alerts", label: "Smart Alerts", icon: Bell },
    { value: "predictions", label: "Predictions", icon: Target },
  ];
  const filteredRecommendations = useMemo(() => {
    if (insightType === "all" || insightType === "recommendations") {
      return recommendations;
    }
    return [];
  }, [recommendations, insightType]);
  const filteredAlerts = useMemo(() => {
    if (insightType === "all" || insightType === "alerts") {
      return alerts;
    }
    return [];
  }, [alerts, insightType]);
  const filteredPredictions = useMemo(() => {
    if (insightType === "all" || insightType === "predictions") {
      return predictions;
    }
    return [];
  }, [predictions, insightType]);
  const totalPotentialSavings = useMemo(() => {
    return filteredRecommendations.reduce((sum, rec) => sum + rec.potential, 0);
  }, [filteredRecommendations]);
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "error":
        return "text-red-500 bg-red-100";
      case "warning":
        return "text-orange-500 bg-orange-100";
      case "success":
        return "text-green-500 bg-green-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };
  const getTrendIcon = (trend) => {
    return trend === "up" ? (
      <ArrowUpRight className="w-4 h-4 text-red-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-green-500" />
    );
  };
  const handleRefreshInsights = () => {
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                AI Insights
              </h1>
              <p
                className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Smart recommendations and financial predictions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Period Selector */}
              <div className="flex items-center space-x-3">
                <Calendar
                  className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {periodOptions.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshInsights}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <Zap className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
        {/* Insight Type Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {insightTypes.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInsightType(type.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                insightType === type.value
                  ? `bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg`
                  : darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span>{type.label}</span>
            </motion.button>
          ))}
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Savings Potential */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 bg-opacity-20">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Potential Savings
                  </h3>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Monthly
                </span>
                <span
                  className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {currency}
                  {totalPotentialSavings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Annual
                </span>
                <span
                  className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {currency}
                  {(totalPotentialSavings * 12).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
          {/* AI Accuracy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 bg-opacity-20">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    AI Accuracy
                  </h3>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Prediction Accuracy
                </span>
                <span
                  className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  94.2%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Alert Precision
                </span>
                <span
                  className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  87.5%
                </span>
              </div>
            </div>
          </motion.div>
          {/* Active Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 bg-opacity-20">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Active Alerts
                  </h3>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {filteredAlerts.slice(0, 3).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "border-gray-200 hover:bg-gray-50"
                  } transition-colors duration-200`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{alert.icon}</div>
                    <div>
                      <p
                        className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {alert.title}
                      </p>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}
                    >
                      {alert.severity}
                    </span>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
                    >
                      {alert.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        {/* AI Recommendations */}
        {filteredRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm mb-8`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 bg-opacity-20">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      AI Recommendations
                    </h3>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecommendations.map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{recommendation.icon}</div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {recommendation.title}
                        </h4>
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {recommendation.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            recommendation.impact === "High"
                              ? "bg-red-100 text-red-800"
                              : recommendation.impact === "Medium"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {recommendation.impact} Impact
                        </span>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {currency}
                          {recommendation.potential}/mo
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {/* Predictions */}
        {filteredPredictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className={`rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 bg-opacity-20">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Expense Predictions
                    </h3>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {filteredPredictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          prediction.category === "Food"
                            ? "bg-blue-500"
                            : prediction.category === "Transport"
                              ? "bg-green-500"
                              : prediction.category === "Entertainment"
                                ? "bg-purple-500"
                                : prediction.category === "Shopping"
                                  ? "bg-orange-500"
                                  : "bg-gray-500"
                        }`}
                      ></div>
                      <div>
                        <p
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {prediction.category}
                        </p>
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {prediction.confidence}% confidence
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Current
                        </p>
                        <p
                          className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {currency}
                          {prediction.current}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(prediction.trend)}
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Predicted
                        </p>
                        <p
                          className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {currency}
                          {prediction.predicted}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default AIInsights;

