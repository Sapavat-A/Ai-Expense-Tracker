import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye, 
  EyeOff,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Gamepad2,
  Heart,
  Plane
} from 'lucide-react';

const EnhancedTransactionTable = ({ 
  transactions = [], 
  currency = '$', 
  darkMode = false,
  onEdit,
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [viewMode, setViewMode] = useState('table'); // table, cards, list

  const categories = [
    { id: 'all', label: 'All Categories', icon: Filter },
    { id: 'food', label: 'Food & Dining', icon: Coffee },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'entertainment', label: 'Entertainment', icon: Gamepad2 },
    { id: 'bills', label: 'Bills & Utilities', icon: Home },
    { id: 'health', label: 'Health & Fitness', icon: Heart },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'other', label: 'Other', icon: MoreVertical }
  ];

  const sortOptions = [
    { id: 'date', label: 'Date' },
    { id: 'amount', label: 'Amount' },
    { id: 'category', label: 'Category' },
    { id: 'description', label: 'Description' }
  ];

  const viewModes = [
    { id: 'table', label: 'Table View', icon: 'Grid3x3' },
    { id: 'cards', label: 'Card View', icon: 'CreditCard' },
    { id: 'list', label: 'List View', icon: 'List' }
  ];

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' }
  ];

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : DollarSign;
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: 'from-blue-500 to-cyan-500',
      shopping: 'from-green-500 to-emerald-500',
      transport: 'from-orange-500 to-red-500',
      entertainment: 'from-purple-500 to-pink-500',
      bills: 'from-gray-500 to-slate-500',
      health: 'from-red-500 to-pink-500',
      travel: 'from-indigo-500 to-blue-500',
      other: 'from-yellow-500 to-orange-500'
    };
    return colors[category] || 'from-gray-500 to-slate-500';
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }

    // Filter by date range
    const now = new Date();
    if (dateRange === 'today') {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.toDateString() === now.toDateString();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(transaction => new Date(transaction.date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(transaction => new Date(transaction.date) >= monthAgo);
    }

    // Sort transactions
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
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
          comparison = new Date(a.date) - new Date(b.date);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [transactions, searchTerm, selectedCategory, dateRange, sortBy, sortOrder]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleTransactionSelection = (id) => {
    const newSelection = new Set(selectedTransactions);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTransactions(newSelection);
  };

  const renderTableView = () => (
    <div className="overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl">
      {/* Table Header */}
      <div className={`
        p-4 border-b
        ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}
      `}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2.5 rounded-xl border
                ${darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all
              `}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all
                  ${selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600'
                    : darkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {categories.find(cat => cat.id === selectedCategory)?.label || 'All Categories'}
                </span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`
                px-3 py-2.5 rounded-xl border transition-all
                ${darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
                }
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              `}
            >
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-sm font-medium">
                  {sortOptions.find(opt => opt.id === sortBy)?.label || 'Date'}
                </span>
                {sortOrder === 'asc' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* View Mode */}
            <div className="relative">
              <button
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-sm font-medium">
                  {viewModes.find(mode => mode.id === viewMode)?.label || 'Table View'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`
            ${darkMode ? 'bg-gray-900/60' : 'bg-gray-50/60'}
          `}>
            <tr>
              <th className={`
                px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = new Set(filteredAndSortedTransactions.map(t => t.id));
                      setSelectedTransactions(allIds);
                    } else {
                      setSelectedTransactions(new Set());
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className={`
                px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Date
              </th>
              <th className={`
                px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Description
              </th>
              <th className={`
                px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Category
              </th>
              <th className={`
                px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Amount
              </th>
              <th className={`
                px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody>
            {filteredAndSortedTransactions.map((transaction, index) => {
              const CategoryIcon = getCategoryIcon(transaction.category);
              const isSelected = selectedTransactions.has(transaction.id);
              
              return (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    border-b transition-all duration-200
                    ${darkMode ? 'border-gray-800 hover:bg-gray-900/50' : 'border-gray-100 hover:bg-gray-50'}
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTransactionSelection(transaction.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className={`
                    px-6 py-4 text-sm
                    ${darkMode ? 'text-gray-300' : 'text-gray-900'}
                  `}>
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg
                        bg-gradient-to-r ${getCategoryColor(transaction.category)}
                        text-white
                      `}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`
                          text-sm font-medium
                          ${darkMode ? 'text-gray-200' : 'text-gray-900'}
                        `}>
                          {transaction.description}
                        </p>
                        {transaction.notes && (
                          <p className={`
                            text-xs mt-1
                            ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                          `}>
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold
                      ${transaction.amount > 0 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                      }
                    `}>
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit?.(transaction)}
                        className={`
                          p-2 rounded-lg transition-all
                          ${darkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                        title="Edit transaction"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => onDelete?.(transaction.id)}
                        className={`
                          p-2 rounded-lg transition-all
                          ${darkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-red-900/50' 
                            : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                          }
                        `}
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAndSortedTransactions.map((transaction, index) => {
        const CategoryIcon = getCategoryIcon(transaction.category);
        const isSelected = selectedTransactions.has(transaction.id);
        
        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`
              relative overflow-hidden rounded-2xl border p-6 shadow-lg
              ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}
              backdrop-blur-xl transition-all duration-300
              hover:shadow-2xl
              ${isSelected ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-3 right-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleTransactionSelection(transaction.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Transaction Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`
                p-2 rounded-lg
                bg-gradient-to-r ${getCategoryColor(transaction.category)}
                text-white
              `}>
                <CategoryIcon className="h-4 w-4" />
              </div>
              <span className={`
                text-xs font-medium
                ${darkMode ? 'text-gray-400' : 'text-gray-500'}
              `}>
                {formatDate(transaction.date)}
              </span>
            </div>

            {/* Transaction Content */}
            <div className="space-y-3">
              <div>
                <p className={`
                  text-sm font-medium
                  ${darkMode ? 'text-gray-200' : 'text-gray-900'}
                `}>
                  {transaction.description}
                </p>
                {transaction.notes && (
                  <p className={`
                    text-xs mt-1
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    {transaction.notes}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`
                  inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold
                  ${transaction.amount > 0 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                  }
                `}>
                  {transaction.amount > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(transaction)}
                    className={`
                      p-1.5 rounded-lg transition-all
                      ${darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                    title="Edit transaction"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  
                  <button
                    onClick={() => onDelete?.(transaction.id)}
                    className={`
                      p-1.5 rounded-lg transition-all
                      ${darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-red-900/50' 
                        : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                      }
                    `}
                    title="Delete transaction"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {viewMode === 'table' && renderTableView()}
      {viewMode === 'cards' && renderCardsView()}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredAndSortedTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center justify-between p-4 rounded-xl border
                ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}
                backdrop-blur-xl shadow-lg
              `}
            >
              {/* List Item Content */}
              <div className="flex items-center gap-4 flex-1">
                <div className={`
                  p-2 rounded-lg
                  bg-gradient-to-r ${getCategoryColor(transaction.category)}
                  text-white
                `}>
                  {React.createElement(getCategoryIcon(transaction.category), { className: "h-4 w-4" })}
                </div>
                <div className="flex-1">
                  <p className={`
                    text-sm font-medium
                    ${darkMode ? 'text-gray-200' : 'text-gray-900'}
                  `}>
                    {transaction.description}
                  </p>
                  <p className={`
                    text-xs
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    {formatDate(transaction.date)} • {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default EnhancedTransactionTable;
