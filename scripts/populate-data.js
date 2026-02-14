#!/usr/bin/env node

/**
 * Data Population Script for Demo Day Preparation
 * 
 * This script generates and inserts realistic demo data into all databases
 * to prepare the WellSense AI Platform for demo day presentation.
 * 
 * Requirements: 2.1-2.7
 * - Minimum 10 user profiles with complete health information
 * - Minimum 10 health metrics records per user
 * - Minimum 10 AI-generated nutrition plans
 * - Minimum 10 AI-generated fitness plans
 * - Minimum 10 community posts with engagement data
 * - Minimum 10 mental wellness tracking entries
 * - Minimum 5 video consultation records
 */

const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const { getDatabaseConnection } = require('./database/connection');
const { initializeFirebase, getFirebaseAdmin } = require('../lib/firebase');

// Database connection instance
let prisma = null;

/**
 * Set the Prisma client instance
 * This must be called before using any generation functions
 * @param {PrismaClient} prismaInstance - Prisma client instance
 */
function setPrismaClient(prismaInstance) {
  prisma = prismaInstance;
}

// Configuration
const CONFIG = {
  users: {
    count: 10,
    minAge: 18,
    maxAge: 70
  },
  healthMetrics: {
    recordsPerUser: 10,
    daysBack: 30
  },
  nutritionPlans: {
    count: 10
  },
  fitnessPlans: {
    count: 10
  },
  communityPosts: {
    count: 10
  },
  mentalWellness: {
    recordsPerUser: 10,
    daysBack: 30
  },
  consultations: {
    recordsPerUser: 5
  }
};

// Utility: Generate random date within range
function randomDateInPast(daysBack) {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return faker.date.between({ from: past, to: now });
}

// Utility: Calculate BMI
function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

// Utility: Get BMI category
function getBMICategory(bmi) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// Utility: Convert kg to lbs
function kgToLbs(kg) {
  return parseFloat((kg * 2.20462).toFixed(1));
}

// Utility: Convert cm to feet and inches
function cmToFeetInches(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches, totalFeet: parseFloat((totalInches / 12).toFixed(2)) };
}

/**
 * Generate realistic user profiles
 * @param {number} count - Number of users to generate
 * @returns {Promise<Array>} Array of created user IDs
 */
async function generateUserProfiles(count = CONFIG.users.count) {
  console.log(`\n📝 Generating ${count} user profiles...`);
  const userIds = [];
  
  // Initialize Firebase for auth account creation
  const firebaseResult = initializeFirebase();
  let firebaseAvailable = firebaseResult.success;
  
  if (firebaseAvailable) {
    console.log('  ℹ️  Firebase initialized - will create auth accounts');
  } else {
    console.log('  ⚠️  Firebase not available - skipping auth account creation');
  }
  
  for (let i = 0; i < count; i++) {
    const gender = faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']);
    const firstName = faker.person.firstName(gender === 'MALE' ? 'male' : 'female');
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    
    // Generate realistic physical measurements
    const heightCm = faker.number.float({ min: 150, max: 195, fractionDigits: 1 });
    const { feet, inches, totalFeet } = cmToFeetInches(heightCm);
    const weightKg = faker.number.float({ min: 50, max: 120, fractionDigits: 1 });
    const weightLbs = kgToLbs(weightKg);
    const bmi = calculateBMI(weightKg, heightCm);
    const bmiCategory = getBMICategory(bmi);
    
    // Calculate age from date of birth
    const dateOfBirth = faker.date.birthdate({ 
      min: CONFIG.users.minAge, 
      max: CONFIG.users.maxAge, 
      mode: 'age' 
    });
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();
    
    let firebaseUid = null;
    
    // Create Firebase auth account if available
    if (firebaseAvailable) {
      try {
        const admin = getFirebaseAdmin();
        const firebaseUser = await admin.auth().createUser({
          email,
          emailVerified: true,
          password: 'DemoDay2024!', // Demo password for all users
          displayName: `${firstName} ${lastName}`,
          photoURL: faker.image.avatar(),
          disabled: false
        });
        
        firebaseUid = firebaseUser.uid;
        console.log(`  ✓ Created Firebase auth account for ${email} (UID: ${firebaseUid})`);
      } catch (error) {
        // If user already exists in Firebase, try to get their UID
        if (error.code === 'auth/email-already-exists') {
          try {
            const admin = getFirebaseAdmin();
            const existingUser = await admin.auth().getUserByEmail(email);
            firebaseUid = existingUser.uid;
            console.log(`  ℹ️  Firebase user already exists: ${email} (UID: ${firebaseUid})`);
          } catch (getError) {
            console.error(`  ✗ Failed to get existing Firebase user ${email}:`, getError.message);
          }
        } else if (error.code === 'auth/configuration-not-found') {
          // Email/password authentication not enabled in Firebase
          if (i === 0) {
            console.log(`  ⚠️  Email/password auth not enabled in Firebase - skipping auth account creation`);
            console.log(`     To enable: Firebase Console > Authentication > Sign-in method > Email/Password`);
          }
          // Don't try to create more Firebase accounts
          firebaseAvailable = false;
        } else {
          console.error(`  ✗ Failed to create Firebase auth account for ${email}:`, error.message);
        }
      }
    }
    
    const userData = {
      email,
      username: faker.internet.username({ firstName, lastName }).toLowerCase(),
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber: faker.phone.number(),
      profileImage: faker.image.avatar(),
      
      // Physical measurements
      heightCm,
      height: heightCm,
      heightFt: totalFeet,
      heightIn: inches,
      weight: weightKg,
      weightLbs,
      age,
      bmi,
      bmiCategory,
      
      // Account settings
      isActive: true,
      isVerified: true,
      emailVerifiedAt: faker.date.past({ years: 1 }),
      
      // Preferences
      preferredUnits: faker.helpers.arrayElement(['METRIC', 'IMPERIAL']),
      timezone: faker.location.timeZone(),
      language: 'en',
      location: `${faker.location.city()}, ${faker.location.state()}`,
      bio: faker.lorem.sentence(),
      
      // Privacy
      profileVisibility: faker.helpers.arrayElement(['PUBLIC', 'FRIENDS', 'PRIVATE']),
      shareHealthData: faker.datatype.boolean(),
      
      // Timestamps
      createdAt: faker.date.past({ years: 2 }),
      lastLoginAt: faker.date.recent({ days: 7 })
    };
    
    // Store Firebase UID in googleId field (since Firebase is used for Google OAuth)
    if (firebaseUid) {
      userData.googleId = firebaseUid;
    }
    
    try {
      const user = await prisma.user.create({ data: userData });
      userIds.push(user.id);
      console.log(`  ✓ Created PostgreSQL user: ${firstName} ${lastName} (${email})`);
    } catch (error) {
      console.error(`  ✗ Failed to create PostgreSQL user ${email}:`, error.message);
      if (process.env.DEBUG) {
        console.error('    Full error:', error);
        console.error('    User data:', JSON.stringify(userData, null, 2));
      }
    }
  }
  
  console.log(`✅ Created ${userIds.length} user profiles`);
  if (firebaseAvailable) {
    console.log(`   🔐 Firebase auth accounts created successfully`);
    console.log(`   📧 Demo login credentials: Use any email above with password "DemoDay2024!"`);
  } else {
    console.log(`   ℹ️  Firebase auth accounts not created (Firebase not configured or email/password auth disabled)`);
  }
  return userIds;
}

/**
 * Generate health metrics records for a user
 * Includes vitals (HealthRecord), weight tracking (WeightRecord), and exercise (ExerciseRecord)
 * @param {string} userId - User ID
 * @param {number} count - Number of records to generate per type
 * @returns {Promise<Object>} Object with arrays of created record IDs by type
 */
