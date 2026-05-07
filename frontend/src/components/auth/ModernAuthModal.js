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
import { auth } from '../../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

const ModernAuthModal = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  darkMode 
}) => {
  const [authMode, setAuthMode] = useState('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);

  const handleSocialAuthSuccess = (userData) => {
    setIsLoading(true);
    const payload = {
      ...userData,
      subscription: 'premium',
      isOnline: true,
      memberSince: new Date().getFullYear().toString(),
    };
    localStorage.setItem('fintech-user', JSON.stringify(payload));
    onAuthSuccess(payload);
    setIsLoading(false);
    onClose();
  };

  const handleEmailAuthSuccess = (formData) => {
    setIsLoading(true);
    setError('');
    if (!auth) {
      setError('Authentication service is not configured.');
      setIsLoading(false);
      return;
    }

    const { email, password, name } = formData;

    const finish = (firebaseUser, subscription = 'free') => {
      const payload = {
        id: firebaseUser.uid,
        name: name || firebaseUser.displayName || email,
        email,
        avatar: firebaseUser.photoURL || null,
        provider: 'email',
        subscription,
        isOnline: true,
        memberSince: new Date().getFullYear().toString(),
      };
      localStorage.setItem('fintech-user', JSON.stringify(payload));
      onAuthSuccess(payload);
      setIsLoading(false);
      onClose();
    };

    if (forgotMode) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          setError('Password reset email sent. Check your inbox.');
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to send reset email.');
          setIsLoading(false);
        });
      return;
    }

    if (authMode === 'signin') {
      signInWithEmailAndPassword(auth, email, password)
        .then(({ user }) => finish(user, 'premium'))
        .catch((err) => {
          setError(err.message || 'Sign in failed.');
          setIsLoading(false);
        });
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then(({ user }) => finish(user, 'free'))
        .catch((err) => {
          setError(err.message || 'Sign up failed.');
          setIsLoading(false);
        });
    }
  };

  const handleAuthError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError('');
    setForgotMode(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        className="w-full max-w-5xl mx-4 rounded-3xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(129,140,248,0.35),transparent_55%),radial-gradient(circle_at_100%_0,rgba(56,189,248,0.35),transparent_55%)] pointer-events-none" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 bg-slate-950/90 text-white">
          {/* Left branding */}
          <div className="p-8 md:p-10 border-r border-white/10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur">
                <Shield className="w-4 h-4 text-cyan-300" />
                <span className="text-xs font-medium text-cyan-100">Expense Tracker · AI Insights</span>
              </div>
              <h2 className="mt-6 text-3xl md:text-4xl font-semibold leading-tight">
                Manage your{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                  finances smarter
                </span>
              </h2>
              <p className="mt-4 text-sm text-slate-200/80">
                Connect, track and optimize your spending with real‑time analytics and AI-driven insights.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-slate-100/80">
              <div className="rounded-2xl bg-white/5 p-3 border border-white/10 shadow-lg">
                <p className="font-semibold">Smart Alerts</p>
                <p className="mt-1 text-slate-200/80">Instant notifications when you approach your budget limits.</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 border border-white/10 shadow-lg">
                <p className="font-semibold">Multi-Account</p>
                <p className="mt-1 text-slate-200/80">Track cards, bank accounts and wallets in one place.</p>
              </div>
            </div>
          </div>

          {/* Right auth column */}
          <div className={`p-6 md:p-8 bg-white/95 text-slate-900`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 bg-opacity-20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-slate-500">
                {authMode === 'signin' 
                  ? 'Sign in to your Expense Tracker account'
                  : 'Join thousands managing their finances smarter'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200"
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
          <div className="inline-flex rounded-xl p-1 bg-slate-100">
            <button
              onClick={() => switchMode('signin')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                authMode === 'signin'
                  ? `text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 shadow-lg`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
                  ? `text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 shadow-lg`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
            <p className="text-sm text-slate-500">
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
          <div className="flex-1 h-px bg-slate-200" />
          <span className="px-4 text-sm text-slate-400">
            OR
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Email Form */}
        <EmailAuth
          mode={authMode}
          onSubmit={handleEmailAuthSuccess}
          isLoading={isLoading}
          darkMode={false}
          onModeChange={switchMode}
        />

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-slate-500">
            {authMode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
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
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Terms */}
        <div className="text-center mt-3">
          <p className="text-xs text-slate-400">
            By continuing, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
      </div>
      </motion.div>
    </motion.div>
  );
};

export default ModernAuthModal;
