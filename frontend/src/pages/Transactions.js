import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  Calendar,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Coffee,
  Home,
  Car,
  Gamepad2,
  Music,
  Heart,
  Zap,
  CheckCircle,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Transactions = ({ darkMode, currency = '$' }) => {
  const [transactions, setTransactions] = useState([
    { id: 1, description: 'Weekly Grocery Shopping', amount: 127.43, category: 'Food & Dining', date: '2024-05-06', paymentMethod: 'Credit Card', status: 'completed', type: 'expense' },
    { id: 2, description: 'Gas Station Fill-up', amount: 65.00, category: 'Transportation', date: '2024-05-05', paymentMethod: 'Debit Card', status: 'completed', type: 'expense' },
    { id: 3, description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2024-05-04', paymentMethod: 'Auto-pay', status: 'completed', type: 'expense' },
    { id: 4, description: 'Restaurant Dinner', amount: 45.67, category: 'Food & Dining', date: '2024-05-03', paymentMethod: 'Credit Card', status: 'completed', type: 'expense' },
    { id: 5, description: 'Electric Bill', amount: 89.50, category: 'Bills & Utilities', date: '2024-05-01', paymentMethod: 'Bank Transfer', status: 'pending', type: 'expense' },
    { id: 6, description: 'Gym Membership', amount: 29.99, category: 'Health & Fitness', date: '2024-05-08', paymentMethod: 'Credit Card', status: 'completed', type: 'expense' },
    { id: 7, description: 'Online Shopping', amount: 156.78, category: 'Shopping', date: '2024-05-07', paymentMethod: 'PayPal', status: 'completed', type: 'expense' },
    { id: 8, description: 'Salary Deposit', amount: 3750.00, category: 'Income', date: '2024-05-01', paymentMethod: 'Direct Deposit', status: 'completed', type: 'income' },
    { id: 9, description: 'Freelance Project', amount: 850.00, category: 'Income', date: '2024-05-15', paymentMethod: 'Bank Transfer', status: 'completed', type: 'income' },
    { id: 10, description: 'Coffee Shop', amount: 12.50, category: 'Food & Dining', date: '2024-05-08', paymentMethod: 'Credit Card', status: 'completed', type: 'expense' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const categories = ['All', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health & Fitness', 'Income', 'Other'];
  const statuses = ['All', 'Completed', 'Pending', 'Failed'];
  const dateRanges = ['All', 'Today', 'This Week', 'This Month', 'This Quarter', 'This Year'];
  const sortOptions = ['Date', 'Amount', 'Category', 'Description'];
  const paymentMethods = ['All', 'Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Cash', 'Auto-pay', 'Direct Deposit'];

  const categoryIcons = {
    'Food & Dining': Coffee,
    'Transportation': Car,
    'Entertainment': Gamepad2,
    'Shopping': ShoppingCart,
    'Bills': Home,
    'Health': Heart,
    'Transport': Zap,
    'Other': Plus
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }
    
    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(transaction => transaction.status === selectedStatus.toLowerCase());
    }
    
    // Filter by date range
    if (selectedDateRange !== 'all') {
      const today = new Date();
      const transactionDate = (date) => new Date(date);
      
      filtered = filtered.filter(transaction => {
        const tDate = transactionDate(transaction.date);
        switch (selectedDateRange) {
          case 'today':
            return tDate.toDateString() === today.toDateString();
          case 'this week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return tDate >= weekAgo;
          case 'this month':
            return tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
          case 'this quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            const tQuarter = Math.floor(tDate.getMonth() / 3);
            return tQuarter === quarter && tDate.getFullYear() === today.getFullYear();
          case 'this year':
            return tDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }
    
    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy.toLowerCase()) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [transactions, searchQuery, selectedCategory, selectedStatus, selectedDateRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Transaction management functions
  const handleAddTransaction = (newTransaction) => {
    const transaction = {
      ...newTransaction,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    };
    setTransactions([transaction, ...transactions]);
    setShowAddModal(false);
  };

  const handleEditTransaction = (updatedTransaction) => {
    setTransactions(transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
    setShowEditModal(false);
    setSelectedTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleBulkDelete = () => {
    setTransactions(transactions.filter(t => !selectedTransactions.includes(t.id)));
    setSelectedTransactions([]);
  };

  const handleSelectTransaction = (id) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === paginatedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(paginatedTransactions.map(t => t.id));
    }
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.date,
        `"${t.description}"`,
        t.category,
        t.amount,
        t.paymentMethod,
        t.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  const exportToPDF = () => {
    // In a real app, you would use a PDF library like jsPDF
    alert('PDF export would be implemented with a PDF library');
  };

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [filteredTransactions]);

  
  const handleSaveTransaction = (transactionData) => {
    if (isEditing && transactionData.id) {
      // Update existing transaction
      setTransactions(transactions.map(t => 
        t.id === transactionData.id ? { ...transactionData, status: 'completed' } : t
      ));
    } else {
      // Add new transaction
      const newTransaction = {
        ...transactionData,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
      };
      setTransactions([...transactions, newTransaction]);
    }
    setIsAddingTransaction(false);
    setIsEditing(false);
    setSelectedTransaction(null);
  };

  const handleExportTransactions = () => {
    const csvContent = [
      ['Description', 'Amount', 'Category', 'Date', 'Payment Method', 'Status'],
      ...filteredTransactions.map(t => [
        t.description,
        t.amount.toString(),
        t.category,
        t.date,
        t.paymentMethod,
        t.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
                Transactions
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage and track all your expenses
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Add Transaction Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddTransaction}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Transaction
              </motion.button>

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportTransactions}
                className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                } border`}
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`mb-6 p-4 rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg backdrop-blur-sm`}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date Range
                  </label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {dateRanges.map(range => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {sortOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`mb-6 p-4 rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg backdrop-blur-sm`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Transactions
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {filteredTransactions.length}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Amount
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currency}{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Average Transaction
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currency}{(totalAmount / filteredTransactions.length).toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg backdrop-blur-sm overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <tr>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`text-center p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                    className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors duration-200`}
                  >
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${categoryIcons[transaction.category] ? `bg-${transaction.category.toLowerCase().replace(' ', '-')}-500` : 'bg-gray-400'}`}></div>
                        <span className="font-medium">{transaction.description}</span>
                      </div>
                    </td>
                    <td className={`p-4 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {currency}{transaction.amount.toLocaleString()}
                    </td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const CategoryIcon = categoryIcons[transaction.category];
                          return CategoryIcon ? (
                            <CategoryIcon className="w-4 h-4" />
                          ) : null;
                        })()}
                        <span>{transaction.category}</span>
                      </div>
                    </td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {transaction.date}
                    </td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className={`p-4 text-center ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            darkMode 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                              : 'text-blue-600 hover:text-blue-700 hover:bg-gray-100'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            darkMode 
                              ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                              : 'text-red-600 hover:text-red-700 hover:bg-gray-100'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Transaction Modal */}
      <AnimatePresence>
        {(isAddingTransaction || selectedTransaction) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => e.target === e.currentTarget && setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-full max-w-md mx-4 p-6 rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const transactionData = {
                  description: formData.get('description'),
                  amount: parseFloat(formData.get('amount')),
                  category: formData.get('category'),
                  date: formData.get('date'),
                  paymentMethod: formData.get('paymentMethod'),
                  status: 'pending'
                };
                handleSaveTransaction(transactionData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      defaultValue={selectedTransaction?.description || ''}
                      required
                      className={`w-full p-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter transaction description"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Amount
                      </label>
                      <div className="relative">
                        <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="number"
                          name="amount"
                          defaultValue={selectedTransaction?.amount || ''}
                          required
                          step="0.01"
                          min="0"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category
                      </label>
                      <select
                        name="category"
                        defaultValue={selectedTransaction?.category || 'Food'}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        {categories.filter(cat => cat !== 'All').map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        defaultValue={selectedTransaction?.date || new Date().toISOString().split('T')[0]}
                        required
                        className={`w-full p-3 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Payment Method
                      </label>
                      <select
                        name="paymentMethod"
                        defaultValue={selectedTransaction?.paymentMethod || 'Credit Card'}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Auto-pay">Auto-pay</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTransaction(null)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    {isEditing ? 'Update Transaction' : 'Add Transaction'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
