import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  Filter,
  Download,
  Eye,
  Settings,
  Info,
  Zap
} from 'lucide-react';

const EnhancedCharts = ({ 
  data = [], 
  currency = '$', 
  darkMode = false,
  type = 'spending'
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [chartType, setChartType] = useState('bar');

  const timeRanges = [
    { id: 'week', label: '7 Days', value: 7 },
    { id: 'month', label: '30 Days', value: 30 },
    { id: 'quarter', label: '3 Months', value: 90 },
    { id: 'year', label: '1 Year', value: 365 }
  ];

  const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'pie', label: 'Pie Chart', icon: PieChart },
    { id: 'line', label: 'Trend Line', icon: TrendingUp }
  ];

  // Sample data for demonstration
  const spendingData = [
    { name: 'Food', value: 2450, percentage: 38.2, color: '#3b82f6' },
    { name: 'Shopping', value: 1890, percentage: 29.4, color: '#10b981' },
    { name: 'Transport', value: 980, percentage: 15.3, color: '#f59e0b' },
    { name: 'Entertainment', value: 650, percentage: 10.1, color: '#8b5cf6' },
    { name: 'Bills', value: 450, percentage: 7.0, color: '#ef4444' }
  ];

  const trendData = [
    { date: 'Jan', amount: 3200, transactions: 45 },
    { date: 'Feb', amount: 2800, transactions: 38 },
    { date: 'Mar', amount: 3500, transactions: 52 },
    { date: 'Apr', amount: 2900, transactions: 41 },
    { date: 'May', amount: 3100, transactions: 47 },
    { date: 'Jun', amount: 3400, transactions: 49 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`
          p-4 rounded-xl shadow-2xl border
          ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          backdrop-blur-xl
        `}>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {entry.name}
                </span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <div className="relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Spending Analysis
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Category breakdown for selected period
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setSelectedTimeRange(range.id)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${selectedTimeRange === range.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex items-center gap-2">
            {chartTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={`
                    p-2 rounded-lg transition-all
                    ${chartType === type.id 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  title={`Switch to ${type.label}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
          
          {/* Export Button */}
          <button className={`
            p-2 rounded-lg transition-all
            ${darkMode 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `} title="Export data">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Glassmorphism Chart Container */}
      <div className={`
        relative p-6 rounded-2xl border
        ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}
        backdrop-blur-xl shadow-2xl
      `}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd' stroke='%239CA3AF' stroke-width='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Chart Content */}
        <div className="relative z-10">
          {chartType === 'bar' && (
            <div className="h-80">
              {/* Custom Bar Chart Implementation */}
              <div className="flex items-end justify-between h-full px-4">
                {spendingData.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${item.percentage}%`, opacity: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 25
                    }}
                    whileHover={{ scale: 1.05 }}
                    onMouseEnter={() => setHoveredSegment(item.name)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="flex-1 flex flex-col items-center justify-end"
                  >
                    {/* Bar */}
                    <div className="w-full relative">
                      <div 
                        className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                        style={{ 
                          backgroundColor: item.color,
                          height: `${item.percentage}%`,
                          boxShadow: hoveredSegment === item.name 
                            ? `0 0 20px ${item.color}40` 
                            : 'none'
                        }}
                      />
                      
                      {/* Value Label */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`
                          absolute -top-8 left-1/2 transform -translate-x-1/2
                          px-2 py-1 rounded-lg text-xs font-bold text-white
                          ${darkMode ? 'bg-gray-800' : 'bg-gray-900'}
                          shadow-lg
                        `}
                      >
                        {formatCurrency(item.value)}
                      </motion.div>
                    </div>
                    
                    {/* Category Label */}
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {chartType === 'pie' && (
            <div className="h-80 flex items-center justify-center">
              {/* Custom Pie Chart Implementation */}
              <div className="relative w-64 h-64">
                {spendingData.map((item, index) => {
                  const angle = (spendingData.slice(0, index + 1).reduce((sum, curr) => sum + curr.percentage, 0) / 100) * 360;
                  const startAngle = angle - (item.percentage / 100) * 360;
                  
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                      whileHover={{ scale: 1.05 }}
                      onMouseEnter={() => setHoveredSegment(item.name)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      className="absolute inset-0"
                    >
                      {/* Pie Segment */}
                      <div
                        className={`
                          absolute inset-0 rounded-full
                          ${hoveredSegment === item.name ? 'z-20' : 'z-10'}
                        `}
                        style={{
                          background: `conic-gradient(from ${startAngle}deg, ${item.color} 0deg, ${item.color} ${angle}deg, transparent ${angle}deg)`,
                          transform: `rotate(${startAngle}deg)`,
                          filter: hoveredSegment === item.name ? 'brightness(1.1)' : 'brightness(1)',
                          transition: 'filter 0.3s ease'
                        }}
                      />
                      
                      {/* Label */}
                      <div
                        className="absolute"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${startAngle + item.percentage / 2}deg) translateX(80px)`,
                        }}
                      >
                        <span className={`
                          text-xs font-bold text-white
                          ${darkMode ? 'bg-gray-900/90' : 'bg-gray-900/80'}
                          px-2 py-1 rounded
                        `}>
                          {item.name}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Center Circle */}
                <div className={`
                  absolute inset-0 rounded-full
                  ${darkMode ? 'bg-gray-900' : 'bg-white'}
                  shadow-inner
                `} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {chartType === 'pie' && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {spendingData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.name}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {renderBarChart()}
    </motion.div>
  );
};

export default EnhancedCharts;
