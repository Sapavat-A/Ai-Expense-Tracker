import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  Settings,
  Zap,
  Award,
  Activity,
  Bell,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Flag,
  Goal,
  PiggyBank,
  Shield,
  Warning
} from "lucide-react";

const Budget = ({ darkMode, currency = "$" }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAlerts, setShowAlerts] = useState(true);
  const [showGoals, setShowGoals] = useState(true);

  // Monthly budget setup with category-wise limits
  const [monthlyBudget, setMonthlyBudget] = useState({
    total: 5000,
    remaining: 1850,
    spent: 3150,
    utilization: 63.0
  });

  // Category-wise budget limits
  const [categoryBudgets, setCategoryBudgets] = useState([
    {
      id: 1,
      category: "Food & Dining",
      allocated: 1500,
      spent: 892,
      remaining: 608,
      percentage: 59.5,
      icon: "🍔",
      color: "from-blue-500 to-blue-600",
      status: "on_track",
      alert: false,
      dailyAverage: 29.7,
      weeklyAverage: 208.3
    },
    {
      id: 2,
      category: "Transportation",
      allocated: 800,
      spent: 425,
      remaining: 375,
      percentage: 53.1,
      icon: "🚗",
      color: "from-green-500 to-green-600",
      status: "under_budget",
      alert: false,
      dailyAverage: 14.2,
      weeklyAverage: 99.3
    },
    {
      id: 3,
      category: "Entertainment",
      allocated: 600,
      spent: 267,
      remaining: 333,
      percentage: 44.5,
      icon: "🎮",
      color: "from-purple-500 to-purple-600",
      status: "under_budget",
      alert: false,
      dailyAverage: 8.9,
      weeklyAverage: 62.4
    },
    {
      id: 4,
      category: "Shopping",
      allocated: 1200,
      spent: 678,
      remaining: 522,
      percentage: 56.5,
      icon: "🛍️",
      color: "from-orange-500 to-orange-600",
      status: "on_track",
      alert: false,
      dailyAverage: 22.6,
      weeklyAverage: 158.2
    },
    {
      id: 5,
      category: "Bills & Utilities",
      allocated: 1000,
      spent: 983,
      remaining: 17,
      percentage: 98.3,
      icon: "💡",
      color: "from-red-500 to-red-600",
      status: "over_budget",
      alert: true,
      dailyAverage: 32.8,
      weeklyAverage: 229.4
    },
    {
      id: 6,
      category: "Health & Fitness",
      allocated: 300,
      spent: 299,
      remaining: 1,
      percentage: 99.7,
      icon: "�",
      color: "from-pink-500 to-pink-600",
      status: "over_budget",
      alert: true,
      dailyAverage: 10.0,
      weeklyAverage: 69.7
    }
  ]);

  // Savings goals tracking
  const [savingsGoals, setSavingsGoals] = useState([
    {
      id: 1,
      title: "Emergency Fund",
      target: 10000,
      current: 6500,
      monthly: 500,
      percentage: 65,
      deadline: "2024-12-31",
      status: "on_track",
      icon: Shield,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      title: "Vacation Fund",
      target: 3000,
      current: 1200,
      monthly: 300,
      percentage: 40,
      deadline: "2024-08-31",
      status: "on_track",
      icon: Target,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 3,
      title: "New Laptop",
      target: 2000,
      current: 800,
      monthly: 200,
      percentage: 40,
      deadline: "2024-09-30",
      status: "on_track",
      icon: Award,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 4,
      title: "Investment Portfolio",
      target: 5000,
      current: 3200,
      monthly: 400,
      percentage: 64,
      deadline: "2024-12-31",
      status: "on_track",
      icon: TrendingUp,
      color: "from-orange-500 to-red-600"
    }
  ]);

  // Budget recommendations
  const [recommendations, setRecommendations] = useState([
    {
      type: "warning",
      title: "Bills & Utilities Over Budget",
      description: "You've used 98.3% of your budget with 17 days remaining",
      action: "Consider reducing usage or adjusting budget",
      priority: "high"
    },
    {
      type: "suggestion",
      title: "Optimize Food Budget",
      description: "Reduce food spending by 10% to save $150 monthly",
      action: "Try meal planning and bulk purchasing",
      priority: "medium"
    },
    {
      type: "success",
      title: "Transportation Under Budget",
      description: "Great job! You're 46.9% under budget",
      action: "Consider allocating surplus to savings",
      priority: "low"
    }
  ]);

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "",
    allocated: 0,
    period: "monthly",
  });

  const periodOptions = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ];

  const categoryOptions = [
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Other",
  ];

  const filteredBudgets = useMemo(() => {
    if (selectedPeriod === "month") {
      return budgets;
    } else if (selectedPeriod === "quarter") {
      return budgets.map((budget) => ({
        ...budget,
        allocated: budget.allocated * 3,
        spent: budget.spent * 3,
        remaining: budget.remaining * 3,
        percentage: budget.percentage,
      }));
    } else if (selectedPeriod === "year") {
      return budgets.map((budget) => ({
        ...budget,
        allocated: budget.allocated * 12,
        spent: budget.spent * 12,
        remaining: budget.remaining * 12,
        percentage: budget.percentage,
      }));
    }
    return budgets;
  }, [budgets, selectedPeriod]);

  const totalAllocated = useMemo(() => {
    return filteredBudgets.reduce((sum, budget) => sum + budget.allocated, 0);
  }, [filteredBudgets]);

  const totalSpent = useMemo(() => {
    return filteredBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  }, [filteredBudgets]);

  const totalRemaining = useMemo(() => {
    return filteredBudgets.reduce((sum, budget) => sum + budget.remaining, 0);
  }, [filteredBudgets]);

  const overallPercentage = useMemo(() => {
    return totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  }, [totalAllocated, totalSpent]);

  const handleAddBudget = () => {
    if (editingBudget) {
      // Update existing budget
      setBudgets(
        budgets.map((b) =>
          b.id === editingBudget.id
            ? { ...newBudget, id: editingBudget.id }
            : b,
        ),
      );
    } else {
      // Add new budget
      const newId = Math.max(...budgets.map((b) => b.id)) + 1;
      setBudgets([...budgets, { ...newBudget, id: newId }]);
    }

    setShowAddBudget(false);
    setEditingBudget(null);
    setNewBudget({ category: "", allocated: 0, period: "monthly" });
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setNewBudget({
      category: budget.category,
      allocated: budget.allocated,
      period: "monthly",
    });
    setShowAddBudget(true);
  };

  const handleDeleteBudget = (id) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const getBudgetStatus = (percentage) => {
    if (percentage >= 90) return { status: "danger", color: "text-red-500" };
    if (percentage >= 75)
      return { status: "warning", color: "text-orange-500" };
    if (percentage >= 50)
      return { status: "moderate", color: "text-yellow-500" };
    return { status: "good", color: "text-green-500" };
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
                Budget Planning
              </h1>
              <p
                className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Set and monitor your financial goals
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

              {/* Add Budget Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddBudget(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Budget
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Allocated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 bg-opacity-20">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Total Allocated
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {selectedPeriod === "month"
                    ? "This Month"
                    : selectedPeriod === "quarter"
                      ? "This Quarter"
                      : "This Year"}
                </span>
                <span
                  className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {currency}
                  {totalAllocated.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total Spent
                </span>
                <span
                  className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {currency}
                  {totalSpent.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Total Remaining
              </span>
              <span
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {currency}
                {totalRemaining.toLocaleString()}
              </span>
            </div>
          </motion.div>

          {/* Budget Utilization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 bg-opacity-20">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Budget Utilization
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallPercentage > 80
                      ? "bg-red-500"
                      : overallPercentage > 60
                        ? "bg-orange-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Overall Usage
                </span>
                <span
                  className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {overallPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Status:
                </span>
                <span
                  className={`text-sm font-medium ${
                    overallPercentage > 80
                      ? "text-red-500"
                      : overallPercentage > 60
                        ? "text-orange-500"
                        : "text-green-500"
                  }`}
                >
                  {overallPercentage > 80
                    ? "Over Budget"
                    : overallPercentage > 60
                      ? "Warning"
                      : "On Track"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 bg-opacity-20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    AI Recommendations
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: "💡",
                  title: "Reduce Food Expenses",
                  description:
                    "Consider meal planning to save 20% on food costs",
                },
                {
                  icon: "🎯",
                  title: "Increase Savings",
                  description: "Set aside 15% of income for emergency fund",
                },
                {
                  icon: "📊",
                  title: "Review Subscriptions",
                  description: "Cancel unused subscriptions to save monthly",
                },
              ].map((recommendation, index) => (
                <motion.div
                  key={recommendation.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="text-2xl">{recommendation.icon}</div>
                  <div>
                    <p
                      className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {recommendation.title}
                    </p>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {recommendation.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Budget Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm overflow-hidden`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 bg-opacity-20">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Budget Categories
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredBudgets.map((budget, index) => {
                const status = getBudgetStatus(budget.percentage);

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{budget.icon}</div>
                        <div>
                          <h4
                            className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {budget.category}
                          </h4>
                          <p
                            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {budget.percentage.toFixed(1)}% of budget used
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditBudget(budget)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            darkMode
                              ? "text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                              : "text-blue-600 hover:text-blue-700 hover:bg-gray-100"
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            darkMode
                              ? "text-red-400 hover:text-red-300 hover:bg-gray-700"
                              : "text-red-600 hover:text-red-700 hover:bg-gray-100"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Allocated
                        </p>
                        <p
                          className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {currency}
                          {budget.allocated.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Spent
                        </p>
                        <p
                          className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {currency}
                          {budget.spent.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Remaining
                        </p>
                        <p
                          className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {currency}
                          {budget.remaining.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            budget.percentage > 80
                              ? "bg-red-500"
                              : budget.percentage > 60
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(budget.percentage, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {budget.remaining > 0
                            ? `${Math.abs(budget.percentage - 100).toFixed(1)}% remaining`
                            : "Over budget"}
                        </span>
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Budget Modal */}
      {showAddBudget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowAddBudget(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md mx-4 p-6 rounded-2xl border shadow-2xl backdrop-blur-xl ${
              darkMode
                ? "border-gray-700 bg-gray-800/95"
                : "border-gray-200 bg-white/95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {editingBudget ? "Edit Budget" : "Add New Budget"}
              </h3>
              <button
                onClick={() => setShowAddBudget(false)}
                className={`p-2 rounded-xl transition-colors duration-200 ${
                  darkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddBudget();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Category
                  </label>
                  <select
                    value={newBudget.category}
                    onChange={(e) =>
                      setNewBudget((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className={`w-full p-3 rounded-xl border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Allocated Amount
                  </label>
                  <div className="relative">
                    <DollarSign
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <input
                      type="number"
                      value={newBudget.allocated}
                      onChange={(e) =>
                        setNewBudget((prev) => ({
                          ...prev,
                          allocated: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Period
                  </label>
                  <select
                    value={newBudget.period}
                    onChange={(e) =>
                      setNewBudget((prev) => ({
                        ...prev,
                        period: e.target.value,
                      }))
                    }
                    className={`w-full p-3 rounded-xl border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  {editingBudget ? "Update Budget" : "Add Budget"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Budget;
