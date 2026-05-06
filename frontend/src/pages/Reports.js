import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Eye,
  EyeOff,
  Printer,
  Share2,
  Mail,
  Zap,
  Target,
  Activity,
  RefreshCw,
  Settings,
  FileSpreadsheet,
  FileDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Database,
  FileCheck,
  Receipt,
  Calculator,
  FileSearch,
  Send,
  CalendarDays,
  FileBarChart
} from 'lucide-react';

const Reports = ({ darkMode, currency = '$' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('spending');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportFormat, setReportFormat] = useState('pdf');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Monthly reports data
  const [monthlyReports, setMonthlyReports] = useState([
    {
      id: 1,
      month: 'May 2024',
      totalIncome: 7500,
      totalExpenses: 2847.32,
      netSavings: 4652.68,
      transactions: 89,
      categories: 8,
      topCategory: 'Food & Dining',
      growthRate: 12.5
    },
    {
      id: 2,
      month: 'April 2024',
      totalIncome: 7200,
      totalExpenses: 3120.45,
      netSavings: 4079.55,
      transactions: 76,
      categories: 8,
      topCategory: 'Shopping',
      growthRate: -8.3
    },
    {
      id: 3,
      month: 'March 2024',
      totalIncome: 7800,
      totalExpenses: 2980.12,
      netSavings: 4819.88,
      transactions: 82,
      categories: 8,
      topCategory: 'Bills & Utilities',
      growthRate: 15.2
    }
  ]);

  // Weekly reports data
  const [weeklyReports, setWeeklyReports] = useState([
    {
      id: 1,
      week: 'Week 18 (May 6-12, 2024)',
      totalIncome: 1875,
      totalExpenses: 712.50,
      netSavings: 1162.50,
      transactions: 23,
      dailyAverage: 101.79,
      topSpendingDay: 'Saturday',
      budgetUtilization: 68.5
    },
    {
      id: 2,
      week: 'Week 17 (Apr 29 - May 5, 2024)',
      totalIncome: 1875,
      totalExpenses: 845.30,
      netSavings: 1029.70,
      transactions: 28,
      dailyAverage: 120.76,
      topSpendingDay: 'Friday',
      budgetUtilization: 81.2
    },
    {
      id: 3,
      week: 'Week 16 (Apr 22-28, 2024)',
      totalIncome: 1875,
      totalExpenses: 623.80,
      netSavings: 1251.20,
      transactions: 19,
      dailyAverage: 89.11,
      topSpendingDay: 'Sunday',
      budgetUtilization: 59.8
    }
  ]);

  // Yearly reports data
  const [yearlyReports, setYearlyReports] = useState([
    {
      id: 1,
      year: 2024,
      totalIncome: 93600,
      totalExpenses: 34168.00,
      netSavings: 59432.00,
      transactions: 1048,
      averageMonthly: 2847.33,
      savingsRate: 63.5,
      topCategory: 'Food & Dining',
      growthRate: 8.7
    },
    {
      id: 2,
      year: 2023,
      totalIncome: 86100,
      totalExpenses: 31420.00,
      netSavings: 54680.00,
      transactions: 987,
      averageMonthly: 2618.33,
      savingsRate: 63.5,
      topCategory: 'Shopping',
      growthRate: 12.3
    },
    {
      id: 3,
      year: 2022,
      totalIncome: 79500,
      totalExpenses: 28900.00,
      netSavings: 50600.00,
      transactions: 892,
      averageMonthly: 2408.33,
      savingsRate: 63.6,
      topCategory: 'Bills & Utilities',
      growthRate: 15.8
    }
  ]);

  // Expense summaries data
  const [expenseSummaries, setExpenseSummaries] = useState([
    {
      id: 1,
      period: 'May 2024',
      categories: [
        { name: 'Food & Dining', amount: 892.10, percentage: 31.3, transactions: 28 },
        { name: 'Transportation', amount: 425.00, percentage: 14.9, transactions: 12 },
        { name: 'Shopping', amount: 678.45, percentage: 23.8, transactions: 15 },
        { name: 'Entertainment', amount: 267.99, percentage: 9.4, transactions: 8 },
        { name: 'Bills & Utilities', amount: 583.78, percentage: 20.5, transactions: 6 },
        { name: 'Health & Fitness', amount: 0.00, percentage: 0.0, transactions: 0 },
        { name: 'Other', amount: 0.00, percentage: 0.0, transactions: 0 }
      ],
      totalTransactions: 69,
      averageTransaction: 41.26,
      highestTransaction: 156.78,
      lowestTransaction: 5.99
    }
  ]);

  // Tax summary data
  const [taxSummaries, setTaxSummaries] = useState([
    {
      id: 1,
      year: 2024,
      totalIncome: 93600,
      taxableIncome: 85000,
      standardDeduction: 13850,
      taxableAfterDeduction: 71150,
      estimatedTax: 15230,
      effectiveRate: 17.9,
      deductibleExpenses: {
        businessExpenses: 3450,
        medicalExpenses: 1200,
        charitableDonations: 1800,
        mortgageInterest: 8900,
        stateTaxes: 3200
      },
      credits: {
        childTaxCredit: 2000,
        educationCredit: 1200,
        retirementCredit: 800
      }
    }
  ]);

  const periodOptions = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 90 Days' },
    { value: 'year', label: 'Last 365 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const reportTypes = [
    { 
      id: 'monthly', 
      name: 'Monthly Report', 
      description: 'Comprehensive monthly financial summary',
      icon: CalendarDays,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      id: 'weekly', 
      name: 'Weekly Report', 
      description: 'Detailed weekly spending breakdown',
      icon: Calendar,
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'yearly', 
      name: 'Yearly Report', 
      description: 'Annual financial performance summary',
      icon: FileBarChart,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'expense', 
      name: 'Expense Summary', 
      description: 'Detailed expense breakdown by category',
      icon: Receipt,
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'tax', 
      name: 'Tax Summary', 
      description: 'Tax calculation and deductible expenses',
      icon: Calculator,
      color: 'from-cyan-500 to-teal-600'
    }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet },
    { value: 'csv', label: 'CSV Data', icon: FileDown }
  ];

  // Mock report data
  const [reportData, setReportData] = useState({
    spending: {
      total: 14567.89,
      transactions: 234,
      categories: 8,
      averageDaily: 485.60,
      topCategory: 'Food & Dining',
      growthRate: 12.5
    },
    category: {
      breakdown: [
        { name: 'Food & Dining', amount: 4567.23, percentage: 31.4 },
        { name: 'Transportation', amount: 2341.56, percentage: 16.1 },
        { name: 'Shopping', amount: 3456.78, percentage: 23.7 },
        { name: 'Entertainment', amount: 1234.89, percentage: 8.5 },
        { name: 'Bills & Utilities', amount: 2967.43, percentage: 20.3 }
      ]
    },
    income: {
      total: 52340.00,
      sources: [
        { name: 'Salary', amount: 48000.00, percentage: 91.7 },
        { name: 'Freelance', amount: 2840.00, percentage: 5.4 },
        { name: 'Investment', amount: 1500.00, percentage: 2.9 }
      ]
    },
    budget: {
      allocated: 18000.00,
      spent: 14567.89,
      remaining: 3432.11,
      utilization: 80.9,
      overBudgetCategories: 2
    },
    tax: {
      deductibleExpenses: 8934.56,
      potentialSavings: 2233.64,
      businessExpenses: 3456.78,
      charitableDonations: 1200.00
    },
    investment: {
      portfolioValue: 45678.90,
      totalReturns: 3456.78,
      returnRate: 8.2,
      topPerformer: 'Tech Stocks',
      riskLevel: 'Moderate'
    }
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport = {
      id: Date.now(),
      type: selectedReport,
      period: selectedPeriod,
      format: reportFormat,
      generatedAt: new Date().toISOString(),
      data: reportData[selectedReport]
    };
    
    setGeneratedReports([newReport, ...generatedReports]);
    setIsGenerating(false);
  };

  const handleDownloadReport = (report) => {
    // In real app, this would download the actual report file
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${report.type}_${report.generatedAt.split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEmailReport = (report) => {
    // In real app, this would open email client or send via API
    const subject = `Financial Report - ${report.type} - ${report.period}`;
    const body = `Please find attached the financial report for ${report.period}.\n\nReport Type: ${report.type}\nGenerated: ${report.generatedAt}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleScheduleReport = () => {
    // In real app, this would open scheduling modal
    alert('Report scheduling feature would open here');
  };

  const mockReportData = {
    spending: {
      totalSpent: 2847.32,
      totalTransactions: 47,
      averageTransaction: 60.58,
      topCategory: 'Food',
      topMerchant: 'Amazon',
      dateRange: 'May 1-31, 2024'
    },
    category: {
      categories: [
        { name: 'Food', amount: 892.10, percentage: 31.3 },
        { name: 'Transport', amount: 425.00, percentage: 14.9 },
        { name: 'Entertainment', amount: 267.99, percentage: 9.4 },
        { name: 'Shopping', amount: 678.45, percentage: 23.8 },
        { name: 'Bills', amount: 583.78, percentage: 20.5 }
      ]
    },
    trends: {
      monthlyData: [
        { month: 'Jan', amount: 2450, change: 12.5 },
        { month: 'Feb', amount: 1890, change: -22.9 },
        { month: 'Mar', amount: 3200, change: 69.3 },
        { month: 'Apr', amount: 2750, change: -14.1 },
        { month: 'May', amount: 2100, change: -23.5 }
      ]
    },
    summary: {
      income: 7500,
      expenses: 2847.32,
      savings: 4652.68,
      savingsRate: 62.0,
      budgetUtilization: 37.9
    }
  };

  const currentReportData = mockReportData[selectedReport] || {};

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
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
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Reports
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Generate and download detailed financial reports
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Period Selector */}
              <div className="flex items-center space-x-3">
                <Calendar className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {periodOptions.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Report Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 ${
                  isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Generate Report</span>
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportTypes.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${
                selectedReport === report.id
                  ? `border-blue-500 bg-gradient-to-br ${report.color} text-white shadow-xl`
                  : darkMode 
                    ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-xl ${
                  selectedReport === report.id
                    ? 'bg-white bg-opacity-20'
                    : `bg-gradient-to-br ${report.color} bg-opacity-20`
                }`}>
                  <report.icon className={`w-6 h-6 ${
                    selectedReport === report.id ? 'text-white' : 'text-white'
                  }`} />
                </div>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 ${
                selectedReport === report.id ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {report.name}
              </h3>
              <p className={`text-sm ${
                selectedReport === report.id ? 'text-white opacity-90' : darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {report.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Current Report Preview */}
        {currentReportData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg backdrop-blur-sm mb-8`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${reportTypes.find(r => r.id === selectedReport)?.color} bg-opacity-20`}>
                    {React.createElement(reportTypes.find(r => r.id === selectedReport)?.icon, { className: 'w-6 h-6 text-white' })}
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {reportTypes.find(r => r.id === selectedReport)?.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {periodOptions.find(p => p.value === selectedPeriod)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="space-y-6">
                {selectedReport === 'spending' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currency}{currentReportData.totalSpent.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transactions</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentReportData.totalTransactions}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currency}{currentReportData.averageTransaction.toFixed(2)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top Category</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentReportData.topCategory}
                      </p>
                    </div>
                  </div>
                )}

                {selectedReport === 'category' && (
                  <div className="space-y-3">
                    {currentReportData.categories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currency}{category.amount.toLocaleString()}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {category.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedReport === 'trends' && (
                  <div className="space-y-4">
                    {currentReportData.monthlyData.map((data, index) => (
                      <div key={data.month} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center space-x-3">
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {data.month}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currency}{data.amount.toLocaleString()}
                          </p>
                          <p className={`text-sm ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {data.change >= 0 ? '+' : ''}{data.change}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedReport === 'summary' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Income</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currency}{currentReportData.income.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expenses</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currency}{currentReportData.expenses.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Savings</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currency}{currentReportData.savings.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Savings Rate</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentReportData.savingsRate}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Generated Reports */}
        {generatedReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg backdrop-blur-sm`}
          >
            <div className="p-6">
              <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Generated Reports
              </h3>
              
              <div className="space-y-3">
                {generatedReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${reportTypes.find(r => r.id === report.type)?.color} bg-opacity-20`}>
                        {React.createElement(reportTypes.find(r => r.id === report.type)?.icon, { className: 'w-5 h-5 text-white' })}
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {report.name}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(report.generatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          darkMode 
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                            : 'text-blue-600 hover:text-blue-700 hover:bg-gray-100'
                        }`}
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintReport(report)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          darkMode 
                            ? 'text-green-400 hover:text-green-300 hover:bg-gray-700' 
                            : 'text-green-600 hover:text-green-700 hover:bg-gray-100'
                        }`}
                        title="Print Report"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEmailReport(report)}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          darkMode 
                            ? 'text-purple-400 hover:text-purple-300 hover:bg-gray-700' 
                            : 'text-purple-600 hover:text-purple-700 hover:bg-gray-100'
                        }`}
                        title="Email Report"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
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

export default Reports;
