import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
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

const filters = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
];
const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F97316", "#EF4444", "#14B8A6"];

const cardClass = (darkMode) =>
  `rounded-2xl border p-5 backdrop-blur-xl shadow-lg ${
    darkMode ? "bg-white/5 border-white/10" : "bg-white/70 border-white/60"
  }`;

const exportRows = (rows, filename, mime = "text/csv;charset=utf-8;") => {
  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: mime });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const Analytics = ({ darkMode, currency = "$" }) => {
  const [period, setPeriod] = useState("month");
  const { transactions } = useTransactionsStore();
  const filtered = useMemo(() => filterTransactionsByPeriod(transactions, period), [transactions, period]);

  const monthlyTrends = useMemo(() => {
    const map = {};
    filtered.forEach((item) => {
      const key = item.date.slice(0, 7);
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0, savings: 0 };
      map[key][item.type === "income" ? "income" : "expenses"] += Number(item.amount || 0);
      map[key].savings = map[key].income - map[key].expenses;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const map = {};
    filtered
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        map[item.category] = (map[item.category] || 0) + Number(item.amount || 0);
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const summary = useMemo(() => {
    const income = filtered.filter((i) => i.type === "income").reduce((s, i) => s + Number(i.amount || 0), 0);
    const expenses = filtered.filter((i) => i.type === "expense").reduce((s, i) => s + Number(i.amount || 0), 0);
    const savings = income - expenses;
    const savingsRatio = income ? (savings / income) * 100 : 0;
    const growth =
      monthlyTrends.length > 1
        ? ((monthlyTrends[monthlyTrends.length - 1].expenses - monthlyTrends[0].expenses) /
            Math.max(monthlyTrends[0].expenses, 1)) *
          100
        : 0;
    return { income, expenses, savings, savingsRatio, growth };
  }, [filtered, monthlyTrends]);

  const topSpending = categoryData.sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Analytics</h1>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Real-time spending trends, category analysis and growth insights.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              exportRows(
                [["Month", "Income", "Expenses", "Savings"], ...monthlyTrends.map((item) => [item.month, item.income, item.expenses, item.savings])],
                "analytics.csv",
              )
            }
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id)}
            className={`px-3 py-1.5 rounded-lg ${
              period === item.id
                ? "bg-indigo-600 text-white"
                : darkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-white text-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={cardClass(darkMode)}>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Spending Trends</p>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{currency}{Number(summary.expenses ?? 0).toLocaleString()}</p>
        </div>
        <div className={cardClass(darkMode)}>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Savings Ratio</p>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{summary.savingsRatio.toFixed(1)}%</p>
        </div>
        <div className={cardClass(darkMode)}>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Monthly Growth</p>
          <p className={`text-2xl font-bold ${summary.growth > 0 ? "text-red-500" : "text-green-500"}`}>{summary.growth.toFixed(1)}%</p>
        </div>
        <div className={cardClass(darkMode)}>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Top Categories</p>
          <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{topSpending.map((i) => i.name).join(", ") || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Spending Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
                <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Category Analysis</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {categoryData.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={cardClass(darkMode)}>
        <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Income, Expenses and Savings</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#3B82F6" />
              <Bar dataKey="expenses" fill="#F97316" />
              <Bar dataKey="savings" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
