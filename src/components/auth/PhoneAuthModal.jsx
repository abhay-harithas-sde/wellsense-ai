import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ArrowRight, Check, ChevronDown, Globe } from 'lucide-react';

const PhoneAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone' or 'verify'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('IN'); // Default to India
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Popular countries with their codes and formats
  const countries = [
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', format: 'XXXXX XXXXX', length: 10 },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(XXX) XXX-XXXX', length: 10 },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: 'XXXX XXX XXXX', length: 10 },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '(XXX) XXX-XXXX', length: 10 },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: 'XXXX XXX XXX', length: 9 },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: 'XXX XXXXXXX', length: 10 },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: 'XX XX XX XX XX', length: 9 },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: 'XXX-XXXX-XXXX', length: 10 },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', format: 'XXX XXXX XXXX', length: 11 },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', format: '(XX) XXXXX-XXXX', length: 11 },
    { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', format: 'XX XXX XXXX', length: 9 },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', format: 'XXXX XXXX', length: 8 },
    { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', format: 'XX-XXX XXXX', length: 9 },
    { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', format: 'XX XXX XXXX', length: 9 },
    { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', format: 'XXX XXX XXXX', length: 10 },
  ];

  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

  const formatPhoneNumber = (value, countryCode) => {
    const digits = value.replace(/\D/g, '');
    const country = countries.find(c => c.code === countryCode) || countries[0];
    
    switch (countryCode) {
      case 'IN':
        // Indian format: XXXXX XXXXX
        if (digits.length >= 5) {
          return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
        }
        return digits;
      
      case 'US':
      case 'CA':
        // US/Canada format: (XXX) XXX-XXXX
        if (digits.length >= 6) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        } else if (digits.length >= 3) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        return digits;
      
      case 'GB':
        // UK format: XXXX XXX XXXX
        if (digits.length >= 7) {
          return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
        } else if (digits.length >= 4) {
          return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        }
        return digits;
      
      case 'AU':
        // Australia format: XXXX XXX XXX
        if (digits.length >= 7) {
          return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
        } else if (digits.length >= 4) {
          return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        }
        return digits;
      
      case 'SG':
        // Singapore format: XXXX XXXX
        if (digits.length >= 4) {
          return `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
        }
        return digits;
      
      default:
        // Generic formatting with spaces every 3-4 digits
        if (digits.length >= 6) {
          return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        } else if (digits.length >= 3) {
          return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        return digits;
    }
  };

  const validatePhoneNumber = (phone, countryCode) => {
    const digits = phone.replace(/\D/g, '');
    const country = countries.find(c => c.code === countryCode) || countries[0];
    
    // Check if the number has the correct length for the country
    return digits.length === country.length;
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate phone number for selected country
      if (!validatePhoneNumber(phoneNumber, selectedCountry)) {
        const country = countries.find(c => c.code === selectedCountry);
        setError(`Please enter a valid ${country.length}-digit phone number for ${country.name}`);
        setIsLoading(false);
        return;
      }

      // Clean phone number and create full international number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const fullPhoneNumber = `${currentCountry.dialCode}${cleanPhone}`;
      
      // Send OTP request to backend
      const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${serverURL}/api/auth/phone/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          countryCode: selectedCountry
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ OTP sent successfully:', result);
        
        // Start countdown timer
        setTimeLeft(60);
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setStep('verify');
      } else {
        setError(result.message || 'Failed to send verification code');
      }
      
    } catch (error) {
      console.error('Phone verification error:', error);
      setError('Failed to send verification code. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (verificationCode.length !== 6) {
        setError('Please enter the 6-digit verification code');
        setIsLoading(false);
        return;
      }

      // Send verification request to backend
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const fullPhoneNumber = `${currentCountry.dialCode}${cleanPhone}`;
      
      const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${serverURL}/api/auth/phone/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          code: verificationCode,
          countryCode: selectedCountry
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        localStorage.setItem('wellsense_token', result.data.token);
        
        console.log('✅ Phone verification successful:', result.data.user);
        
        onSuccess({ 
          user: result.data.user, 
          token: result.data.token 
        });
        onClose();
      } else {
        setError(result.message || 'Invalid verification code. Please try again.');
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      setError('Verification failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;
    
    setIsLoading(true);
    try {
      // Resend OTP using the same logic as initial send
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const fullPhoneNumber = `${currentCountry.dialCode}${cleanPhone}`;
      
      const serverURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${serverURL}/api/auth/phone/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          countryCode: selectedCountry
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Restart timer
        setTimeLeft(60);
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        console.log('✅ Verification code resent successfully');
      } else {
        setError(result.message || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setError('Failed to resend code. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setVerificationCode('');
    setError('');
    setTimeLeft(0);
    setShowCountryDropdown(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => {
                onClose();
                resetModal();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step === 'phone' ? 'Phone Authentication' : 'Verify Your Phone'}
              </h3>
              <p className="text-gray-600">
                {step === 'phone' 
                  ? 'Enter your phone number to receive a verification code'
                  : `We sent a 6-digit code to ${currentCountry.dialCode} ${phoneNumber}`
                }
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{currentCountry.flag}</span>
                        <span className="text-sm font-medium">{currentCountry.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{currentCountry.dialCode}</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    {showCountryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                      >
                        {countries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country.code);
                              setShowCountryDropdown(false);
                              setPhoneNumber(''); // Reset phone number when country changes
                            }}
                            className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="text-xl mr-3">{country.flag}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{country.name}</div>
                              <div className="text-xs text-gray-500">{country.dialCode}</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                      {currentCountry.dialCode}
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value, selectedCountry))}
                      className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder={currentCountry.format.replace(/X/g, '0')}
                      maxLength={currentCountry.length + 5} // Account for formatting characters
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your {currentCountry.name} phone number
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !validatePhoneNumber(phoneNumber, selectedCountry)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Globe className="w-5 h-5 mr-2" />
                      Send Verification Code
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-lg font-mono tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Verify
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={timeLeft > 0}
                    className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend verification code'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                🔒 Your phone number is encrypted and secure. We'll never share it with third parties.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PhoneAuthModal;