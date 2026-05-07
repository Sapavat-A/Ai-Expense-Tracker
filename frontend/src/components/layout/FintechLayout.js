import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import FintechSidebar from "./FintechSidebar";
import Navbar from "./Navbar";

const FintechLayout = ({
  children,
  user,
  onLogin,
  onLogout,
  darkMode,
  toggleTheme,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Close sidebar on mobile when route changes
  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}
    >
      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Always visible on desktop, slide-in on mobile */}
      <div
        className={`fixed left-0 top-0 h-full z-30 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <FintechSidebar
          user={user}
          onLogout={onLogout}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        } ${isSidebarOpen ? "ml-0" : ""}`}
      >
        {/* Top padding for navbar */}
        <div className="h-16"></div>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-20 left-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-200 md:hidden ${
          darkMode
            ? "bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
            : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  );
};

export default FintechLayout;
