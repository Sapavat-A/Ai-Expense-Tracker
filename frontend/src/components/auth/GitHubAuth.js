import React, { useState } from 'react';
import { auth, githubProvider, isConfigValid } from '../../firebase/config';
import { signInWithPopup } from 'firebase/auth';
const GitHubAuth = ({ onSuccess, onError, darkMode }) => {
  const [loading, setLoading] = useState(false);

  if (!isConfigValid || !auth || !githubProvider) {
    return (
      <button
        type="button"
        disabled
        title="OAuth not configured"
        className={`flex items-center justify-center space-x-3 w-full px-4 py-3 rounded-xl font-medium border opacity-70 ${
          darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-300'
        }`}
      >
        <span>GitHub Login</span>
      </button>
    );
  }

  const handleClick = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      const userData = {
        id: user.uid,
        name: user.displayName || user.email || 'GitHub User',
        email: user.email || '',
        avatar: user.photoURL || null,
        provider: 'github',
      };
      onSuccess(userData);
    } catch (error) {
      console.error('GitHub Login Error:', error);
      onError(error.message || 'GitHub login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        darkMode 
          ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-600' 
          : 'bg-gray-900 text-white hover:bg-gray-800 border-gray-700'
      } border shadow-sm hover:shadow-md transform hover:-translate-y-0.5`}
      disabled={loading}
    >
      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
        <span className="text-black text-xs font-bold">G</span>
      </div>
      <span>{loading ? 'Connecting…' : 'Continue with GitHub'}</span>
    </button>
  );
};

export default GitHubAuth;
