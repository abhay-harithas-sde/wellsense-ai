// Input Validation Module using Joi
import Joi from 'joi';

// User validation schemas
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    age: Joi.number().integer().min(13).max(120).optional(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY').optional(),
    heightCm: Joi.number().min(50).max(300).optional(),
    weight: Joi.number().min(20).max(500).optional(),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  })
};

// Health record validation schemas
const healthSchemas = {
  createRecord: Joi.object({
    bloodPressureSystolic: Joi.number().integer().min(70).max(250).optional(),
    bloodPressureDiastolic: Joi.number().integer().min(40).max(150).optional(),
    heartRate: Joi.number().integer().min(30).max(220).optional(),
    temperature: Joi.number().min(35).max(42).optional(),
    oxygenSaturation: Joi.number().min(70).max(100).optional(),
    bloodSugar: Joi.number().min(20).max(600).optional(),
    bmi: Joi.number().min(10).max(70).optional(),
    bodyFatPercentage: Joi.number().min(3).max(70).optional(),
    muscleMass: Joi.number().min(10).max(200).optional(),
    symptoms: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().max(1000).optional(),
    mood: Joi.number().integer().min(1).max(10).optional(),
    energyLevel: Joi.number().integer().min(1).max(10).optional(),
    sleepHours: Joi.number().min(0).max(24).optional(),
    sleepQuality: Joi.number().integer().min(1).max(10).optional(),
    recordedAt: Joi.date().optional()
  }),

  vitals: Joi.object({
    bloodPressureSystolic: Joi.number().integer().min(70).max(250).optional(),
    bloodPressureDiastolic: Joi.number().integer().min(40).max(150).optional(),
    heartRate: Joi.number().integer().min(30).max(220).optional(),
    temperature: Joi.number().min(35).max(42).optional(),
    oxygenSaturation: Joi.number().min(70).max(100).optional(),
    bloodGlucose: Joi.number().min(20).max(600).optional(),
    weight: Joi.number().min(20).max(500).optional()
  }),

  exercise: Joi.object({
    type: Joi.string().required(),
    duration: Joi.number().integer().min(1).max(1440).required(),
    caloriesBurned: Joi.number().min(0).max(10000).optional(),
    intensity: Joi.string().valid('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH').optional(),
    distance: Joi.number().min(0).max(500).optional()
  }),

  nutrition: Joi.object({
    mealType: Joi.string().valid('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK').required(),
    calories: Joi.number().min(0).max(10000).required(),
    protein: Joi.number().min(0).max(500).optional(),
    carbs: Joi.number().min(0).max(1000).optional(),
    fat: Joi.number().min(0).max(500).optional(),
    fiber: Joi.number().min(0).max(200).optional()
  }),

  weight: Joi.object({
    weight: Joi.number().min(20).max(500).required(),
    bodyFatPercentage: Joi.number().min(3).max(70).optional(),
    muscleMass: Joi.number().min(10).max(200).optional(),
    bmi: Joi.number().min(10).max(70).optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};

export {
  userSchemas,
  healthSchemas,
  validate
};
