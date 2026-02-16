import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import Logo from '../components/ui/Logo';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import MicrosoftAuthButton from '../components/auth/MicrosoftAuthButton';
import WellSenseAuthButton from '../components/auth/WellSenseAuthButton';
import PhoneAuthModal from '../components/auth/PhoneAuthModal';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const { login, register, error, setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        console.log('Attempting login with:', { email: formData.email, password: formData.password });
        result = await login({ email: formData.email, password: formData.password });
      } else {
        console.log('Attempting registration with:', formData);
        result = await register(formData);
      }
      
      console.log('Auth result:', result);
      
      // Check if login/register was successful
      if (result && result.success) {
        // Success - user will be redirected by the auth system
        console.log('Authentication successful - should redirect now');
      } else {
        // Error will be handled by the auth context and displayed
        console.log('Authentication failed:', result?.message);
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    console.log('Form data updated:', newFormData);
    setFormData(newFormData);
    
    // Clear email check message when user types
    if (e.target.name === 'email') {
      setEmailCheckMessage('');
    }
  };

  // Check if email exists when user leaves email field
  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes('@')) return;
    
    setIsCheckingEmail(true);
    setEmailCheckMessage('');
    
    try {
      // Try to login with a dummy password to check if user exists
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
      const response = await fetch(`${apiUrl}/api/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await response.json();
      
      if (data.exists) {
        // User exists - switch to login
        setIsLogin(true);
        setEmailCheckMessage('✓ Welcome back! Please enter your password.');
      } else {
        // User doesn't exist - switch to signup
        setIsLogin(false);
        setEmailCheckMessage('✓ New user! Please complete the sign-up form.');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // On error, don't change anything
    } finally {
      setIsCheckingEmail(false);
    }
  };



  const handlePhoneAuthSuccess = (authData) => {
    console.log('Phone authentication successful:', authData);
    setUser(authData.user);
    // The user will be redirected by the auth system
  };

  const handleGoogleAuthSuccess = (userData) => {
    console.log('Google authentication successful:', userData);
    setUser(userData);
    setSuccessMessage('Google authentication successful! Redirecting...');
    setShowSuccessMessage(true);
    // User will be redirected by the auth system
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <Logo size="lg" variant="full" />
          </motion.div>
          <p className="text-gray-600 mt-2">Your intelligent health companion</p>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          {/* Welcome Message */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Welcome to WellSense AI
              </h3>
              <p className="text-sm text-gray-600">
                Your intelligent health companion powered by AI. Choose your preferred sign-in method below.
              </p>
            </div>
          </motion.div>

          {/* Tab Switcher */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-600 flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">✓</span>
                </span>
                {successMessage}
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John"
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Doe"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                  required
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {emailCheckMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs mt-1 ${
                    isLogin ? 'text-green-600' : 'text-blue-600'
                  }`}
                >
                  {emailCheckMessage}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* Alternative Authentication Methods */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Or continue with</p>
            
            <div className="space-y-3">
              {/* WellSense App Authentication */}
              <WellSenseAuthButton isSignUp={!isLogin} />
              
              {/* Social Authentication */}
              <div className="grid grid-cols-2 gap-3">
                <GoogleAuthButton isSignUp={!isLogin} onSuccess={handleGoogleAuthSuccess} />
                <MicrosoftAuthButton isSignUp={!isLogin} />
              </div>
              
              {/* Phone Authentication */}
              <motion.button
                onClick={() => setShowPhoneModal(true)}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-5 h-5 mr-3 text-green-600" />
                {isLogin ? 'Sign in with Phone' : 'Sign up with Phone'}
              </motion.button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                🔒 Your data is encrypted and secure
              </p>
              <p className="text-xs text-gray-400">
                We use industry-standard security measures to protect your health information
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>

      {/* Phone Authentication Modal */}
      <PhoneAuthModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSuccess={handlePhoneAuthSuccess}
      />
    </div>
  );
};

export default AuthPage;