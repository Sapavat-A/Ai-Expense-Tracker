import React from 'react';
import { useGitHubLogin } from '@react-oauth/github';
const GitHubAuth = ({ onSuccess, onError, darkMode }) => {
  const githubLogin = useGitHubLogin({
    onSuccess: (response) => {
      // Get user info from GitHub
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${response.access_token}`
        }
      })
        .then(response => response.json())
        .then(user => {
          const userData = {
            id: user.id,
            name: user.name || user.login,
            email: user.email || `${user.login}@github.local`,
            avatar: user.avatar_url,
            provider: 'github',
            subscription: 'premium',
            isOnline: true,
            memberSince: new Date().getFullYear().toString(),
            balance: 5420.50,
            monthlySpent: 2847.32
          };
          onSuccess(userData);
        })
        .catch(error => {
          console.error('Error fetching GitHub user info:', error);
          onError('Failed to fetch GitHub user information');
        });
    },
    onError: (error) => {
      console.error('GitHub Login Error:', error);
      onError('GitHub login failed');
    },
    scope: 'user:email'
  });

  return (
    <button
      onClick={() => githubLogin()}
      className={`flex items-center justify-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        darkMode 
          ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-600' 
          : 'bg-gray-900 text-white hover:bg-gray-800 border-gray-700'
      } border shadow-sm hover:shadow-md transform hover:-translate-y-0.5`}
    >
      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
        <span className="text-black text-xs font-bold">G</span>
      </div>
      <span>Continue with GitHub</span>
    </button>
  );
};

export default GitHubAuth;
