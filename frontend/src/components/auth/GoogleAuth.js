import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

const GoogleAuth = ({ onSuccess, onError, darkMode }) => {
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Get user info from Google
      fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`)
        .then(response => response.json())
        .then(data => {
          const userData = {
            name: data.name,
            email: data.email,
            avatar: data.picture,
            provider: 'google'
          };
          onSuccess(userData);
        })
        .catch(error => onError(error.message));
    },
    onError: (error) => {
      console.error('Google login error:', error);
      onError(error.error || 'Google login failed');
    }
  });

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Sign in with Google
        </h2>
        <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Connect your Google account to access all features
        </p>
        
        <button
          onClick={googleLogin}
          className={`w-full flex items-center justify-center space-x-3 p-3 rounded-lg border shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
            darkMode 
              ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300' 
              : 'bg-gray-900 text-white hover:bg-gray-800 border-gray-600'
          }`}
        >
          <FcGoogle className="w-5 h-5" />
          <span className="text-black text-xs font-bold">Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default GoogleAuth;
