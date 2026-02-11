import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Activity, Heart, Moon } from 'lucide-react';

const InitialHealthDataModal = ({ isOpen, onClose, onComplete, userName = 'there' }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    heartRate: '',
    sleepHours: '',
    dailySteps: ''
  });
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [errors, setErrors] = useState({});

  // Calculate BMI when weight and height are available
  useEffect(() => {
    if (formData.weight && formData.height) {
      const weightKg = parseFloat(formData.weight);
      const heightM = parseFloat(formData.height) / 100; // Convert cm to m
      
      if (weightKg > 0 && heightM > 0) {
        const calculatedBmi = (weightKg / (heightM * heightM)).toFixed(1);
        setBmi(calculatedBmi);
        
        // Determine BMI category
        if (calculatedBmi < 18.5) {
          setBmiCategory('Underweight');
        } else if (calculatedBmi < 25) {
          setBmiCategory('Normal');
        } else if (calculatedBmi < 30) {
          setBmiCategory('Overweight');
        } else {
          setBmiCategory('Obese');
        }
      }
    }
  }, [formData.weight, formData.height]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.weight || formData.weight <= 0) {
        newErrors.weight = 'Please enter a valid weight';
      }
      if (!formData.height || formData.height <= 0) {
        newErrors.height = 'Please enter a valid height';
      }
      if (!formData.age || formData.age <= 0 || formData.age > 150) {
        newErrors.age = 'Please enter a valid age';
      }
      if (!formData.gender) {
        newErrors.gender = 'Please select your gender';
      }
    }
    
    if (currentStep === 2) {
      if (!formData.heartRate || formData.heartRate < 40 || formData.heartRate > 200) {
        newErrors.heartRate = 'Please enter a valid heart rate (40-200 bpm)';
      }
      if (!formData.sleepHours || formData.sleepHours < 0 || formData.sleepHours > 24) {
        newErrors.sleepHours = 'Please enter valid sleep hours (0-24)';
      }
      if (!formData.dailySteps || formData.dailySteps < 0 || formData.dailySteps > 100000) {
        newErrors.dailySteps = 'Please enter valid daily steps (0-100,000)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    const healthData = {
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      age: parseInt(formData.age),
      gender: formData.gender,
      bmi: parseFloat(bmi),
      bmiCategory,
      heartRate: parseInt(formData.heartRate),
      sleepHours: parseFloat(formData.sleepHours),
      dailySteps: parseInt(formData.dailySteps),
      completedAt: new Date().toISOString()
    };

    onComplete(healthData);
  };

  const getBmiColor = () => {
    if (!bmi) return 'text-gray-500';
    if (bmi < 18.5) return 'text-blue-500';
    if (bmi < 25) return 'text-green-500';
    if (bmi < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Welcome, {userName}! 👋</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Let's set up your health profile
                </p>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex gap-2 mt-4">
              <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <User className="w-5 h-5" />
                  <h3 className="font-semibold">Basic Information</h3>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="e.g., 70"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
                  )}
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="e.g., 170"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.height ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.height && (
                    <p className="text-red-500 text-xs mt-1">{errors.height}</p>
                  )}
                </div>

                {/* BMI Display */}
                {bmi && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Your BMI</p>
                        <p className={`text-3xl font-bold ${getBmiColor()}`}>
                          {bmi}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Category</p>
                        <p className={`text-lg font-semibold ${getBmiColor()}`}>
                          {bmiCategory}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="e.g., 25"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.age && (
                    <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => handleChange('gender', gender)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          formData.gender === gender
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <Activity className="w-5 h-5" />
                  <h3 className="font-semibold">Health Vitals</h3>
                </div>

                {/* Heart Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Resting Heart Rate (bpm) *
                    </div>
                  </label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => handleChange('heartRate', e.target.value)}
                    placeholder="e.g., 72"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.heartRate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.heartRate && (
                    <p className="text-red-500 text-xs mt-1">{errors.heartRate}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Normal range: 60-100 bpm
                  </p>
                </div>

                {/* Sleep Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      Average Sleep (hours/night) *
                    </div>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.sleepHours}
                    onChange={(e) => handleChange('sleepHours', e.target.value)}
                    placeholder="e.g., 7.5"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.sleepHours ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.sleepHours && (
                    <p className="text-red-500 text-xs mt-1">{errors.sleepHours}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 7-9 hours
                  </p>
                </div>

                {/* Daily Steps */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      Average Daily Steps *
                    </div>
                  </label>
                  <input
                    type="number"
                    value={formData.dailySteps}
                    onChange={(e) => handleChange('dailySteps', e.target.value)}
                    placeholder="e.g., 8000"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dailySteps ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dailySteps && (
                    <p className="text-red-500 text-xs mt-1">{errors.dailySteps}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 8,000-10,000 steps/day
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 mt-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Your Health Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">BMI:</span> {bmi} ({bmiCategory})</p>
                    <p><span className="font-medium">Age:</span> {formData.age} years</p>
                    <p><span className="font-medium">Gender:</span> {formData.gender}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t flex gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={step === 1 ? handleNext : handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
            >
              {step === 1 ? 'Next' : 'Complete Setup'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InitialHealthDataModal;
