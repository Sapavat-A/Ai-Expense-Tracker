import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { auth, googleProvider, isConfigValid } from '../../firebase/config';
import { signInWithPopup } from 'firebase/auth';

const GoogleAuthButton = ({ onSuccess, onError, darkMode }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!auth || !googleProvider) return;
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData = {
        name: user.displayName || user.email || 'Google User',
        email: user.email || '',
        avatar: user.photoURL || null,
        provider: 'google',
      };
      onSuccess(userData);
    } catch (error) {
      console.error('Google login error:', error);
      onError(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-center space-x-3 p-3 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
        darkMode
          ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          : 'bg-gray-900 text-white hover:bg-gray-800 border-gray-600'
      }`}
      disabled={loading}
    >
      <FcGoogle className="w-5 h-5" />
      <span className="text-xs font-semibold">
        {loading ? 'Connecting…' : 'Continue with Google'}
      </span>
    </button>
  );
};

const GoogleAuth = ({ onSuccess, onError, darkMode }) => {
  if (!isConfigValid || !auth || !googleProvider) {
    return (
      <button
        type="button"
        disabled
        title="OAuth not configured"
        className={`w-full p-3 rounded-xl border text-sm font-medium cursor-not-allowed opacity-70 ${
          darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'
        }`}
      >
        Google Login
      </button>
    );
  }

  return <GoogleAuthButton onSuccess={onSuccess} onError={onError} darkMode={darkMode} />;
};

export default GoogleAuth;
