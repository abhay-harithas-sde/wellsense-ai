import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const provider = urlParams.get('provider');
        const error = urlParams.get('error');

        console.log('🔄 Auth callback received:', { hasToken: !!token, provider, error });

        if (error) {
          console.error('❌ Authentication error:', error);
          navigate('/auth?error=' + encodeURIComponent(error));
          return;
        }

        if (token) {
          console.log('✅ Token received, storing and verifying...');
          
          // Store the token using apiService
          apiService.setToken(token);

          // Verify the token by fetching user data
          const result = await apiService.getCurrentUser();

          if (result.success) {
            console.log('✅ User authenticated successfully:', result.data.user.email);
            
            // Clear auth intent from localStorage
            localStorage.removeItem('wellsense_auth_intent');
            localStorage.removeItem('wellsense_auth_provider');
            
            // Redirect to home - AuthContext will pick up the user automatically
            console.log('🔄 Redirecting to home...');
            navigate('/', { replace: true });
            
            // Force a page reload to ensure AuthContext picks up the new token
            window.location.href = '/';
            return;
          } else {
            console.error('❌ Failed to fetch user data:', result.message);
          }
        }

        // If we get here, something went wrong
        console.error('❌ Authentication failed - no token or invalid response');
        navigate('/auth?error=Authentication failed');

      } catch (error) {
        console.error('❌ Auth callback error:', error);
        navigate('/auth?error=Authentication failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

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