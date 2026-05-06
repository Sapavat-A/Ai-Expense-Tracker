import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PiggyBank,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Users,
  Activity,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Filter,
  Zap,
  Shield,
  Award,
  Plane,
  Laptop,
} from "lucide-react";

const Overview = ({ darkMode, currency = "$" }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [accountBalance, setAccountBalance] = useState(5420.5);
  const [monthlyIncome, setMonthlyIncome] = useState(7500);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2847.32);
  const [budgets, setBudgets] = useState([
    {
      category: "Food",
      spent: 892,
      limit: 1200,
    },
    {
      category: "Transport",
      spent: 425,
      limit: 600,
    },
    {
      category: "Shopping",
      spent: 678,
      limit: 800,
    },
  ]);
  const [savingsGoal, setSavingsGoal] = useState({
    target: 2000,
    current: 4652.68,
    percentage: 232.6,
  });

  // Test rendering
  console.log("Overview component rendering with darkMode:", darkMode);

  // Financial goals data
  const [financialGoals, setFinancialGoals] = useState([
    {
      id: 1,
      title: "Emergency Fund",
      target: 10000,
      current: 6500,
      percentage: 65,
      color: "from-blue-500 to-indigo-600",
      icon: Shield,
    },
    {
      id: 2,
      title: "Vacation Fund",
      target: 3000,
      current: 1200,
      percentage: 40,
      color: "from-green-500 to-emerald-600",
      icon: Target,
    },
    {
      id: 3,
      title: "Investment Portfolio",
      target: 5000,
      current: 3200,
      percentage: 64,
      color: "from-purple-500 to-pink-600",
      icon: TrendingUp,
    },
  ]);

  // Spending categories
  const [spendingCategories, setSpendingCategories] = useState([
    {
      category: "Food & Dining",
      amount: 892.1,
      percentage: 31.3,
      color: "bg-blue-500",
      trend: "up",
      icon: "🍔",
    },
    {
      category: "Transportation",
      amount: 425.0,
      percentage: 14.9,
      color: "bg-green-500",
      trend: "down",
      icon: "🚗",
    },
    {
      category: "Shopping",
      amount: 678.45,
      percentage: 23.8,
      color: "bg-purple-500",
      trend: "up",
      icon: "🛍️",
    },
    {
      category: "Entertainment",
      amount: 267.99,
      percentage: 9.4,
      color: "bg-orange-500",
      trend: "down",
      icon: "🎬",
    },
    {
      category: "Bills & Utilities",
      amount: 583.78,
      percentage: 20.5,
      color: "bg-red-500",
      trend: "stable",
      icon: "💡",
    },
  ]);

  const periodOptions = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ];

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
  const budgetUtilization = (monthlyExpenses / monthlyIncome) * 100;

  // Calculate savings progress
  const savingsProgress = savingsGoal?.target > 0 
    ? Math.min((savingsGoal?.current / savingsGoal?.target) * 100, 100)
    : 0;

  // Financial health score calculation
  const financialHealthScore = useMemo(() => {
    const savingsScore = Math.min((savingsRate / 20) * 100, 100); // 20% savings rate = perfect
    const budgetScore = Math.max(100 - budgetUtilization, 0); // Lower utilization is better
    const balanceScore = Math.min((accountBalance / 10000) * 100, 100); // 10k balance = perfect

    return Math.round((savingsRate + budgetScore + balanceScore) / 3);
  }, [savingsRate, budgetUtilization, accountBalance]);

  const quickStats = useMemo(
    () => [
      {
        title: "Total Balance",
        value: accountBalance || 0,
        change: "+12.5%",
        trend: "up",
        icon: Wallet,
        color: "from-blue-500 to-blue-600",
        description: "Available funds",
      },
      {
        title: "Monthly Income",
        value: monthlyIncome || 0,
        change: "+8.2%",
        trend: "up",
        icon: TrendingUp,
        color: "from-green-500 to-green-600",
        description: "Total earnings",
      },
      {
        title: "Monthly Expenses",
        value: monthlyExpenses || 0,
        change: "-3.4%",
        trend: "down",
        icon: CreditCard,
        color: "from-red-500 to-red-600",
        description: "Total spending",
      },
      {
        title: "Savings Rate",
        value: `${(savingsRate || 0).toFixed(1)}%`,
        change: "+5.1%",
        trend: "up",
        icon: PiggyBank,
        color: "from-purple-500 to-purple-600",
        description: "Of total income",
      },
    ],
    [accountBalance, monthlyIncome, monthlyExpenses, savingsRate],
  );

  const categoryBreakdown = useMemo(
    () =>
      [
        {
          category: "Food",
          amount: 892.1,
          percentage: 31.3,
          color: "bg-blue-500",
        },
        {
          category: "Transport",
          amount: 425.0,
          percentage: 14.9,
          color: "bg-green-500",
        },
        {
          category: "Entertainment",
          amount: 267.99,
          percentage: 9.4,
          color: "bg-purple-500",
        },
        {
          category: "Shopping",
          amount: 678.45,
          percentage: 23.8,
          color: "bg-orange-500",
        },
        {
          category: "Bills",
          amount: 583.78,
          percentage: 20.5,
          color: "bg-red-500",
        },
      ].map((category) => ({
        ...category,
        amount: Number(category.amount || 0).toFixed(2),
        percentage: Number(category.percentage || 0).toFixed(1),
      })),
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="text-center">
          <h1
            className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Financial Overview
          </h1>
          <p
            className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Complete view of your financial health
          </p>
        </div>
      </motion.div>

      {/* Period Selector */}
      <div className="flex justify-center mb-6">
        <div
          className={`inline-flex rounded-lg p-1 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
        >
          {periodOptions.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                selectedPeriod === period.value
                  ? `text-white bg-gradient-to-r from-blue-600 to-indigo-600`
                  : darkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-20`}>
                  <stat.icon className={`w-6 h-6 text-white`} />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {stat.title}
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {stat.title}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center space-x-1 ${stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"}`}
              >
                {stat.trend === "up" && <TrendingUp className="w-4 h-4" />}
                {stat.trend === "down" && <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {currency}
                {Number(stat.value || 0).toLocaleString()}
              </p>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {stat.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Budget Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          className={`p-8 rounded-3xl border ${darkMode ? "border-gray-700/30 bg-gray-800/30" : "border-gray-200/30 bg-white/30"} shadow-2xl backdrop-blur-2xl bg-gradient-to-br ${darkMode ? "from-gray-800/60 to-gray-900/60" : "from-white/60 to-gray-50/60"} hover:shadow-3xl transition-all duration-500`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-xl">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3
                  className={`text-2xl font-black ${darkMode ? "text-white" : "text-gray-900"} bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent`}
                >
                  Budget Progress
                </h3>
                <p
                  className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mt-1`}
                >
                  Track your spending goals
                </p>
              </div>
            </div>
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-6">
            {budgets.map((budget, index) => (
              <motion.div
                key={budget.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  darkMode
                    ? "border-gray-700/50 bg-gray-700/30"
                    : "border-gray-200/50 bg-gray-50/30"
                } backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-r ${budget.color} shadow-lg animate-pulse`}
                    ></div>
                    <div>
                      <h4
                        className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {budget.category}
                      </h4>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                      >
                        Monthly Allocation
                      </p>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className={`text-lg font-bold px-3 py-1 rounded-full ${
                      budget.percentage > 80
                        ? "bg-red-500/20 text-red-500"
                        : budget.percentage > 60
                          ? "bg-orange-500/20 text-orange-500"
                          : "bg-green-500/20 text-green-500"
                    }`}
                  >
                    {Number(budget?.percentage || 0).toFixed(1)}%
                  </motion.div>
                </div>

                <div className="relative mb-4">
                  <div
                    className={`w-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded-full h-4 overflow-hidden`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-700 relative ${
                        budget.percentage > 80
                          ? "bg-gradient-to-r from-red-500 to-pink-500"
                          : budget.percentage > 60
                            ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(Number(budget?.percentage || 0), 100)}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p
                      className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      Spent / Budget
                    </p>
                    <p
                      className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {currency}
                      {Number(budget?.spent || 0).toLocaleString()} / {currency}
                      {Number(budget?.limit || 0).toLocaleString()}
                    </p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className={`text-lg font-bold px-4 py-2 rounded-xl ${
                      budget.percentage > 80
                        ? "bg-red-500 text-white"
                        : budget.percentage > 60
                          ? "bg-orange-500 text-white"
                          : "bg-green-500 text-white"
                    } shadow-lg`}
                  >
                    {budget.percentage > 80
                      ? "⚠️ Over Budget"
                      : budget.percentage > 60
                        ? "⚡ Warning"
                        : "✅ On Track"}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Savings Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 bg-opacity-20">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3
                  className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  Savings Goal
                </h3>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Monthly Target
              </span>
              <span
                className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {currency}
                {savingsGoal.toLocaleString()}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  savingsProgress >= 100
                    ? "bg-green-500"
                    : savingsProgress >= 75
                      ? "bg-blue-500"
                      : savingsProgress >= 50
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                }`}
                style={{
                  width: `${Math.min(Number(savingsProgress || 0), 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {currency}
                {Number(monthlySavings || 0).toLocaleString()} (
                {Number(savingsProgress || 0).toFixed(1)}%)
              </span>
              <span
                className={`text-sm font-medium ${savingsProgress >= 75 ? "text-green-500" : "text-gray-500"}`}
              >
                {100 - savingsProgress >= 0
                  ? `${(100 - Number(savingsProgress || 0)).toFixed(1)}% to go`
                  : "Goal exceeded!"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 bg-opacity-20">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Spending by Category
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {categoryBreakdown.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                <div>
                  <p
                    className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {category.category}
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {category.percentage}% of total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {currency}
                  {category.amount.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 bg-opacity-20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Recent Activity
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    transaction.trend === "up"
                      ? "bg-green-500"
                      : transaction.trend === "down"
                        ? "bg-red-500"
                        : "bg-gray-400"
                  }`}
                ></div>
                <div>
                  <p
                    className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {transaction.description}
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {transaction.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold ${
                    transaction.trend === "up"
                      ? "text-green-500"
                      : transaction.trend === "down"
                        ? "text-red-500"
                        : "text-gray-900"
                  }`}
                >
                  {transaction.trend === "up" && "+"}
                  {currency}
                  {Number(transaction.amount || 0).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
