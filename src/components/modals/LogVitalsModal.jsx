import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Activity, Thermometer, Droplets, Save, CheckCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import { calculateRecommendedWaterIntake, validateVitalSigns } from '../../utils/healthCalculations';

const LogVitalsModal = ({ isOpen, onClose }) => {
  const [vitals, setVitals] = useState({
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    temperature: '',
    weight: '',
    oxygenSaturation: '',
    waterIntake: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);



  const handleInputChange = (e) => {
    setVitals({
      ...vitals,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Prepare health record data - structure it correctly for the HealthRecord model
      const vitalSigns = {};
      
      if (vitals.heartRate) {
        vitalSigns.heartRate = parseInt(vitals.heartRate);
      }
      
      if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
        vitalSigns.bloodPressure = {
          systolic: parseInt(vitals.bloodPressureSystolic),
          diastolic: parseInt(vitals.bloodPressureDiastolic)
        };
      }
      
      if (vitals.temperature) {
        vitalSigns.temperature = parseFloat(vitals.temperature);
      }
      
      if (vitals.weight) {
        vitalSigns.weight = parseFloat(vitals.weight);
      }
      
      if (vitals.oxygenSaturation) {
        vitalSigns.oxygenSaturation = parseInt(vitals.oxygenSaturation);
      }
      
      if (vitals.waterIntake) {
        vitalSigns.waterIntake = parseFloat(vitals.waterIntake);
      }

      // Only save if there's at least one vital sign
      if (Object.keys(vitalSigns).length === 0) {
        setError('Please enter at least one vital sign');
        return;
      }

      const healthData = {
        type: 'vital_signs',
        data: vitalSigns,
        notes: vitals.notes || 'Vitals logged via quick action',
        source: 'manual'
      };

      console.log('Saving vitals data:', healthData);

      const response = await apiService.createHealthRecord(healthData);
      
      if (response.success) {
        setSaveSuccess(true);
        
        // Also save weight record if weight is provided
        if (vitals.weight) {
          try {
            await apiService.addWeightEntry({
              weight: parseFloat(vitals.weight),
              notes: vitals.notes || 'Weight logged via vitals quick action',
              source: 'manual'
            });
          } catch (weightError) {
            console.log('Weight save failed, but vitals saved successfully');
          }
        }

        // Show success message and reset form
        setTimeout(() => {
          setVitals({
            heartRate: '',
            bloodPressureSystolic: '',
            bloodPressureDiastolic: '',
            temperature: '',
            weight: '',
            oxygenSaturation: '',
            waterIntake: '',
            notes: ''
          });
          setSaveSuccess(false);
          onClose();
          
          // Trigger a custom event to notify other components
          window.dispatchEvent(new CustomEvent('vitalsUpdated', { 
            detail: { 
              type: 'vital_signs', 
              data: vitalSigns,
              timestamp: new Date()
            } 
          }));
          
          // Also trigger a page refresh event for dashboard updates
          window.dispatchEvent(new CustomEvent('healthDataUpdated'));
        }, 1500);

        console.log('✅ Vitals saved successfully to MongoDB');
      } else {
        throw new Error(response.message || 'Failed to save vitals');
      }
    } catch (err) {
      console.error('❌ Error saving vitals:', err);
      setError(err.message || 'Failed to save vitals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Log Vitals</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Success Message */}
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-700 text-sm font-semibold">Vitals saved successfully!</p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    name="heartRate"
                    value={vitals.heartRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="72"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={vitals.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="70"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Systolic BP
                  </label>
                  <input
                    type="number"
                    name="bloodPressureSystolic"
                    value={vitals.bloodPressureSystolic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diastolic BP
                  </label>
                  <input
                    type="number"
                    name="bloodPressureDiastolic"
                    value={vitals.bloodPressureDiastolic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="temperature"
                    value={vitals.temperature}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="36.5"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oxygen Sat (%)
                  </label>
                  <input
                    type="number"
                    name="oxygenSaturation"
                    value={vitals.oxygenSaturation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="98"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Intake (Liters)
                  {vitals.weight && (
                    <span className="text-xs text-blue-600 ml-2">
                      Recommended: {calculateRecommendedWaterIntake(vitals.weight).toFixed(1)}L
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <input
                    type="number"
                    name="waterIntake"
                    value={vitals.waterIntake}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="2.5"
                    step="0.1"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Formula: (Body Weight ÷ 10) - 2 liters per day
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={vitals.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Any additional notes about your health today..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Vitals</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogVitalsModal;