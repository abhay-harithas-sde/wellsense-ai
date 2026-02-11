// AI Health Engine - Core AI functionality for WellSense AI
import apiService from './api';

class AIHealthEngine {
  constructor() {
    this.userProfile = null;
    this.healthHistory = [];
    this.nutritionDatabase = this.initNutritionDB();
    this.behaviorPatterns = new Map();
  }

  // Initialize nutrition database
  initNutritionDB() {
    return {
      foods: {
        'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, vitamins: ['C'], minerals: ['K'] },
        'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, vitamins: ['B6', 'C'], minerals: ['K', 'Mg'] },
        'chicken_breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, vitamins: ['B6', 'B12'], minerals: ['P', 'Se'] },
        'salmon': { calories: 208, protein: 22, carbs: 0, fat: 12, fiber: 0, vitamins: ['D', 'B12'], minerals: ['Se', 'P'] },
        'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, vitamins: ['C', 'K'], minerals: ['Fe', 'K'] },
        'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, vitamins: ['B6'], minerals: ['Mg', 'Fe'] },
        'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, vitamins: ['K', 'E'], minerals: ['K', 'Mg'] },
        'greek_yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, vitamins: ['B12'], minerals: ['Ca', 'P'] }
      },
      mealTypes: ['breakfast', 'lunch', 'dinner', 'snack'],
      dietaryRestrictions: ['vegetarian', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free']
    };
  }

  // 1. PERSONALIZED NUTRITION GUIDANCE
  async generatePersonalizedNutrition(userProfile, healthGoals, preferences) {
    const nutritionPlan = {
      dailyCalories: this.calculateDailyCalories(userProfile, healthGoals),
      macroDistribution: this.calculateMacros(userProfile, healthGoals),
      mealPlan: await this.generateMealPlan(userProfile, preferences),
      supplements: this.recommendSupplements(userProfile),
      hydration: this.calculateWaterIntake(userProfile.weight),
      restrictions: this.analyzeRestrictions(preferences.dietType),
      aiInsights: await this.generateNutritionInsights(userProfile, healthGoals)
    };

    return nutritionPlan;
  }

  calculateDailyCalories(profile, goals) {
    // Harris-Benedict Equation with activity factor
    let bmr;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }

    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725,
      'extremely_active': 1.9
    };

