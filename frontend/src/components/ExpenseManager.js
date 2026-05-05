import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bot,
  ArrowUpRight,
  BellRing,
  BrainCircuit,
  CalendarDays,
  Lightbulb,
  IndianRupee,
  Layers,
  LoaderCircle,
  MessageCircle,
  PiggyBank,
  PieChart as PieChartIcon,
  PlusCircle,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Flame,
  Award,
  Wallet,
} from 'lucide-react';

import {
  addExpense,
  checkBackendConnection,
  getActiveBackendURL,
  getExpenses,
  getInsights,
  getPrediction,
} from '../services/api';
import financeIllustration from '../assets/finance-illustration.svg';
import watermarkPattern from '../assets/watermark-pattern.svg';
import CategoryBadge from './ui/CategoryBadge';
import AnimatedCard from './ui/AnimatedCard';
import ProgressStat from './ui/ProgressStat';
import ToastStack from './ui/ToastStack';
import { parseBankStatementCsv } from '../utils/bankStatementParser';

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Water Bills',
  'Entertainment',

  'Health',
  'Current Bills',
  'Other',
];

const CATEGORY_COLORS = [
  '#6366f1',
  '#14b8a6',
  '#f97316',
  '#ec4899',
  '#22c55e',
  '#06b6d4',
  '#eab308',
  '#8b5cf6',
];

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isPositiveAmount = (value) => {
  const parsed = parseFloat(value);
  return !Number.isNaN(parsed) && parsed > 0;
};

const isValidDateFormat = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isNetworkError = (error) => String(error?.message || '').toLowerCase().includes('network');
const STORAGE_KEYS = {
  budget: 'ai-expense-tracker:monthly-budget',
  goal: 'ai-expense-tracker:savings-goal',
  chat: 'ai-expense-tracker:chat-messages',
};

const getFriendlyErrorMessage = (error, fallbackMessage) => {
  const message = error?.message || '';
  if (isNetworkError(error)) {
    return '';
  }
  return message || fallbackMessage;
};

const getMonthLabel = (dateText) => {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleString('en-US', { month: 'short' });
};

