import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Globe,
  Lock,
  CreditCard,
  Mail,
  Smartphone,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Key,
  Smartphone as Phone,
  Calendar,
  Clock,
  RefreshCw,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Plus,
  Minus,
  LogOut,
  UserCheck,
  Fingerprint,
  Wifi,
  Monitor,
  Palette,
  Volume2,
  CreditCard as CardIcon,
  ShieldCheck,
  KeyRound,
  UserX,
  AlertTriangle
} from "lucide-react";

const Settings = ({ darkMode, user, onThemeToggle }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    phone: user?.phone || "+1 (555) 123-4567",
    bio: user?.bio || "Financial enthusiast focused on smart money management",
    avatar: user?.avatar || "",
    currency: "USD",
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true,
    budgetAlerts: true,
    weeklyReports: true,
    monthlySummary: true,
    securityAlerts: true,
    transactionAlerts: true,
    goalReminders: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordStrength: "strong",
    biometricLogin: false,
    trustedDevices: ["iPhone 14", "MacBook Pro"],
    lastPasswordChange: "2024-04-15"
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: darkMode ? "dark" : "light",
    accentColor: "blue",
    compactMode: false,
    showAnimations: true,
    dashboardLayout: "grid",
    fontSize: "medium",
    sidebarWidth: "normal"
  });

  const [connectedAccounts, setConnectedAccounts] = useState([
    {
      id: 1,
      type: "bank",
      name: "Chase Checking",
      accountNumber: "****4582",
      balance: 5420.50,
      lastSync: "2024-05-06 14:30",
      status: "connected"
    },
    {
      id: 2,
      type: "credit",
      name: "Chase Sapphire",
      accountNumber: "****8976",
      balance: 2340.00,
      lastSync: "2024-05-06 14:30",
      status: "connected"
    },
    {
      id: 3,
      type: "investment",
      name: "Fidelity IRA",
      accountNumber: "****2341",
      balance: 45678.90,
      lastSync: "2024-05-06 14:30",
      status: "connected"
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: SettingsIcon },
    { id: "accounts", label: "Connected Accounts", icon: CreditCard }
  ];

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "zh", name: "中文" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");

    // Simulate API call
    setTimeout(() => {
      // Update user data
      const updatedUser = {
        ...user,
        ...formData,
      };

      localStorage.setItem(
        "ai-expense-tracker-user",
        JSON.stringify(updatedUser),
      );

      setIsLoading(false);
      setMessage("Settings saved successfully!");

      setTimeout(() => setMessage(""), 3000);
    }, 1500);
  };

  const handleExportData = () => {
    const exportData = {
      user: formData,
      settings: {
        theme: darkMode,
        currency: formData.currency,
        language: formData.language,
        notifications: formData.notifications,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settings_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      // Simulate account deletion
      localStorage.removeItem("ai-expense-tracker-user");
      window.location.href = "/";
    }
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Settings
              </h1>
              <p
                className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Manage your account and preferences
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportData}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Download className="w-5 h-5 mr-2" />
                Export
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isLoading}
                className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Success/Error Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-4 rounded-lg ${
                message.includes("success")
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                {message.includes("success") ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Tabs */}
        <div
          className={`rounded-2xl border ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} shadow-lg backdrop-blur-sm`}
        >
          {/* Tab Navigation */}
          <div
            className={`flex space-x-1 p-1 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `text-blue-600 bg-blue-50 border-blue-200`
                    : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <button
                          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            darkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-white text-gray-700 hover:bg-gray-100 border"
                          }`}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="john@example.com"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Member Since
                    </label>
                    <div
                      className={`p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <p className="font-medium">
                        {user?.joinedAt
                          ? new Date(user.joinedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Subscription
                    </label>
                    <div
                      className={`p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <p className="font-medium">
                        {user?.subscription || "Premium"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <input
                        type="password"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="••••••••••"
                        disabled
                      />
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-100 border"
                    }`}
                  >
                    Change Password
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Two-Factor Authentication
                      </h4>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      name="twoFactorAuth"
                      checked={formData.twoFactorAuth}
                      onChange={handleInputChange}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.twoFactorAuth ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 rounded-full transition-transform duration-200 ${
                          formData.twoFactorAuth
                            ? "translate-x-6 bg-white"
                            : "translate-x-1 bg-white"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Active Sessions
                      </h4>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Manage your active login sessions
                      </p>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-white text-gray-700 hover:bg-gray-100 border"
                      }`}
                    >
                      View All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Email Notifications
                      </h4>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Receive updates about your account and transactions
                      </p>
                    </div>
                    <button
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.emailNotifications
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 rounded-full transition-transform duration-200 ${
                          formData.emailNotifications
                            ? "translate-x-6 bg-white"
                            : "translate-x-1 bg-white"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Push Notifications
                      </h4>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Get instant updates on your device
                      </p>
                    </div>
                    <button
                      name="pushNotifications"
                      checked={formData.pushNotifications}
                      onChange={handleInputChange}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        formData.pushNotifications
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 rounded-full transition-transform duration-200 ${
                          formData.pushNotifications
                            ? "translate-x-6 bg-white"
                            : "translate-x-1 bg-white"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.symbol}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {languages.map((language) => (
                        <option key={language.code} value={language.code}>
                          {language.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Data & Privacy
                      </h4>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Manage your data and privacy settings
                      </p>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-white text-gray-700 hover:bg-gray-100 border"
                      }`}
                    >
                      Manage Data
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Danger Zone
                      </h4>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Irreversible account actions
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-red-600 text-white hover:bg-red-700`}
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
