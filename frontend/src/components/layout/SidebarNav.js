import { BrainCircuit, ChartColumn, FileText, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: ChartColumn },
  { id: 'transactions', label: 'Transactions', icon: Wallet },
  { id: 'ai', label: 'AI Insights', icon: BrainCircuit },
  { id: 'reports', label: 'Reports', icon: FileText },
];

function SidebarNav({ activeSection, onSelectSection }) {
  return (
    <aside className="w-full rounded-2xl border border-white/30 bg-white/70 p-4 shadow-lg backdrop-blur-xl lg:w-64">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">AI Expense Tracker</p>
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-white/80 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default SidebarNav;
