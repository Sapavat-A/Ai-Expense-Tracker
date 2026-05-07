import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Plus, Save } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const EXPENSES_KEY = "budget-module-expenses-v2";
const LIMITS_KEY = "budget-module-limits-v2";

const CATEGORY_OPTIONS = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Other",
];

const PAYMENT_METHODS = ["Cash", "UPI", "Credit Card", "Debit Card", "Bank Transfer"];
const PERIODS = ["weekly", "monthly", "quarterly", "halfYearly", "yearly"];
const PERIOD_LABELS = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  halfYearly: "Half-Yearly",
  yearly: "Yearly",
};
const LIMIT_KEYS = {
  weekly: "weeklyLimit",
  monthly: "monthlyLimit",
  quarterly: "quarterlyLimit",
  halfYearly: "halfYearlyLimit",
  yearly: "yearlyLimit",
};
const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6", "#F97316", "#6366F1"];

const defaultLimits = {
  weeklyLimit: 1200,
  monthlyLimit: 5000,
  quarterlyLimit: 15000,
  halfYearlyLimit: 30000,
  yearlyLimit: 60000,
};

const defaultExpenses = [
  {
    id: 1,
    title: "Groceries",
    amount: 220,
    category: "Food",
    date: "2026-05-04",
    paymentMethod: "UPI",
    notes: "Weekly shopping",
  },
  {
    id: 2,
    title: "Electricity Bill",
    amount: 140,
    category: "Bills",
    date: "2026-05-03",
    paymentMethod: "Bank Transfer",
    notes: "",
  },
  {
    id: 3,
    title: "Cab Ride",
    amount: 35,
    category: "Transport",
    date: "2026-05-05",
    paymentMethod: "Cash",
    notes: "",
  },
];

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
};

const startForPeriod = (period) => {
  const now = new Date();
  const start = new Date(now);
  if (period === "weekly") start.setDate(now.getDate() - 7);
  if (period === "monthly") start.setMonth(now.getMonth() - 1);
  if (period === "quarterly") start.setMonth(now.getMonth() - 3);
  if (period === "halfYearly") start.setMonth(now.getMonth() - 6);
  if (period === "yearly") start.setFullYear(now.getFullYear() - 1);
  return start;
};

