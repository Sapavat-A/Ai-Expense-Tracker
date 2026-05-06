import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, GitBranch } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState('signin');

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      onAuthSuccess({ provider: 'google', user: { name: 'John Doe', email: 'john@gmail.com' } });
      onClose();
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    try {
      // Simulate GitHub OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      onAuthSuccess({ provider: 'github', user: { name: 'John Doe', email: 'john@github.com' } });
      onClose();
    } catch (error) {
      console.error('GitHub auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate email auth
      await new Promise(resolve => setTimeout(resolve, 1500));
      onAuthSuccess({ provider: 'email', user: { name: 'John Doe', email: 'john@example.com' } });
      onClose();
    } catch (error) {
      console.error('Email auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {authType === 'signin' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {authType === 'signin' 
                      ? 'Sign in to access your expense dashboard' 
                      : 'Start tracking your expenses today'
                    }
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Auth Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
                <button
                  onClick={() => setAuthType('signin')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authType === 'signin'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthType('signup')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authType === 'signup'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FcGoogle className="h-5 w-5" />
                  <span>Continue with Google</span>
                  {isLoading && (
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-transparent animate-spin rounded-full" />
                  )}
                </button>

                <button
                  onClick={handleGitHubAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-3 font-medium hover:bg-gray-800 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GitBranch className="h-5 w-5" />
                  <span>Continue with GitHub</span>
                  {isLoading && (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  )}
                </button>

                <button
                  onClick={handleEmailAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-4 py-3 font-medium hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="h-5 w-5" />
                  <span>Continue with Email</span>
                  {isLoading && (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                {authType === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-4 py-3 font-medium hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      <span>{authType === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                    </div>
                  ) : (
                    <span>{authType === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              {/* Terms */}
              <p className="text-center text-xs text-gray-500 mt-6">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
