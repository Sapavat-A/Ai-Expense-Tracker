import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Brain, Sparkles, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { filterTransactionsByPeriod, useTransactionsStore } from "../data/transactionsStore";

const palette = ["#3B82F6", "#10B981", "#8B5CF6", "#F97316", "#EF4444", "#14B8A6"];

const cardClass = (darkMode) =>
  `rounded-2xl border p-5 backdrop-blur-xl shadow-lg ${
    darkMode ? "bg-white/5 border-white/10" : "bg-white/70 border-white/60"
  }`;

const AIInsights = ({ darkMode, currency = "$" }) => {
  const [period] = useState("month");
  const { transactions } = useTransactionsStore();
  const filtered = useMemo(() => filterTransactionsByPeriod(transactions, period), [transactions, period]);
  const expenses = filtered.filter((item) => item.type === "expense");
  const income = filtered.filter((item) => item.type === "income");

  const monthlyExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const monthlyIncome = income.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const budget = Math.max(monthlyIncome * 0.65, 1);

  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + Number(item.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const trendData = useMemo(() => {
    const map = {};
    filtered.forEach((item) => {
      const key = item.date.slice(0, 7);
      if (!map[key]) map[key] = { month: key, expenses: 0, income: 0 };
      map[key][item.type === "income" ? "income" : "expenses"] += Number(item.amount || 0);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const predictions = useMemo(() => {
    const avgMonthlyExpense =
      trendData.length > 0
        ? trendData.reduce((sum, item) => sum + item.expenses, 0) / trendData.length
        : monthlyExpenses;
    return [
      { label: "Next Month", value: avgMonthlyExpense * 1.02 },
      { label: "Quarterly", value: avgMonthlyExpense * 3.04 },
      { label: "Half Yearly", value: avgMonthlyExpense * 6.12 },
      { label: "Annual", value: avgMonthlyExpense * 12.3 },
    ];
  }, [trendData, monthlyExpenses]);

  const alerts = useMemo(() => {
    const food = categoryData.find((item) => item.name.toLowerCase().includes("food"))?.value || 0;
    const entertainment =
      categoryData.find((item) => item.name.toLowerCase().includes("entertainment"))?.value || 0;
    const foodPct = monthlyExpenses ? (food / monthlyExpenses) * 100 : 0;
    const entertainmentPct = monthlyExpenses ? (entertainment / monthlyExpenses) * 100 : 0;
    const list = [];
    if (foodPct > 20) list.push(`Food expenses exceeded 20% this month (${foodPct.toFixed(1)}%).`);
    if (entertainmentPct > 15) list.push(`Entertainment spending increased (${entertainmentPct.toFixed(1)}% share).`);
    if (monthlyExpenses > budget) list.push("You may exceed monthly budget based on current trend.");
    if (list.length === 0) list.push("Spending is healthy this month. Keep following your budget strategy.");
    return list;
  }, [categoryData, monthlyExpenses, budget]);

  const unusualSpending = useMemo(() => {
    const avg = expenses.length ? monthlyExpenses / expenses.length : 0;
    return expenses.filter((item) => Number(item.amount || 0) > avg * 2).slice(0, 5);
  }, [expenses, monthlyExpenses]);

  const recommendations = useMemo(() => {
    const list = [];
    if (monthlyIncome && monthlyExpenses / monthlyIncome > 0.75) {
      list.push("Reduce variable expenses by 8-12% to improve savings ratio.");
    }
    if (categoryData.length) {
      const top = [...categoryData].sort((a, b) => b.value - a.value)[0];
      list.push(`Top category is ${top.name}. Cap it by 10% to save ${currency}${(top.value * 0.1).toFixed(0)}.`);
    }
    list.push("Set recurring expenses to automated reminders to avoid bill spikes.");
    return list;
  }, [monthlyIncome, monthlyExpenses, categoryData, currency]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>AI Insights</h1>
        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Dynamic recommendations, alerts and predictions generated from your real transactions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardClass(darkMode)} bg-gradient-to-br from-blue-600/20 to-indigo-600/20`}>
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Brain className="w-5 h-5" />
            <p className="font-semibold">AI Confidence</p>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>93.4%</p>
        </div>
        <div className={`${cardClass(darkMode)} bg-gradient-to-br from-red-600/20 to-orange-600/20`}>
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-semibold">Active Alerts</p>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{alerts.length}</p>
        </div>
        <div className={`${cardClass(darkMode)} bg-gradient-to-br from-emerald-600/20 to-teal-600/20`}>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <TrendingUp className="w-5 h-5" />
            <p className="font-semibold">Projected Annual Spend</p>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {currency}
            {Number(predictions[3]?.value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Smart Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((text) => (
              <div key={text} className={`p-3 rounded-lg ${darkMode ? "bg-gray-800/70" : "bg-blue-50"} flex gap-2`}>
                <Sparkles className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Smart Alerts</h3>
          <div className="space-y-3">
            {alerts.map((text) => (
              <div key={text} className={`p-3 rounded-lg ${darkMode ? "bg-red-900/20" : "bg-red-50"} flex gap-2`}>
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <p className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Unusual Spending Detection</h3>
          <div className="space-y-2">
            {unusualSpending.length === 0 ? (
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>No unusual spending spikes detected.</p>
            ) : (
              unusualSpending.map((item) => (
                <div key={item.id} className={`p-3 rounded-lg ${darkMode ? "bg-gray-800/70" : "bg-orange-50"} flex justify-between`}>
                  <div>
                    <p className={`${darkMode ? "text-white" : "text-gray-900"} font-medium`}>{item.title}</p>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>{item.category} • {item.date}</p>
                  </div>
                  <p className="text-red-500 font-semibold">{currency}{Number(item?.amount ?? 0).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Prediction Engine</h3>
          <div className="grid grid-cols-2 gap-3">
            {predictions.map((item) => (
              <div key={item.label} className={`p-3 rounded-lg ${darkMode ? "bg-gray-800/70" : "bg-emerald-50"}`}>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{item.label}</p>
                <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {currency}
                  {Number(item?.value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Category Contribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {categoryData.map((item, index) => (
                    <Cell key={item.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Income vs Expense Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="income" stroke="#10B981" strokeWidth={3} />
                <Line dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={cardClass(darkMode)}>
        <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Prediction Bars</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
