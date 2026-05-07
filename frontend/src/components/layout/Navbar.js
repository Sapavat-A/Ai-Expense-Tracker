import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import ModernAuthModal from "../auth/ModernAuthModal";

const Navbar = ({ user, onLogin, onLogout, darkMode, toggleTheme }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Budget alert",
      message: "Food budget is at 80%",
      read: false,
    },
    {
      id: 2,
      title: "Spending insight",
      message: "You saved 12% vs last month",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleAuthSuccess = (authData) => {
    onLogin(authData);
    setShowAuthModal(false);
  };

  return (
    <>
      <ModernAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        darkMode={darkMode}
      />

      <motion.nav
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl ${
          darkMode
            ? "border-gray-700 bg-gray-900/90"
            : "border-gray-200 bg-white/90"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Expense Tracker
              </p>
              <p
                className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                AI Powered Personal Finance Manager
              </p>
            </div>
          </div>

          <div className="hidden md:flex w-full max-w-md px-6">
            <div className="relative w-full">
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search modules..."
                className={`w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none transition ${
                  darkMode
                    ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500"
                    : "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((value) => !value)}
                className={`relative rounded-xl p-2 transition ${
                  darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className={`absolute right-0 mt-2 w-72 rounded-2xl border p-3 shadow-2xl ${
                      darkMode
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`mb-2 rounded-lg p-2 ${darkMode ? "bg-gray-700/40" : "bg-gray-50"}`}
                      >
                        <p
                          className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {item.title}
                        </p>
                        <p
                          className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                        >
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className={`rounded-xl p-2 transition ${
                darkMode
                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-blue-600 border border-blue-200 transition hover:bg-blue-50"
                >
                  Google Login
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
                >
                  GitHub Login
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu((value) => !value)}
                  className={`flex items-center gap-2 rounded-xl p-2 transition ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="relative">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-600">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || user.email}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white bg-green-500" />
                  </div>
                  <div className="hidden text-left sm:block">
                    <p
                      className={`text-sm font-semibold leading-none ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {user.name || user.username || "User"}
                    </p>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition ${showProfileMenu ? "rotate-180" : ""} ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className={`absolute right-0 mt-2 w-64 rounded-2xl border p-2 shadow-2xl ${
                        darkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          darkMode
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          darkMode
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          darkMode
                            ? "text-red-400 hover:bg-gray-700"
                            : "text-red-600 hover:bg-gray-100"
                        }`}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
