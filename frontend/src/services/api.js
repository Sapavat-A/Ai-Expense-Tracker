import axios from 'axios';

const BACKEND_BASE_URLS = ['http://127.0.0.1:8000', 'http://127.0.0.1:8001'];
let activeBaseURL = BACKEND_BASE_URLS[0];

const api = axios.create({
  baseURL: activeBaseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      const response = await axios.get(`${baseURL}/`, { timeout: 2500 });
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
  return error?.response?.data?.detail || fallbackMessage;
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

export const getExpenses = () =>
  request(() => api.get('/expenses'), 'Could not fetch expenses.');

export const addExpense = (expenseData) =>
  request(
    () => {
      console.log('[POST /expenses] Request payload:', expenseData);
      return api.post('/expenses', expenseData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    'Could not add expense.'
  );

export const getInsights = () =>
  request(() => api.get('/insights'), 'Could not fetch insights.');

export const getPrediction = () =>
  request(() => api.get('/predict'), 'Could not fetch prediction.');
