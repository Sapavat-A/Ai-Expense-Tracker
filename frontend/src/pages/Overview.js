import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
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

const periods = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

const categoryColors = ["#3B82F6", "#14B8A6", "#A855F7", "#F97316", "#EF4444", "#22C55E"];

const cardClass = (darkMode) =>
  `rounded-2xl border backdrop-blur-xl shadow-xl ${
    darkMode ? "bg-white/5 border-white/10" : "bg-white/70 border-white/60"
  }`;

const Overview = ({ darkMode, currency = "$" }) => {
  const [period, setPeriod] = useState("month");
  const { transactions, totals } = useTransactionsStore();
  const filtered = useMemo(
    () => filterTransactionsByPeriod(transactions, period),
    [transactions, period],
  );

  const expenseTransactions = filtered.filter((item) => item.type === "expense");
  const incomeTransactions = filtered.filter((item) => item.type === "income");
  const periodExpenses = expenseTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const periodIncome = incomeTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const budgetLimit = Math.max(periodIncome * 0.7, 1);
  const budgetUsage = (periodExpenses / budgetLimit) * 100;
  const savings = periodIncome - periodExpenses;

  const categoryData = useMemo(() => {
    const map = {};
    expenseTransactions.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + Number(item.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenseTransactions]);

  const trendData = useMemo(() => {
    const map = {};
    filtered.forEach((item) => {
      const key = item.date.slice(0, 7);
      if (!map[key]) {
        map[key] = { month: key, income: 0, expenses: 0 };
      }
      map[key][item.type === "income" ? "income" : "expenses"] += Number(item.amount || 0);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const recentTransactions = [...filtered]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const statCards = [
    { title: "Total Balance", value: totals.balance, icon: Wallet, tone: "from-blue-500 to-indigo-600" },
    { title: "Monthly Income", value: periodIncome, icon: TrendingUp, tone: "from-blue-500 to-cyan-500" },
    { title: "Monthly Expenses", value: periodExpenses, icon: TrendingDown, tone: "from-red-500 to-pink-600" },
    { title: "Savings", value: savings, icon: PiggyBank, tone: "from-green-500 to-emerald-600" },
    { title: "Budget Usage %", value: budgetUsage, icon: AlertTriangle, tone: "from-orange-500 to-amber-500", suffix: "%" },
  ];

  return (
    <div className="space-y-6">
      <div
        className={`absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.12),transparent_30%)]`}
      />
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Financial Overview</h1>
        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Complete view of your financial health with live transaction metrics.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {periods.map((option) => (
          <button
            key={option.id}
            onClick={() => setPeriod(option.id)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              period === option.id
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                : darkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className={`${cardClass(darkMode)} p-4`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{card.title}</p>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${card.tone}`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className={`mt-3 text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {card.suffix
                ? `${Number(card.value || 0).toFixed(1)}${card.suffix}`
                : `${currency}${Number(card.value || 0).toLocaleString()}`}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={`${cardClass(darkMode)} p-5`}>
          <h3 className={`mb-4 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Spending Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
                <XAxis dataKey="month" stroke={darkMode ? "#D1D5DB" : "#4B5563"} />
                <YAxis stroke={darkMode ? "#D1D5DB" : "#4B5563"} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={3} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardClass(darkMode)} p-5`}>
          <h3 className={`mb-4 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Category Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`${cardClass(darkMode)} p-5`}>
        <h3 className={`mb-4 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Monthly Income vs Expenses</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="month" stroke={darkMode ? "#D1D5DB" : "#4B5563"} />
              <YAxis stroke={darkMode ? "#D1D5DB" : "#4B5563"} />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${cardClass(darkMode)} p-5`}>
        <h3 className={`mb-4 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((item) => (
                <tr key={item.id} className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-t`}>
                  <td className={`py-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{item.title}</td>
                  <td className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{item.category}</td>
                  <td className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{item.date}</td>
                  <td className={`text-right font-medium ${item.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {item.type === "income" ? "+" : "-"}
                    {currency}
                    {Number(item.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