async function generateHealthMetrics(userId, count = CONFIG.healthMetrics.recordsPerUser) {
  const result = {
    healthRecords: [],
    weightRecords: [],
    exerciseRecords: []
  };
  
  // Get user data for demographic-based ranges
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`  ✗ User ${userId} not found`);
    return result;
  }
  
  // Generate time series data over past month
  const dates = [];
  for (let i = 0; i < count; i++) {
    dates.push(randomDateInPast(CONFIG.healthMetrics.daysBack));
  }
  dates.sort((a, b) => a - b); // Sort chronologically
  
  // 1. Generate HealthRecords (vitals and wellness metrics)
  for (let i = 0; i < count; i++) {
    const recordData = {
      userId,
      
      // Vital signs - realistic ranges based on age and gender
      bloodPressureSystolic: faker.number.int({ 
        min: user.age > 50 ? 120 : 110, 
        max: user.age > 50 ? 145 : 135 
      }),
      bloodPressureDiastolic: faker.number.int({ 
        min: user.age > 50 ? 75 : 70, 
        max: user.age > 50 ? 95 : 90 
      }),
      heartRate: faker.number.int({ 
        min: user.gender === 'FEMALE' ? 65 : 60, 
        max: user.gender === 'FEMALE' ? 100 : 95 
      }),
      temperature: faker.number.float({ min: 36.1, max: 37.2, fractionDigits: 1 }),
      oxygenSaturation: faker.number.float({ min: 95, max: 100, fractionDigits: 1 }),
      bloodSugar: faker.number.float({ min: 70, max: 120, fractionDigits: 1 }),
      
      // Body composition - varies by gender
      bodyFatPercentage: faker.number.float({ 
        min: user.gender === 'FEMALE' ? 20 : 12, 
        max: user.gender === 'FEMALE' ? 32 : 25, 
        fractionDigits: 1 
      }),
      muscleMass: faker.number.float({ 
        min: user.gender === 'FEMALE' ? 25 : 35, 
        max: user.gender === 'FEMALE' ? 40 : 55, 
        fractionDigits: 1 
      }),
      
      // Wellness metrics
      mood: faker.number.int({ min: 5, max: 10 }),
      energyLevel: faker.number.int({ min: 5, max: 10 }),
      sleepHours: faker.number.float({ min: 6, max: 9, fractionDigits: 1 }),
      sleepQuality: faker.number.int({ min: 6, max: 10 }),
      
      // Symptoms and notes
      symptoms: faker.helpers.arrayElements(
        ['None', 'Headache', 'Fatigue', 'Muscle soreness', 'Good energy', 'Well rested'],
        faker.number.int({ min: 0, max: 2 })
      ),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
      
      recordedAt: dates[i]
    };
    
    try {
      const record = await prisma.healthRecord.create({ data: recordData });
      result.healthRecords.push(record.id);
    } catch (error) {
      console.error(`  ✗ Failed to create health record:`, error.message);
    }
  }
  
  // 2. Generate WeightRecords (weight tracking over time)
  const baseWeight = user.weight || faker.number.float({ min: 50, max: 120, fractionDigits: 1 });
  for (let i = 0; i < count; i++) {
    // Simulate realistic weight fluctuation (±2kg over the month)
    const weightVariation = faker.number.float({ min: -2, max: 2, fractionDigits: 1 });
    const weightKg = parseFloat((baseWeight + weightVariation).toFixed(1));
    const weightLbs = kgToLbs(weightKg);
    
    const weightData = {
      userId,
      weightKg,
      weightLbs,
      
      // Body composition (optional, included occasionally)
      bodyFatPercentage: faker.helpers.maybe(() => 
        faker.number.float({ 
          min: user.gender === 'FEMALE' ? 20 : 12, 
          max: user.gender === 'FEMALE' ? 32 : 25, 
          fractionDigits: 1 
        }), 
        { probability: 0.5 }
      ),
      muscleMass: faker.helpers.maybe(() => 
        faker.number.float({ 
          min: user.gender === 'FEMALE' ? 25 : 35, 
          max: user.gender === 'FEMALE' ? 40 : 55, 
          fractionDigits: 1 
        }), 
        { probability: 0.5 }
      ),
      waterPercentage: faker.helpers.maybe(() => 
        faker.number.float({ min: 50, max: 65, fractionDigits: 1 }), 
        { probability: 0.3 }
      ),
      
      notes: faker.helpers.maybe(() => 
        faker.helpers.arrayElement([
          'Morning weight',
          'After workout',
          'Before breakfast',
          'Weekly check-in'
        ]), 
        { probability: 0.2 }
      ),
      
      recordedAt: dates[i]
    };
    
    try {
      const record = await prisma.weightRecord.create({ data: weightData });
      result.weightRecords.push(record.id);
    } catch (error) {
      console.error(`  ✗ Failed to create weight record:`, error.message);
    }
  }
  
  // 3. Generate ExerciseRecords (varied exercise activities)
  const exerciseTypes = ['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'SPORTS'];
  const cardioActivities = ['Running', 'Cycling', 'Swimming', 'Walking', 'Elliptical'];
  const strengthActivities = ['Weight Training', 'Bodyweight Exercises', 'Resistance Bands', 'CrossFit'];
  const flexibilityActivities = ['Yoga', 'Stretching', 'Pilates'];
  const sportsActivities = ['Basketball', 'Tennis', 'Soccer', 'Volleyball'];
  
  for (let i = 0; i < count; i++) {
    const exerciseType = faker.helpers.arrayElement(exerciseTypes);
    let name, duration, intensity, caloriesBurned;
    
    // Generate realistic exercise data based on type
    switch (exerciseType) {
      case 'CARDIO':
        name = faker.helpers.arrayElement(cardioActivities);
        duration = faker.number.int({ min: 20, max: 60 });
        intensity = faker.helpers.arrayElement(['LOW', 'MODERATE', 'HIGH']);
        caloriesBurned = Math.round(duration * (intensity === 'HIGH' ? 10 : intensity === 'MODERATE' ? 7 : 5));
        break;
      case 'STRENGTH':
        name = faker.helpers.arrayElement(strengthActivities);
        duration = faker.number.int({ min: 30, max: 90 });
        intensity = faker.helpers.arrayElement(['MODERATE', 'HIGH', 'VERY_HIGH']);
        caloriesBurned = Math.round(duration * 6);
        break;
      case 'FLEXIBILITY':
        name = faker.helpers.arrayElement(flexibilityActivities);
        duration = faker.number.int({ min: 15, max: 60 });
        intensity = faker.helpers.arrayElement(['LOW', 'MODERATE']);
        caloriesBurned = Math.round(duration * 3);
        break;
      case 'SPORTS':
        name = faker.helpers.arrayElement(sportsActivities);
        duration = faker.number.int({ min: 30, max: 120 });
        intensity = faker.helpers.arrayElement(['MODERATE', 'HIGH', 'VERY_HIGH']);
        caloriesBurned = Math.round(duration * 8);
        break;
    }
    
    const exerciseData = {
      userId,
      exerciseType,
      name,
      duration,
      caloriesBurned,
      intensity,
      
      // Cardio-specific fields
      distance: exerciseType === 'CARDIO' ? 
        faker.number.float({ min: 2, max: 15, fractionDigits: 2 }) : null,
      heartRateAvg: exerciseType === 'CARDIO' ? 
        faker.number.int({ min: 120, max: 170 }) : null,
      heartRateMax: exerciseType === 'CARDIO' ? 
        faker.number.int({ min: 150, max: 190 }) : null,
      steps: exerciseType === 'CARDIO' && name === 'Walking' ? 
        faker.number.int({ min: 5000, max: 15000 }) : null,
      
      // Strength training specific
      sets: exerciseType === 'STRENGTH' ? 
        faker.number.int({ min: 3, max: 5 }) : null,
      reps: exerciseType === 'STRENGTH' ? 
        faker.number.int({ min: 8, max: 15 }) : null,
      weightKg: exerciseType === 'STRENGTH' ? 
        faker.number.float({ min: 5, max: 100, fractionDigits: 1 }) : null,
      
      notes: faker.helpers.maybe(() => 
        faker.helpers.arrayElement([
          'Felt great!',
          'Good workout',
          'Challenging but rewarding',
          'New personal best',
          'Need to improve form'
        ]), 
        { probability: 0.3 }
      ),
      
      recordedAt: dates[i]
    };
    
    try {
      const record = await prisma.exerciseRecord.create({ data: exerciseData });
      result.exerciseRecords.push(record.id);
    } catch (error) {
      console.error(`  ✗ Failed to create exercise record:`, error.message);
    }
  }
  
  return result;
}

/**
 * Generate comprehensive nutrition plans for a user
 * Creates complete daily meal plans with calorie and macro calculations
 * aligned with user health goals
 * @param {string} userId - User ID
 * @param {number} count - Number of complete meal plans to generate (default: 10)
 * @returns {Promise<Array>} Array of created nutrition record IDs
 */
