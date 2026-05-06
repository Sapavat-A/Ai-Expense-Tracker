import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Target,
  Users,
  Activity,
  Eye,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  LineChart,
  BarChart,
  ChevronDown,
  RefreshCw,
  Settings,
  TrendingDown as TrendDownIcon,
  AreaChart,
  Brain
} from "lucide-react";

const Analytics = ({ darkMode, currency = "$" }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedChart, setSelectedChart] = useState("trend");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState("previous_month");

  // Spending trend analysis data
  const [spendingTrends, setSpendingTrends] = useState([
    { month: "Jan", income: 7500, expenses: 2450, net: 5050, growth: 12.5 },
    { month: "Feb", income: 7500, expenses: 1890, net: 5610, growth: -22.9 },
    { month: "Mar", income: 8200, expenses: 3200, net: 5000, growth: 69.3 },
    { month: "Apr", income: 7500, expenses: 2750, net: 4750, growth: -14.1 },
    { month: "May", income: 7800, expenses: 2100, net: 5700, growth: -23.5 },
    { month: "Jun", income: 7500, expenses: 1950, net: 5550, growth: -7.1 },
  ]);

  // Monthly comparison data
  const [monthlyComparisons, setMonthlyComparisons] = useState([
    { month: "Jan", current: 2450, previous: 2180, change: 12.4, trend: "up" },
    { month: "Feb", current: 1890, previous: 2050, change: -7.8, trend: "down" },
    { month: "Mar", current: 3200, previous: 2890, change: 10.7, trend: "up" },
    { month: "Apr", current: 2750, previous: 3100, change: -11.3, trend: "down" },
    { month: "May", current: 2100, previous: 2450, change: -14.3, trend: "down" },
    { month: "Jun", current: 1950, previous: 2100, change: -7.1, trend: "down" },
  ]);

  // Category-wise spending analysis
  const [categoryAnalysis, setCategoryAnalysis] = useState([
    { name: "Food & Dining", current: 4600, previous: 4100, change: 12.2, trend: "up", percentage: 32.5, color: "bg-blue-500" },
    { name: "Transportation", current: 1890, previous: 1980, change: -4.5, trend: "down", percentage: 13.3, color: "bg-green-500" },
    { name: "Entertainment", current: 3200, previous: 2960, change: 8.1, trend: "up", percentage: 22.6, color: "bg-purple-500" },
    { name: "Shopping", current: 2750, previous: 2890, change: -4.8, trend: "down", percentage: 19.4, color: "bg-orange-500" },
    { name: "Bills & Utilities", current: 1950, previous: 1820, change: 7.1, trend: "up", percentage: 13.8, color: "bg-red-500" },
    { name: "Health & Fitness", current: 890, previous: 950, change: -6.3, trend: "down", percentage: 6.3, color: "bg-pink-500" },
    { name: "Other", current: 1567, previous: 1400, change: 11.9, trend: "up", percentage: 11.1, color: "bg-gray-500" },
  ]);

  // AI-based trend predictions
  const [aiPredictions, setAiPredictions] = useState([
    { month: "Jul", predicted: 2800, confidence: 85, factors: ["Seasonal increase", "Historical pattern"] },
    { month: "Aug", predicted: 2600, confidence: 82, factors: ["Vacation spending", "Lower utility costs"] },
    { month: "Sep", predicted: 2900, confidence: 78, factors: ["Back to school", "Increased activities"] },
    { month: "Oct", predicted: 2750, confidence: 75, factors: ["Holiday prep", "Stable pattern"] },
    { month: "Nov", predicted: 3100, confidence: 72, factors: ["Black Friday", "Holiday shopping"] },
    { month: "Dec", predicted: 3500, confidence: 68, factors: ["Christmas", "Year-end expenses"] },
  ]);

  // Yearly reports visualization data
  const [yearlyData, setYearlyData] = useState([
    { year: 2021, income: 85000, expenses: 58000, savings: 27000, growth: 8.2 },
    { year: 2022, income: 92000, expenses: 62000, savings: 30000, growth: 8.2 },
    { year: 2023, income: 98000, expenses: 67000, savings: 31000, growth: 6.5 },
    { year: 2024, income: 105000, expenses: 71000, savings: 34000, growth: 7.1 },
  ]);

  const periodOptions = [
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "quarter", label: "Last 90 Days" },
    { value: "year", label: "Last 365 Days" },
  ];

  const chartOptions = [
    { value: "trend", label: "Spending Trend Analysis", icon: LineChart },
    { value: "comparison", label: "Monthly Comparison", icon: BarChart },
    { value: "income", label: "Income vs Expense", icon: AreaChart },
    { value: "category", label: "Category Analysis", icon: PieChart },
    { value: "forecast", label: "AI Forecast", icon: Brain },
    { value: "yearly", label: "Yearly Reports", icon: BarChart3 },
  ];

  const filteredSpendingData = useMemo(() => {
    if (selectedPeriod === "month") {
      return spendingData;
    } else if (selectedPeriod === "quarter") {
      return spendingData.slice(-3);
    } else if (selectedPeriod === "year") {
      return spendingData;
    } else {
      return spendingData.slice(-1);
    }
  }, [spendingData, selectedPeriod]);

  const filteredCategoryData = useMemo(() => {
    if (selectedCategory === "all") {
      return categoryData;
    }
    return categoryData.filter((cat) =>
      cat.name.toLowerCase().includes(selectedCategory.toLowerCase()),
    );
  }, [categoryData, selectedCategory]);

  const filteredTrends = useMemo(() => {
    if (selectedPeriod === "month") {
      return trends.slice(-1);
    } else if (selectedPeriod === "quarter") {
      return trends.slice(-3);
    } else if (selectedPeriod === "year") {
      return trends;
    } else {
      return trends.slice(-1);
    }
  }, [trends, selectedPeriod]);

  const totalSpending = useMemo(() => {
    return filteredSpendingData.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredSpendingData]);

  const averageSpending = useMemo(() => {
    return totalSpending / filteredSpendingData.length;
  }, [totalSpending, filteredSpendingData]);

  const spendingChange = useMemo(() => {
    if (filteredTrends.length >= 2) {
      const current = filteredTrends[filteredTrends.length - 1].value;
      const previous = filteredTrends[filteredTrends.length - 2].value;
      return ((current - previous) / previous) * 100;
    }
    return 0;
  }, [filteredTrends]);

  const handleExportData = () => {
    const exportData = {
      spending: filteredSpendingData,
      categories: filteredCategoryData,
      trends: filteredTrends,
      period: selectedPeriod,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${selectedPeriod}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
                Analytics
              </h1>
              <p
                className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Deep insights into your spending patterns
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

              {/* Chart Type Selector */}
              <div className="flex items-center space-x-3">
                <BarChart3
                  className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                />
                <select
                  value={selectedChart}
                  onChange={(e) => setSelectedChart(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {chartOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-3">
                <Filter
                  className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Categories</option>
                  {categoryData.map((cat) => (
                    <option key={cat.name} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportData}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Download className="w-5 h-5 mr-2" />
                Export Data
              </motion.button>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefreshData}
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
                  <Zap className="w-5 h-5 mr-2" />
                )}
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Spending Card */}
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
                    Total Spending
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
                  {totalSpending.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span
                  className={`text-sm font-medium ${spendingChange >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {spendingChange >= 0 ? "Increased by" : "Decreased by"}
                </span>
                <span
                  className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  {Math.abs(spendingChange).toFixed(1)}% from last period
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Average Monthly
              </span>
              <span
                className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {currency}
                {averageSpending.toFixed(2)}
              </span>
            </div>
          </motion.div>

          {/* Spending Trend Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 bg-opacity-20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Spending Trend
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {spendingChange >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-500">
                        Upward trend
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-red-500">
                        Downward trend
                      </span>
                    </>
                  )}
                </span>
                <span
                  className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  over the last{" "}
                  {selectedPeriod === "month"
                    ? "month"
                    : selectedPeriod === "quarter"
                      ? "quarter"
                      : "year"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Highest Category
                </span>
                <span
                  className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {filteredCategoryData.length > 0
                    ? filteredCategoryData.reduce(
                        (max, cat) => (cat.amount > max.amount ? cat : max),
                        { amount: 0, name: "None" },
                      ).name
                    : "None"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Prediction
              </span>
              <span
                className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {spendingChange >= 0
                  ? `Continue current trend to save ${currency}${(averageSpending * 1.1).toFixed(2)}/month`
                  : `Reduce spending by ${currency}${(averageSpending * 0.1).toFixed(2)}/month`}
              </span>
            </div>
          </motion.div>

          {/* Category Breakdown Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
                    Category Breakdown
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCategoryData.map((category, index) => (
                <div key={category.name}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full ${category.color}`}
                      ></div>
                      <div>
                        <p
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {category.name}
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

                  {/* Progress Bar */}
                  <div className="w-full mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span
                        className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {category.name}
                      </span>
                      <span
                        className={`${darkMode ? "text-gray-300" : "text-gray-500"}`}
                      >
                        {category.percentage}% allocated
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          category.percentage > 80
                            ? "bg-red-500"
                            : category.percentage > 60
                              ? "bg-orange-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spending Trend Chart */}
          {selectedChart === "spending" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={`p-6 rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 bg-opacity-20">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Spending Trend
                    </h3>
                  </div>
                </div>
              </div>

              {/* Simple Bar Chart Visualization */}
              <div className="h-64 flex items-end justify-between space-x-2">
                {filteredSpendingData.map((item, index) => (
                  <motion.div
                    key={item.month}
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(item.amount / Math.max(...filteredSpendingData.map((d) => d.amount))) * 200}px`,
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex-1"
                  >
                    <div
                      className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {item.month}
                    </div>
                    <div
                      className={`w-full bg-gradient-to-t ${
                        darkMode
                          ? "from-blue-600 to-blue-400"
                          : "from-blue-500 to-blue-300"
                      } rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500`}
                      style={{
                        height: `${(item.amount / Math.max(...filteredSpendingData.map((d) => d.amount))) * 200}px`,
                      }}
                    ></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Pie Chart */}
          {selectedChart === "category" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
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
                      Category Distribution
                    </h3>
                  </div>
                </div>
              </div>

              {/* Simple Pie Chart Visualization */}
              <div className="h-64 flex items-center justify-center">
                <div className="relative">
                  {filteredCategoryData.map((category, index) => {
                    const angle = (category.percentage / 100) * 360;
                    const x = Math.cos((angle * Math.PI) / 180) * 120;
                    const y = Math.sin((angle * Math.PI) / 180) * 120;

                    return (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                        className="absolute"
                        style={{
                          transform: `rotate(${angle}deg) translateX(${x}px) translateY(${y}px)`,
                          transformOrigin: "center",
                        }}
                      >
                        <div
                          className={`absolute top-0 left-0 w-32 h-32 rounded-full transition-all duration-300 ${
                            darkMode
                              ? "bg-gray-700 border-gray-600"
                              : "bg-white border-gray-300"
                          } ${index === 0 ? "ring-2 ring-blue-500" : ""}`}
                          style={{
                            clipPath: `polygon(50% 50%, 50% 50%, ${50 + category.percentage / 2}% 50%)`,
                            clipPath: `polygon(50% 50%, 50% 50%, ${50 + category.percentage / 2}% 50%)`,
                            backgroundColor: category.color
                              .replace("bg-", "")
                              .replace("-500", ""),
                            borderColor: darkMode ? "#374151" : "#e5e7eb",
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
