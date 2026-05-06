import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  Smartphone,
  ArrowRight,
  ChevronDown,
  UserPlus,
  LogIn,
  Zap,
  Users,
  RefreshCw,
  Settings
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const IntegratedAuth = ({ darkMode, onAuthSuccess, onClose }) => {
  const [authMode, setAuthMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  // Mock Google accounts
  const [googleAccounts] = useState([
    {
      id: '1',
      email: 'john.doe@gmail.com',
      name: 'John Doe',
      avatar: 'https://lh3.googleusercontent.com/a-/AOh14szjQpBhQqVlUHN8QqVlUHN8QqVlUHN8QqVlUHN8Q=s96-c/photo.jpg',
      lastLogin: '2 hours ago'
    },
    {
      id: '2', 
      email: 'jane.smith@gmail.com',
      name: 'Jane Smith',
      avatar: 'https://lh3.googleusercontent.com/a-/AOh14szjQpBhQqVlUHN8QqVlUHN8QqVlUHN8QqVlUHN8Q=s96-c/photo.jpg',
      lastLogin: '1 day ago'
    }
  ]);

  const [selectedAccount, setSelectedAccount] = useState(googleAccounts[0]);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('ai-expense-tracker-user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      onAuthSuccess(user);
    }
  }, [onAuthSuccess]);

  const validateForm = () => {
    const newErrors = {};

    if (authMode === 'signin') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (authMode === 'signup') {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = {
        id: Date.now(),
        name: formData.name || 'John Doe',
        email: formData.email,
        avatar: null,
        subscription: 'premium',
        joinedAt: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('ai-expense-tracker-user', JSON.stringify(user));
      
      setIsLoading(false);
      onAuthSuccess(user);
      onClose();
    }, 1500);
  };

  const handleSocialAuth = async (provider) => {
    setSocialLoading(provider);
    
    // Simulate social auth
    setTimeout(() => {
      const user = {
        id: Date.now(),
        name: provider === 'google' ? 'Google User' : 'GitHub User',
        email: `user@${provider}.com`,
        avatar: null,
        subscription: 'premium',
        joinedAt: new Date().toISOString(),
        provider: provider
      };

      // Save to localStorage
      localStorage.setItem('ai-expense-tracker-user', JSON.stringify(user));
      
      setSocialLoading(null);
      onAuthSuccess(user);
      onClose();
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPassword(false);
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    resetForm();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md mx-4 p-8 rounded-3xl border shadow-2xl backdrop-blur-xl ${
          darkMode 
            ? 'border-gray-700 bg-gray-800/95' 
            : 'border-gray-200 bg-white/95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 bg-opacity-20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {authMode === 'signin' 
                  ? 'Sign in to your AI Expense Tracker account'
                  : 'Join thousands of users managing their finances smarter'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors duration-200 ${
              darkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className={`inline-flex rounded-xl p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <button
              onClick={() => switchMode('signin')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                authMode === 'signin'
                  ? `text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg`
                  : darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                authMode === 'signup'
                  ? `text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg`
                  : darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </button>
          </div>
        </div>

        {/* Social Authentication */}
        <div className="space-y-3 mb-6">
          <div className="text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {authMode === 'signin' ? 'Or continue with' : 'Or sign up with'}
            </p>
          </div>

          {/* Google Account Switcher */}
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 rounded-xl border ${
              darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
            } backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FcGoogle className="w-5 h-5" />
                    <div className="text-left">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedAccount.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedAccount.email}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAccountSwitcher ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Account Dropdown */}
                  <AnimatePresence>
                    {showAccountSwitcher && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`absolute top-full left-0 mt-2 w-80 rounded-2xl border shadow-2xl backdrop-blur-xl z-50 ${
                          darkMode 
                            ? 'border-gray-700 bg-gray-800' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="p-4">
                          <div className="space-y-3">
                            {googleAccounts.map((account) => (
                              <motion.button
                                key={account.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setShowAccountSwitcher(false);
                                }}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                                  selectedAccount.id === account.id
                                    ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                                    : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                <img 
                                  src={account.avatar} 
                                  alt={account.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="text-left">
                                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {account.name}
                                  </p>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {account.email}
                                  </p>
                                </div>
                                {selectedAccount.id === account.id && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </motion.button>
                            ))}
                          </div>
                          
                          <div className={`h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} my-3`}></div>
                          
                          <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}>
                            <Users className="w-4 h-4" />
                            <span>Add Account</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <RefreshCw className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedAccount.lastLogin}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialAuth('google')}
              disabled={socialLoading !== null}
              className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              } ${socialLoading === 'google' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FcGoogle className="w-5 h-5" />
              )}
              <span>Continue with Google</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialAuth('github')}
              disabled={socialLoading !== null}
              className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              } ${socialLoading === 'github' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {socialLoading === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
              )}
              <span>Continue with GitHub</span>
            </motion.button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className={`flex-1 h-px ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
          <span className={`px-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            OR
          </span>
          <div className={`flex-1 h-px ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-500 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </motion.div>
              )}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-500 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </motion.div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
                placeholder={authMode === 'signup' ? '••••••••••' : 'Enter your password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-500 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </motion.div>
            )}
          </div>

          {authMode === 'signup' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-500 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </motion.div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-lg transform hover:-translate-y-0.5'
            } bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{authMode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </div>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {authMode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default IntegratedAuth;
