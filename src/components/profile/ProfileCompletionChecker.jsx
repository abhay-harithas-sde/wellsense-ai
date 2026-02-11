import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import InitialHealthDataModal from '../modals/InitialHealthDataModal';
import apiService from '../../services/api';
import storageService from '../../services/storage';

const ProfileCompletionChecker = ({ children }) => {
  const { user, isAuthenticated, updateProfile: updateAuthProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const hasChecked = useRef(false); // Prevent multiple checks
  const isProcessing = useRef(false); // Prevent concurrent processing

  // Check if user needs to complete initial health data
  const checkHealthDataStatus = async () => {
    if (!user) return false;
    
    try {
      // FIRST: Check storage service (checks both localStorage and sessionStorage)
      if (storageService.isHealthProfileComplete(user.id)) {
        console.log('✅ Health setup already completed (storage)');
        return false; // Don't show modal
      }
      
      // THEN: Check backend database for existing health data
      console.log('🔍 Checking health data status for user:', user.id);
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.data.user) {
        const userData = response.data.user;
        
        // Check if user has essential health data in database
        const hasWeight = userData.weight && userData.weight > 0;
        const hasHeight = userData.height && userData.height > 0;
        const hasBMI = userData.bmi && userData.bmi > 0;
        
        console.log('📊 Health data check:', { hasWeight, hasHeight, hasBMI });
        
        // If user has data in database, mark as complete and bypass modal
        if (hasWeight && hasHeight && hasBMI) {
          console.log('✅ User has health data in database, bypassing profile setup');
          storageService.setHealthProfileComplete(user.id, true);
          
          // Save health data to storage for offline access
          storageService.set(`health_data_${user.id}`, {
            weight: userData.weight,
            height: userData.height,
            bmi: userData.bmi,
            bmiCategory: userData.bmiCategory,
            age: userData.age
          });
          
          return false; // Don't show modal
        }
        
        // User needs health data if database has no data
        console.log('⚠️ User needs to complete health profile setup');
        return true;
      }
      
      // If we can't fetch user data, don't show modal (fail gracefully)
      console.warn('⚠️ Could not fetch user data, skipping health profile check');
      return false;
    } catch (error) {
      console.error('❌ Error checking health data status:', error);
      // On error, don't show modal (fail gracefully)
      return false;
    }
  };

  useEffect(() => {
    const checkAndShowModal = async () => {
      // Prevent multiple checks
      if (hasChecked.current || isProcessing.current) {
        setIsChecking(false);
        return;
      }

      // Only check for authenticated users
      if (!isAuthenticated || !user) {
        setIsChecking(false);
        return;
      }

      // Don't show modal on auth pages
      if (location.pathname.startsWith('/auth')) {
        setIsChecking(false);
        return;
      }

      // Mark as processing
      isProcessing.current = true;
      hasChecked.current = true; // Mark as checked immediately to prevent re-showing

      // Check if user needs health data setup
      const needsSetup = await checkHealthDataStatus();
      
      if (needsSetup) {
        setShowHealthModal(true);
      }
      
      isProcessing.current = false;
      setIsChecking(false);
    };

    checkAndShowModal();
  }, [user?.id, isAuthenticated]); // Only depend on user.id and auth status, not location

  const handleHealthDataComplete = async (healthData) => {
    try {
      console.log('💾 Saving health data...', healthData);
      
      // Use storage service to save health data (handles both storage and database sync)
      const saved = await storageService.saveHealthData(user.id, healthData);
      
      if (saved) {
        console.log('✅ Health data saved successfully');
        hasChecked.current = true;
        
        // Close modal immediately
        setShowHealthModal(false);
        
        // Update user context with new profile data
        if (updateAuthProfile) {
          await updateAuthProfile({
            weight: healthData.weight,
            height: healthData.height,
            age: healthData.age,
            gender: healthData.gender,
            bmi: healthData.bmi,
            bmiCategory: healthData.bmiCategory
          });
        }
        
        // Navigate to dashboard
        if (location.pathname !== '/dashboard') {
          navigate('/dashboard', { replace: true });
        } else {
          window.location.reload();
        }
      } else {
        throw new Error('Failed to save health data');
      }
      
    } catch (error) {
      console.error('❌ Failed to save health data:', error);
      
      // Still mark as complete to prevent infinite loop
      storageService.setHealthProfileComplete(user.id, true);
      hasChecked.current = true;
      setShowHealthModal(false);
      
      // Navigate to dashboard
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard', { replace: true });
      } else {
        window.location.reload();
      }
    }
  };

  const getUserFirstName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700">Loading your profile...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {children}
      <InitialHealthDataModal
        isOpen={showHealthModal}
        onClose={() => {}} // Prevent closing without completing
        onComplete={handleHealthDataComplete}
        userName={getUserFirstName()}
      />
    </>
  );
};

export default ProfileCompletionChecker;