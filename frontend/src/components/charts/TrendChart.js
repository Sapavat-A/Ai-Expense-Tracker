import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const TrendChart = ({ 
  data = [], 
  height = 300, 
  currency = '$',
  type = 'line',
  className = '' 
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      amount: parseFloat(item.amount),
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  const statistics = useMemo(() => {
    if (!chartData.length) return { trend: 'neutral', change: 0, changePercent: 0 };
    
    const amounts = chartData.map(d => d.amount);
    const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2));
    const secondHalf = amounts.slice(Math.floor(amounts.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    const changePercent = firstAvg !== 0 ? (change / firstAvg) * 100 : 0;
    
    let trend = 'neutral';
    if (changePercent > 5) trend = 'up';
    else if (changePercent < -5) trend = 'down';
    
    return { trend, change, changePercent };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">
            {data.date}
          </p>
          <p className="text-sm text-gray-600">
            Spending: <span className="font-medium">{currency}{data.amount.toFixed(2)}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.category}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <div className={`flex items-center justify-center h-${height} ${className}`}>
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No trend data available</p>
        </div>
      </div>
    );
  }

  const gradientOffset = type === 'area' ? (
    <defs>
      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
      </linearGradient>
    </defs>
  ) : null;

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Spending Trend</h3>
          <div className="flex items-center gap-2">
            {statistics.trend === 'up' && (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  +{statistics.changePercent.toFixed(1)}% ({currency}{Math.abs(statistics.change).toFixed(2)})
                </span>
              </>
            )}
            {statistics.trend === 'down' && (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  {statistics.changePercent.toFixed(1)}% ({currency}{Math.abs(statistics.change).toFixed(2)})
                </span>
              </>
            )}
            {statistics.trend === 'neutral' && (
              <>
                <div className="h-4 w-4 text-gray-400">—</div>
                <span className="text-sm text-gray-600">
                  No change ({currency}{statistics.change.toFixed(2)})
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => `${currency}${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              fill="url(#colorGradient)" 
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => `${currency}${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
