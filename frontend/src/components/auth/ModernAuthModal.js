import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  LogIn, 
  UserPlus,
  Zap,
  ChevronLeft
} from 'lucide-react';
import GoogleAuth from './GoogleAuth';
import GitHubAuth from './GitHubAuth';
import EmailAuth from './EmailAuth';

const ModernAuthModal = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  darkMode 
}) => {
  const [authMode, setAuthMode] = useState('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSocialAuthSuccess = (userData) => {
    setIsLoading(true);
    // Simulate processing
    setTimeout(() => {
      localStorage.setItem('fintech-user', JSON.stringify(userData));
      onAuthSuccess(userData);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleEmailAuthSuccess = (formData) => {
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (authMode === 'signin') {
        // Mock sign in
        const userData = {
          id: Date.now(),
          name: formData.name || 'John Doe',
          email: formData.email,
          avatar: null,
          provider: 'email',
          subscription: 'premium',
          isOnline: true,
          memberSince: new Date().getFullYear().toString(),
          balance: 5420.50,
          monthlySpent: 2847.32
        };
        localStorage.setItem('fintech-user', JSON.stringify(userData));
        onAuthSuccess(userData);
      } else {
        // Mock sign up
        const userData = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          avatar: null,
          provider: 'email',
          subscription: 'free',
          isOnline: true,
          memberSince: new Date().getFullYear().toString(),
          balance: 1000.00,
          monthlySpent: 0
        };
        localStorage.setItem('fintech-user', JSON.stringify(userData));
        onAuthSuccess(userData);
      }
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleAuthError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError('');
  };

  const resetForm = () => {
    setError('');
    setIsLoading(false);
  };

  if (!isOpen) return null;

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
                  ? 'Sign in to your FinTrack Pro account'
                  : 'Join thousands managing their finances smarter'
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

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-red-500 text-sm">{error}</p>
          </motion.div>
        )}

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
              disabled={isLoading}
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
              disabled={isLoading}
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

          <div className="grid grid-cols-1 gap-3">
            <GoogleAuth
              onSuccess={handleSocialAuthSuccess}
              onError={handleAuthError}
              darkMode={darkMode}
            />
            <GitHubAuth
              onSuccess={handleSocialAuthSuccess}
              onError={handleAuthError}
              darkMode={darkMode}
            />
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
        <EmailAuth
          mode={authMode}
          onSubmit={handleEmailAuthSuccess}
          isLoading={isLoading}
          darkMode={darkMode}
          onModeChange={switchMode}
        />

        {/* Footer */}
        <div className="text-center mt-6">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {authMode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={isLoading}
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
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Terms */}
        <div className="text-center mt-4">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ModernAuthModal;
