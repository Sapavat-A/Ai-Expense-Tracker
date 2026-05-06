import axios from 'axios';

const BACKEND_BASE_URLS = [
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];
let activeBaseURL = BACKEND_BASE_URLS[0];

const api = axios.create({
  baseURL: activeBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintech-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('fintech-token');
      localStorage.removeItem('fintech-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const getApiPath = (url = '') => (url.startsWith('/') ? url : `/${url}`);

const setActiveBaseURL = (url) => {
  activeBaseURL = url;
  api.defaults.baseURL = url;
  console.log('[API INFO] Active backend URL:', url);
};

export const getActiveBackendURL = () => activeBaseURL;

export const checkBackendConnection = async () => {
  for (const baseURL of BACKEND_BASE_URLS) {
    try {
      const response = await axios.get(`${baseURL}/health`, { timeout: 2500 });
      if (response.status >= 200 && response.status < 300) {
        setActiveBaseURL(baseURL);
        return { connected: true, baseURL };
      }
    } catch (error) {
      console.error('[API PROBE FAILED]', baseURL, {
        message: error?.message,
        status: error?.response?.status,
      });
    }
  }

  return { connected: false, baseURL: null };
};

const getErrorMessage = (error, fallbackMessage) => {
  if (!error?.response) {
    return 'Network error: cannot reach backend API.';
  }
  return error?.response?.data?.message || error?.response?.data?.detail || fallbackMessage;
};

const request = async (apiCall, fallbackMessage) => {
  try {
    const response = await apiCall();
    console.log(
      '[API SUCCESS]',
      response.config?.method?.toUpperCase(),
      `${response.config?.baseURL || ''}${getApiPath(response.config?.url || '')}`,
      response.data
    );
    return response.data;
  } catch (error) {
    if (!error?.response) {
      const connectionState = await checkBackendConnection();
      if (connectionState.connected) {
        try {
          const retryResponse = await apiCall();
          console.log(
            '[API RETRY SUCCESS]',
            retryResponse.config?.method?.toUpperCase(),
            `${retryResponse.config?.baseURL || ''}${getApiPath(retryResponse.config?.url || '')}`
          );
          return retryResponse.data;
        } catch (retryError) {
          error = retryError;
        }
      }
    }

    console.error(
      '[API ERROR]',
      error?.config?.method?.toUpperCase(),
      `${error?.config?.baseURL || activeBaseURL}${getApiPath(error?.config?.url || '')}`,
      {
        message: error?.message,
        status: error?.response?.status,
        detail: error?.response?.data,
      }
    );
    throw new Error(getErrorMessage(error, fallbackMessage));
  }
};

// ==================== AUTHENTICATION API ====================

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${activeBaseURL}/api/auth/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      const { access_token, user } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('fintech-token', access_token);
      localStorage.setItem('fintech-user', JSON.stringify(user));
      
      return { access_token, user };
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Login failed. Please check your credentials.'));
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${activeBaseURL}/api/auth/register`, userData);
    
    if (response.data.success) {
      const { access_token, user } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('fintech-token', access_token);
      localStorage.setItem('fintech-user', JSON.stringify(user));
      
      return { access_token, user };
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'));
  }
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem('fintech-token');
    localStorage.removeItem('fintech-user');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/profile');
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to get user information.'));
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to change password.'));
  }
};

// ==================== EXPENSES API ====================

export const getExpenses = (params = {}) =>
  request(() => api.get('/api/expenses', { params }), 'Could not fetch expenses.');

export const createExpense = (expenseData) =>
  request(() => api.post('/api/expenses', expenseData), 'Could not create expense.');

export const updateExpense = (id, expenseData) =>
  request(() => api.put(`/api/expenses/${id}`, expenseData), 'Could not update expense.');

export const deleteExpense = (id) =>
  request(() => api.delete(`/api/expenses/${id}`), 'Could not delete expense.');

export const getExpenseStats = (params = {}) =>
  request(() => api.get('/api/expenses/stats/summary', { params }), 'Could not fetch expense stats.');

export const createBulkExpenses = (expenses) =>
  request(() => api.post('/api/expenses/bulk', { expenses }), 'Could not create expenses.');

export const updateBulkExpenses = (expenseIds, updates) =>
  request(() => api.put('/api/expenses/bulk', { expense_ids: expenseIds, updates }), 'Could not update expenses.');

// ==================== BUDGETS API ====================

export const getBudgets = (params = {}) =>
  request(() => api.get('/api/budgets', { params }), 'Could not fetch budgets.');

export const createBudget = (budgetData) =>
  request(() => api.post('/api/budgets', budgetData), 'Could not create budget.');

export const updateBudget = (id, budgetData) =>
  request(() => api.put(`/api/budgets/${id}`, budgetData), 'Could not update budget.');

export const deleteBudget = (id) =>
  request(() => api.delete(`/api/budgets/${id}`), 'Could not delete budget.');

export const getBudgetStats = () =>
  request(() => api.get('/api/budgets/stats/summary'), 'Could not fetch budget stats.');

export const createBulkBudgets = (budgets) =>
  request(() => api.post('/api/budgets/bulk', { budgets }), 'Could not create budgets.');

export const updateBudgetSpending = (id, spentAmount) =>
  request(() => api.post(`/api/budgets/${id}/update-spending`, { spent_amount: spentAmount }), 'Could not update budget spending.');

// ==================== ANALYTICS API ====================

export const getDashboardAnalytics = () =>
  request(() => api.get('/api/analytics/dashboard'), 'Could not fetch dashboard analytics.');

export const getCategoryAnalytics = (params = {}) =>
  request(() => api.get('/api/analytics/categories', { params }), 'Could not fetch category analytics.');

export const getMonthlyAnalytics = (params = {}) =>
  request(() => api.get('/api/analytics/monthly', { params }), 'Could not fetch monthly analytics.');

export const getFinancialHealth = () =>
  request(() => api.get('/api/analytics/financial-health'), 'Could not fetch financial health metrics.');

// ==================== AI INSIGHTS API ====================

export const analyzeSpending = (params = {}) =>
  request(() => api.post('/api/ai/analyze', {}, { params }), 'Could not analyze spending.');

export const getRecommendations = () =>
  request(() => api.get('/api/ai/recommendations'), 'Could not fetch recommendations.');

export const getAnomalies = () =>
  request(() => api.get('/api/ai/anomalies'), 'Could not fetch anomalies.');

export const getPredictions = (params = {}) =>
  request(() => api.get('/api/ai/predictions', { params }), 'Could not fetch predictions.');

export const getInsights = () =>
  request(() => api.get('/api/ai/insights'), 'Could not fetch insights.');

// ==================== REPORTS API ====================

export const getReports = (params = {}) =>
  request(() => api.get('/api/reports', { params }), 'Could not fetch reports.');

export const createReport = (reportData) =>
  request(() => api.post('/api/reports', reportData), 'Could not create report.');

export const getReport = (id) =>
  request(() => api.get(`/api/reports/${id}`), 'Could not fetch report.');

export const deleteReport = (id) =>
  request(() => api.delete(`/api/reports/${id}`), 'Could not delete report.');

export const getMonthlySummaryReport = (month) =>
  request(() => api.get('/api/reports/monthly/summary', { params: { month } }), 'Could not fetch monthly summary.');

export const getWeeklySummaryReport = (weekNumber, year) =>
  request(() => api.get('/api/reports/weekly/summary', { params: { week_number: weekNumber, year } }), 'Could not fetch weekly summary.');

export const getYearlySummaryReport = (year) =>
  request(() => api.get('/api/reports/yearly/summary', { params: { year } }), 'Could not fetch yearly summary.');

// ==================== SETTINGS API ====================

export const getUserProfile = () =>
  request(() => api.get('/api/settings/profile'), 'Could not fetch user profile.');

export const updateUserProfile = (profileData) =>
  request(() => api.put('/api/settings/profile', profileData), 'Could not update user profile.');

export const getUserPreferences = () =>
  request(() => api.get('/api/settings/preferences'), 'Could not fetch user preferences.');

export const updateUserPreferences = (preferences) =>
  request(() => api.put('/api/settings/preferences', preferences), 'Could not update user preferences.');

export const getSecuritySettings = () =>
  request(() => api.get('/api/settings/security'), 'Could not fetch security settings.');

export const updateSecuritySettings = (securityData) =>
  request(() => api.put('/api/settings/security', securityData), 'Could not update security settings.');

export const updateTheme = (theme) =>
  request(() => api.post('/api/settings/theme', { theme }), 'Could not update theme.');

export const updateCurrency = (currency) =>
  request(() => api.post('/api/settings/currency', { currency }), 'Could not update currency.');

export const updateNotificationPreferences = (notifications) =>
  request(() => api.post('/api/settings/notifications', notifications), 'Could not update notification preferences.');

export const getConnectedAccounts = () =>
  request(() => api.get('/api/settings/connected-accounts'), 'Could not fetch connected accounts.');

export const addConnectedAccount = (accountData) =>
  request(() => api.post('/api/settings/connected-accounts', accountData), 'Could not add connected account.');

export const removeConnectedAccount = (accountId) =>
  request(() => api.delete(`/api/settings/connected-accounts/${accountId}`), 'Could not remove connected account.');

export const exportUserData = () =>
  request(() => api.post('/api/settings/export-data'), 'Could not export user data.');

export const deleteAccount = () =>
  request(() => api.delete('/api/settings/account'), 'Could not delete account.');

