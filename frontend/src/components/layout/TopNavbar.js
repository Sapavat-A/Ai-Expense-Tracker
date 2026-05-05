import { Moon, Sun, UserCircle2 } from 'lucide-react';

function TopNavbar({ darkMode, onToggleDarkMode, currency, onCurrencyChange }) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/30 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-xl">
      <div>
        <p className="text-sm font-semibold text-slate-900">Finance Command Center</p>
        <p className="text-xs text-slate-500">Track, analyze, and optimize your expenses.</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-400"
        >
          <option value="$">$ USD</option>
          <option value="₹">₹ INR</option>
          <option value="€">€ EUR</option>
        </select>
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Light' : 'Dark'}
        </button>
        <div className="rounded-full bg-indigo-100 p-1.5 text-indigo-700">
          <UserCircle2 size={22} />
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