const Budget = ({ darkMode, currency = "$" }) => {
  const [expenses, setExpenses] = useState(() => readJson(EXPENSES_KEY, defaultExpenses));
  const [limits, setLimits] = useState(() => ({ ...defaultLimits, ...readJson(LIMITS_KEY, {}) }));
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "UPI",
    notes: "",
  });

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses || []));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(LIMITS_KEY, JSON.stringify(limits || defaultLimits));
  }, [limits]);

  const periodExpenses = useMemo(() => {
    const start = startForPeriod(selectedPeriod);
    return (expenses || []).filter((item) => new Date(item?.date || 0) >= start);
  }, [expenses, selectedPeriod]);

  const selectedLimit = Number(limits?.[LIMIT_KEYS[selectedPeriod]] ?? 0);
  const totalSpent = useMemo(
    () => (periodExpenses || []).reduce((sum, item) => sum + Number(item?.amount ?? 0), 0),
    [periodExpenses],
  );
  const remaining = Math.max(selectedLimit - totalSpent, 0);
  const percentageUsed = selectedLimit > 0 ? (totalSpent / selectedLimit) * 100 : 0;
  const savings = selectedLimit - totalSpent;

  const categoryData = useMemo(() => {
    const map = {};
    (periodExpenses || []).forEach((item) => {
      const category = item?.category || "Other";
      map[category] = (map[category] || 0) + Number(item?.amount ?? 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodExpenses]);

  const monthlyTrendData = useMemo(() => {
    const map = {};
    (expenses || []).forEach((item) => {
      const key = String(item?.date || "").slice(0, 7);
      if (!key) return;
      map[key] = (map[key] || 0) + Number(item?.amount ?? 0);
    });
    return Object.entries(map)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-8);
  }, [expenses]);

  const weeklyComparisonData = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const buckets = [0, 0, 0, 0, 0];
    (expenses || []).forEach((item) => {
      const d = new Date(item?.date || 0);
      if (d < startMonth || d > now) return;
      const day = d.getDate();
      const index = Math.min(4, Math.floor((day - 1) / 7));
      buckets[index] += Number(item?.amount ?? 0);
    });
    return buckets.map((amount, index) => ({ week: `W${index + 1}`, amount }));
  }, [expenses]);

  const alerts = useMemo(() => {
    const list = [];
    if (percentageUsed >= 80 && percentageUsed < 100) {
      list.push(`Warning: You used ${Number(percentageUsed).toFixed(1)}% of your ${PERIOD_LABELS[selectedPeriod].toLowerCase()} budget.`);
    }
    if (percentageUsed >= 100) {
      list.push(`Budget exceeded: You are above your ${PERIOD_LABELS[selectedPeriod].toLowerCase()} limit by ${currency}${Number(totalSpent - selectedLimit).toFixed(2)}.`);
    }

    const weeklyExpenses = (expenses || []).filter((item) => new Date(item?.date || 0) >= startForPeriod("weekly"));
    const categoryMap = {};
    weeklyExpenses.forEach((item) => {
      const category = item?.category || "Other";
      categoryMap[category] = (categoryMap[category] || 0) + Number(item?.amount ?? 0);
    });
    Object.entries(categoryMap).forEach(([category, amount]) => {
      const avg = ((periodExpenses || []).filter((x) => x?.category === category).reduce((s, x) => s + Number(x?.amount ?? 0), 0) || 0) / Math.max(1, selectedPeriod === "weekly" ? 1 : 4);
      if (Number(amount) > avg * 1.6 && Number(amount) > 0) {
        list.push(`${category} expenses are higher than usual this week.`);
      }
    });
    return list;
  }, [percentageUsed, selectedPeriod, totalSpent, selectedLimit, currency, expenses, periodExpenses]);

  const filteredExpenses = useMemo(() => {
    let data = [...(periodExpenses || [])];
    if (search) {
      data = data.filter((item) =>
        `${item?.title || ""} ${item?.category || ""} ${item?.paymentMethod || ""} ${item?.notes || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }
    if (categoryFilter !== "All") {
      data = data.filter((item) => item?.category === categoryFilter);
    }
    data.sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "amount") return (Number(a?.amount ?? 0) - Number(b?.amount ?? 0)) * multiplier;
      return (new Date(a?.date || 0) - new Date(b?.date || 0)) * multiplier;
    });
    return data;
  }, [periodExpenses, search, categoryFilter, sortBy, sortOrder]);

  const handleAddExpense = (event) => {
    event.preventDefault();
    const amount = Number(newExpense?.amount ?? 0);
    if (!newExpense?.title || amount <= 0) return;
    const payload = {
      id: Date.now(),
      title: newExpense.title,
      amount,
      category: newExpense.category || "Other",
      date: newExpense.date || new Date().toISOString().slice(0, 10),
      paymentMethod: newExpense.paymentMethod || "UPI",
      notes: newExpense.notes || "",
    };
    setExpenses((prev) => [payload, ...(prev || [])]);
    setShowForm(false);
    setNewExpense({
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: "UPI",
      notes: "",
    });
  };

  const setLimitValue = (key, value) => {
    setLimits((prev) => ({ ...(prev || defaultLimits), [key]: Number(value ?? 0) }));
  };

  const statusColor =
    percentageUsed >= 100 ? "text-red-500" : percentageUsed >= 80 ? "text-yellow-500" : "text-green-500";
  const progressBar =
    percentageUsed >= 100
      ? "from-red-500 to-rose-600"
      : percentageUsed >= 80
        ? "from-yellow-500 to-orange-500"
        : "from-green-500 to-emerald-600";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Budget Planner</h1>
        <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
          Track real-life expenses, set limits, and monitor smart budget alerts.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <p className="text-sm text-gray-500">Total Spent ({PERIOD_LABELS[selectedPeriod]})</p>
          <p className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{currency}{Number(totalSpent ?? 0).toLocaleString()}</p>
        </div>
        <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <p className="text-sm text-gray-500">Remaining Balance</p>
          <p className={`text-3xl font-bold ${remaining > 0 ? "text-green-500" : "text-red-500"}`}>{currency}{Number(remaining ?? 0).toLocaleString()}</p>
        </div>
        <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <p className="text-sm text-gray-500">Savings vs Limit</p>
          <p className={`text-3xl font-bold ${savings >= 0 ? "text-green-500" : "text-red-500"}`}>{currency}{Number(savings ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Budget Usage</h3>
          <span className={`font-semibold ${statusColor}`}>{Number(percentageUsed ?? 0).toFixed(1)}%</span>
        </div>
        <div className={`w-full h-4 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
          <div
            className={`h-full bg-gradient-to-r ${progressBar}`}
            style={{ width: `${Math.min(Number(percentageUsed ?? 0), 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Period & Limits</h3>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {PERIODS.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  selectedPeriod === period
                    ? "bg-indigo-600 text-white"
                    : darkMode
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {PERIOD_LABELS[period]}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {PERIODS.map((period) => (
              <div key={period} className="flex items-center gap-3">
                <label className={`w-28 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{PERIOD_LABELS[period]}</label>
                <input
                  type="number"
                  min="0"
                  value={Number(limits?.[LIMIT_KEYS[period]] ?? 0)}
                  onChange={(event) => setLimitValue(LIMIT_KEYS[period], event.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            ))}
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} flex items-center gap-1`}>
              <Save className="w-3 h-3" /> Limits are saved automatically to localStorage.
            </p>
          </div>
        </div>

        <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Smart Alerts</h3>
          <div className="space-y-2">
            {(alerts || []).length === 0 ? (
              <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-800" : "bg-green-50"} text-green-500`}>
                All good. Your spending is in a safe zone.
              </div>
            ) : (
              (alerts || []).map((alert) => (
                <div key={alert} className={`p-3 rounded-lg ${darkMode ? "bg-red-900/20" : "bg-red-50"} flex gap-2`}>
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{alert}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Category Spending</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData || []} dataKey="value" nameKey="name" outerRadius={80} label>
                  {(categoryData || []).map((item, index) => (
                    <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Weekly Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyComparisonData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-5 shadow-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"}`}>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Recent Expenses</h3>
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search expenses..."
              className={`px-3 py-2 rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option>All</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={darkMode ? "text-gray-300" : "text-gray-700"}>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Payment</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(filteredExpenses || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className={`py-6 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    No expenses found for selected filters.
                  </td>
                </tr>
              ) : (
                (filteredExpenses || []).slice(0, 20).map((item) => {
                  const status =
                    Number(item?.amount ?? 0) > selectedLimit * 0.1
                      ? "High"
                      : Number(item?.amount ?? 0) > selectedLimit * 0.05
                        ? "Medium"
                        : "Normal";
                  const statusStyle = status === "High" ? "text-red-500" : status === "Medium" ? "text-yellow-500" : "text-green-500";
                  return (
                    <tr key={item?.id} className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-t`}>
                      <td className={`py-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{item?.title || "Untitled"}</td>
                      <td className={darkMode ? "text-gray-300" : "text-gray-700"}>{item?.category || "Other"}</td>
                      <td className={darkMode ? "text-gray-300" : "text-gray-700"}>{item?.date || "-"}</td>
                      <td className={darkMode ? "text-gray-300" : "text-gray-700"}>{item?.paymentMethod || "-"}</td>
                      <td className="text-right font-semibold text-red-500">
                        {currency}
                        {Number(item?.amount ?? 0).toLocaleString()}
                      </td>
                      <td className={statusStyle}>{status}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleAddExpense}
            onClick={(event) => event.stopPropagation()}
            className={`w-full max-w-xl rounded-2xl p-5 shadow-2xl border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} space-y-4`}
          >
            <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Add Daily Expense</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={newExpense.title}
                onChange={(event) => setNewExpense((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Title"
                className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={newExpense.amount}
                onChange={(event) => setNewExpense((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder="Amount"
                className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              />
              <select
                value={newExpense.category}
                onChange={(event) => setNewExpense((prev) => ({ ...prev, category: event.target.value }))}
                className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <input
                type="date"
                value={newExpense.date}
                onChange={(event) => setNewExpense((prev) => ({ ...prev, date: event.target.value }))}
                className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              />
              <select
                value={newExpense.paymentMethod}
                onChange={(event) => setNewExpense((prev) => ({ ...prev, paymentMethod: event.target.value }))}
                className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                {PAYMENT_METHODS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <input
                value={newExpense.notes}
                onChange={(event) => setNewExpense((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Notes (optional)"
                className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-gray-500 text-white">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                Add Expense
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};

export default Budget;
