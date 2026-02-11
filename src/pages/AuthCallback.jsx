import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const provider = urlParams.get('provider');
        const error = urlParams.get('error');

        if (error) {
          console.error('Authentication error:', error);
          navigate('/auth?error=' + encodeURIComponent(error));
          return;
        }

        if (token) {
          // Store the token
          localStorage.setItem('wellsense_token', token);

          // Fetch user data with the token
          const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const response = await fetch(`${serverURL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setUser(result.data.user);
              
              // Clear auth intent from localStorage
              localStorage.removeItem('wellsense_auth_intent');
              localStorage.removeItem('wellsense_auth_provider');
              
              // Redirect to home (dashboard will be shown if logged in)
              navigate('/');
              return;
            }
          }
        }

        // If we get here, something went wrong
        navigate('/auth?error=Authentication failed');

      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=Authentication failed');
      }
    };

    handleAuthCallback();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 text-center"
      >
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Completing Authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we sign you in securely.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthCallback;