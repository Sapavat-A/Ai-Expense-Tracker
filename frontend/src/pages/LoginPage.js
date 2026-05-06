import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import '../styles/modern.css';

const LoginPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(true);

  const handleAuthSuccess = (authData) => {
    console.log('Authentication successful:', authData);
    // Handle successful authentication
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd' stroke='%239CA3AF' stroke-width='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-4xl"
        >
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Welcome Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <LogIn className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Expense Tracker
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">Smart Finance Dashboard</p>
                  </div>
                </div>
                <p className="text-xl text-gray-700 mb-4">
                  Welcome back to your personal finance command center
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Track expenses, analyze spending patterns, and achieve your financial goals with AI-powered insights.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Smart Analytics</h3>
                    <p className="text-gray-600">AI-powered spending insights and trend analysis</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Budget Tracking</h3>
                    <p className="text-gray-600">Real-time budget monitoring and alerts</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bank-Level Security</h3>
                    <p className="text-gray-600">Your data is encrypted and secure</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAuthModal(true)}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.button>
                
                <p className="mt-4 text-center text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                  >
                    Sign up for free
                  </button>
                </p>
              </div>
            </motion.div>

            {/* Right Side - Visual Element */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="modern-card p-6 mb-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">💳</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Smart Cards</p>
                      <p className="text-sm text-gray-600">Virtual card management</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="modern-card p-6 mb-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">📈</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Growth Tracking</p>
                      <p className="text-sm text-gray-600">Monitor your progress</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                  className="modern-card p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">🤖</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">AI Insights</p>
                      <p className="text-sm text-gray-600">Smart recommendations</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LoginPage;