async function generateNutritionPlans(userId, count = CONFIG.nutritionPlans.count) {
  const nutritionIds = [];
  
  // Get user data for personalized meal planning
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`  ✗ User ${userId} not found`);
    return nutritionIds;
  }
  
  // Determine user's health goal and calculate daily calorie target
  const bmi = user.bmi || calculateBMI(user.weight || 70, user.height || 170);
  const bmiCategory = user.bmiCategory || getBMICategory(bmi);
  
  // Calculate daily calorie needs based on BMI category and goals
  let dailyCalorieTarget;
  let proteinRatio, carbRatio, fatRatio;
  let goalType;
  
  if (bmiCategory === 'underweight') {
    goalType = 'Weight Gain';
    dailyCalorieTarget = 2500; // Calorie surplus
    proteinRatio = 0.25; // 25% protein
    carbRatio = 0.50;    // 50% carbs
    fatRatio = 0.25;     // 25% fat
  } else if (bmiCategory === 'overweight' || bmiCategory === 'obese') {
    goalType = 'Weight Loss';
    dailyCalorieTarget = 1800; // Calorie deficit
    proteinRatio = 0.35; // 35% protein (higher for satiety)
    carbRatio = 0.35;    // 35% carbs
    fatRatio = 0.30;     // 30% fat
  } else {
    goalType = 'Maintenance';
    dailyCalorieTarget = 2200; // Maintenance
    proteinRatio = 0.30; // 30% protein
    carbRatio = 0.40;    // 40% carbs
    fatRatio = 0.30;     // 30% fat
  }
  
  // Adjust for gender (women typically need fewer calories)
  if (user.gender === 'FEMALE') {
    dailyCalorieTarget = Math.round(dailyCalorieTarget * 0.85);
  }
  
  // Calculate macro targets in grams
  const dailyProteinTarget = Math.round((dailyCalorieTarget * proteinRatio) / 4); // 4 cal/g
  const dailyCarbTarget = Math.round((dailyCalorieTarget * carbRatio) / 4);       // 4 cal/g
  const dailyFatTarget = Math.round((dailyCalorieTarget * fatRatio) / 9);         // 9 cal/g
  
  // Meal distribution (percentage of daily calories)
  const mealDistribution = {
    BREAKFAST: 0.25,  // 25%
    LUNCH: 0.35,      // 35%
    DINNER: 0.30,     // 30%
    SNACK: 0.10       // 10%
  };
  
  // Comprehensive food database organized by meal type and goal
  const foodDatabase = {
    BREAKFAST: {
      'Weight Loss': [
        { name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 20, fat: 4, fiber: 3 },
        { name: 'Egg White Omelet with Vegetables', calories: 200, protein: 20, carbs: 10, fat: 8, fiber: 3 },
        { name: 'Oatmeal with Protein Powder', calories: 250, protein: 20, carbs: 35, fat: 5, fiber: 6 },
        { name: 'Cottage Cheese with Fruit', calories: 190, protein: 18, carbs: 22, fat: 3, fiber: 2 }
      ],
      'Weight Gain': [
        { name: 'Protein Pancakes with Peanut Butter', calories: 450, protein: 25, carbs: 50, fat: 18, fiber: 5 },
        { name: 'Scrambled Eggs with Avocado Toast', calories: 480, protein: 22, carbs: 40, fat: 25, fiber: 8 },
        { name: 'Mass Gainer Smoothie', calories: 520, protein: 30, carbs: 65, fat: 15, fiber: 4 },
        { name: 'Bagel with Cream Cheese and Salmon', calories: 500, protein: 28, carbs: 55, fat: 18, fiber: 3 }
      ],
      'Maintenance': [
        { name: 'Whole Grain Toast with Eggs', calories: 350, protein: 20, carbs: 35, fat: 15, fiber: 5 },
        { name: 'Greek Yogurt Parfait with Granola', calories: 320, protein: 18, carbs: 42, fat: 10, fiber: 4 },
        { name: 'Protein Smoothie Bowl', calories: 380, protein: 22, carbs: 48, fat: 12, fiber: 7 },
        { name: 'Oatmeal with Nuts and Banana', calories: 340, protein: 12, carbs: 52, fat: 11, fiber: 8 }
      ]
    },
    LUNCH: {
      'Weight Loss': [
        { name: 'Grilled Chicken Salad with Vinaigrette', calories: 350, protein: 40, carbs: 20, fat: 12, fiber: 6 },
        { name: 'Turkey and Vegetable Wrap', calories: 320, protein: 30, carbs: 35, fat: 8, fiber: 5 },
        { name: 'Tuna Poke Bowl', calories: 380, protein: 35, carbs: 40, fat: 10, fiber: 4 },
        { name: 'Grilled Salmon with Quinoa', calories: 420, protein: 38, carbs: 35, fat: 15, fiber: 5 }
      ],
      'Weight Gain': [
        { name: 'Chicken Burrito Bowl with Rice', calories: 650, protein: 45, carbs: 75, fat: 20, fiber: 10 },
        { name: 'Beef Stir Fry with Noodles', calories: 700, protein: 42, carbs: 80, fat: 24, fiber: 6 },
        { name: 'Pasta with Meatballs', calories: 720, protein: 40, carbs: 85, fat: 25, fiber: 7 },
        { name: 'Loaded Turkey Sandwich', calories: 680, protein: 48, carbs: 70, fat: 22, fiber: 8 }
      ],
      'Maintenance': [
        { name: 'Grilled Chicken with Sweet Potato', calories: 500, protein: 42, carbs: 50, fat: 15, fiber: 8 },
        { name: 'Salmon Bowl with Brown Rice', calories: 520, protein: 38, carbs: 55, fat: 18, fiber: 6 },
        { name: 'Turkey Chili with Cornbread', calories: 480, protein: 35, carbs: 52, fat: 16, fiber: 12 },
        { name: 'Chicken Fajita Bowl', calories: 510, protein: 40, carbs: 48, fat: 18, fiber: 9 }
      ]
    },
    DINNER: {
      'Weight Loss': [
        { name: 'Baked Cod with Roasted Vegetables', calories: 320, protein: 35, carbs: 25, fat: 10, fiber: 7 },
        { name: 'Chicken Breast with Broccoli', calories: 350, protein: 42, carbs: 20, fat: 12, fiber: 6 },
        { name: 'Shrimp Stir Fry with Cauliflower Rice', calories: 280, protein: 30, carbs: 22, fat: 9, fiber: 5 },
        { name: 'Turkey Meatballs with Zucchini Noodles', calories: 340, protein: 38, carbs: 24, fat: 11, fiber: 6 }
      ],
      'Weight Gain': [
        { name: 'Ribeye Steak with Loaded Baked Potato', calories: 750, protein: 50, carbs: 60, fat: 35, fiber: 6 },
        { name: 'Chicken Alfredo Pasta', calories: 720, protein: 45, carbs: 70, fat: 28, fiber: 4 },
        { name: 'Salmon with Quinoa and Avocado', calories: 680, protein: 42, carbs: 55, fat: 32, fiber: 10 },
        { name: 'BBQ Ribs with Mac and Cheese', calories: 800, protein: 48, carbs: 75, fat: 38, fiber: 5 }
      ],
      'Maintenance': [
        { name: 'Grilled Chicken with Rice and Vegetables', calories: 520, protein: 45, carbs: 50, fat: 16, fiber: 8 },
        { name: 'Baked Salmon with Asparagus', calories: 480, protein: 40, carbs: 35, fat: 22, fiber: 6 },
        { name: 'Lean Beef Tacos', calories: 500, protein: 38, carbs: 48, fat: 18, fiber: 9 },
        { name: 'Chicken Curry with Basmati Rice', calories: 540, protein: 42, carbs: 55, fat: 18, fiber: 7 }
      ]
    },
    SNACK: {
      'Weight Loss': [
        { name: 'Apple with Almond Butter', calories: 150, protein: 4, carbs: 18, fat: 8, fiber: 4 },
        { name: 'Protein Shake', calories: 120, protein: 20, carbs: 8, fat: 2, fiber: 1 },
        { name: 'Carrots with Hummus', calories: 100, protein: 4, carbs: 14, fat: 4, fiber: 4 },
        { name: 'Hard Boiled Eggs', calories: 140, protein: 12, carbs: 2, fat: 10, fiber: 0 }
      ],
      'Weight Gain': [
        { name: 'Trail Mix with Dried Fruit', calories: 280, protein: 8, carbs: 35, fat: 14, fiber: 4 },
        { name: 'Peanut Butter Banana Sandwich', calories: 320, protein: 12, carbs: 42, fat: 14, fiber: 5 },
        { name: 'Protein Bar with Nuts', calories: 300, protein: 20, carbs: 30, fat: 12, fiber: 4 },
        { name: 'Greek Yogurt with Granola and Honey', calories: 290, protein: 15, carbs: 38, fat: 10, fiber: 3 }
      ],
      'Maintenance': [
        { name: 'Mixed Nuts', calories: 180, protein: 6, carbs: 8, fat: 16, fiber: 3 },
        { name: 'Protein Bar', calories: 200, protein: 15, carbs: 22, fat: 7, fiber: 3 },
        { name: 'Greek Yogurt', calories: 150, protein: 15, carbs: 12, fat: 4, fiber: 0 },
        { name: 'Apple with Cheese', calories: 170, protein: 7, carbs: 20, fat: 8, fiber: 4 }
      ]
    }
  };
  
  // Generate dates over past month
  const dates = [];
  for (let i = 0; i < count; i++) {
    dates.push(randomDateInPast(CONFIG.healthMetrics.daysBack));
  }
  dates.sort((a, b) => a - b);
  
  console.log(`  📋 Generating ${count} complete meal plans for ${goalType} goal (${dailyCalorieTarget} cal/day)`);
  console.log(`     Daily macros: ${dailyProteinTarget}g protein, ${dailyCarbTarget}g carbs, ${dailyFatTarget}g fat`);
  
  // Generate complete meal plans (each plan = 1 day with all meals)
  for (let planIndex = 0; planIndex < count; planIndex++) {
    const planDate = dates[planIndex];
    let dailyTotalCalories = 0;
    let dailyTotalProtein = 0;
    let dailyTotalCarbs = 0;
    let dailyTotalFat = 0;
    
    // Generate all meals for this day
    for (const mealType of ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']) {
      const mealCalorieTarget = Math.round(dailyCalorieTarget * mealDistribution[mealType]);
      
      // Select appropriate food based on goal type
      const foodOptions = foodDatabase[mealType][goalType];
      const selectedFood = faker.helpers.arrayElement(foodOptions);
      
      // Calculate serving size to match calorie target (with some variation)
      const targetCalories = mealCalorieTarget + faker.number.int({ min: -30, max: 30 });
      const servingMultiplier = targetCalories / selectedFood.calories;
      
      const actualCalories = Math.round(selectedFood.calories * servingMultiplier);
      const actualProtein = parseFloat((selectedFood.protein * servingMultiplier).toFixed(1));
      const actualCarbs = parseFloat((selectedFood.carbs * servingMultiplier).toFixed(1));
      const actualFat = parseFloat((selectedFood.fat * servingMultiplier).toFixed(1));
      const actualFiber = parseFloat((selectedFood.fiber * servingMultiplier).toFixed(1));
      
      dailyTotalCalories += actualCalories;
      dailyTotalProtein += actualProtein;
      dailyTotalCarbs += actualCarbs;
      dailyTotalFat += actualFat;
      
      // Create nutrition record
      const nutritionData = {
        userId,
        mealType,
        foodName: selectedFood.name,
        brand: faker.helpers.maybe(() => faker.company.name(), { probability: 0.2 }),
        servingSize: parseFloat(servingMultiplier.toFixed(2)),
        servingUnit: 'serving',
        calories: actualCalories,
        protein: actualProtein,
        carbohydrates: actualCarbs,
        fat: actualFat,
        fiber: actualFiber,
        sugar: faker.number.float({ min: 5, max: 25, fractionDigits: 1 }),
        sodium: faker.number.float({ min: 200, max: 900, fractionDigits: 0 }),
        waterIntakeMl: mealType === 'SNACK' ? faker.number.float({ min: 250, max: 500, fractionDigits: 0 }) : null,
        notes: `Part of ${goalType} meal plan - Day ${planIndex + 1}`,
        recordedAt: planDate
      };
      
      try {
        const record = await prisma.nutritionRecord.create({ data: nutritionData });
        nutritionIds.push(record.id);
      } catch (error) {
        console.error(`  ✗ Failed to create nutrition record:`, error.message);
      }
    }
    
    // Log plan summary
    const macroAccuracy = Math.abs(dailyTotalCalories - dailyCalorieTarget) / dailyCalorieTarget * 100;
    if (planIndex === 0 || planIndex === count - 1) {
      console.log(`  ✓ Plan ${planIndex + 1}: ${dailyTotalCalories} cal (${dailyTotalProtein}g P, ${dailyTotalCarbs}g C, ${dailyTotalFat}g F) - ${macroAccuracy.toFixed(1)}% variance`);
    }
  }
  
  console.log(`  ✅ Generated ${count} complete meal plans (${nutritionIds.length} total meals)`);
  
  return nutritionIds;
}

