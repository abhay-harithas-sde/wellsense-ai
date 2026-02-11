import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, Camera, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isFirstTime = searchParams.get('firstTime') === 'true';
  
  const [isEditing, setIsEditing] = useState(isFirstTime);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showWelcome, setShowWelcome] = useState(isFirstTime);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || user?.profile?.firstName || '',
    lastName: user?.lastName || user?.profile?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || user?.profile?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : (user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : ''),
    location: user?.profile?.location || '',
    bio: user?.profile?.bio || ''
  });

  // Check if profile is complete
  const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth'];
  const isProfileComplete = requiredFields.every(field => {
    const value = profileData[field];
    return value && value.toString().trim() !== '';
  });

  useEffect(() => {
    // Update profile data when user changes
    if (user) {
      setProfileData({
        firstName: user?.firstName || user?.profile?.firstName || '',
        lastName: user?.lastName || user?.profile?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || user?.profile?.phone || '',
        dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : (user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : ''),
        location: user?.profile?.location || '',
        bio: user?.profile?.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Update profile using AuthContext
      const result = await updateProfile(profileData);
      
      if (result.success) {
        setIsEditing(false);
        setSaveSuccess(true);
        setShowWelcome(false);
        
        // If this was first-time setup, redirect to dashboard after success
        if (isFirstTime) {
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          // Hide success message after 3 seconds for regular updates
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } else {
        console.error('Profile update failed:', result.message);
        // In a real app, you'd show an error message to the user
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner for First-Time Users */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h1 className="text-3xl font-bold">Welcome to WellSense AI!</h1>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-100 mb-1">Profile Completion</div>
                <div className="text-2xl font-bold">
                  {Math.round((requiredFields.filter(field => profileData[field] && profileData[field].toString().trim() !== '').length / requiredFields.length) * 100)}%
                </div>
              </div>
            </div>
            <p className="text-green-100 text-lg mb-4">
              Let's complete your profile to personalize your health journey and unlock all features.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <AlertCircle className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold">Please fill in the required fields below</span>
              </div>
              <div className="w-32">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-yellow-300 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(requiredFields.filter(field => profileData[field] && profileData[field].toString().trim() !== '').length / requiredFields.length) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${showWelcome ? 'from-blue-600 to-indigo-600' : 'from-purple-600 to-indigo-600'} rounded-2xl p-6 text-white`}
      >
        <h1 className="text-3xl font-bold mb-2">
          {showWelcome ? 'Complete Your Profile' : 'Profile Settings'}
        </h1>
        <p className={showWelcome ? 'text-blue-100' : 'text-purple-100'}>
          {showWelcome ? 'Help us personalize your WellSense AI experience' : 'Manage your personal information and preferences'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                </div>
                <motion.button
                  className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-gray-600 mb-4">{profileData.email}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined March 2024</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                {showWelcome && (
                  <p className="text-sm text-gray-600 mt-1">
                    Fields marked with <span className="text-red-500">*</span> are required
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-green-600"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {isFirstTime ? 'Profile completed! Redirecting...' : 'Profile updated!'}
                    </span>
                  </motion.div>
                )}
                
                <motion.button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isSaving || (isEditing && !isProfileComplete)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    isEditing 
                      ? `${isProfileComplete ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white disabled:bg-green-300` 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  whileHover={{ scale: (isSaving || (isEditing && !isProfileComplete)) ? 1 : 1.02 }}
                  whileTap={{ scale: (isSaving || (isEditing && !isProfileComplete)) ? 1 : 0.98 }}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isFirstTime ? 'Complete Profile' : 'Save Changes'}</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name {showWelcome && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your first name" : ""}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                      isEditing 
                        ? `${!profileData.firstName && showWelcome ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'} focus:border-transparent` 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {!profileData.firstName && showWelcome && isEditing && (
                    <p className="text-red-500 text-xs mt-1">First name is required</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name {showWelcome && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your last name" : ""}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                      isEditing 
                        ? `${!profileData.lastName && showWelcome ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'} focus:border-transparent` 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {!profileData.lastName && showWelcome && isEditing && (
                    <p className="text-red-500 text-xs mt-1">Last name is required</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled={true}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number {showWelcome && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your phone number" : ""}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                      isEditing 
                        ? `${!profileData.phoneNumber && showWelcome ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'} focus:border-transparent` 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {!profileData.phoneNumber && showWelcome && isEditing && (
                    <p className="text-red-500 text-xs mt-1">Phone number is required</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth {showWelcome && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                      isEditing 
                        ? `${!profileData.dateOfBirth && showWelcome ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'} focus:border-transparent` 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {!profileData.dateOfBirth && showWelcome && isEditing && (
                    <p className="text-red-500 text-xs mt-1">Date of birth is required</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your location (optional)" : ""}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl transition-all ${
                  isEditing 
                    ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                placeholder={isEditing ? "Tell us about yourself (optional)..." : ""}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;