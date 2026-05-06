import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import FintechLayout from "./components/layout/FintechLayout";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Budget from "./pages/Budget";
import AIInsights from "./pages/AIInsights";
import "./styles/modern.css";

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("fintech-theme");
    return saved === "true" || false;
  });

  useEffect(() => {
    // Check for saved user on mount
    const savedUser = localStorage.getItem("fintech-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem("fintech-theme", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("fintech-user");
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider>
      <Router>
        <FintechLayout
          user={user}
          onLogin={handleAuthSuccess}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
        >
          <Routes>
            <Route path="/" element={<Overview darkMode={darkMode} />} />
            <Route
              path="/overview"
              element={<Overview darkMode={darkMode} />}
            />
            <Route
              path="/transactions"
              element={<Transactions darkMode={darkMode} />}
            />
            <Route
              path="/analytics"
              element={<Analytics darkMode={darkMode} />}
            />
            <Route path="/budget" element={<Budget darkMode={darkMode} />} />
            <Route
              path="/ai-insights"
              element={<AIInsights darkMode={darkMode} />}
            />
            <Route path="/reports" element={<Reports darkMode={darkMode} />} />
            <Route
              path="/settings"
              element={<Settings darkMode={darkMode} user={user} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FintechLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