/**
 * Generate comprehensive fitness plans for users
 * Creates varied exercise routines with different intensity levels
 * and stores them in MongoDB fitness_plans collection
 * @param {Array} userIds - Array of user IDs
 * @param {number} count - Number of fitness plans to generate (default: 10)
 * @returns {Promise<Array>} Array of created fitness plan IDs
 */
async function generateFitnessPlans(userIds, count = CONFIG.fitnessPlans.count) {
  const planIds = [];
  
  // Get MongoDB connection
  const db = getDatabaseConnection();
  const mongodb = db.getMongo();
  const fitnessPlansCollection = mongodb.collection('fitness_plans');
  
  // Fitness levels and their characteristics
  const fitnessLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  
  // Comprehensive exercise database organized by type and intensity
  const exerciseDatabase = {
    CARDIO: {
      BEGINNER: [
        { name: 'Walking', duration: 20, intensity: 'LOW', caloriesPerMin: 4, description: 'Brisk walking at comfortable pace' },
        { name: 'Light Cycling', duration: 25, intensity: 'LOW', caloriesPerMin: 5, description: 'Easy cycling on flat terrain' },
        { name: 'Swimming (Easy)', duration: 20, intensity: 'LOW', caloriesPerMin: 6, description: 'Leisurely swimming with breaks' },
        { name: 'Elliptical (Low)', duration: 20, intensity: 'LOW', caloriesPerMin: 5, description: 'Low resistance elliptical training' }
      ],
      INTERMEDIATE: [
        { name: 'Jogging', duration: 30, intensity: 'MODERATE', caloriesPerMin: 8, description: 'Steady-pace jogging' },
        { name: 'Cycling', duration: 35, intensity: 'MODERATE', caloriesPerMin: 7, description: 'Moderate cycling with varied terrain' },
        { name: 'Swimming', duration: 30, intensity: 'MODERATE', caloriesPerMin: 9, description: 'Continuous lap swimming' },
        { name: 'Rowing', duration: 25, intensity: 'MODERATE', caloriesPerMin: 10, description: 'Steady rowing machine workout' },
        { name: 'Jump Rope', duration: 20, intensity: 'MODERATE', caloriesPerMin: 11, description: 'Interval jump rope training' }
      ],
      ADVANCED: [
        { name: 'Running', duration: 40, intensity: 'HIGH', caloriesPerMin: 12, description: 'High-intensity running with intervals' },
        { name: 'HIIT Cardio', duration: 30, intensity: 'VERY_HIGH', caloriesPerMin: 14, description: 'High-intensity interval training' },
        { name: 'Sprint Intervals', duration: 25, intensity: 'VERY_HIGH', caloriesPerMin: 15, description: 'Sprint training with recovery periods' },
        { name: 'Cycling (Intense)', duration: 45, intensity: 'HIGH', caloriesPerMin: 11, description: 'High-intensity cycling with hills' },
        { name: 'Swimming (Intense)', duration: 35, intensity: 'HIGH', caloriesPerMin: 12, description: 'Fast-paced competitive swimming' }
      ]
    },
    STRENGTH: {
      BEGINNER: [
        { name: 'Bodyweight Exercises', duration: 25, intensity: 'LOW', caloriesPerMin: 4, description: 'Basic push-ups, squats, and planks', sets: 2, reps: 10 },
        { name: 'Resistance Bands', duration: 20, intensity: 'LOW', caloriesPerMin: 4, description: 'Light resistance band training', sets: 2, reps: 12 },
        { name: 'Light Dumbbells', duration: 25, intensity: 'LOW', caloriesPerMin: 5, description: 'Basic dumbbell exercises (5-10 lbs)', sets: 2, reps: 12 },
        { name: 'Machine Circuit', duration: 30, intensity: 'LOW', caloriesPerMin: 4, description: 'Gym machine circuit training', sets: 2, reps: 10 }
      ],
      INTERMEDIATE: [
        { name: 'Weight Training', duration: 40, intensity: 'MODERATE', caloriesPerMin: 6, description: 'Compound movements with moderate weight', sets: 3, reps: 10 },
        { name: 'Kettlebell Workout', duration: 30, intensity: 'MODERATE', caloriesPerMin: 7, description: 'Kettlebell swings and exercises', sets: 3, reps: 12 },
        { name: 'Functional Training', duration: 35, intensity: 'MODERATE', caloriesPerMin: 6, description: 'Multi-joint functional movements', sets: 3, reps: 10 },
        { name: 'TRX Suspension', duration: 30, intensity: 'MODERATE', caloriesPerMin: 7, description: 'Suspension training exercises', sets: 3, reps: 12 }
      ],
      ADVANCED: [
        { name: 'Heavy Lifting', duration: 50, intensity: 'HIGH', caloriesPerMin: 7, description: 'Heavy compound lifts (squats, deadlifts, bench)', sets: 4, reps: 6 },
        { name: 'CrossFit WOD', duration: 45, intensity: 'VERY_HIGH', caloriesPerMin: 10, description: 'High-intensity CrossFit workout of the day', sets: 5, reps: 8 },
        { name: 'Olympic Lifting', duration: 40, intensity: 'HIGH', caloriesPerMin: 8, description: 'Clean and jerk, snatch training', sets: 4, reps: 5 },
        { name: 'Powerlifting', duration: 60, intensity: 'HIGH', caloriesPerMin: 6, description: 'Heavy powerlifting routine', sets: 5, reps: 5 }
      ]
    },
    FLEXIBILITY: {
      BEGINNER: [
        { name: 'Basic Stretching', duration: 15, intensity: 'LOW', caloriesPerMin: 2, description: 'Gentle full-body stretching routine' },
        { name: 'Beginner Yoga', duration: 30, intensity: 'LOW', caloriesPerMin: 3, description: 'Gentle yoga flow for beginners' },
        { name: 'Foam Rolling', duration: 15, intensity: 'LOW', caloriesPerMin: 2, description: 'Self-myofascial release with foam roller' }
      ],
      INTERMEDIATE: [
        { name: 'Yoga Flow', duration: 45, intensity: 'MODERATE', caloriesPerMin: 4, description: 'Vinyasa flow yoga practice' },
        { name: 'Pilates', duration: 40, intensity: 'MODERATE', caloriesPerMin: 4, description: 'Core-focused Pilates workout' },
        { name: 'Dynamic Stretching', duration: 25, intensity: 'MODERATE', caloriesPerMin: 3, description: 'Active stretching with movement' }
      ],
      ADVANCED: [
        { name: 'Power Yoga', duration: 60, intensity: 'HIGH', caloriesPerMin: 5, description: 'Intense power yoga session' },
        { name: 'Advanced Pilates', duration: 50, intensity: 'HIGH', caloriesPerMin: 5, description: 'Advanced Pilates with equipment' },
        { name: 'Mobility Training', duration: 40, intensity: 'MODERATE', caloriesPerMin: 4, description: 'Advanced mobility and flexibility work' }
      ]
    },
    SPORTS: {
      BEGINNER: [
        { name: 'Recreational Basketball', duration: 30, intensity: 'MODERATE', caloriesPerMin: 7, description: 'Casual basketball game' },
        { name: 'Recreational Tennis', duration: 30, intensity: 'MODERATE', caloriesPerMin: 6, description: 'Friendly tennis match' },
        { name: 'Recreational Volleyball', duration: 30, intensity: 'MODERATE', caloriesPerMin: 5, description: 'Casual volleyball game' }
      ],
      INTERMEDIATE: [
        { name: 'Basketball', duration: 45, intensity: 'HIGH', caloriesPerMin: 9, description: 'Competitive basketball game' },
        { name: 'Tennis', duration: 45, intensity: 'HIGH', caloriesPerMin: 8, description: 'Competitive tennis match' },
        { name: 'Soccer', duration: 50, intensity: 'HIGH', caloriesPerMin: 9, description: 'Soccer game or practice' },
        { name: 'Racquetball', duration: 40, intensity: 'HIGH', caloriesPerMin: 10, description: 'Fast-paced racquetball match' }
      ],
      ADVANCED: [
        { name: 'Competitive Basketball', duration: 60, intensity: 'VERY_HIGH', caloriesPerMin: 11, description: 'Intense competitive basketball' },
        { name: 'Competitive Soccer', duration: 60, intensity: 'VERY_HIGH', caloriesPerMin: 11, description: 'High-level soccer match' },
        { name: 'Martial Arts', duration: 50, intensity: 'VERY_HIGH', caloriesPerMin: 12, description: 'Intense martial arts training' },
        { name: 'Boxing Training', duration: 45, intensity: 'VERY_HIGH', caloriesPerMin: 13, description: 'High-intensity boxing workout' }
      ]
    }
  };
  
  console.log(`\n💪 Generating ${count} fitness plans with varied intensity levels...`);
  
  // Generate fitness plans
  for (let i = 0; i < count; i++) {
    // Randomly select user and fitness level
    const userId = faker.helpers.arrayElement(userIds);
    const fitnessLevel = faker.helpers.arrayElement(fitnessLevels);
    
    // Get user data for personalized planning
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error(`  ✗ User ${userId} not found`);
      continue;
    }
    
    // Determine plan focus based on user's BMI and goals
    const bmi = user.bmi || calculateBMI(user.weight || 70, user.height || 170);
    const bmiCategory = user.bmiCategory || getBMICategory(bmi);
    
    let planGoal, exerciseTypes;
    if (bmiCategory === 'underweight') {
      planGoal = 'Muscle Building';
      exerciseTypes = ['STRENGTH', 'STRENGTH', 'FLEXIBILITY']; // More strength focus
    } else if (bmiCategory === 'overweight' || bmiCategory === 'obese') {
      planGoal = 'Weight Loss';
      exerciseTypes = ['CARDIO', 'CARDIO', 'STRENGTH', 'FLEXIBILITY']; // More cardio focus
    } else {
      planGoal = 'General Fitness';
      exerciseTypes = ['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'SPORTS']; // Balanced
    }
    
    // Generate weekly workout plan (3-5 workouts per week based on fitness level)
    const workoutsPerWeek = fitnessLevel === 'BEGINNER' ? 3 : fitnessLevel === 'INTERMEDIATE' ? 4 : 5;
    const exercises = [];
    let totalWeeklyCalories = 0;
    let totalWeeklyDuration = 0;
    
    for (let day = 0; day < workoutsPerWeek; day++) {
      // Select exercise type for this day
      const exerciseType = faker.helpers.arrayElement(exerciseTypes);
      
      // Get appropriate exercises for this type and fitness level
      const availableExercises = exerciseDatabase[exerciseType][fitnessLevel];
      if (!availableExercises || availableExercises.length === 0) {
        continue;
      }
      
      const selectedExercise = faker.helpers.arrayElement(availableExercises);
      
      // Add some variation to duration (±10%)
      const durationVariation = faker.number.float({ min: 0.9, max: 1.1, fractionDigits: 2 });
      const actualDuration = Math.round(selectedExercise.duration * durationVariation);
      const caloriesBurned = Math.round(actualDuration * selectedExercise.caloriesPerMin);
      
      totalWeeklyCalories += caloriesBurned;
      totalWeeklyDuration += actualDuration;
      
      const exercise = {
        dayOfWeek: day + 1,
        exerciseType,
        name: selectedExercise.name,
        description: selectedExercise.description,
        duration: actualDuration,
        intensity: selectedExercise.intensity,
        caloriesBurned,
        sets: selectedExercise.sets || null,
        reps: selectedExercise.reps || null,
        restBetweenSets: selectedExercise.sets ? faker.number.int({ min: 30, max: 90 }) : null,
        notes: faker.helpers.maybe(() => 
          faker.helpers.arrayElement([
            'Focus on proper form',
            'Warm up for 5 minutes before starting',
            'Cool down and stretch after workout',
            'Stay hydrated throughout',
            'Listen to your body and adjust intensity as needed'
          ]), 
          { probability: 0.4 }
        )
      };
      
      exercises.push(exercise);
    }
    
    // Create the fitness plan document
    const fitnessPlan = {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      planName: `${fitnessLevel} ${planGoal} Plan`,
      goal: planGoal,
      fitnessLevel,
      duration: '1 week',
      workoutsPerWeek,
      totalWeeklyDuration,
      totalWeeklyCalories,
      exercises,
      recommendations: [
        `This ${fitnessLevel.toLowerCase()} plan is designed for ${planGoal.toLowerCase()}`,
        `Complete ${workoutsPerWeek} workouts per week for best results`,
        'Rest days are important for recovery and muscle growth',
        'Combine with proper nutrition for optimal results',
        'Gradually increase intensity as you progress'
      ],
      createdAt: randomDateInPast(30),
      updatedAt: new Date(),
      isActive: true
    };
    
    try {
      const result = await fitnessPlansCollection.insertOne(fitnessPlan);
      planIds.push(result.insertedId.toString());
      
      // Log first and last plan for verification
      if (i === 0 || i === count - 1) {
        console.log(`  ✓ Plan ${i + 1}: ${fitnessPlan.planName} - ${workoutsPerWeek} workouts/week, ${totalWeeklyDuration} min, ${totalWeeklyCalories} cal`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create fitness plan:`, error.message);
    }
  }
  
  console.log(`✅ Created ${planIds.length} fitness plans in MongoDB`);
  
  return planIds;
}

/**
 * Generate community posts with realistic content and engagement data
 * Stores posts in MongoDB community_posts collection
 * @param {Array} userIds - Array of user IDs
 * @param {number} count - Number of posts to generate (default: 10)
 * @returns {Promise<Array>} Array of created post IDs
 */
async function generateCommunityPosts(userIds, count = CONFIG.communityPosts.count) {
  const postIds = [];
  
  // Get MongoDB connection
  const db = getDatabaseConnection();
  const mongodb = db.getMongo();
  const communityPostsCollection = mongodb.collection('community_posts');
  
  // Comprehensive post templates with realistic content
  const postTemplates = [
    {
      category: 'SUCCESS_STORY',
      title: 'Lost 10 pounds this month! 🎉',
      content: 'I am so proud of my progress! Started at 180 lbs and now I\'m at 170 lbs. The key was consistency - working out 4 times a week and tracking my meals. Consistent exercise and healthy eating really works! If I can do it, you can too!',
      tags: ['weightloss', 'success', 'motivation', 'fitness']
    },
    {
      category: 'SUCCESS_STORY',
      title: 'Ran my first 5K today! 🏃‍♀️',
      content: 'Three months ago, I could barely run for 5 minutes. Today I completed my first 5K in 32 minutes! The Couch to 5K program really works. Feeling accomplished and ready for the next challenge!',
      tags: ['running', 'success', '5k', 'cardio', 'achievement']
    },
    {
      category: 'FITNESS',
      title: 'Best morning workout routine?',
      content: 'What are your favorite exercises to start the day? I\'m looking for a 20-30 minute routine that I can do at home. Currently doing some yoga but want to add more variety. Any recommendations?',
      tags: ['fitness', 'workout', 'morning', 'routine', 'advice']
    },
    {
      category: 'FITNESS',
      title: 'Strength training tips for beginners',
      content: 'Just started lifting weights and loving it! Here are my top tips: 1) Start with lighter weights and focus on form, 2) Don\'t skip leg day, 3) Rest is just as important as training, 4) Track your progress. What would you add to this list?',
      tags: ['strength', 'weightlifting', 'beginner', 'tips', 'gym']
    },
    {
      category: 'NUTRITION',
      title: 'Healthy meal prep ideas for busy weeks',
      content: 'Sharing my weekly meal prep routine that saves me so much time! Sunday: Cook chicken breast, brown rice, and roast vegetables. Portion into containers for lunch. Prep overnight oats for breakfast. Game changer for staying on track!',
      tags: ['nutrition', 'mealprep', 'healthy', 'cooking', 'tips']
    },
    {
      category: 'NUTRITION',
      title: 'High protein vegetarian meals?',
      content: 'Recently went vegetarian and struggling to hit my protein goals (120g/day). What are your favorite high-protein vegetarian meals? Already eating lots of tofu, lentils, and Greek yogurt. Need more variety!',
      tags: ['nutrition', 'vegetarian', 'protein', 'diet', 'advice']
    },
    {
      category: 'MENTAL_HEALTH',
      title: 'Meditation has changed my life 🧘‍♂️',
      content: 'Started meditating daily 6 months ago and my stress levels have decreased significantly. I use the Headspace app for 10 minutes every morning. My sleep quality improved, anxiety reduced, and I feel more focused throughout the day. Highly recommend!',
      tags: ['mentalhealth', 'meditation', 'mindfulness', 'wellness', 'stress']
    },
    {
      category: 'MENTAL_HEALTH',
      title: 'Dealing with workout burnout',
      content: 'Been feeling exhausted and unmotivated lately. Used to love my workouts but now they feel like a chore. How do you deal with burnout? Should I take a break or push through? Any advice appreciated.',
      tags: ['mentalhealth', 'burnout', 'motivation', 'advice', 'rest']
    },
    {
      category: 'TIP',
      title: 'Stay hydrated! 💧',
      content: 'Reminder: Drink at least 8 glasses of water daily! I started using a water tracking app and it made a huge difference. Better energy, clearer skin, and improved workout performance. Pro tip: Add lemon or cucumber for flavor!',
      tags: ['hydration', 'water', 'health', 'tips', 'wellness']
    },
    {
      category: 'TIP',
      title: 'Sleep is the secret weapon',
      content: 'After tracking my sleep for 3 months, I realized I perform 10x better with 7-8 hours of quality sleep. Better recovery, more energy, better mood. Don\'t sacrifice sleep for early morning workouts if you\'re exhausted!',
      tags: ['sleep', 'recovery', 'health', 'tips', 'wellness']
    },
    {
      category: 'RECIPE',
      title: 'Protein-packed smoothie recipe 🥤',
      content: 'My go-to post-workout smoothie: 1 banana, 1 scoop vanilla protein powder, 1 cup almond milk, handful of spinach, 1 tbsp peanut butter, ice. Blend and enjoy! 350 calories, 30g protein. Tastes like a milkshake!',
      tags: ['recipe', 'smoothie', 'protein', 'postworkout', 'nutrition']
    },
    {
      category: 'RECIPE',
      title: 'Easy high-protein breakfast',
      content: 'Overnight oats recipe: 1/2 cup oats, 1 scoop protein powder, 1 cup almond milk, chia seeds, berries. Mix and refrigerate overnight. Ready to eat in the morning! 400 cal, 35g protein, 45g carbs. Perfect for busy mornings.',
      tags: ['recipe', 'breakfast', 'oats', 'protein', 'mealprep']
    },
    {
      category: 'QUESTION',
      title: 'How to stay motivated?',
      content: 'Sometimes I struggle to stay consistent with my health journey. What keeps you motivated when you don\'t feel like working out or eating healthy? Looking for practical tips and mindset shifts.',
      tags: ['motivation', 'advice', 'mindset', 'consistency', 'help']
    },
    {
      category: 'QUESTION',
      title: 'Best fitness tracker?',
      content: 'Looking to buy a fitness tracker to monitor my workouts, sleep, and heart rate. Considering Apple Watch, Fitbit, or Garmin. What do you use and would you recommend it? Budget is around $300.',
      tags: ['fitness', 'technology', 'tracker', 'advice', 'gear']
    },
    {
      category: 'GENERAL',
      title: 'New to the community! 👋',
      content: 'Hi everyone! Just joined and excited to start my wellness journey with this amazing community. My goals are to lose 20 pounds, build strength, and improve my overall health. Looking forward to learning from all of you!',
      tags: ['introduction', 'newmember', 'goals', 'community', 'wellness']
    },
    {
      category: 'GENERAL',
      title: 'Celebrating 1 year of consistency! 🎊',
      content: 'One year ago today, I made a commitment to prioritize my health. 365 days later: lost 35 pounds, ran 3 half marathons, and feel better than ever. This community has been incredible. Thank you all for the support and inspiration!',
      tags: ['milestone', 'success', 'anniversary', 'gratitude', 'community']
    }
  ];
  
  // Sample comment templates for engagement
  const commentTemplates = [
    'Great job! Keep it up! 💪',
    'This is so inspiring! Thank you for sharing.',
    'I needed to see this today. Thanks!',
    'Amazing progress! What\'s your secret?',
    'Congratulations! You should be proud.',
    'This is exactly what I was looking for!',
    'Thanks for the tips! Going to try this.',
    'Love this! Saved for later.',
    'You\'re crushing it! 🔥',
    'So helpful! Thank you!'
  ];
  
  console.log(`\n💬 Generating ${count} community posts with engagement data...`);
  
  // Generate dates over past month
  const dates = [];
  for (let i = 0; i < count; i++) {
    dates.push(randomDateInPast(30));
  }
  dates.sort((a, b) => b - a); // Sort reverse chronologically (newest first)
  
  // Generate community posts
  for (let i = 0; i < count; i++) {
    // Select random user and post template
    const userId = faker.helpers.arrayElement(userIds);
    const template = faker.helpers.arrayElement(postTemplates);
    
    // Get user data for author information
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error(`  ✗ User ${userId} not found`);
      continue;
    }
    
    // Generate realistic engagement metrics
    const likesCount = faker.number.int({ min: 5, max: 150 });
    const commentsCount = faker.number.int({ min: 0, max: 50 });
    const sharesCount = faker.number.int({ min: 0, max: 20 });
    const viewsCount = faker.number.int({ min: likesCount * 2, max: likesCount * 10 });
    
    // Generate array of user IDs who liked the post
    const likedByUsers = faker.helpers.arrayElements(
      userIds.filter(id => id !== userId), 
      Math.min(likesCount, userIds.length - 1)
    );
    
    // Generate comments with realistic content
    const comments = [];
    for (let c = 0; c < Math.min(commentsCount, 10); c++) { // Limit to 10 comments per post
      const commentUserId = faker.helpers.arrayElement(userIds.filter(id => id !== userId));
      const commentUser = await prisma.user.findUnique({ where: { id: commentUserId } });
      
      if (commentUser) {
        comments.push({
          commentId: faker.string.uuid(),
          userId: commentUserId,
          userName: `${commentUser.firstName} ${commentUser.lastName}`,
          userAvatar: commentUser.profileImage,
          content: faker.helpers.arrayElement(commentTemplates),
          likes: faker.number.int({ min: 0, max: 20 }),
          createdAt: new Date(dates[i].getTime() + faker.number.int({ min: 60000, max: 86400000 })), // Comment after post
          updatedAt: new Date()
        });
      }
    }
    
    // Create the community post document
    const communityPost = {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.profileImage,
      title: template.title,
      content: template.content,
      category: template.category,
      tags: template.tags,
      
      // Engagement metrics
      likes: likesCount,
      likedBy: likedByUsers,
      comments: commentsCount,
      commentsList: comments,
      shares: sharesCount,
      views: viewsCount,
      
      // Media
      images: faker.helpers.maybe(() => [
        faker.image.urlLoremFlickr({ category: 'fitness' }),
        faker.image.urlLoremFlickr({ category: 'health' })
      ], { probability: 0.3 }) || [],
      
      // Status and moderation
      isPublished: true,
      isFeatured: faker.helpers.maybe(() => true, { probability: 0.2 }) || false,
      isPinned: faker.helpers.maybe(() => true, { probability: 0.1 }) || false,
      moderationStatus: 'APPROVED',
      
      // Timestamps
      createdAt: dates[i],
      updatedAt: new Date(),
      lastActivityAt: comments.length > 0 ? comments[comments.length - 1].createdAt : dates[i]
    };
    
    try {
      const result = await communityPostsCollection.insertOne(communityPost);
      postIds.push(result.insertedId.toString());
      
      // Log first and last post for verification
      if (i === 0 || i === count - 1) {
        console.log(`  ✓ Post ${i + 1}: "${communityPost.title}" by ${communityPost.userName}`);
        console.log(`     Engagement: ${likesCount} likes, ${commentsCount} comments, ${sharesCount} shares, ${viewsCount} views`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create community post:`, error.message);
    }
  }
  
  console.log(`✅ Created ${postIds.length} community posts in MongoDB with realistic engagement data`);
  
  return postIds;
}

/**
 * Generate mental wellness entries for a user
 * @param {string} userId - User ID
 * @param {number} count - Number of entries to generate
 * @returns {Promise<Array>} Array of created entry IDs
 */
async function generateMentalWellnessEntries(userId, count = CONFIG.mentalWellness.recordsPerUser) {
  const entryIds = [];
  
  // Generate dates over past month
  const dates = [];
  for (let i = 0; i < count; i++) {
    dates.push(randomDateInPast(CONFIG.mentalWellness.daysBack));
  }
  dates.sort((a, b) => a - b);
  
  for (let i = 0; i < count; i++) {
    const entryData = {
      userId,
      mood: faker.number.int({ min: 5, max: 10 }),
      anxiety: faker.number.int({ min: 1, max: 7 }),
      stress: faker.number.int({ min: 2, max: 8 }),
      depression: faker.number.int({ min: 1, max: 5 }),
      energy: faker.number.int({ min: 5, max: 10 }),
      focus: faker.number.int({ min: 5, max: 10 }),
      sleepHours: faker.number.float({ min: 6, max: 9, fractionDigits: 1 }),
      sleepQuality: faker.number.int({ min: 6, max: 10 }),
      meditation: faker.helpers.maybe(() => faker.number.int({ min: 10, max: 30 }), { probability: 0.5 }),
      journaling: faker.datatype.boolean(),
      socialTime: faker.number.int({ min: 30, max: 180 }),
      outdoorTime: faker.number.int({ min: 15, max: 120 }),
      symptoms: faker.helpers.arrayElements(['None', 'Anxiety', 'Stress', 'Fatigue', 'Good mood', 'Relaxed'], 
        faker.number.int({ min: 0, max: 2 })),
      triggers: faker.helpers.arrayElements(['Work', 'Family', 'Health', 'Finances', 'None'], 
        faker.number.int({ min: 0, max: 2 })),
      copingStrategies: faker.helpers.arrayElements(['Exercise', 'Meditation', 'Talking to friends', 'Journaling', 'Deep breathing'], 
        faker.number.int({ min: 1, max: 3 })),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
      recordedAt: dates[i]
    };
    
    try {
      const entry = await prisma.mentalHealthRecord.create({ data: entryData });
      entryIds.push(entry.id);
    } catch (error) {
      console.error(`  ✗ Failed to create mental wellness entry:`, error.message);
    }
  }
  
  return entryIds;
}

/**
 * Generate consultation records for a user
 * Creates realistic video consultation history with doctor names, dates, duration, and notes
 * @param {string} userId - User ID
 * @param {number} count - Number of consultations to generate (default: 5)
 * @returns {Promise<Array>} Array of created consultation IDs
 */
async function generateConsultationRecords(userId, count = CONFIG.consultations.recordsPerUser) {
  const consultationIds = [];
  
  // Comprehensive list of medical specializations
  const specializations = [
    'General Physician',
    'Nutritionist',
    'Fitness Trainer',
    'Mental Health Counselor',
    'Cardiologist',
    'Endocrinologist',
    'Physical Therapist',
    'Sports Medicine Specialist'
  ];
  
  // Diverse list of healthcare professionals
  const professionals = [
    { name: 'Dr. Sarah Johnson', specialization: 'General Physician' },
    { name: 'Dr. Michael Chen', specialization: 'Cardiologist' },
    { name: 'Dr. Emily Rodriguez', specialization: 'Nutritionist' },
    { name: 'Dr. James Wilson', specialization: 'Mental Health Counselor' },
    { name: 'Dr. Priya Patel', specialization: 'Endocrinologist' },
    { name: 'Dr. David Kim', specialization: 'Sports Medicine Specialist' },
    { name: 'Dr. Lisa Anderson', specialization: 'Physical Therapist' },
    { name: 'Dr. Robert Martinez', specialization: 'Fitness Trainer' }
  ];
  
  // Consultation notes templates by specialization
  const notesBySpecialization = {
    'General Physician': [
      'Patient is making good progress with treatment plan. Vital signs are stable.',
      'Discussed recent symptoms and adjusted medication dosage accordingly.',
      'Annual health checkup completed. All tests within normal ranges.',
      'Patient reported improvement in overall health. Continue current regimen.',
      'Reviewed lab results. Recommended lifestyle modifications for better health.'
    ],
    'Nutritionist': [
      'Discussed nutrition goals and created personalized meal plan.',
      'Reviewed food diary. Making excellent progress toward weight goals.',
      'Adjusted macronutrient ratios to support fitness objectives.',
      'Patient showing improved energy levels with new diet plan.',
      'Discussed meal prep strategies and healthy eating habits.'
    ],
    'Fitness Trainer': [
      'Reviewed exercise routine and made adjustments for better results.',
      'Patient demonstrating improved strength and endurance.',
      'Created new workout plan focusing on cardiovascular health.',
      'Discussed proper form and injury prevention techniques.',
      'Set new fitness goals for the next month. Patient is motivated.'
    ],
    'Mental Health Counselor': [
      'Patient reported improvement in stress management and mood.',
      'Discussed coping strategies for anxiety. Making good progress.',
      'Reviewed mindfulness techniques and sleep hygiene practices.',
      'Patient showing positive response to therapy sessions.',
      'Discussed work-life balance and stress reduction techniques.'
    ],
    'Cardiologist': [
      'Cardiovascular health assessment completed. Heart function is good.',
      'Reviewed blood pressure readings. Medication is effective.',
      'Discussed exercise recommendations for heart health.',
      'Patient showing improvement in cardiovascular fitness.',
      'Scheduled follow-up for routine cardiac monitoring.'
    ],
    'Endocrinologist': [
      'Thyroid function tests reviewed. Levels are within normal range.',
      'Discussed hormone balance and metabolic health.',
      'Adjusted medication for optimal hormone regulation.',
      'Patient showing improvement in energy and metabolism.',
      'Reviewed diabetes management plan. Blood sugar control is good.'
    ],
    'Physical Therapist': [
      'Rehabilitation progress is excellent. Range of motion improving.',
      'Demonstrated new exercises for injury recovery.',
      'Patient showing reduced pain and increased mobility.',
      'Discussed home exercise program for continued improvement.',
      'Reviewed posture and ergonomics for injury prevention.'
    ],
    'Sports Medicine Specialist': [
      'Injury assessment completed. Recovery is on track.',
      'Discussed return-to-sport timeline and training modifications.',
      'Patient cleared for gradual increase in activity level.',
      'Reviewed injury prevention strategies for athletic performance.',
      'Discussed nutrition and recovery protocols for athletes.'
    ]
  };
  
  // Prescription templates by specialization
  const prescriptionsBySpecialization = {
    'General Physician': [
      'Continue current medication as prescribed',
      'Vitamin D supplement - 1000 IU daily',
      'Multivitamin - once daily with breakfast',
      'Increase water intake to 8 glasses per day'
    ],
    'Nutritionist': [
      'Increase protein intake to 1.5g per kg body weight',
      'Add omega-3 supplement - 1000mg daily',
      'Probiotic supplement - once daily',
      'Reduce processed sugar intake to less than 25g per day'
    ],
    'Fitness Trainer': [
      'BCAA supplement - pre and post workout',
      'Increase daily step count to 10,000 steps',
      'Foam rolling routine - 10 minutes daily',
      'Stretching exercises - 15 minutes after each workout'
    ],
    'Mental Health Counselor': [
      'Practice stress management techniques daily',
      'Meditation - 10 minutes twice daily',
      'Journaling - write for 15 minutes before bed',
      'Deep breathing exercises when feeling anxious'
    ],
    'Cardiologist': [
      'Continue blood pressure medication as prescribed',
      'CoQ10 supplement - 100mg daily',
      'Reduce sodium intake to less than 2000mg per day',
      'Moderate aerobic exercise - 30 minutes, 5 days per week'
    ],
    'Endocrinologist': [
      'Continue thyroid medication - take on empty stomach',
      'Monitor blood sugar levels twice daily',
      'Vitamin B12 supplement - 1000mcg daily',
      'Maintain consistent meal timing for metabolic health'
    ],
    'Physical Therapist': [
      'Ice therapy - 15 minutes, 3 times daily',
      'Prescribed stretching routine - twice daily',
      'Gradual progression of strengthening exercises',
      'Use proper body mechanics during daily activities'
    ],
    'Sports Medicine Specialist': [
      'Rest and ice for 48 hours post-activity',
      'Compression sleeve during physical activity',
      'Gradual return to training protocol',
      'Anti-inflammatory as needed for pain management'
    ]
  };
  
  // Generate consultation records over past 2 months
  for (let i = 0; i < count; i++) {
    const scheduledDate = randomDateInPast(60); // Past 2 months
    const duration = faker.number.int({ min: 15, max: 60 });
    
    // Select a professional and their specialization
    const professional = faker.helpers.arrayElement(professionals);
    const specialization = professional.specialization;
    
    // Get appropriate notes and prescription for this specialization
    const notes = faker.helpers.arrayElement(notesBySpecialization[specialization] || notesBySpecialization['General Physician']);
    const prescription = faker.helpers.maybe(() => 
      faker.helpers.arrayElement(prescriptionsBySpecialization[specialization] || prescriptionsBySpecialization['General Physician']),
      { probability: 0.5 }
    );
    
    const consultationData = {
      userId,
      type: faker.helpers.arrayElement(['VIDEO_CALL', 'PHONE_CALL', 'CHAT']),
      specialization,
      duration,
      scheduledAt: scheduledDate,
      startedAt: new Date(scheduledDate.getTime() + faker.number.int({ min: 0, max: 10 }) * 60000), // 0-10 minutes after scheduled
      endedAt: new Date(scheduledDate.getTime() + (duration + faker.number.int({ min: 0, max: 10 })) * 60000),
      professionalName: professional.name,
      professionalId: faker.string.uuid(),
      notes,
      prescription,
      followUpDate: faker.helpers.maybe(() => 
        new Date(scheduledDate.getTime() + faker.number.int({ min: 7, max: 30 }) * 24 * 60 * 60 * 1000), // 1-4 weeks later
        { probability: 0.6 }
      ),
      status: 'COMPLETED',
      roomId: faker.string.alphanumeric(10)
    };
    
    try {
      const consultation = await prisma.consultation.create({ data: consultationData });
      consultationIds.push(consultation.id);
    } catch (error) {
      console.error(`  ✗ Failed to create consultation record:`, error.message);
      if (process.env.DEBUG) {
        console.error('    Full error:', error);
      }
    }
  }
  
  return consultationIds;
}

/**
 * Main population function
 * Orchestrates all data generation
 */
async function populateAllData() {
  console.log('🚀 Starting data population for Demo Day...\n');
  console.log('=' .repeat(60));
  
  const report = {
    timestamp: new Date().toISOString(),
    status: 'success',
    entities: {}
  };
  
  // Initialize database connection
  const db = getDatabaseConnection();
  
  try {
    // Connect to databases
    await db.connectPostgres();
    prisma = db.getPrisma();
    
    // Step 1: Generate users
    const userIds = await generateUserProfiles();
    report.entities.users = {
      target: CONFIG.users.count,
      created: userIds.length,
      status: userIds.length >= CONFIG.users.count ? 'success' : 'partial'
    };
    
    // Step 2: Generate health metrics for each user
    console.log(`\n📊 Generating health metrics (vitals, weight, exercise)...`);
    let totalHealthRecords = 0;
    let totalWeightRecords = 0;
    let totalExerciseRecords = 0;
    
    for (const userId of userIds) {
      const records = await generateHealthMetrics(userId);
      totalHealthRecords += records.healthRecords.length;
      totalWeightRecords += records.weightRecords.length;
      totalExerciseRecords += records.exerciseRecords.length;
    }
    
    console.log(`✅ Created ${totalHealthRecords} health records (vitals)`);
    console.log(`✅ Created ${totalWeightRecords} weight records`);
    console.log(`✅ Created ${totalExerciseRecords} exercise records`);
    
    const totalHealthMetrics = totalHealthRecords + totalWeightRecords + totalExerciseRecords;
    report.entities.healthMetrics = {
      target: CONFIG.users.count * CONFIG.healthMetrics.recordsPerUser * 3, // 3 types of records
      created: totalHealthMetrics,
      breakdown: {
        vitals: totalHealthRecords,
        weight: totalWeightRecords,
        exercise: totalExerciseRecords
      },
      status: totalHealthMetrics >= (CONFIG.users.count * CONFIG.healthMetrics.recordsPerUser * 3) ? 'success' : 'partial'
    };
    
    // Step 3: Generate nutrition plans for each user
    console.log(`\n🍎 Generating nutrition records...`);
    let totalNutritionRecords = 0;
    
    for (const userId of userIds) {
      const nutritionIds = await generateNutritionPlans(userId);
      totalNutritionRecords += nutritionIds.length;
    }
    
    console.log(`✅ Created ${totalNutritionRecords} nutrition records`);
    report.entities.nutritionPlans = {
      target: CONFIG.users.count * CONFIG.nutritionPlans.count,
      created: totalNutritionRecords,
      status: totalNutritionRecords >= (CONFIG.users.count * CONFIG.nutritionPlans.count) ? 'success' : 'partial'
    };
    
    // Step 4: Connect to MongoDB and generate fitness plans
    console.log(`\n💪 Connecting to MongoDB for fitness plans...`);
    await db.connectMongo();
    const fitnessPlanIds = await generateFitnessPlans(userIds);
    console.log(`✅ Created ${fitnessPlanIds.length} fitness plans`);
    report.entities.fitnessPlans = {
      target: CONFIG.fitnessPlans.count,
      created: fitnessPlanIds.length,
      status: fitnessPlanIds.length >= CONFIG.fitnessPlans.count ? 'success' : 'partial'
    };
    
    // Step 5: Generate community posts
    console.log(`\n💬 Generating community posts...`);
    const postIds = await generateCommunityPosts(userIds);
    console.log(`✅ Created ${postIds.length} community posts`);
    report.entities.communityPosts = {
      target: CONFIG.communityPosts.count,
      created: postIds.length,
      status: postIds.length >= CONFIG.communityPosts.count ? 'success' : 'partial'
    };
    
    // Step 6: Generate mental wellness entries for each user
    console.log(`\n🧠 Generating mental wellness entries...`);
    let totalWellnessEntries = 0;
    
    for (const userId of userIds) {
      const entryIds = await generateMentalWellnessEntries(userId);
      totalWellnessEntries += entryIds.length;
    }
    
    console.log(`✅ Created ${totalWellnessEntries} mental wellness entries`);
    report.entities.mentalWellness = {
      target: CONFIG.users.count * CONFIG.mentalWellness.recordsPerUser,
      created: totalWellnessEntries,
      status: totalWellnessEntries >= (CONFIG.users.count * CONFIG.mentalWellness.recordsPerUser) ? 'success' : 'partial'
    };
    
    // Step 7: Generate consultation records for each user
    console.log(`\n👨‍⚕️ Generating consultation records...`);
    let totalConsultations = 0;
    
    for (const userId of userIds) {
      const consultationIds = await generateConsultationRecords(userId);
      totalConsultations += consultationIds.length;
    }
    
    console.log(`✅ Created ${totalConsultations} consultation records`);
    report.entities.consultations = {
      target: CONFIG.users.count * CONFIG.consultations.recordsPerUser,
      created: totalConsultations,
      status: totalConsultations >= (CONFIG.users.count * CONFIG.consultations.recordsPerUser) ? 'success' : 'partial'
    };
    
    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📋 DATA POPULATION REPORT');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Status: ${report.status.toUpperCase()}\n`);
    
    for (const [entity, data] of Object.entries(report.entities)) {
      console.log(`${entity}:`);
      console.log(`  Target: ${data.target}`);
      console.log(`  Created: ${data.created}`);
      console.log(`  Status: ${data.status.toUpperCase()}`);
    }
    
    // Save report to file
    const reportPath = path.join(__dirname, 'reports', 'population-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
    
    console.log('\n✅ Data population completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Data population failed:', error);
    report.status = 'failed';
    report.error = error.message;
    throw error;
  } finally {
    await db.disconnectAll();
  }
  
  return report;
}

// Run if called directly
if (require.main === module) {
  populateAllData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

// Export functions for testing
module.exports = {
  setPrismaClient,
  generateUserProfiles,
  generateHealthMetrics,
  generateNutritionPlans,
  generateFitnessPlans,
  generateCommunityPosts,
  generateMentalWellnessEntries,
  generateConsultationRecords,
  populateAllData,
  calculateBMI,
  getBMICategory,
  kgToLbs,
  cmToFeetInches
};
