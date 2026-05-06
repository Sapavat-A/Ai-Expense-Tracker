import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const SpendingChart = ({ 
  data = [], 
  height = 300, 
  currency = '$',
  showLegend = true,
  className = '' 
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.category,
      value: parseFloat(item.amount),
      percentage: item.percentage || 0
    })).sort((a, b) => b.value - a.value);
  }, [data]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const COLORS = [
    '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', 
    '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#14b8a6'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {currency}{data.value.toFixed(2)} ({data.percentage?.toFixed(1)}%)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.count || 1} transaction{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 5) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${percent.toFixed(0)}%`}
      </text>
    );
  };

  if (!chartData.length) {
    return (
      <div className={`flex items-center justify-center h-${height} ${className}`}>
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No spending data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="middle" 
              height={36}
              formatter={(value, entry) => (
                <span className="text-sm">
                  {entry.name}: {currency}{value.toFixed(2)}
                </span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Top Category</span>
          </div>
          <p className="text-lg font-bold text-blue-900">
            {chartData[0]?.name || 'N/A'}
          </p>
          <p className="text-sm text-blue-700">
            {currency}{chartData[0]?.value?.toFixed(2) || '0.00'}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Total Spending</span>
          </div>
          <p className="text-lg font-bold text-green-900">
            {currency}{totalAmount.toFixed(2)}
          </p>
          <p className="text-sm text-green-700">
            {chartData.length} categor{chartData.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;
