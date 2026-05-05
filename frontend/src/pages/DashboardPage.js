import { useState } from 'react';

import SidebarNav from '../components/layout/SidebarNav';
import TopNavbar from '../components/layout/TopNavbar';
import ExpenseManager from '../components/ExpenseManager';

function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('$');
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div
      className={`min-h-screen py-6 transition-colors ${
        darkMode
          ? 'bg-[radial-gradient(circle_at_top,_#1e1b4b_0%,_#0f172a_55%,_#020617_100%)]'
          : 'bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#ede9fe_35%,_#f8fafc_70%)]'
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 lg:flex-row">
        <SidebarNav activeSection={activeSection} onSelectSection={setActiveSection} />
        <main className="min-w-0 flex-1">
          <TopNavbar
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((prev) => !prev)}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
          <ExpenseManager darkMode={darkMode} currency={currency} activeSection={activeSection} />
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
