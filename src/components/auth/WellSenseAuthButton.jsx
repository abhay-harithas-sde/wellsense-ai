import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Smartphone, Download } from 'lucide-react';

const WellSenseAuthButton = ({ className = '', isSignUp = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const { setUser } = useAuth();

  const handleWellSenseAuth = async () => {
    setIsLoading(true);
    
    try {
      // Check if WellSense mobile app is installed
      const isAppInstalled = await checkAppInstallation();
      
      if (isAppInstalled) {
        // Deep link to WellSense mobile app
        const authType = isSignUp ? 'signup' : 'signin';
        const deepLink = `wellsense://auth?type=${authType}&callback=${encodeURIComponent(window.location.origin + '/auth/callback')}`;
        
        window.location.href = deepLink;
        
        // Fallback if deep link doesn't work
        setTimeout(() => {
          setShowAppModal(true);
          setIsLoading(false);
        }, 3000);
      } else {
        // Show app download modal
        setShowAppModal(true);
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('WellSense app authentication error:', error);
      setShowAppModal(true);
      setIsLoading(false);
    }
  };

  const checkAppInstallation = async () => {
    // Check if mobile app is installed via deep link test
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 1000);
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = 'wellsense://check';
      
      iframe.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      iframe.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 1000);
    });
  };

  const AppDownloadModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Download WellSense AI App
          </h3>
          
          <p className="text-gray-600 mb-6">
            Get the full WellSense AI experience with our mobile app for seamless health tracking and AI coaching.
          </p>
          
          <div className="space-y-3">
            <a
              href="https://apps.apple.com/wellsense-ai"
              className="flex items-center justify-center w-full px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download for iOS
            </a>
            
            <a
              href="https://play.google.com/store/apps/wellsense-ai"
              className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download for Android
            </a>
          </div>
          
          <button
            onClick={() => setShowAppModal(false)}
            className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
          >
            Continue with web version
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <motion.button
        onClick={handleWellSenseAuth}
        disabled={isLoading}
        className={`w-full flex items-center justify-center px-4 py-3 border-2 border-blue-500 rounded-xl shadow-sm bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
            Connecting to WellSense App...
          </>
        ) : (
          <>
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold text-xs">W</span>
            </div>
            {isSignUp ? 'Sign up with WellSense App' : 'Sign in with WellSense App'}
          </>
        )}
      </motion.button>
      
      {showAppModal && <AppDownloadModal />}
    </>
  );
};

export default WellSenseAuthButton;