const parseStoredNumber = (key, fallback) => {
  const value = Number(window.localStorage.getItem(key));
  if (!Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return value;
};

const getSuggestionForCategory = (category) => {
  const normalized = String(category || '').toLowerCase();
  if (normalized.includes('food')) {
    return 'Reduce food spending by 10% with meal planning and weekly budget limits.';
  }
  if (normalized.includes('travel')) {
    return 'Plan travel ahead and use fare alerts to lower transport expenses by around 8-12%.';
  }
  if (normalized.includes('shopping')) {
    return 'Delay non-essential shopping by 48 hours to avoid impulse purchases.';
  }
  return 'Set a category cap and review high-cost entries weekly for consistent savings.';
};

function ExpenseManager({ darkMode = false, currency = '$', activeSection = 'overview' }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(() => parseStoredNumber(STORAGE_KEYS.budget, 2000));
  const [savingsGoal, setSavingsGoal] = useState(() => parseStoredNumber(STORAGE_KEYS.goal, 1000));
  const [isImportingCsv, setIsImportingCsv] = useState(false);

  const [formError, setFormError] = useState('');
  const [apiMessage, setApiMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendURL, setBackendURL] = useState(getActiveBackendURL());

  const [insights, setInsights] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(() => {
    const initialMessage = [
      {
        role: 'assistant',
        text: 'Hi! I am your AI finance assistant. Ask me about spending trends, budgets, or savings tips.',
      },
    ];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.chat);
      const parsed = JSON.parse(raw || 'null');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (_) {
      // Ignore storage parse errors and fallback to default.
    }
    return initialMessage;
  });
  const [unreadAssistantCount, setUnreadAssistantCount] = useState(0);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const categoryMatches =
        filterCategory === 'All' || expense.category === filterCategory;
      const startMatches = !filterStartDate || expense.date >= filterStartDate;
      const endMatches = !filterEndDate || expense.date <= filterEndDate;
      const searchMatches =
        searchQuery.trim().length === 0 ||
        String(expense.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(expense.date || '').includes(searchQuery) ||
        String(expense.amount || '').includes(searchQuery);
      return categoryMatches && startMatches && endMatches && searchMatches;
    });
  }, [expenses, filterCategory, filterStartDate, filterEndDate, searchQuery]);

  const hasExpenses = filteredExpenses.length > 0;
  const uniqueDaysCount = useMemo(
    () =>
      new Set(
        filteredExpenses
          .map((expense) => String(expense.date || ''))
          .filter((dateText) => dateText.length > 0)
      ).size,
    [filteredExpenses]
  );
  const canPredict = uniqueDaysCount >= 5;
  const isFormValid = isPositiveAmount(amount || '0') && isValidDateFormat(selectedDate || getTodayDateString());

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [filteredExpenses]
  );

  const highestSpendingCategory = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return 'N/A';
    }

    const totalsByCategory = filteredExpenses.reduce((acc, expense) => {
      const key = expense.category || 'Other';
      acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1])[0][0];
  }, [filteredExpenses]);

  const averageSpending = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return 0;
    }
    return totalExpenses / filteredExpenses.length;
  }, [filteredExpenses, totalExpenses]);

  // Group total expense by category for bar chart.
  const chartData = useMemo(() => {
    const totals = filteredExpenses.reduce((acc, expense) => {
      const categoryName = expense.category || 'Other';
      const amountValue = Number(expense.amount);
      if (Number.isNaN(amountValue)) {
        return acc;
      }

      const current = acc[categoryName] || 0;
      acc[categoryName] = current + amountValue;
      return acc;
    }, {});

    return Object.entries(totals)
      .map(([name, total]) => ({
        category: name,
        total: Number(total.toFixed(2)),
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const monthlyExpenseData = useMemo(() => {
    const monthTotals = filteredExpenses.reduce((acc, expense) => {
      const month = getMonthLabel(expense.date);
      acc[month] = (acc[month] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(monthTotals).map(([month, total]) => ({
      month,
      total: Number(total.toFixed(2)),
    }));
  }, [filteredExpenses]);

  const monthlyComparisonData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const categoryMap = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const key = expense.category || 'Other';
      if (!categoryMap[key]) {
        categoryMap[key] = { category: key, current: 0, previous: 0 };
      }
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        categoryMap[key].current += Number(expense.amount || 0);
      } else if (date.getMonth() === previousMonth && date.getFullYear() === previousYear) {
        categoryMap[key].previous += Number(expense.amount || 0);
      }
    });
    return Object.values(categoryMap).slice(0, 8);
  }, [expenses]);

  const trendData = useMemo(() => {
    const dayTotals = filteredExpenses.reduce((acc, expense) => {
      const day = String(expense.date || '');
      acc[day] = (acc[day] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(dayTotals)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([date, total]) => ({
        date: date.slice(5),
        total: Number(total.toFixed(2)),
      }));
  }, [filteredExpenses]);

  const recentTransactions = useMemo(
    () =>
      [...filteredExpenses]
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 8),
    [filteredExpenses]
  );

  const categoryTotals = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const key = expense.category || 'Other';
      acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});
  }, [filteredExpenses]);

  const smartSuggestions = useMemo(() => {
    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      return [];
    }

    const [topCategory, topValue] = entries[0];
    const reduced = (Number(topValue) * 0.9).toFixed(2);
    return [
      `Reduce ${topCategory} spending by 10% to save about ${currency}${(Number(topValue) * 0.1).toFixed(2)}.`,
      getSuggestionForCategory(topCategory),
      `If you cap ${topCategory} at ${currency}${reduced}, your monthly trend can improve noticeably.`,
    ];
  }, [categoryTotals, currency]);

  const thisMonthSpent = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return expenses.reduce((sum, expense) => {
      const date = new Date(expense.date);
      if (date.getMonth() === month && date.getFullYear() === year) {
        return sum + Number(expense.amount || 0);
      }
      return sum;
    }, 0);
  }, [expenses]);

  const monthlySavings = useMemo(() => {
    if (!monthlyBudget || Number(monthlyBudget) <= 0) {
      return 0;
    }
    return Math.max(Number(monthlyBudget) - Number(thisMonthSpent || 0), 0);
  }, [monthlyBudget, thisMonthSpent]);

  const savingsGoalProgress = useMemo(() => {
    if (!savingsGoal || Number(savingsGoal) <= 0) {
      return 0;
    }
    return Math.min((monthlySavings / Number(savingsGoal)) * 100, 100);
  }, [monthlySavings, savingsGoal]);

  const budgetProgress = useMemo(() => {
    if (!monthlyBudget || Number(monthlyBudget) <= 0) {
      return 0;
    }
    return Math.min((thisMonthSpent / Number(monthlyBudget)) * 100, 100);
  }, [thisMonthSpent, monthlyBudget]);

  const budgetTone = useMemo(() => {
    if (budgetProgress < 70) {
      return 'bg-emerald-500';
    }
    if (budgetProgress < 90) {
      return 'bg-amber-500';
    }
    return 'bg-red-500';
  }, [budgetProgress]);

  const { currentStreak, longestStreak } = useMemo(() => {
    const uniqueDates = [...new Set(expenses.map((expense) => String(expense.date || '')))]
      .filter(Boolean)
      .sort();
    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let maxRun = 1;
    let run = 1;
    for (let i = 1; i < uniqueDates.length; i += 1) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 1;
      }
    }

    let currentRun = 1;
    for (let i = uniqueDates.length - 1; i > 0; i -= 1) {
      const curr = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i - 1]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun += 1;
      } else {
        break;
      }
    }

    return { currentStreak: currentRun, longestStreak: maxRun };
  }, [expenses]);

  const earnedBadges = useMemo(() => {
    const badges = [];
    if (currentStreak >= 3) {
      badges.push('Consistency Streak');
    }
    if (budgetProgress <= 80 && monthlyBudget > 0) {
      badges.push('Budget Master');
    }
    if (thisMonthSpent > 0 && thisMonthSpent <= Number(monthlyBudget) * 0.7) {
      badges.push('Saver');
    }
    return badges;
  }, [currentStreak, budgetProgress, monthlyBudget, thisMonthSpent]);

  const smartAlerts = useMemo(() => {
    const alerts = [];
    if (budgetProgress >= 90) {
      alerts.push('You are close to your monthly budget limit.');
    }
    if (budgetProgress >= 100) {
      alerts.push('Budget exceeded this month. Consider reducing discretionary spending.');
    }
    if (insights?.unusual_expenses?.length > 0) {
      alerts.push(`Unusual activity detected: ${insights.unusual_expenses.length} high expenses.`);
    }
    const sortedRecent = [...expenses]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 20);
    const values = sortedRecent.map((item) => Number(item.amount || 0)).filter((v) => Number.isFinite(v) && v > 0);
    if (values.length >= 8) {
      const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
      const latest = values[0];
      if (latest > avg * 2.2) {
        alerts.push('Unusual activity: your latest expense is much higher than your recent average.');
      }
    }
    return alerts;
  }, [budgetProgress, insights, expenses]);

  const heatmapCells = useMemo(() => {
    const totalByDay = expenses.reduce((acc, expense) => {
      const key = String(expense.date || '');
      if (isValidDateFormat(key)) {
        acc[key] = (acc[key] || 0) + Number(expense.amount || 0);
      }
      return acc;
    }, {});
    const endDate = new Date();
    const cells = [];
    for (let offset = 83; offset >= 0; offset -= 1) {
      const current = new Date(endDate);
      current.setDate(endDate.getDate() - offset);
      const iso = current.toISOString().slice(0, 10);
      const value = Number(totalByDay[iso] || 0);
      const level =
        value === 0
          ? 'bg-slate-200'
          : value <= 60
          ? 'bg-emerald-200'
          : value <= 150
          ? 'bg-emerald-400'
          : 'bg-emerald-600';
      cells.push({
        date: iso,
        dayLabel: iso.slice(5),
        value,
        level,
      });
    }
    return cells;
  }, [expenses]);

  const predictionTrendData = useMemo(() => {
    const lastThree = trendData.slice(-3).map((point, index) => ({
      label: `Past ${index + 1}`,
      value: point.total,
      isPrediction: false,
    }));
    if (!prediction?.predicted_expense && prediction?.predicted_expense !== 0) {
      return lastThree;
    }
    return [
      ...lastThree,
      {
        label: 'Next Month',
        value: Number(prediction.predicted_expense ?? prediction.predicted_total ?? 0),
        isPrediction: true,
      },
    ];
  }, [trendData, prediction]);

  const futurePredictionData = useMemo(() => {
    const predicted = Number(prediction?.predicted_expense ?? prediction?.predicted_total ?? 0);
    if (!predicted) {
      return [];
    }
    const latestActual = Number(monthlyExpenseData[monthlyExpenseData.length - 1]?.total || 0);
    return [
      { month: 'Current', actual: latestActual || predicted * 0.95, forecast: null },
      { month: 'Next', actual: null, forecast: predicted },
      { month: '+2 Months', actual: null, forecast: predicted * 1.03 },
      { month: '+3 Months', actual: null, forecast: predicted * 1.07 },
    ].map((item) => ({
      ...item,
      actual: item.actual === null ? null : Number(item.actual.toFixed(2)),
      forecast: item.forecast === null ? null : Number(item.forecast.toFixed(2)),
    }));
  }, [prediction, monthlyExpenseData]);

  const showToast = (type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const formatMoney = (value) => `${currency}${Number(value || 0).toFixed(2)}`;

  const askAiAssistant = () => {
    const userText = chatInput.trim();
    if (!userText) {
      return;
    }
    const lower = userText.toLowerCase();
    let answer = `Your current month spending is ${formatMoney(thisMonthSpent)} with ${budgetProgress.toFixed(
      0
    )}% of budget used.`;
    if (lower.includes('budget')) {
      answer = `Budget status: ${formatMoney(thisMonthSpent)} spent out of ${formatMoney(monthlyBudget)} (${budgetProgress.toFixed(0)}%).`;
    } else if (lower.includes('save') || lower.includes('reduce')) {
      answer = smartSuggestions[0] || 'Cut top category spending by 10% and track daily.';
    } else if (lower.includes('category') || lower.includes('top')) {
      answer = `Top spending category: ${highestSpendingCategory}.`;
    } else if (lower.includes('predict') || lower.includes('next month')) {
      answer = prediction
        ? `Predicted next month expense is ${formatMoney(
            prediction.predicted_expense ?? prediction.predicted_total ?? 0
          )}.`
        : 'Generate prediction first from the Quick Actions panel.';
    } else if (lower.includes('advice') || lower.includes('improve')) {
      answer = [
        `1) Keep discretionary categories under ${formatMoney((monthlyBudget || 0) * 0.35)}.`,
        `2) Current streak is ${currentStreak} days, aim for 7+ for better consistency.`,
        `3) Save at least ${formatMoney(Math.max(monthlySavings * 0.2, 50))} this week.`,
      ].join(' ');
    }

    setChatMessages((prev) => [...prev, { role: 'user', text: userText }, { role: 'assistant', text: answer }]);
    if (!chatOpen) {
      setUnreadAssistantCount((prev) => prev + 1);
    }
    setChatInput('');
  };

  const exportToCsv = () => {
    if (filteredExpenses.length === 0) {
      showToast('error', 'No expenses to export.');
      return;
    }

    const header = ['id', 'amount', 'category', 'date'];
    const rows = filteredExpenses.map((expense) => [
      expense.id,
      expense.amount,
      `"${expense.category}"`,
      expense.date,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expenses-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showToast('success', 'CSV exported successfully.');
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsImportingCsv(true);
    try {
      const text = await file.text();
      const payloads = parseBankStatementCsv(text);

      if (payloads.length === 0) {
        showToast('error', 'No valid debit expenses found. Ensure CSV has date and amount/debit columns.');
        return;
      }

      await Promise.all(payloads.map((payload) => addExpense(payload)));
      await fetchExpenses();
      showToast('success', `Imported ${payloads.length} bank transactions.`);
    } catch (error) {
      showToast('error', 'Bank statement import failed. Please verify CSV format.');
    } finally {
      setIsImportingCsv(false);
      event.target.value = '';
    }
  };

  const summaryCards = [
    {
      label: 'Total Spend',
      value: formatMoney(totalExpenses),
      icon: Wallet,
      tone: 'from-indigo-500/30 to-blue-500/30',
    },
    {
      label: 'Average Expense',
      value: formatMoney(averageSpending),
      icon: TrendingUp,
      tone: 'from-cyan-500/30 to-emerald-500/30',
    },
    {
      label: 'Top Category',
      value: highestSpendingCategory,
      icon: Layers,
      tone: 'from-fuchsia-500/30 to-violet-500/30',
    },
    {
      label: 'Unique Days',
      value: `${uniqueDaysCount}`,
      icon: PieChartIcon,
      tone: 'from-orange-500/30 to-rose-500/30',
    },
  ];

  const refreshBackendConnection = async () => {
    setIsCheckingBackend(true);
    setApiMessage('');
    const result = await checkBackendConnection();
    setIsBackendConnected(result.connected);
    setBackendURL(result.baseURL || 'Unavailable');
    setIsCheckingBackend(false);
    if (!result.connected) {
      setInsights(null);
      setPrediction(null);
      showToast('error', 'Backend is offline. Start FastAPI and reconnect.');
    }
    return result.connected;
  };

  const fetchExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
      setIsBackendConnected(true);
      setBackendURL(getActiveBackendURL());
      setApiMessage('');
      if (data.length === 0) {
        showToast('success', 'Connected to backend. Add your first expense.');
      }
    } catch (error) {
      if (isNetworkError(error)) {
        setIsBackendConnected(false);
        setApiMessage('');
        showToast('error', 'Network error while loading expenses.');
      } else {
        setApiMessage(
          getFriendlyErrorMessage(
            error,
            'Could not load expenses. Please refresh the page and try again.'
          )
        );
        showToast('error', 'Could not load expenses.');
      }
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      const connected = await refreshBackendConnection();
      if (connected) {
        await fetchExpenses();
      } else {
        setApiMessage('');
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.budget, String(monthlyBudget));
  }, [monthlyBudget]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.goal, String(savingsGoal));
  }, [savingsGoal]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(chatMessages.slice(-30)));
  }, [chatMessages]);

  useEffect(() => {
    if (chatOpen) {
      setUnreadAssistantCount(0);
    }
  }, [chatOpen]);

  useEffect(() => {
    if (smartAlerts.length > 0) {
      showToast('error', smartAlerts[0]);
    }
  }, [smartAlerts]);

  const handleAddExpense = async (event) => {
    event.preventDefault();
    setFormError('');
    setApiMessage('');
    setSuccessMessage('');

    if (!isPositiveAmount(amount)) {
      setFormError('Please enter a valid positive amount (for example: 150.75).');
      return;
    }
    const dateToSend = selectedDate || getTodayDateString();
    if (!isValidDateFormat(dateToSend)) {
      setFormError('Please select a valid date in YYYY-MM-DD format.');
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      category: String(category),
      date: dateToSend,
    };
    console.log('Sending data:', payload);

    setIsAddingExpense(true);
    try {
      await addExpense(payload);
      setIsBackendConnected(true);
      setBackendURL(getActiveBackendURL());
      setAmount('');
      setSelectedDate('');
      await fetchExpenses();
      setSuccessMessage('Expense added successfully.');
      showToast('success', 'Expense added successfully.');
    } catch (error) {
      if (isNetworkError(error)) {
        setIsBackendConnected(false);
        setApiMessage('');
        showToast('error', 'Network error while adding expense.');
      } else {
        setApiMessage(
          getFriendlyErrorMessage(error, 'Unable to add expense right now. Please try again.')
        );
        showToast('error', 'Unable to add expense right now.');
      }
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleGetInsights = async () => {
    setApiMessage('');
    setSuccessMessage('');
    if (!isBackendConnected) {
      await refreshBackendConnection();
      return;
    }
    if (!hasExpenses) {
      setApiMessage('Add some expenses to see insights');
      return;
    }

    setIsLoadingInsights(true);
    try {
      const data = await getInsights();
      setInsights(data);
      setIsBackendConnected(true);
      setBackendURL(getActiveBackendURL());
      showToast('success', 'AI insights generated.');
    } catch (error) {
      if (isNetworkError(error)) {
        setIsBackendConnected(false);
        setApiMessage('');
        showToast('error', 'Network error while generating insights.');
      } else {
        setApiMessage(
          getFriendlyErrorMessage(error, 'Unable to load insights right now. Please try again.')
        );
        showToast('error', 'Unable to load insights right now.');
      }
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleGetPrediction = async () => {
    setApiMessage('');
    setSuccessMessage('');
    if (!isBackendConnected) {
      await refreshBackendConnection();
      return;
    }
    if (!canPredict) {
      setApiMessage('Select different dates to enable prediction');
      return;
    }

    setIsLoadingPrediction(true);
    try {
      const data = await getPrediction();
      setPrediction(data);
      setIsBackendConnected(true);
      setBackendURL(getActiveBackendURL());
      showToast('success', 'Prediction generated successfully.');
    } catch (error) {
      if (isNetworkError(error)) {
        setIsBackendConnected(false);
        setApiMessage('');
        showToast('error', 'Network error while generating prediction.');
      } else {
        setApiMessage(
          getFriendlyErrorMessage(error, 'Unable to get prediction right now. Please try again.')
        );
        showToast('error', 'Unable to get prediction right now.');
      }
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <ToastStack toasts={toasts} />
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-xl md:p-8 ${
          darkMode ? 'border-slate-700/50 bg-slate-900/70 text-slate-100' : 'border-white/30 bg-white/70'
        }`}
        style={{ backgroundImage: `url(${watermarkPattern})`, backgroundRepeat: 'repeat' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute bottom-3 right-4 text-3xl font-extrabold tracking-widest text-indigo-900">
            AI EXPENSE TRACKER
          </div>
        </div>
        <div className="mb-6 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              <Sparkles size={14} /> Smart Finance Workspace
            </p>
            <h1 className={`text-3xl font-extrabold tracking-tight md:text-4xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              AI Expense Tracker
            </h1>
            <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Modern analytics dashboard for spending, insights, and forecasts.
            </p>
          </div>
          <img src={financeIllustration} alt="Finance dashboard visual" className="h-24 w-auto md:h-28" />
        </div>
        <p className={`mb-4 text-center text-sm md:text-left ${isBackendConnected ? 'text-emerald-700' : 'text-red-600'}`}>
          {isCheckingBackend
            ? 'Checking backend connection...'
            : isBackendConnected
            ? `Backend connected: ${backendURL}`
            : 'Backend disconnected. Start FastAPI on port 8000 or 8001.'}
        </p>
        {!isBackendConnected && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>Backend is offline. Start FastAPI, then click reconnect.</span>
            <button
              type="button"
              onClick={refreshBackendConnection}
              disabled={isCheckingBackend}
              className="rounded-lg bg-red-600 px-3 py-1 font-semibold text-white disabled:opacity-60"
            >
              {isCheckingBackend ? 'Checking...' : 'Reconnect'}
            </button>
          </div>
        )}

        {(activeSection === 'overview' || activeSection === 'reports') && (
        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <AnimatedCard
                key={card.label}
                className={`rounded-2xl border border-white/40 bg-gradient-to-br ${card.tone} p-4 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">{card.label}</p>
                  <div className="rounded-full bg-white/80 p-2 text-slate-800 shadow">
                    <Icon size={16} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
              </AnimatedCard>
            );
          })}
        </section>
        )}

        {activeSection === 'overview' && (
        <section className="mb-6 grid gap-6 xl:grid-cols-[1.2fr,1fr]">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <PlusCircle size={18} className="text-indigo-600" /> Add New Expense
            </h2>
            <form onSubmit={handleAddExpense} className="grid gap-3 md:grid-cols-4">
            {/* Text input avoids browser spinner arrows for easier manual typing */}
            <input
              type="text"
              inputMode="decimal"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              placeholder="Select date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={isAddingExpense || !isBackendConnected || !isFormValid}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAddingExpense ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle size={15} className="animate-spin" /> Adding...
                </span>
              ) : (
                'Add Expense'
              )}
            </button>
            </form>
            <p className="mt-2 text-sm text-slate-500">
              Selected date: {selectedDate || `${getTodayDateString()} (today default)`}
            </p>
            {!isFormValid && (
              <p className="mt-2 text-xs text-amber-700">
                Enter a positive amount and valid date to enable submit.
              </p>
            )}
            {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
            {successMessage && <p className="mt-2 text-sm text-emerald-600">{successMessage}</p>}
            {apiMessage && <p className="mt-2 text-sm text-red-600">{apiMessage}</p>}
          </motion.div>

          <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <ArrowUpRight size={18} className="text-cyan-600" /> Quick Actions
            </h2>
            <div className="mb-4 grid gap-3">
              <button
                type="button"
                onClick={handleGetInsights}
                disabled={isLoadingInsights || !hasExpenses || !isBackendConnected}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:from-violet-600 hover:to-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingInsights ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle size={15} className="animate-spin" /> Loading Insights...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <BrainCircuit size={16} /> Get Insights
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={handleGetPrediction}
                disabled={!canPredict || isLoadingPrediction || !isBackendConnected}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingPrediction ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle size={15} className="animate-spin" /> Loading Prediction...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp size={16} /> Predict Next Month
                  </span>
                )}
              </button>
            </div>
            {!hasExpenses && <p className="text-sm text-slate-500">Add expenses to unlock AI features.</p>}
            {!canPredict && (
              <p className="mt-1 text-sm text-slate-500">
                Prediction needs at least 5 unique expense dates.
              </p>
            )}
          </div>
        </section>
        )}

        {(activeSection === 'overview' || activeSection === 'transactions') && (
        <section className="mb-6 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Layers size={18} className="text-indigo-600" /> Filter Expenses
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by category, date, or amount..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 md:col-span-3"
            />
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filterStartDate}
              onChange={(event) => setFilterStartDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            />
            <input
              type="date"
              value={filterEndDate}
              onChange={(event) => setFilterEndDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={exportToCsv}
              className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:from-slate-600 hover:to-slate-800"
            >
              Export CSV
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:from-indigo-500 hover:to-blue-600">
              {isImportingCsv ? 'Importing...' : 'Upload Bank Statement'}
              <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Supports bank statement headers like date, debit/amount, credit, narration, description.
          </p>
        </section>
        )}

        {(activeSection === 'overview' || activeSection === 'reports') && (
          <section className="mb-6 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5">
            <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Target size={18} className="text-emerald-600" /> Budget Tracking
            </h2>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-slate-600">Monthly Budget</label>
              <input
                type="number"
                min="0"
                value={monthlyBudget}
                onChange={(event) => setMonthlyBudget(Number(event.target.value || 0))}
                className="w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <p className="text-sm text-slate-600">
                Spent: <span className="font-semibold text-slate-900">{formatMoney(thisMonthSpent)}</span>
              </p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full ${budgetTone} transition-all duration-500`} style={{ width: `${budgetProgress}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-600">Usage: {budgetProgress.toFixed(1)}%</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <ProgressStat
                label="Monthly Budget Health"
                valueText={`${budgetProgress.toFixed(0)}%`}
                progress={budgetProgress}
                tone={budgetTone}
              />
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="mb-2 text-sm font-medium text-slate-700">Savings Goal</p>
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={savingsGoal}
                    onChange={(event) => setSavingsGoal(Number(event.target.value || 0))}
                    className="w-32 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                  />
                  <p className="text-xs text-slate-500">Goal / month</p>
                </div>
                <ProgressStat
                  label="Goal Progress"
                  valueText={`${savingsGoalProgress.toFixed(0)}%`}
                  progress={savingsGoalProgress}
                  tone="bg-cyan-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Saved this month:{' '}
                  <span className="font-semibold text-slate-700">{formatMoney(monthlySavings)}</span>
                </p>
              </div>
            </div>
          </section>
        )}

        {(activeSection === 'overview' || activeSection === 'ai') && (
          <section className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur">
              <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-slate-800">
                <BellRing size={18} className="text-red-500" /> Smart Alerts
              </h2>
              {smartAlerts.length === 0 ? (
                <p className="text-sm text-slate-500">No critical alerts. You are on track.</p>
              ) : (
                <div className="space-y-2">
                  {smartAlerts.map((alert) => (
                    <div key={alert} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {alert}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur">
              <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Flame size={18} className="text-orange-500" /> Gamification
              </h2>
              <p className="text-sm text-slate-700">Current streak: {currentStreak} days</p>
              <p className="text-sm text-slate-700">Longest streak: {longestStreak} days</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {earnedBadges.length === 0 ? (
                  <p className="text-sm text-slate-500">Add more activity to unlock badges.</p>
                ) : (
                  earnedBadges.map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      <Award size={12} /> {badge}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {(activeSection === 'overview' || activeSection === 'reports') && (
          <section className="mb-6 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5">
            <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-slate-800">
              <CalendarDays size={18} className="text-emerald-600" /> Calendar Heatmap
            </h2>
            <p className="mb-3 text-xs text-slate-500">Last 12 weeks of daily expense activity</p>
            <div className="grid grid-cols-12 gap-2">
              {heatmapCells.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${formatMoney(cell.value)}`}
                  className={`flex h-8 items-center justify-center rounded-md text-[10px] font-medium text-slate-700 ${cell.level}`}
                >
                  {cell.dayLabel}
                </div>
              ))}
            </div>
          </section>
        )}

        {(activeSection === 'overview' || activeSection === 'ai') && insights && (
          <section className="mb-6 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <BrainCircuit size={18} className="text-purple-600" /> Insights
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Top Category</p>
                <p className="mt-1 text-base font-bold text-violet-900">
                  {insights.highest_spending_category || 'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Average Spend</p>
                <p className="mt-1 text-base font-bold text-cyan-900">
                  {formatMoney(insights.average_spending)}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Unusual Expenses</p>
                <p className="mt-1 text-base font-bold text-rose-900">
                  {insights.unusual_expenses?.length || 0}
                </p>
              </div>
            </div>
          </section>
        )}

        {(activeSection === 'overview' || activeSection === 'ai') && prediction && (
          <section className="mb-6 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <TrendingUp size={18} className="text-emerald-600" /> Prediction
            </h2>
            <p className="inline-flex items-center gap-1 text-sm text-slate-700">
              <IndianRupee size={14} className="text-emerald-700" />
              Predicted next expense: {formatMoney(
                prediction.predicted_expense ?? prediction.predicted_total ?? 0
              )}
            </p>
            {prediction.message && <p className="mt-1 text-sm text-slate-500">{prediction.message}</p>}
            <div className="mt-3 h-56 w-full rounded-xl border border-emerald-100 bg-emerald-50/40 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatMoney(value), 'Amount']} />
                  <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {(activeSection === 'overview' || activeSection === 'ai') && (
        <section className="mb-6 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Lightbulb size={18} className="text-amber-500" /> Smart Suggestions
          </h2>
          {smartSuggestions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
              <p className="mx-auto mb-2 w-fit rounded-full bg-white p-3 shadow">
                <BellRing size={18} className="text-slate-500" />
              </p>
              Add expenses to unlock smart spending suggestions.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {smartSuggestions.map((item) => (
                <div key={item} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="inline-flex items-start gap-2 text-sm text-amber-900">
                    <PiggyBank size={15} className="mt-0.5 text-amber-600" /> {item}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
        )}

        {(activeSection === 'overview' || activeSection === 'transactions') && (
        <section className="mb-6 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur md:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Wallet size={18} className="text-blue-600" /> Recent Transactions
          </h2>
          {isLoadingExpenses ? (
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <LoaderCircle size={14} className="animate-spin" /> Loading expenses...
            </p>
          ) : recentTransactions.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              <p className="mx-auto mb-2 w-fit rounded-full bg-white p-3 shadow">
                <Wallet size={20} className="text-slate-500" />
              </p>
              No expenses yet. Add your first transaction to populate this table.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full bg-white/80 text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((expense) => (
                    <tr key={expense.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-slate-700">{expense.date}</td>
                      <td className="px-4 py-3">
                        <CategoryBadge category={expense.category} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatMoney(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-emerald-700">
                        <span className="inline-flex items-center gap-1">
                          <ArrowUpRight size={13} /> Logged
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}

        {(activeSection === 'overview' || activeSection === 'reports') && (
        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold text-slate-800">Category Split</h2>
            {chartData.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                <p className="mx-auto mb-2 w-fit rounded-full bg-white p-3 shadow">
                  <PieChartIcon size={20} className="text-slate-500" />
                </p>
                Add expenses to see the pie chart.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="total"
                      nameKey="category"
                      outerRadius={100}
                      innerRadius={55}
                      paddingAngle={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatMoney(value), 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold text-slate-800">Monthly Expenses</h2>
            {monthlyExpenseData.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                <p className="mx-auto mb-2 w-fit rounded-full bg-white p-3 shadow">
                  <TrendingUp size={20} className="text-slate-500" />
                </p>
                Add expenses to see monthly bars.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatMoney(value), 'Total']} />
                    <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold text-slate-800">Spending Trend</h2>
            {trendData.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                <p className="mx-auto mb-2 w-fit rounded-full bg-white p-3 shadow">
                  <Layers size={20} className="text-slate-500" />
                </p>
                Add expenses to see trend lines.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatMoney(value), 'Daily']} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0284c7' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
        )}

        {(activeSection === 'overview' || activeSection === 'reports') && (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <AnimatedCard className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">Monthly Comparison Chart</h2>
              {monthlyComparisonData.length === 0 ? (
                <p className="text-sm text-slate-500">Need expenses from current/previous month to compare.</p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatMoney(value), 'Amount']} />
                      <Legend />
                      <Bar dataKey="current" name="Current Month" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="previous" name="Previous Month" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </AnimatedCard>

            <AnimatedCard className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur">
              <h2 className="mb-3 text-lg font-semibold text-slate-800">Future Prediction Graph</h2>
              {futurePredictionData.length === 0 ? (
                <p className="text-sm text-slate-500">Generate prediction to unlock future projection graph.</p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={futurePredictionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatMoney(value), 'Projected']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#0ea5e9' }}
                        activeDot={{ r: 7 }}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        name="Forecast"
                        stroke="#7c3aed"
                        strokeDasharray="5 5"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#7c3aed' }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </AnimatedCard>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-white/40 bg-slate-900 p-4 text-slate-100 shadow-lg">
          <h2 className="mb-2 text-base font-semibold">Startup-style Experience Enhancements</h2>
          <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-3">
            <p className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-300" /> Glassmorphism cards + depth layers
            </p>
            <p className="inline-flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-300" /> Animated gradients and hover motion
            </p>
            <p className="inline-flex items-center gap-2">
              <BrainCircuit size={14} className="text-violet-300" /> AI insights and forecasting controls
            </p>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-indigo-600 p-4 text-white shadow-xl transition hover:scale-105 hover:bg-indigo-700"
      >
        <span className="relative block">
          <MessageCircle size={20} />
          {!chatOpen && unreadAssistantCount > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold">
              {unreadAssistantCount}
            </span>
          )}
        </span>
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[420px] w-[320px] flex-col rounded-2xl border border-white/30 bg-white/95 p-3 shadow-2xl backdrop-blur-xl">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Bot size={14} className="text-indigo-600" /> AI Chat Assistant
          </p>
          <div className="mb-2 flex-1 space-y-2 overflow-auto rounded-xl bg-slate-50 p-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'ml-auto bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 shadow'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  askAiAssistant();
                }
              }}
              placeholder="Ask about your spending..."
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={askAiAssistant}
              className="rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-700"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseManager;