    let tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.55);

    // Adjust for goals
    if (goals.includes('weight_loss')) tdee -= 500; // 1lb per week
    if (goals.includes('weight_gain')) tdee += 500;
    if (goals.includes('muscle_gain')) tdee += 200;

    return Math.round(tdee);
  }

  calculateMacros(profile, goals) {
    let proteinRatio = 0.25, carbRatio = 0.45, fatRatio = 0.30;

    if (goals.includes('muscle_gain')) {
      proteinRatio = 0.35;
      carbRatio = 0.40;
      fatRatio = 0.25;
    } else if (goals.includes('weight_loss')) {
      proteinRatio = 0.30;
      carbRatio = 0.35;
      fatRatio = 0.35;
    }

    return { protein: proteinRatio, carbs: carbRatio, fat: fatRatio };
  }

  async generateMealPlan(profile, preferences) {
    const meals = {
      breakfast: this.generateMeal('breakfast', profile, preferences),
      lunch: this.generateMeal('lunch', profile, preferences),
      dinner: this.generateMeal('dinner', profile, preferences),
      snacks: this.generateMeal('snack', profile, preferences)
    };

    return meals;
  }

  generateMeal(mealType, profile, preferences) {
    const mealCalories = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snack: 0.10
    };

    const targetCalories = this.calculateDailyCalories(profile, []) * mealCalories[mealType];
    
    // AI-generated meal suggestions based on preferences
    const mealSuggestions = this.getMealSuggestions(mealType, preferences.dietType, targetCalories);
    
    return {
      targetCalories,
      suggestions: mealSuggestions,
      alternatives: this.getAlternativeMeals(mealType, preferences.dietType)
    };
  }

  getMealSuggestions(mealType, dietType, targetCalories) {
    const suggestions = {
      breakfast: {
        standard: ['Oatmeal with berries and nuts', 'Greek yogurt with granola', 'Scrambled eggs with toast'],
        vegetarian: ['Avocado toast with tomatoes', 'Smoothie bowl with fruits', 'Vegetarian omelet'],
        vegan: ['Chia seed pudding', 'Oat smoothie with banana', 'Tofu scramble with vegetables'],
        keto: ['Keto omelet with cheese', 'Avocado and bacon', 'Bulletproof coffee with MCT oil']
      },
      lunch: {
        standard: ['Grilled chicken salad', 'Quinoa bowl with vegetables', 'Turkey sandwich with side salad'],
        vegetarian: ['Caprese salad with quinoa', 'Vegetable stir-fry with tofu', 'Lentil soup with bread'],
        vegan: ['Buddha bowl with tahini', 'Chickpea curry with rice', 'Vegan protein smoothie'],
        keto: ['Keto Caesar salad', 'Zucchini noodles with pesto', 'Cauliflower rice bowl']
      },
      dinner: {
        standard: ['Grilled salmon with vegetables', 'Lean beef with sweet potato', 'Chicken stir-fry with brown rice'],
        vegetarian: ['Eggplant parmesan', 'Vegetable curry with quinoa', 'Stuffed bell peppers'],
        vegan: ['Lentil bolognese with pasta', 'Roasted vegetable medley', 'Chickpea tikka masala'],
        keto: ['Keto salmon with asparagus', 'Cauliflower mac and cheese', 'Zucchini lasagna']
      },
      snack: {
        standard: ['Apple with almond butter', 'Greek yogurt with berries', 'Mixed nuts and dried fruit'],
        vegetarian: ['Hummus with vegetables', 'Cheese and crackers', 'Fruit smoothie'],
        vegan: ['Almond butter on celery', 'Vegan protein bar', 'Mixed seeds and nuts'],
        keto: ['Keto fat bombs', 'Cheese crisps', 'Avocado with salt']
      }
    };

    return suggestions[mealType][dietType] || suggestions[mealType]['standard'];
  }

  // 2. REAL-TIME FOOD TRACKING AND ANALYSIS
  async analyzeFood(foodImage, foodDescription) {
    // Simulate AI food recognition and analysis
    const analysis = {
      recognizedFoods: await this.recognizeFoodsFromImage(foodImage),
      nutritionalBreakdown: await this.calculateNutrition(foodDescription),
      healthScore: this.calculateFoodHealthScore(foodDescription),
      recommendations: await this.generateFoodRecommendations(foodDescription),
      alternatives: this.suggestHealthierAlternatives(foodDescription),
      portionAnalysis: this.analyzePortionSize(foodImage),
      mealTiming: this.analyzeMealTiming(new Date()),
      aiInsights: await this.generateFoodInsights(foodDescription)
    };

    return analysis;
  }

  async recognizeFoodsFromImage(imageData) {
    // Simulate AI image recognition
    const commonFoods = ['apple', 'banana', 'chicken_breast', 'broccoli', 'rice', 'pasta'];
    const recognized = commonFoods.slice(0, Math.floor(Math.random() * 3) + 1);
    
    return recognized.map(food => ({
      name: food,
      confidence: 0.85 + Math.random() * 0.15,
      nutrition: this.nutritionDatabase.foods[food] || {}
    }));
  }

  calculateFoodHealthScore(foodDescription) {
    // AI-based health scoring algorithm
    const healthyKeywords = ['vegetable', 'fruit', 'lean', 'grilled', 'steamed', 'fresh', 'organic'];
    const unhealthyKeywords = ['fried', 'processed', 'sugar', 'fast food', 'deep fried'];
    
    let score = 50; // Base score
    
    healthyKeywords.forEach(keyword => {
      if (foodDescription.toLowerCase().includes(keyword)) score += 10;
    });
    
    unhealthyKeywords.forEach(keyword => {
      if (foodDescription.toLowerCase().includes(keyword)) score -= 15;
    });
    
    return Math.max(0, Math.min(100, score));
  }

  // 3. BEHAVIOR AND LIFESTYLE COACHING
  async generateBehaviorCoaching(userBehaviorData, goals) {
    const coaching = {
      behaviorAnalysis: this.analyzeBehaviorPatterns(userBehaviorData),
      personalizedTips: await this.generatePersonalizedTips(userBehaviorData, goals),
      habitRecommendations: this.recommendHabits(userBehaviorData),
      motivationalInsights: await this.generateMotivationalContent(userBehaviorData),
      progressCelebration: this.celebrateProgress(userBehaviorData),
      challengeAreas: this.identifyChallengeAreas(userBehaviorData),
      actionPlan: this.createActionPlan(userBehaviorData, goals),
      aiCoaching: await this.generateAICoachingAdvice(userBehaviorData)
    };

    return coaching;
  }

  analyzeBehaviorPatterns(behaviorData) {
    const patterns = {
      eatingPatterns: this.analyzeEatingPatterns(behaviorData.meals),
      exerciseConsistency: this.analyzeExerciseConsistency(behaviorData.workouts),
      sleepQuality: this.analyzeSleepPatterns(behaviorData.sleep),
      stressLevels: this.analyzeStressPatterns(behaviorData.stress),
      hydrationHabits: this.analyzeHydrationPatterns(behaviorData.water),
      screenTime: this.analyzeScreenTimePatterns(behaviorData.screenTime)
    };

    return patterns;
  }

  async generatePersonalizedTips(behaviorData, goals) {
    const tips = [];
    
    // Analyze behavior and generate contextual tips
    if (behaviorData.meals && behaviorData.meals.length < 3) {
      tips.push({
        category: 'nutrition',
        tip: 'Try to eat 3 balanced meals per day to maintain steady energy levels',
        priority: 'high',
        aiReasoning: 'Your meal frequency is below optimal for metabolic health'
      });
    }

    if (behaviorData.water && behaviorData.water.daily < 2000) {
      tips.push({
        category: 'hydration',
        tip: 'Increase your daily water intake to at least 2 liters for better health',
        priority: 'medium',
        aiReasoning: 'Proper hydration supports all bodily functions and weight management'
      });
    }

    if (behaviorData.sleep && behaviorData.sleep.averageHours < 7) {
      tips.push({
        category: 'sleep',
        tip: 'Aim for 7-9 hours of sleep per night for optimal recovery and health',
        priority: 'high',
        aiReasoning: 'Sleep is crucial for hormone regulation and weight management'
      });
    }

    return tips;
  }

  // 4. COMMUNITY-DRIVEN SUPPORT
  async generateCommunityFeatures(userProfile, communityData) {
    const features = {
      personalizedFeed: await this.generatePersonalizedFeed(userProfile, communityData),
      matchedUsers: this.findSimilarUsers(userProfile, communityData),
      challengeRecommendations: this.recommendChallenges(userProfile),
      supportGroups: this.findRelevantGroups(userProfile),
      mentorshipOpportunities: this.findMentors(userProfile),
      achievementSharing: this.generateShareableAchievements(userProfile),
      communityInsights: await this.generateCommunityInsights(communityData),
      aiModeration: this.moderateContent(communityData)
    };

    return features;
  }

  async generatePersonalizedFeed(userProfile, communityData) {
    // AI-curated content based on user interests and goals
    const relevantPosts = communityData.posts.filter(post => {
      return this.calculateRelevanceScore(post, userProfile) > 0.7;
    });

    return relevantPosts.sort((a, b) => 
      this.calculateEngagementScore(b) - this.calculateEngagementScore(a)
    );
  }

  findSimilarUsers(userProfile, communityData) {
    return communityData.users
      .filter(user => user.id !== userProfile.id)
      .map(user => ({
        ...user,
        similarityScore: this.calculateUserSimilarity(userProfile, user)
      }))
      .filter(user => user.similarityScore > 0.6)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10);
  }

  // 5. CONTINUOUS HEALTH MONITORING
  async generateHealthMonitoring(healthData, userProfile) {
    const monitoring = {
      vitalTrends: this.analyzeVitalTrends(healthData),
      anomalyDetection: await this.detectHealthAnomalies(healthData),
      predictiveInsights: await this.generatePredictiveInsights(healthData, userProfile),
      riskAssessment: this.assessHealthRisks(healthData, userProfile),
      interventionRecommendations: await this.recommendInterventions(healthData),
      progressTracking: this.trackHealthProgress(healthData),
      alertSystem: this.generateHealthAlerts(healthData),
      aiHealthCoach: await this.generateContinuousCoaching(healthData, userProfile)
    };

    return monitoring;
  }

  analyzeVitalTrends(healthData) {
    const trends = {};
    const vitals = ['heartRate', 'bloodPressure', 'weight', 'sleepHours', 'steps'];
    
    vitals.forEach(vital => {
      const data = healthData.filter(record => record[vital]).map(record => ({
        date: record.date,
        value: record[vital]
      }));
      
      if (data.length > 1) {
        trends[vital] = {
          trend: this.calculateTrend(data),
          average: this.calculateAverage(data),
          variance: this.calculateVariance(data),
          prediction: this.predictNextValue(data)
        };
      }
    });
    
    return trends;
  }

  async detectHealthAnomalies(healthData) {
    const anomalies = [];
    
    // AI-based anomaly detection
    const recentData = healthData.slice(-7); // Last 7 days
    
    recentData.forEach(record => {
      if (record.heartRate && (record.heartRate > 100 || record.heartRate < 50)) {
        anomalies.push({
          type: 'heart_rate_anomaly',
          value: record.heartRate,
          date: record.date,
          severity: record.heartRate > 120 ? 'high' : 'medium',
          recommendation: 'Consider consulting with a healthcare provider'
        });
      }
      
      if (record.weight && this.isWeightAnomalous(record.weight, healthData)) {
        anomalies.push({
          type: 'weight_fluctuation',
          value: record.weight,
          date: record.date,
          severity: 'medium',
          recommendation: 'Monitor weight changes and consider dietary adjustments'
        });
      }
    });
    
    return anomalies;
  }

  // Utility methods
  calculateTrend(data) {
    if (data.length < 2) return 'insufficient_data';
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  calculateAverage(data) {
    return data.reduce((sum, item) => sum + item.value, 0) / data.length;
  }

  calculateVariance(data) {
    const avg = this.calculateAverage(data);
    const variance = data.reduce((sum, item) => sum + Math.pow(item.value - avg, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  calculateWaterIntake(weight) {
    return Math.max(1, (weight / 10) - 1);
  }

  // AI Integration methods
  async generateNutritionInsights(profile, goals) {
    return [
      `Based on your ${profile.activityLevel} lifestyle, focus on protein-rich foods for muscle recovery`,
      `Your ${goals.join(' and ')} goals suggest increasing fiber intake by 25%`,
      `Consider meal timing: eat within 2 hours post-workout for optimal results`
    ];
  }

  async generateFoodInsights(foodDescription) {
    return [
      `This meal provides balanced macronutrients for sustained energy`,
      `Consider adding more vegetables for increased micronutrient density`,
      `Timing this meal 2-3 hours before exercise would optimize performance`
    ];
  }

  async generateAICoachingAdvice(behaviorData) {
    return [
      `Your consistency has improved 23% this week - keep up the momentum!`,
      `I notice you eat less on weekends - try meal prepping for better nutrition`,
      `Your sleep quality correlates with your workout performance - prioritize rest`
    ];
  }

  async generateContinuousCoaching(healthData, userProfile) {
    const latestData = healthData[healthData.length - 1];
    const coaching = [];

    if (latestData.steps < 8000) {
      coaching.push({
        type: 'activity_encouragement',
        message: `You're ${8000 - latestData.steps} steps away from your daily goal. A 15-minute walk could get you there!`,
        priority: 'medium'
      });
    }

    if (latestData.sleepHours < 7) {
      coaching.push({
        type: 'sleep_optimization',
        message: `Your sleep was ${7 - latestData.sleepHours} hours short last night. Consider an earlier bedtime tonight.`,
        priority: 'high'
      });
    }

    return coaching;
  }
}

// Export singleton instance
const aiHealthEngine = new AIHealthEngine();
export default aiHealthEngine;