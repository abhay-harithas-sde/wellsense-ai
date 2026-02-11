import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save, Camera, Utensils, Clock } from 'lucide-react';

const NutritionLogger = ({ onLogMeal, onClose }) => {
  const [mealData, setMealData] = useState({
    mealType: 'BREAKFAST',
    foodName: '',
    calories: '',
    protein: '',
    carbohydrates: '',
    fat: '',
    fiber: '',
    waterIntakeMl: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const mealTypes = [
    { value: 'BREAKFAST', label: 'Breakfast', icon: '🌅' },
    { value: 'LUNCH', label: 'Lunch', icon: '☀️' },
    { value: 'DINNER', label: 'Dinner', icon: '🌙' },
    { value: 'SNACK', label: 'Snack', icon: '🍎' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nutritionRecord = {
        ...mealData,
        calories: parseFloat(mealData.calories) || 0,
        protein: parseFloat(mealData.protein) || 0,
        carbohydrates: parseFloat(mealData.carbohydrates) || 0,
        fat: parseFloat(mealData.fat) || 0,
        fiber: parseFloat(mealData.fiber) || 0,
        waterIntakeMl: parseFloat(mealData.waterIntakeMl) || 0
      };

      await onLogMeal(nutritionRecord);
      
      // Reset form
      setMealData({
        mealType: 'BREAKFAST',
        foodName: '',
        calories: '',
        protein: '',
        carbohydrates: '',
        fat: '',
        fiber: '',
        waterIntakeMl: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to log meal:', error);
      alert('Failed to log meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Utensils className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Log Meal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {mealTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setMealData({ ...mealData, mealType: type.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    mealData.mealType === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Food Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Name *
            </label>
            <input
              type="text"
              required
              value={mealData.foodName}
              onChange={(e) => setMealData({ ...mealData, foodName: e.target.value })}
              placeholder="e.g., Grilled chicken with vegetables"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories (kcal) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={mealData.calories}
                onChange={(e) => setMealData({ ...mealData, calories: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protein (g) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={mealData.protein}
                onChange={(e) => setMealData({ ...mealData, protein: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carbohydrates (g) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={mealData.carbohydrates}
                onChange={(e) => setMealData({ ...mealData, carbohydrates: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fat (g) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={mealData.fat}
                onChange={(e) => setMealData({ ...mealData, fat: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiber (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={mealData.fiber}
                onChange={(e) => setMealData({ ...mealData, fiber: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Water (ml)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={mealData.waterIntakeMl}
                onChange={(e) => setMealData({ ...mealData, waterIntakeMl: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={mealData.notes}
              onChange={(e) => setMealData({ ...mealData, notes: e.target.value })}
              placeholder="Any additional notes about this meal..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Log Meal</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NutritionLogger;
