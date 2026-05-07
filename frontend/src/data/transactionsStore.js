import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "expense-tracker-transactions";

const starterTransactions = [
  {
    id: 1,
    title: "Salary",
    amount: 7600,
    type: "income",
    category: "Income",
    date: "2026-05-01",
    paymentMethod: "Bank Transfer",
    recurring: true,
    notes: "Primary salary credit",
  },
  {
    id: 2,
    title: "Groceries",
    amount: 230,
    type: "expense",
    category: "Food",
    date: "2026-05-03",
    paymentMethod: "Credit Card",
    recurring: false,
    notes: "Weekly groceries",
  },
  {
    id: 3,
    title: "Rent",
    amount: 1200,
    type: "expense",
    category: "Housing",
    date: "2026-05-02",
    paymentMethod: "Bank Transfer",
    recurring: true,
    notes: "Monthly rent",
  },
  {
    id: 4,
    title: "Movie Night",
    amount: 65,
    type: "expense",
    category: "Entertainment",
    date: "2026-05-04",
    paymentMethod: "UPI",
    recurring: false,
    notes: "Weekend plan",
  },
  {
    id: 5,
    title: "Freelance Work",
    amount: 980,
    type: "income",
    category: "Income",
    date: "2026-05-06",
    paymentMethod: "Bank Transfer",
    recurring: false,
    notes: "Design project",
  },
  {
    id: 6,
    title: "Fuel",
    amount: 90,
    type: "expense",
    category: "Transport",
    date: "2026-05-06",
    paymentMethod: "Debit Card",
    recurring: false,
    notes: "Vehicle refill",
  },
];

const readTransactions = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return starterTransactions;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : starterTransactions;
  } catch (error) {
    return starterTransactions;
  }
};

export const getDateRangeStart = (period) => {
  const now = new Date();
  const start = new Date(now);
  switch (period) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(now.getMonth() - 3);
      break;
    case "half-year":
      start.setMonth(now.getMonth() - 6);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setFullYear(1970);
  }
  return start;
};

export const filterTransactionsByPeriod = (transactions, period) => {
  if (period === "all") return transactions;
  const start = getDateRangeStart(period);
  return transactions.filter((transaction) => new Date(transaction.date) >= start);
};

export const useTransactionsStore = () => {
  const [transactions, setTransactions] = useState(readTransactions);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (payload) => {
    const transaction = {
      ...payload,
      id: Date.now(),
    };
    setTransactions((prev) => [transaction, ...prev]);
  };

  const updateTransaction = (id, payload) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...payload } : item)),
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      income,
      expenses,
      balance: income - expenses,
      savingsRate: income ? ((income - expenses) / income) * 100 : 0,
    };
  }, [transactions]);

  return {
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totals,
  };
};

