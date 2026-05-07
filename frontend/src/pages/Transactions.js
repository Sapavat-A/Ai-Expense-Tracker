import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
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

const filterOptions = [
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
  { id: "quarter", label: "Quarterly" },
  { id: "half-year", label: "Half Yearly" },
  { id: "year", label: "Annually" },
];

const categories = ["Food", "Transport", "Housing", "Shopping", "Entertainment", "Health", "Income", "Other"];
const methods = ["Credit Card", "Debit Card", "Bank Transfer", "UPI", "Cash"];
const chartColors = ["#3B82F6", "#14B8A6", "#8B5CF6", "#F97316", "#EF4444", "#22C55E"];

const cardClass = (darkMode) =>
  `rounded-2xl border backdrop-blur-xl shadow-lg ${
    darkMode ? "bg-white/5 border-white/10" : "bg-white/70 border-white/60"
  }`;

const emptyForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "Credit Card",
  recurring: false,
  notes: "",
};

const downloadCsv = (rows, filename) => {
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const Transactions = ({ darkMode, currency = "$" }) => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionsStore();
  const [period, setPeriod] = useState("month");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const withPeriod = filterTransactionsByPeriod(transactions, period);
    const withSearch = withPeriod.filter((item) =>
      [item.title, item.category, item.paymentMethod, item.notes]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    const withCategory =
      category === "all" ? withSearch : withSearch.filter((item) => item.category.toLowerCase() === category);
    return [...withCategory].sort((a, b) => {
      const mult = order === "asc" ? 1 : -1;
      if (sortBy === "amount") return (Number(a.amount || 0) - Number(b.amount || 0)) * mult;
      if (sortBy === "title") return a.title.localeCompare(b.title) * mult;
      return (new Date(a.date) - new Date(b.date)) * mult;
    });
  }, [transactions, period, query, category, sortBy, order]);

  const categoryData = useMemo(() => {
    const map = {};
    filtered
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        map[item.category] = (map[item.category] || 0) + Number(item.amount || 0);
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const monthlyData = useMemo(() => {
    const map = {};
    filtered.forEach((item) => {
      const key = item.date.slice(0, 7);
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };
      map[key][item.type === "income" ? "income" : "expenses"] += Number(item.amount || 0);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount),
      recurring: Boolean(form.recurring),
    };
    if (editing) {
      updateTransaction(editing, payload);
    } else {
      addTransaction(payload);
    }
    setEditing(null);
    setForm(emptyForm);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Transactions</h1>
        <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Add, edit, filter, sort and visualize all transactions.</p>
      </motion.div>

      <div className={`${cardClass(darkMode)} p-4 flex flex-col lg:flex-row gap-3`}>
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-3.5 w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions..."
            className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
              darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="all">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item.toLowerCase()}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="date">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
          <option value="title">Sort: Title</option>
        </select>
        <select
          value={order}
          onChange={(event) => setOrder(event.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <button
          onClick={() =>
            downloadCsv(
              [["Title", "Amount", "Type", "Category", "Date", "Method", "Recurring", "Notes"], ...filtered.map((i) => [i.title, i.amount, i.type, i.category, i.date, i.paymentMethod, i.recurring ? "Yes" : "No", i.notes])],
              "transactions.csv",
            )
          }
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> CSV
        </button>
        <button
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
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

      <div className={`${cardClass(darkMode)} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Method</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className={`${darkMode ? "border-gray-700" : "border-gray-200"} border-t`}>
                <td className={`p-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {item.title}
                  {item.recurring && <span className="ml-2 text-xs text-blue-500">Recurring</span>}
                </td>
                <td className={`${darkMode ? "text-gray-300" : "text-gray-700"} p-3`}>{item.category}</td>
                <td className={`${darkMode ? "text-gray-300" : "text-gray-700"} p-3`}>{item.date}</td>
                <td className={`${darkMode ? "text-gray-300" : "text-gray-700"} p-3`}>{item.paymentMethod}</td>
                <td className={`p-3 text-right font-semibold ${item.type === "income" ? "text-green-500" : "text-red-500"}`}>
                  {item.type === "income" ? "+" : "-"}
                  {currency}
                  {Number(item.amount).toLocaleString()}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditing(item.id);
                        setForm({
                          title: item.title,
                          amount: item.amount,
                          type: item.type,
                          category: item.category,
                          date: item.date,
                          paymentMethod: item.paymentMethod,
                          recurring: item.recurring,
                          notes: item.notes || "",
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded bg-blue-500 text-white"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteTransaction(item.id)} className="p-1.5 rounded bg-red-500 text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`${cardClass(darkMode)} p-4`}>
          <h3 className={`mb-2 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Expense Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${cardClass(darkMode)} p-4`}>
          <h3 className={`mb-2 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Monthly Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="expenses" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${cardClass(darkMode)} p-4`}>
          <h3 className={`mb-2 font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="income" stroke="#22C55E" strokeWidth={3} />
                <Line dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.form initial={{ scale: 0.96 }} animate={{ scale: 1 }} onSubmit={handleSubmit} className={`${cardClass(darkMode)} w-full max-w-xl p-5 space-y-4`}>
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{editing ? "Edit Transaction" : "Add Transaction"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" required className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`} />
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Amount" required className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`} />
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`} />
                <select value={form.paymentMethod} onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))} className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}>
                  {methods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
              <label className={`text-sm flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <input type="checkbox" checked={form.recurring} onChange={(e) => setForm((p) => ({ ...p, recurring: e.target.checked }))} />
                Recurring transaction
              </label>
              <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" rows={3} className={`w-full px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-500 text-white">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
