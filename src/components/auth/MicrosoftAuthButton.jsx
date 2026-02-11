import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const MicrosoftAuthButton = ({ className = '', isSignUp = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const handleMicrosoftAuth = async () => {
    setIsLoading(true);
    
    try {
      // Redirect to Microsoft OAuth - production implementation
      const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const authType = isSignUp ? 'signup' : 'signin';
      
      // Store auth intent for callback handling
      localStorage.setItem('wellsense_auth_intent', authType);
      localStorage.setItem('wellsense_auth_provider', 'microsoft');
      
      // Redirect to Microsoft OAuth
      window.location.href = `${serverURL}/api/auth/microsoft?type=${authType}`;
      
    } catch (error) {
      console.error('Microsoft authentication error:', error);
      alert('Microsoft authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleMicrosoftAuth}
      disabled={isLoading}
      className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-3"></div>
          {isSignUp ? 'Creating Microsoft Account...' : 'Signing in with Microsoft...'}
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#00BCF2" d="M0 0h11.377v11.372H0z"/>
            <path fill="#00BCF2" d="M12.623 0H24v11.372H12.623z"/>
            <path fill="#00BCF2" d="M0 12.623h11.377V24H0z"/>
            <path fill="#00BCF2" d="M12.623 12.623H24V24H12.623z"/>
          </svg>
          {isSignUp ? 'Sign up with Microsoft' : 'Sign in with Microsoft'}
        </>
      )}
    </motion.button>
  );
};

export default MicrosoftAuthButton;