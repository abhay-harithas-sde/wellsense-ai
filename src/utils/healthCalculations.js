/**
 * Health Calculations Utility
 * Contains formulas and calculations for health metrics
 */

/**
 * Calculate recommended daily water intake based on body weight
 * Formula: (Body Weight in kg ÷ 10) - 2 liters
 * @param {number} weightKg - Body weight in kilograms
 * @returns {number} Recommended water intake in liters
 */
export const calculateRecommendedWaterIntake = (weightKg) => {
  if (!weightKg || weightKg <= 0) {
    return 2.5; // Default recommendation
  }
  
  const recommended = (parseFloat(weightKg) / 10) - 2;
  return Math.max(recommended, 1); // Minimum 1 liter per day
};

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number} BMI value
 */
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return 0;
  }
  
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {string} BMI category
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Calculate target heart rate zones
 * @param {number} age - Age in years
 * @returns {object} Heart rate zones
 */
export const calculateHeartRateZones = (age) => {
  if (!age || age <= 0) {
    return { maxHR: 180, zone1: [108, 126], zone2: [126, 144], zone3: [144, 162] };
  }
  
  const maxHR = 220 - age;
  return {
    maxHR,
    zone1: [Math.round(maxHR * 0.6), Math.round(maxHR * 0.7)], // Fat burning
    zone2: [Math.round(maxHR * 0.7), Math.round(maxHR * 0.8)], // Aerobic
    zone3: [Math.round(maxHR * 0.8), Math.round(maxHR * 0.9)]  // Anaerobic
  };
};

/**
 * Assess hydration status
 * @param {number} actualIntake - Actual water intake in liters
 * @param {number} recommendedIntake - Recommended water intake in liters
 * @returns {object} Hydration status
 */
export const assessHydrationStatus = (actualIntake, recommendedIntake) => {
  if (!actualIntake || !recommendedIntake) {
    return { status: 'unknown', percentage: 0, message: 'No data available' };
  }
  
  const percentage = Math.round((actualIntake / recommendedIntake) * 100);
  
  if (percentage >= 100) {
    return { 
      status: 'excellent', 
      percentage, 
      message: 'Great hydration! You\'re meeting your daily goal.' 
    };
  } else if (percentage >= 80) {
    return { 
      status: 'good', 
      percentage, 
      message: 'Good hydration level. Try to drink a bit more.' 
    };
  } else if (percentage >= 60) {
    return { 
      status: 'moderate', 
      percentage, 
      message: 'Moderate hydration. Increase your water intake.' 
    };
  } else {
    return { 
      status: 'low', 
      percentage, 
      message: 'Low hydration. Please drink more water throughout the day.' 
    };
  }
};

/**
 * Convert units
 */
export const convertUnits = {
  // Weight conversions
  kgToLbs: (kg) => kg * 2.20462,
  lbsToKg: (lbs) => lbs / 2.20462,
  
  // Temperature conversions
  celsiusToFahrenheit: (celsius) => (celsius * 9/5) + 32,
  fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9,
  
  // Volume conversions
  litersToMl: (liters) => liters * 1000,
  mlToLiters: (ml) => ml / 1000,
  litersToOz: (liters) => liters * 33.814,
  ozToLiters: (oz) => oz / 33.814
};

/**
 * Validate vital signs ranges
 * @param {object} vitals - Vital signs object
 * @returns {object} Validation results
 */
export const validateVitalSigns = (vitals) => {
  const results = {
    valid: true,
    warnings: [],
    errors: []
  };
  
  // Heart rate validation
  if (vitals.heartRate) {
    if (vitals.heartRate < 40 || vitals.heartRate > 200) {
      results.errors.push('Heart rate should be between 40-200 BPM');
      results.valid = false;
    } else if (vitals.heartRate < 60 || vitals.heartRate > 100) {
      results.warnings.push('Heart rate is outside normal resting range (60-100 BPM)');
    }
  }
  
  // Blood pressure validation
  if (vitals.bloodPressure) {
    const { systolic, diastolic } = vitals.bloodPressure;
    if (systolic < 70 || systolic > 200 || diastolic < 40 || diastolic > 120) {
      results.errors.push('Blood pressure values are outside safe ranges');
      results.valid = false;
    } else if (systolic > 140 || diastolic > 90) {
      results.warnings.push('Blood pressure is elevated. Consider consulting a healthcare provider.');
    }
  }
  
  // Temperature validation (assuming Celsius)
  if (vitals.temperature) {
    if (vitals.temperature < 35 || vitals.temperature > 42) {
      results.errors.push('Temperature is outside safe range (35-42°C)');
      results.valid = false;
    } else if (vitals.temperature > 37.5) {
      results.warnings.push('Temperature indicates possible fever');
    }
  }
  
  // Oxygen saturation validation
  if (vitals.oxygenSaturation) {
    if (vitals.oxygenSaturation < 70 || vitals.oxygenSaturation > 100) {
      results.errors.push('Oxygen saturation should be between 70-100%');
      results.valid = false;
    } else if (vitals.oxygenSaturation < 95) {
      results.warnings.push('Oxygen saturation is below normal range (95-100%)');
    }
  }
  
  return results;
};