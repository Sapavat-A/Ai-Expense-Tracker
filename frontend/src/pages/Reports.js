import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
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
} from "recharts";
import { filterTransactionsByPeriod, useTransactionsStore } from "../data/transactionsStore";

const periods = [
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
  { id: "quarter", label: "Quarterly" },
  { id: "year", label: "Yearly" },
];

const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F97316", "#EF4444", "#14B8A6"];

const cardClass = (darkMode) =>
  `rounded-2xl border p-5 backdrop-blur-xl shadow-lg ${
    darkMode ? "bg-white/5 border-white/10" : "bg-white/70 border-white/60"
  }`;

const saveRows = (rows, filename, mime = "text/csv;charset=utf-8;") => {
  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: mime });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const Reports = ({ darkMode, currency = "$" }) => {
  const [period, setPeriod] = useState("month");
  const [history, setHistory] = useState([]);
  const { transactions } = useTransactionsStore();
  const filtered = useMemo(() => filterTransactionsByPeriod(transactions, period), [transactions, period]);

  const summary = useMemo(() => {
    const income = filtered.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = filtered.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const savings = income - expenses;
    const byCategoryMap = {};
    filtered
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        byCategoryMap[item.category] = (byCategoryMap[item.category] || 0) + Number(item.amount || 0);
      });
    const byCategory = Object.entries(byCategoryMap).map(([name, value]) => ({ name, value }));
    return { income, expenses, savings, byCategory };
  }, [filtered]);

  const trend = useMemo(() => {
    const map = {};
    filtered.forEach((item) => {
      const key = item.date.slice(0, 7);
      if (!map[key]) map[key] = { period: key, income: 0, expenses: 0, savings: 0 };
      map[key][item.type === "income" ? "income" : "expenses"] += Number(item.amount || 0);
      map[key].savings = map[key].income - map[key].expenses;
    });
    return Object.values(map).sort((a, b) => a.period.localeCompare(b.period));
  }, [filtered]);

  const generateReport = (type) => {
    const stamp = new Date().toLocaleString();
    const record = {
      id: Date.now(),
      period,
      type,
      createdAt: stamp,
      total: summary.expenses,
    };
    setHistory((prev) => [record, ...prev].slice(0, 10));

    const rows = [
      ["Report Type", type],
      ["Period", period],
      ["Generated At", stamp],
      ["Income", summary.income],
      ["Expenses", summary.expenses],
      ["Savings", summary.savings],
      [],
      ["Category", "Amount"],
      ...summary.byCategory.map((item) => [item.name, item.value]),
    ];

    if (type === "pdf") window.print();
    if (type === "csv") saveRows(rows, `report-${period}.csv`);
    if (type === "excel") saveRows(rows, `report-${period}.xls`, "application/vnd.ms-excel");
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Reports</h1>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Generate weekly, monthly, quarterly and yearly reports with export history.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => generateReport("pdf")} className="px-4 py-2 rounded-lg bg-blue-600 text-white flex gap-2 items-center">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => generateReport("csv")} className="px-4 py-2 rounded-lg bg-emerald-600 text-white flex gap-2 items-center">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => generateReport("excel")} className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex gap-2 items-center">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {periods.map((item) => (
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cardClass(darkMode)}>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Income</p>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{currency}{Number(summary.income ?? 0).toLocaleString()}</p>
        </div>
        <div className={cardClass(darkMode)}>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Expenses</p>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{currency}{Number(summary.expenses ?? 0).toLocaleString()}</p>
        </div>
        <div className={cardClass(darkMode)}>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Savings</p>
          <p className={`text-2xl font-bold ${summary.savings >= 0 ? "text-green-500" : "text-red-500"}`}>{currency}{Number(summary.savings ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Category Analysis</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.byCategory} dataKey="value" nameKey="name" outerRadius={100} label>
                  {summary.byCategory.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Savings Report Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#3B82F6" />
                <Bar dataKey="expenses" fill="#F97316" />
                <Bar dataKey="savings" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={cardClass(darkMode)}>
        <h3 className={`mb-3 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Download History</h3>
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>No reports generated yet.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className={`p-3 rounded-lg flex justify-between ${darkMode ? "bg-gray-800/70" : "bg-gray-100"}`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <p className={`${darkMode ? "text-white" : "text-gray-900"} text-sm`}>
                    {item.type.toUpperCase()} • {item.period}
                  </p>
                </div>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm`}>{item.createdAt}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
