// AAP AI Module
// Consolidated AI services and integrations with usage tracking and security

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

class AIManager {
  constructor() {
    // Initialize AI providers
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;

    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    }) : null;

    this.google = process.env.GOOGLE_AI_API_KEY ? new GoogleGenerativeAI(
      process.env.GOOGLE_AI_API_KEY
    ) : null;

    // Provider priority order
    this.providers = ['openai', 'anthropic', 'google'];

    // Usage tracking for OpenAI (NxtWave Buildathon limits)
    this.usageTracking = {
      totalTokens: 0,
      totalRequests: 0,
      totalTokenLimit: parseInt(process.env.OPENAI_TOTAL_TOKEN_LIMIT) || 500000,
      maxTokensPerRequest: parseInt(process.env.OPENAI_MAX_TOKENS_PER_REQUEST) || 1000,
      warnThreshold: parseInt(process.env.OPENAI_WARN_THRESHOLD) || 400000,
      requests: []
    };

    // Load usage data from file
    this.loadUsageData();
  }

  // Load usage data from persistent storage
  async loadUsageData() {
    try {
      const usageFile = path.join(__dirname, '../.openai-usage.json');
      const data = await fs.readFile(usageFile, 'utf8');
      const savedUsage = JSON.parse(data);
      this.usageTracking = { ...this.usageTracking, ...savedUsage };
      console.log(`📊 Loaded OpenAI usage: ${this.usageTracking.totalTokens}/${this.usageTracking.totalTokenLimit} tokens used`);
    } catch (error) {
      // File doesn't exist yet, will be created on first save
      console.log('📊 Starting fresh OpenAI usage tracking');
    }
  }

  // Save usage data to persistent storage
  async saveUsageData() {
    try {
      const usageFile = path.join(__dirname, '../.openai-usage.json');
      await fs.writeFile(usageFile, JSON.stringify(this.usageTracking, null, 2));
    } catch (error) {
      console.error('Failed to save usage data:', error);
    }
  }

  // Check if request is within limits
  checkUsageLimits(requestedTokens = 0) {
    const { totalTokens, totalTokenLimit, maxTokensPerRequest, warnThreshold } = this.usageTracking;

    // Check total token limit
    if (totalTokens >= totalTokenLimit) {
      throw new Error(`OpenAI token limit exceeded: ${totalTokens}/${totalTokenLimit} tokens used`);
    }

    // Check per-request limit
    if (requestedTokens > maxTokensPerRequest) {
      throw new Error(`Request exceeds per-request token limit: ${requestedTokens}/${maxTokensPerRequest} tokens`);
    }

    // Check if approaching limit
    if (totalTokens >= warnThreshold) {
      console.warn(`⚠️ OpenAI usage warning: ${totalTokens}/${totalTokenLimit} tokens used (${((totalTokens/totalTokenLimit)*100).toFixed(1)}%)`);
    }

    // Check if request would exceed limit
    if (totalTokens + requestedTokens > totalTokenLimit) {
      throw new Error(`Request would exceed total token limit: ${totalTokens + requestedTokens}/${totalTokenLimit} tokens`);
    }

    return true;
  }

  // Track usage after API call
  async trackUsage(usage, provider = 'openai') {
    if (provider === 'openai' && usage) {
      this.usageTracking.totalTokens += usage.total_tokens || 0;
      this.usageTracking.totalRequests += 1;
      this.usageTracking.requests.push({
        timestamp: new Date().toISOString(),
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      });

      // Keep only last 100 requests
      if (this.usageTracking.requests.length > 100) {
        this.usageTracking.requests = this.usageTracking.requests.slice(-100);
      }

      await this.saveUsageData();

      console.log(`📊 OpenAI usage: ${this.usageTracking.totalTokens}/${this.usageTracking.totalTokenLimit} tokens (${this.usageTracking.totalRequests} requests)`);
    }
  }

  // Get usage statistics
  getUsageStats() {
    const { totalTokens, totalRequests, totalTokenLimit, warnThreshold } = this.usageTracking;
    const percentUsed = ((totalTokens / totalTokenLimit) * 100).toFixed(2);
    const remaining = totalTokenLimit - totalTokens;

    return {
      totalTokens,
      totalRequests,
      totalTokenLimit,
      percentUsed: parseFloat(percentUsed),
      remaining,
      isNearLimit: totalTokens >= warnThreshold,
      isAtLimit: totalTokens >= totalTokenLimit
    };
  }

  // Health Check for AI Providers
  async healthCheck() {
    const status = {
      openai: !!this.openai,
      anthropic: !!this.anthropic,
      google: !!this.google,
      available: !!this.openai || !!this.anthropic || !!this.google,
      provider: this.openai ? 'openai' : (this.anthropic ? 'anthropic' : (this.google ? 'google' : null)),
      models: [],
      usage: this.openai ? this.getUsageStats() : null
    };

    if (this.openai) {
      status.models.push('gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo');
    }
    if (this.anthropic) {
      status.models.push('claude-3-sonnet', 'claude-3-opus');
    }
    if (this.google) {
      status.models.push('gemini-pro');
    }

    return status;
  }

  // Generate Chat Response with Fallback
  async generateResponse(messages, options = {}) {
    const { 
      provider, 
      model, 
      temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7, 
      maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 800 
    } = options;

    // Check usage limits before making request (for OpenAI)
    if (provider === 'openai' || (!provider && this.openai)) {
      this.checkUsageLimits(maxTokens);
    }

    // Try specific provider if requested
    if (provider && this[provider]) {
      try {
        return await this._generateWithProvider(provider, messages, { model, temperature, maxTokens });
      } catch (error) {
        console.error(`${provider} failed:`, error.message);
        throw error; // Don't fallback if specific provider was requested
      }
    }

    // Try providers in order until one succeeds
    for (const providerName of this.providers) {
      if (this[providerName]) {
        try {
          // Check limits for OpenAI
          if (providerName === 'openai') {
            this.checkUsageLimits(maxTokens);
          }
          return await this._generateWithProvider(providerName, messages, { model, temperature, maxTokens });
        } catch (error) {
          console.error(`${providerName} failed:`, error.message);
          continue;
        }
      }
    }

    throw new Error('All AI providers failed or are unavailable');
  }

  // Generate with specific provider
  async _generateWithProvider(provider, messages, options) {
    switch (provider) {
      case 'openai':
        return await this._generateOpenAI(messages, options);
      case 'anthropic':
        return await this._generateAnthropic(messages, options);
      case 'google':
        return await this._generateGoogle(messages, options);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // OpenAI Implementation with usage tracking
  async _generateOpenAI(messages, options) {
    const response = await this.openai.chat.completions.create({
      model: options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens
    });

    // Track usage
    await this.trackUsage(response.usage, 'openai');

    return {
      content: response.choices[0].message.content,
      provider: 'openai',
      model: response.model,
      usage: response.usage,
      usageStats: this.getUsageStats()
    };
  }

  // Anthropic Implementation
  async _generateAnthropic(messages, options) {
    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      system: systemMessage?.content || '',
      messages: userMessages
    });

    return {
      content: response.content[0].text,
      provider: 'anthropic',
      model: response.model,
      usage: response.usage
    };
  }

  // Google AI Implementation
  async _generateGoogle(messages, options) {
    const model = this.google.getGenerativeModel({ 
      model: options.model || 'gemini-pro' 
    });

    // Convert messages to Google format
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return {
      content: response.text(),
      provider: 'google',
      model: options.model || 'gemini-pro',
      usage: null // Google doesn't provide usage stats in the same format
    };
  }

  // Health-specific AI responses with REAL-TIME data
  async generateHealthAdvice(userProfile, query, db = null) {
    // Fetch real-time health data if database connection provided
    let realtimeData = '';
    if (db && userProfile.id) {
      try {
        const [latestHealth, latestWeight, recentGoals] = await Promise.all([
          db.getHealthRecords(userProfile.id, 1),
          db.getWeightRecords(userProfile.id, 1),
          db.prisma.goal.findMany({
            where: { userId: userProfile.id, status: 'ACTIVE' },
            take: 5,
            orderBy: { createdAt: 'desc' }
          })
        ]);

        if (latestHealth && latestHealth.length > 0) {
          const health = latestHealth[0];
          realtimeData += `\n\nREAL-TIME HEALTH DATA (${new Date(health.recordedAt).toLocaleString()}):\n`;
          if (health.bloodPressureSystolic) realtimeData += `- Blood Pressure: ${health.bloodPressureSystolic}/${health.bloodPressureDiastolic} mmHg\n`;
          if (health.heartRate) realtimeData += `- Heart Rate: ${health.heartRate} bpm\n`;
          if (health.temperature) realtimeData += `- Temperature: ${health.temperature}°C\n`;
          if (health.oxygenSaturation) realtimeData += `- Oxygen Saturation: ${health.oxygenSaturation}%\n`;
          if (health.bloodSugar) realtimeData += `- Blood Sugar: ${health.bloodSugar} mg/dL\n`;
          if (health.mood) realtimeData += `- Mood: ${health.mood}/10\n`;
          if (health.energyLevel) realtimeData += `- Energy Level: ${health.energyLevel}/10\n`;
          if (health.sleepHours) realtimeData += `- Sleep: ${health.sleepHours} hours\n`;
        }

        if (latestWeight && latestWeight.length > 0) {
          const weight = latestWeight[0];
          realtimeData += `- Current Weight: ${weight.weightKg} kg (${new Date(weight.recordedAt).toLocaleDateString()})\n`;
          if (weight.bodyFatPercentage) realtimeData += `- Body Fat: ${weight.bodyFatPercentage}%\n`;
        }

        if (recentGoals && recentGoals.length > 0) {
          realtimeData += `\nACTIVE GOALS:\n`;
          recentGoals.forEach(goal => {
            const progress = goal.currentValue && goal.targetValue 
              ? `${((goal.currentValue / goal.targetValue) * 100).toFixed(0)}%` 
              : 'In Progress';
            realtimeData += `- ${goal.title} (${progress})\n`;
          });
        }
      } catch (error) {
        console.error('Error fetching real-time health data:', error);
      }
    }

    const systemPrompt = `You are a helpful health assistant for WellSense AI. Provide personalized health advice based on the user's profile and REAL-TIME health data. Always recommend consulting healthcare professionals for serious concerns.

User Profile:
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Weight: ${userProfile.weight || 'Not specified'} kg
- Height: ${userProfile.heightCm || userProfile.height || 'Not specified'} cm
- BMI: ${userProfile.bmi || 'Not specified'}
- Health Goals: ${userProfile.goals || 'General wellness'}
- Medical Conditions: ${userProfile.conditions || 'None specified'}
${realtimeData}

Guidelines:
- Use the REAL-TIME data above to provide current, relevant advice
- Be supportive and encouraging
- Provide evidence-based information
- Suggest lifestyle improvements based on current metrics
- Recommend professional consultation when appropriate
- Keep responses concise and actionable (max 250 words)
- Focus on preventive health and wellness
- Reference specific metrics from the real-time data when relevant`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ];

    return await this.generateResponse(messages, { 
      temperature: 0.7,
      maxTokens: 600 // Increased for more detailed responses with real-time data
    });
  }

  // Load personalized diet training data
  loadDietTrainingData() {
    try {
      const fs = require('fs');
      const path = require('path');
      const trainingPath = path.join(__dirname, 'training-data/diet-plans.json');
      
      if (fs.existsSync(trainingPath)) {
        const data = JSON.parse(fs.readFileSync(trainingPath, 'utf8'));
        console.log('✅ Loaded personalized diet training data');
        return data;
      }
    } catch (error) {
      console.log('ℹ️ No personalized diet training data found');
    }
    return null;
  }

  // Nutrition advice with REAL-TIME data + PERSONALIZED TRAINING
  async generateNutritionAdvice(userProfile, query, db = null) {
    // Load personalized diet training data
    const trainingData = this.loadDietTrainingData();
    
    // Fetch real-time nutrition and health data
    let realtimeData = '';
    if (db && userProfile.id) {
      try {
        const [recentNutrition, latestWeight, latestHealth] = await Promise.all([
          db.prisma.nutritionRecord.findMany({
            where: { userId: userProfile.id },
            take: 5,
            orderBy: { recordedAt: 'desc' }
          }),
          db.getWeightRecords(userProfile.id, 1),
          db.getHealthRecords(userProfile.id, 1)
        ]);

        if (recentNutrition && recentNutrition.length > 0) {
          realtimeData += `\n\nRECENT NUTRITION (Last 24 hours):\n`;
          const totalCalories = recentNutrition.reduce((sum, n) => sum + n.calories, 0);
          const totalProtein = recentNutrition.reduce((sum, n) => sum + n.protein, 0);
          const totalCarbs = recentNutrition.reduce((sum, n) => sum + n.carbohydrates, 0);
          const totalFat = recentNutrition.reduce((sum, n) => sum + n.fat, 0);
          
          realtimeData += `- Total Calories: ${totalCalories.toFixed(0)} kcal\n`;
          realtimeData += `- Protein: ${totalProtein.toFixed(1)}g\n`;
          realtimeData += `- Carbs: ${totalCarbs.toFixed(1)}g\n`;
          realtimeData += `- Fat: ${totalFat.toFixed(1)}g\n`;
          
          realtimeData += `\nRecent Meals:\n`;
          recentNutrition.slice(0, 3).forEach(meal => {
            realtimeData += `- ${meal.mealType}: ${meal.foodName} (${meal.calories} kcal)\n`;
          });
        }

        if (latestWeight && latestWeight.length > 0) {
          const weight = latestWeight[0];
          realtimeData += `\nCurrent Weight: ${weight.weightKg} kg\n`;
        }

        if (latestHealth && latestHealth.length > 0) {
          const health = latestHealth[0];
          if (health.energyLevel) realtimeData += `Energy Level: ${health.energyLevel}/10\n`;
          if (health.bloodSugar) realtimeData += `Blood Sugar: ${health.bloodSugar} mg/dL\n`;
        }
      } catch (error) {
        console.error('Error fetching real-time nutrition data:', error);
      }
    }

    // Build personalized training context
    let trainingContext = '';
    if (trainingData) {
      trainingContext = `\n\nPERSONALIZED DIET PLAN:\n`;
      
      if (trainingData.nutritionTargets) {
        trainingContext += `Daily Targets: ${trainingData.nutritionTargets.daily.calories} kcal, `;
        trainingContext += `${trainingData.nutritionTargets.daily.protein}g protein, `;
        trainingContext += `${trainingData.nutritionTargets.daily.carbs}g carbs, `;
        trainingContext += `${trainingData.nutritionTargets.daily.fat}g fat\n\n`;
      }
      
      if (trainingData.mealPlans && trainingData.mealPlans.length > 0) {
        trainingContext += `Recommended Meal Plans:\n`;
        trainingData.mealPlans.forEach(meal => {
          trainingContext += `\n${meal.mealType.toUpperCase()} (${meal.recommendedTime}):\n`;
          meal.items.slice(0, 3).forEach(item => {
            trainingContext += `- ${item.name} (${item.quantity}): ${item.calories} kcal\n`;
          });
        });
      }
      
      if (trainingData.guidelines && trainingData.guidelines.length > 0) {
        trainingContext += `\nGuidelines:\n`;
        trainingData.guidelines.slice(0, 5).forEach(guideline => {
          trainingContext += `- ${guideline}\n`;
        });
      }
    }

    const systemPrompt = `You are a nutrition expert for WellSense AI with access to personalized diet training data. Provide customized nutrition advice based on the user's profile, REAL-TIME data, and TRAINED meal plans.

User Profile:
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Weight: ${userProfile.weight || 'Not specified'} kg
- Height: ${userProfile.heightCm || userProfile.height || 'Not specified'} cm
- BMI: ${userProfile.bmi || 'Not specified'}
- Goals: ${userProfile.goals || 'General wellness'}
${realtimeData}
${trainingContext}

Guidelines:
- Reference the personalized meal plans when suggesting foods
- Compare current intake with trained nutrition targets
- Suggest specific foods from the trained food database
- Provide meal timing based on trained schedule
- Identify gaps between current and target nutrition
- Keep responses practical and actionable (max 250 words)`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ];

    return await this.generateResponse(messages, { 
      temperature: 0.7,
      maxTokens: 600
    });
  }

  // Fitness coaching with REAL-TIME data
  async generateFitnessAdvice(userProfile, query, db = null) {
    // Fetch real-time exercise and health data
    let realtimeData = '';
    if (db && userProfile.id) {
      try {
        const [recentExercise, latestWeight, latestHealth] = await Promise.all([
          db.prisma.exerciseRecord.findMany({
            where: { userId: userProfile.id },
            take: 7,
            orderBy: { recordedAt: 'desc' }
          }),
          db.getWeightRecords(userProfile.id, 1),
          db.getHealthRecords(userProfile.id, 1)
        ]);

        if (recentExercise && recentExercise.length > 0) {
          realtimeData += `\n\nRECENT EXERCISE (Last 7 days):\n`;
          const totalDuration = recentExercise.reduce((sum, e) => sum + e.duration, 0);
          const totalCalories = recentExercise.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
          
          realtimeData += `- Total Duration: ${totalDuration} minutes\n`;
          realtimeData += `- Total Calories Burned: ${totalCalories} kcal\n`;
          realtimeData += `- Workouts: ${recentExercise.length}\n`;
          
          realtimeData += `\nRecent Activities:\n`;
          recentExercise.slice(0, 5).forEach(exercise => {
            realtimeData += `- ${exercise.exerciseType}: ${exercise.name} (${exercise.duration}min, ${exercise.intensity})\n`;
          });
        } else {
          realtimeData += `\n\nNo recent exercise data recorded.\n`;
        }

        if (latestWeight && latestWeight.length > 0) {
          const weight = latestWeight[0];
          realtimeData += `\nCurrent Weight: ${weight.weightKg} kg\n`;
          if (weight.muscleMass) realtimeData += `Muscle Mass: ${weight.muscleMass} kg\n`;
          if (weight.bodyFatPercentage) realtimeData += `Body Fat: ${weight.bodyFatPercentage}%\n`;
        }

        if (latestHealth && latestHealth.length > 0) {
          const health = latestHealth[0];
          if (health.heartRate) realtimeData += `Resting Heart Rate: ${health.heartRate} bpm\n`;
          if (health.energyLevel) realtimeData += `Energy Level: ${health.energyLevel}/10\n`;
          if (health.sleepHours) realtimeData += `Sleep: ${health.sleepHours} hours\n`;
        }
      } catch (error) {
        console.error('Error fetching real-time fitness data:', error);
      }
    }

    const systemPrompt = `You are a fitness coach for WellSense AI. Provide personalized fitness advice based on the user's profile and REAL-TIME exercise data.

User Profile:
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Weight: ${userProfile.weight || 'Not specified'} kg
- Height: ${userProfile.heightCm || userProfile.height || 'Not specified'} cm
- BMI: ${userProfile.bmi || 'Not specified'}
- Fitness Level: ${userProfile.fitnessLevel || 'Beginner'}
- Goals: ${userProfile.goals || 'General fitness'}
${realtimeData}

Guidelines:
- Analyze the REAL-TIME exercise data above
- Provide safe, effective exercise recommendations
- Consider user's current activity level and fitness data
- Include warm-up and cool-down advice
- Suggest progression strategies based on recent performance
- Identify areas for improvement
- Keep responses concise (max 250 words)`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query }
    ];

    return await this.generateResponse(messages, { 
      temperature: 0.7,
      maxTokens: 600
    });
  }
}

module.exports = { AIManager };