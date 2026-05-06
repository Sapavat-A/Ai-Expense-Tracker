import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  X, 
  RefreshCw, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AnomalyAlerts = ({ anomalies = [], onClearAnomaly, onRefresh }) => {
  const [expandedAnomaly, setExpandedAnomaly] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertCircle;
      case 'medium': return TrendingUp;
      case 'low': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const handleClearAnomaly = async (expenseId) => {
    try {
      await onClearAnomaly(expenseId);
      setExpandedAnomaly(null);
    } catch (error) {
      console.error('Error clearing anomaly:', error);
    }
  };

  const getAnomalyTypeLabel = (type) => {
    const labels = {
      'high_amount': 'Unusually High Amount',
      'category_spike': 'Category Spending Spike',
      'duplicate_transaction': 'Duplicate Transaction',
      'unusual_timing': 'Unusual Timing',
      'rapid_succession': 'Rapid Succession',
    };
    return labels[type] || 'Unknown Anomaly';
  };

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-2" />
        <h3 className="text-lg font-semibold text-green-800 mb-1">No Anomalies Detected</h3>
        <p className="text-green-600">Your expense patterns look normal. Keep up the good work!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          Anomaly Detection Alerts
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Detecting...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {anomalies.map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
              style={{
                borderColor: expandedAnomaly === anomaly.id ? '#ef4444' : undefined,
                backgroundColor: expandedAnomaly === anomaly.id ? '#fafafa' : undefined
              }}
              onClick={() => setExpandedAnomaly(expandedAnomaly === anomaly.id ? null : anomaly.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(anomaly.anomaly_severity)}`}>
                    {getSeverityIcon(anomaly.anomaly_severity)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {getAnomalyTypeLabel(anomaly.anomaly_type)}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {anomaly.anomaly_description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">{anomaly.category}</span>
                      <span className="text-gray-500">•</span>
                      <span className="font-bold text-lg">{anomaly.amount.toFixed(2)}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-xs text-gray-400">{anomaly.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleClearAnomaly(anomaly.id)}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    title="Clear anomaly flag"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedAnomaly === anomaly.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pt-3 border-t"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <strong>Z-Score:</strong> {anomaly.anomaly_score?.toFixed(2) || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <strong>Severity:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(anomaly.anomaly_severity)}`}>
                        {anomaly.anomaly_severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <strong>Detected:</strong> {anomaly.detected_at ? new Date(anomaly.detected_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnomalyAlerts;
