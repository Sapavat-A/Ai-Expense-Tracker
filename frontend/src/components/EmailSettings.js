import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Settings, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Send,
  Clock,
  DollarSign
} from 'lucide-react';

const EmailSettings = ({ showToast }) => {
  const [preferences, setPreferences] = useState({
    email_reports_enabled: true,
    budget_alerts_enabled: true,
    monthly_budget: 2000,
    report_day: 1,
    report_frequency: 'monthly',
    email: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState(null);

  // Load preferences on component mount
  useEffect(() => {
    loadEmailPreferences();
    loadSchedulerStatus();
  }, []);

  const loadEmailPreferences = async () => {
    try {
      const { getEmailPreferences } = await import('../services/api');
      const data = await getEmailPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Error loading email preferences:', error);
      showToast('error', 'Failed to load email preferences');
    }
  };

  const loadSchedulerStatus = async () => {
    try {
      const { getSchedulerStatus } = await import('../services/api');
      const status = await getSchedulerStatus();
      setSchedulerStatus(status);
    } catch (error) {
      console.error('Error loading scheduler status:', error);
    }
  };

  const updatePreferences = async (newPreferences) => {
    setIsLoading(true);
    try {
      const { updateEmailPreferences } = await import('../services/api');
      const result = await updateEmailPreferences(newPreferences);
      setPreferences(result.preferences);
      showToast('success', 'Email preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      showToast('error', 'Failed to update email preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      showToast('error', 'Please enter a test email address');
      return;
    }

    setIsSendingTest(true);
    try {
      const { sendTestEmail } = await import('../services/api');
      const result = await sendTestEmail(testEmail);
      if (result.success) {
        showToast('success', `Test email sent to ${testEmail}`);
        setTestEmail('');
      } else {
        showToast('error', result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showToast('error', 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const sendManualReport = async () => {
    setIsLoading(true);
    try {
      const { sendMonthlyReport } = await import('../services/api');
      const result = await sendMonthlyReport();
      if (result.success) {
        showToast('success', 'Monthly report sent successfully');
      } else {
        showToast('error', result.error || 'Failed to send monthly report');
      }
    } catch (error) {
      console.error('Error sending manual report:', error);
      showToast('error', 'Failed to send monthly report');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
  };

  const savePreferences = () => {
    updatePreferences(preferences);
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'monthly': 'Monthly (1st of each month)',
      'weekly': 'Weekly (Every Monday)',
      'biweekly': 'Bi-weekly (1st and 15th)'
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Email Report Settings</h2>
        <Settings className="h-5 w-5 text-gray-400" />
      </div>

      {/* Email Status */}
      {schedulerStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Email Scheduler: {schedulerStatus.scheduler?.running ? 'Running' : 'Stopped'}
            </span>
            <span className="text-sm text-blue-600">
              ({schedulerStatus.scheduler?.job_count || 0} active jobs)
            </span>
          </div>
          {schedulerStatus.scheduler?.next_report_date && (
            <div className="mt-2 text-sm text-blue-700">
              <Clock className="inline h-4 w-4 mr-1" />
              Next report: {schedulerStatus.user_preferences?.next_report_date}
            </div>
          )}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Email Reports Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="font-medium text-gray-900">Monthly Email Reports</label>
            <p className="text-sm text-gray-600 mt-1">
              Receive comprehensive spending summaries and insights
            </p>
          </div>
          <button
            onClick={() => handlePreferenceChange('email_reports_enabled', !preferences.email_reports_enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              preferences.email_reports_enabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-lg transform ring-0 transition-transform ${
                preferences.email_reports_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Budget Alerts Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="font-medium text-gray-900">Budget Alerts</label>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when you exceed your budget
            </p>
          </div>
          <button
            onClick={() => handlePreferenceChange('budget_alerts_enabled', !preferences.budget_alerts_enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              preferences.budget_alerts_enabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-lg transform ring-0 transition-transform ${
                preferences.budget_alerts_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Monthly Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Monthly Budget
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={preferences.monthly_budget}
              onChange={(e) => handlePreferenceChange('monthly_budget', parseFloat(e.target.value) || 0)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="2000.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Report Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Report Frequency
          </label>
          <select
            value={preferences.report_frequency}
            onChange={(e) => handlePreferenceChange('report_frequency', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
          </select>
          <p className="text-sm text-gray-600 mt-1">
            {getFrequencyLabel(preferences.report_frequency)}
          </p>
        </div>

        {/* Report Day (for monthly/biweekly) */}
        {(preferences.report_frequency === 'monthly' || preferences.report_frequency === 'biweekly') && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Report Day
            </label>
            <select
              value={preferences.report_day}
              onChange={(e) => handlePreferenceChange('report_day', parseInt(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Day of month to send reports
            </p>
          </div>
        )}

        {/* Email Display */}
        {preferences.email && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                Reports will be sent to: <span className="font-medium">{preferences.email}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        <div className="flex gap-3">
          <button
            onClick={savePreferences}
            disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
          
          <button
            onClick={sendManualReport}
            disabled={isLoading || !preferences.email_reports_enabled}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isLoading ? 'Sending...' : 'Send Report Now'}
          </button>
        </div>

        {/* Test Email Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Test Email Configuration</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter test email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={sendTestEmail}
              disabled={isSendingTest || !testEmail}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSendingTest ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isSendingTest ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Send a test email to verify your email configuration is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
