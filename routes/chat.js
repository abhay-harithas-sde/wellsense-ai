// OpenAI Chat Routes
import express from 'express';
import { DatabaseManager } from '../lib/database.js';
import { AIManager } from '../lib/ai.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();
const db = new DatabaseManager();
const ai = new AIManager();

// Health check for OpenAI service (no auth required for health check)
router.get('/health-check', async (req, res) => {
  try {
    const aiHealth = await ai.healthCheck();
    
    res.json({
      status: aiHealth.available ? 'available' : 'unavailable',
      available: aiHealth.available,
      availableModels: aiHealth.models || [],
      models: aiHealth.models || [],
      provider: aiHealth.provider || 'openai',
      isDemo: !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-mode'
    });
  } catch (error) {
    console.error('[Chat] Health check error:', error);
    res.status(200).json({ // Return 200 even on error for graceful degradation
      status: 'error',
      available: false,
      error: error.message,
      isDemo: true,
      models: []
    });
  }
});

// Start a new chat session
router.post('/start', authenticateToken, async (req, res) => {
  try {
    console.log('[Chat] Starting new session for user:', req.user?.id);
    const { sessionType = 'COACHING', aiPersonality = 'friendly' } = req.body;
    
    // Create chat session in database
    const session = await db.prisma.chatSession.create({
      data: {
        userId: req.user.id,
        sessionType,
        title: `${sessionType} - ${new Date().toLocaleDateString()}`,
        messages: [],
        aiProvider: 'OPENAI',
        model: 'gpt-4',
        isActive: true
      }
    });

    console.log('[Chat] Session created:', session.id);

    // Initial greeting message
    const greeting = {
      role: 'assistant',
      content: `Hello! I'm your WellSense AI health coach. I'm here to help you with nutrition advice, workout plans, and personalized health guidance. How can I assist you today?`,
      timestamp: new Date()
    };

    // Update session with greeting
    await db.prisma.chatSession.update({
      where: { id: session.id },
      data: {
        messages: [greeting]
      }
    });

    console.log('[Chat] Session updated with greeting');

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        messages: [greeting],
        sessionType,
        isActive: true
      }
    });
  } catch (error) {
    console.error('[Chat] Start session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send a message in a chat session
router.post('/:sessionId/message', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, includeHealthData = true, comprehensiveData = null, context: additionalContext = null } = req.body;

    // Get session
    const session = await db.prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Build comprehensive context
    let context = {};
    if (includeHealthData || comprehensiveData) {
      const user = await db.getUserById(req.user.id);
      const recentRecords = await db.getHealthRecords(req.user.id, 10);
      
      // Use comprehensive data if provided, otherwise build basic context
      if (comprehensiveData) {
        context = {
          user,
          comprehensiveProfile: comprehensiveData,
          recentRecords,
          additionalContext
        };
      } else {
        context = { user, recentRecords };
      }
    }

    // Create enhanced prompt with comprehensive data
    let enhancedMessage = message;
    if (comprehensiveData) {
      const contextSummary = `
User Profile: ${comprehensiveData.profile?.name}, Age: ${comprehensiveData.profile?.age}, Gender: ${comprehensiveData.profile?.gender}
Physical: Weight: ${comprehensiveData.physical?.weight}kg, Height: ${comprehensiveData.physical?.height}cm, BMI: ${comprehensiveData.physical?.bmi?.toFixed(1)} (${comprehensiveData.physical?.bmiCategory})
${comprehensiveData.vitals ? `Vitals: HR: ${comprehensiveData.vitals.heartRate}bpm, BP: ${comprehensiveData.vitals.bloodPressure?.systolic}/${comprehensiveData.vitals.bloodPressure?.diastolic}` : ''}
${comprehensiveData.lifestyle ? `Lifestyle: Sleep: ${comprehensiveData.lifestyle.sleepHours}h, Mood: ${comprehensiveData.lifestyle.mood}/10, Energy: ${comprehensiveData.lifestyle.energyLevel}/10` : ''}
${comprehensiveData.goals?.length > 0 ? `Active Goals: ${comprehensiveData.goals.map(g => g.title).join(', ')}` : ''}
${comprehensiveData.insights ? `Health Score: ${comprehensiveData.insights.healthScore}/100` : ''}
${comprehensiveData.insights?.riskFactors?.length > 0 ? `Risk Factors: ${comprehensiveData.insights.riskFactors.join(', ')}` : ''}

User Question: ${message}`;
      
      enhancedMessage = contextSummary;
    }

    // Generate AI response with comprehensive context and REAL-TIME data
    const aiResponse = await ai.generateHealthAdvice(context.user || {}, enhancedMessage, db);

    // Add messages to session
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    const assistantMessage = {
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      provider: aiResponse.provider,
      model: aiResponse.model
    };

    const updatedMessages = [...(session.messages || []), userMessage, assistantMessage];

    // Update session
    await db.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messages: updatedMessages,
        lastMessageAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        message: assistantMessage,
        sessionId,
        totalMessages: updatedMessages.length
      }
    });
  } catch (error) {
    console.error('[Chat] Send message error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stream chat responses
router.post('/stream', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId, healthData, comprehensiveData = null, context: additionalContext = null } = req.body;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get session if provided
    let session = null;
    if (sessionId) {
      session = await db.prisma.chatSession.findUnique({
        where: { id: sessionId }
      });

      if (!session || session.userId !== req.user.id) {
        res.write(`data: ${JSON.stringify({ error: 'Session not found' })}\n\n`);
        return res.end();
      }
    }

    // Get user context
    const user = await db.getUserById(req.user.id);
    
    // Build enhanced prompt with comprehensive data
    let enhancedMessage = message;
    if (comprehensiveData) {
      const contextSummary = `
User Profile: ${comprehensiveData.profile?.name}, Age: ${comprehensiveData.profile?.age}, Gender: ${comprehensiveData.profile?.gender}
Physical: Weight: ${comprehensiveData.physical?.weight}kg, Height: ${comprehensiveData.physical?.height}cm, BMI: ${comprehensiveData.physical?.bmi?.toFixed(1)} (${comprehensiveData.physical?.bmiCategory})
${comprehensiveData.vitals ? `Vitals: HR: ${comprehensiveData.vitals.heartRate}bpm, BP: ${comprehensiveData.vitals.bloodPressure?.systolic}/${comprehensiveData.vitals.bloodPressure?.diastolic}` : ''}
${comprehensiveData.lifestyle ? `Lifestyle: Sleep: ${comprehensiveData.lifestyle.sleepHours}h, Mood: ${comprehensiveData.lifestyle.mood}/10, Energy: ${comprehensiveData.lifestyle.energyLevel}/10` : ''}
${comprehensiveData.goals?.length > 0 ? `Active Goals: ${comprehensiveData.goals.map(g => g.title).join(', ')}` : ''}
${comprehensiveData.insights ? `Health Score: ${comprehensiveData.insights.healthScore}/100` : ''}
${comprehensiveData.insights?.riskFactors?.length > 0 ? `Risk Factors: ${comprehensiveData.insights.riskFactors.join(', ')}` : ''}

User Question: ${message}`;
      
      enhancedMessage = contextSummary;
    }
    
    // Generate AI response with comprehensive context
    const aiResponse = await ai.generateHealthAdvice(user, enhancedMessage);

    // Simulate streaming by chunking the response
    const content = aiResponse.content;
    const chunkSize = 10; // words per chunk
    const words = content.split(' ');
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Save to session if provided
    if (session) {
      const userMessage = { role: 'user', content: message, timestamp: new Date() };
      const assistantMessage = { role: 'assistant', content, timestamp: new Date() };
      const updatedMessages = [...(session.messages || []), userMessage, assistantMessage];

      await db.prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          messages: updatedMessages,
          lastMessageAt: new Date()
        }
      });
    }

    // Send completion
    res.write(`data: ${JSON.stringify({ type: 'complete', sessionId })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[Chat] Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Get all user chat sessions (must be before /:sessionId route)
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      db.prisma.chatSession.findMany({
        where: { userId: req.user.id },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          sessionType: true,
          isActive: true,
          createdAt: true,
          lastMessageAt: true,
          messages: true
        }
      }),
      db.prisma.chatSession.count({
        where: { userId: req.user.id }
      })
    ]);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('[Chat] Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get chat session history
router.get('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await db.prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        title: session.title,
        messages: session.messages || [],
        sessionType: session.sessionType,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastMessageAt: session.lastMessageAt
      }
    });
  } catch (error) {
    console.error('[Chat] Get session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze food image
router.post('/analyze-food', authenticateToken, async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    // For now, return a demo response
    // In production, this would use OpenAI Vision API
    const analysis = `Based on the image, this appears to be a balanced meal with:
- Lean protein (chicken breast, approximately 150g)
- Complex carbohydrates (brown rice, approximately 100g)
- Vegetables (broccoli and carrots, approximately 150g)
- Healthy fats (olive oil dressing)

Estimated nutritional content:
- Calories: 450-500
- Protein: 35g
- Carbohydrates: 45g
- Fat: 12g
- Fiber: 8g

This is a well-balanced meal that supports muscle maintenance and provides sustained energy. Great choice!`;

    res.json({
      success: true,
      analysis,
      imageUrl
    });
  } catch (error) {
    console.error('[Chat] Food analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate personalized health plan with REAL-TIME data
router.post('/generate-plan', authenticateToken, async (req, res) => {
  try {
    const { userProfile, healthGoals, preferences } = req.body;

    // Validate required fields
    if (!userProfile || !healthGoals) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userProfile and healthGoals are required'
      });
    }

    const user = await db.getUserById(req.user.id);
    
    // Get recent health records for more personalized plan
    const recentRecords = await db.getHealthRecords(req.user.id, 7); // Last 7 records
    
    const prompt = `Generate a personalized health plan for a user with the following profile:

**User Profile:**
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Weight: ${userProfile.weight || 'Not specified'}kg
- Height: ${userProfile.height || 'Not specified'}cm
- BMI: ${userProfile.bmi?.toFixed(1) || 'Not calculated'}
- Activity Level: ${userProfile.activityLevel || 'Moderate'}

**Current Health Status:**
${userProfile.currentHealth ? `
- Heart Rate: ${userProfile.currentHealth.heartRate || 'N/A'} bpm
- Blood Pressure: ${userProfile.currentHealth.bloodPressure || 'N/A'}
- Recent Symptoms: ${userProfile.currentHealth.recentSymptoms?.join(', ') || 'None reported'}
` : '- No recent health data available'}

**Health Goals:** ${healthGoals.join(', ')}
**Preferences:** ${JSON.stringify(preferences)}

**Recent Health Trends:**
${recentRecords && recentRecords.length > 0 ? 
  `- ${recentRecords.length} health records in the past week
- Average mood: ${recentRecords.reduce((sum, r) => sum + (r.mood || 0), 0) / recentRecords.length}/10
- Average energy: ${recentRecords.reduce((sum, r) => sum + (r.energyLevel || 0), 0) / recentRecords.length}/10` 
  : '- No recent health records available'}

Please provide a comprehensive, actionable health plan including:
1. **Nutrition Plan** - Specific meal suggestions and dietary guidelines
2. **Exercise Plan** - Weekly workout schedule with specific exercises
3. **Lifestyle Recommendations** - Sleep, stress management, hydration
4. **Progress Tracking** - Key metrics to monitor
5. **Timeline** - 30-day action plan

Make it personalized, realistic, and achievable based on their current health data.`;

    const aiResponse = await ai.generateHealthAdvice(user, prompt, db);

    // Log successful generation
    console.log('[Chat] Health plan generated successfully for user:', req.user.id);

    res.json({
      success: true,
      content: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
      usageStats: aiResponse.usageStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Chat] Generate plan error:', error);
    
    // Provide fallback response if AI fails
    const fallbackPlan = `# Personalized Health Plan

## 🎯 Your Health Goals
Based on your profile, here's a comprehensive plan to help you achieve your health goals.

### 📊 Nutrition Plan
- **Breakfast:** Oatmeal with fruits and nuts (300-400 calories)
- **Lunch:** Grilled chicken/fish with vegetables and quinoa (400-500 calories)
- **Dinner:** Lean protein with salad and sweet potato (400-500 calories)
- **Snacks:** Greek yogurt, fruits, nuts (200-300 calories)
- **Hydration:** 8-10 glasses of water daily

### 💪 Exercise Plan
**Weekly Schedule:**
- Monday: 30 min cardio + 20 min strength training
- Tuesday: 45 min yoga or stretching
- Wednesday: 30 min HIIT workout
- Thursday: Rest or light walk
- Friday: 30 min cardio + 20 min core exercises
- Weekend: Active recreation (hiking, swimming, cycling)

### 🌙 Lifestyle Recommendations
- Sleep: 7-9 hours per night
- Stress Management: 10 min daily meditation
- Screen Time: Limit to 2 hours before bed
- Social Connection: Regular interaction with friends/family

### 📈 Progress Tracking
Monitor these weekly:
- Weight and body measurements
- Energy levels (1-10 scale)
- Sleep quality
- Mood and stress levels
- Exercise completion rate

### 🗓️ 30-Day Action Plan
**Week 1-2:** Establish routine, focus on consistency
**Week 3-4:** Increase intensity, refine nutrition
**Month 2+:** Maintain habits, set new challenges

💡 **Note:** This is a general plan. For best results, consult with healthcare professionals and adjust based on your progress.`;

    res.json({
      success: true,
      content: fallbackPlan,
      provider: 'fallback',
      model: 'template',
      usageStats: null,
      timestamp: new Date().toISOString(),
      note: 'AI service unavailable - using template plan'
    });
  }
});

// Get nutrition advice with REAL-TIME data
router.post('/nutrition-advice', authenticateToken, async (req, res) => {
  try {
    const { foodLog, userProfile, goals } = req.body;

    const user = await db.getUserById(req.user.id);
    
    const prompt = `Provide nutrition advice based on:
Food Log: ${JSON.stringify(foodLog)}
User Profile: ${JSON.stringify(userProfile)}
Goals: ${goals.join(', ')}

Give specific recommendations for improving nutrition and achieving goals based on their recent eating patterns.`;

    const aiResponse = await ai.generateNutritionAdvice(user, prompt, db);

    res.json({
      success: true,
      content: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
      usageStats: aiResponse.usageStats
    });
  } catch (error) {
    console.error('[Chat] Nutrition advice error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate workout plan with REAL-TIME data
router.post('/workout-plan', authenticateToken, async (req, res) => {
  try {
    const { userProfile, fitnessGoals, preferences } = req.body;

    const user = await db.getUserById(req.user.id);
    
    const prompt = `Create a workout plan for:
Profile: ${JSON.stringify(userProfile)}
Fitness Goals: ${fitnessGoals.join(', ')}
Preferences: ${JSON.stringify(preferences)}

Include specific exercises, sets, reps, and weekly schedule based on their recent activity levels.`;

    const aiResponse = await ai.generateFitnessAdvice(user, prompt, db);

    res.json({
      success: true,
      content: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
      usageStats: aiResponse.usageStats
    });
  } catch (error) {
    console.error('[Chat] Workout plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze health trends with REAL-TIME data
router.post('/analyze-trends', authenticateToken, async (req, res) => {
  try {
    const { healthData, userProfile } = req.body;

    const user = await db.getUserById(req.user.id);
    
    const prompt = `Analyze health trends for:
Health Data: ${JSON.stringify(healthData)}
User Profile: ${JSON.stringify(userProfile)}

Identify patterns, improvements, concerns, and provide actionable insights based on their complete health history.`;

    const aiResponse = await ai.generateHealthAdvice(user, prompt, db);

    res.json({
      success: true,
      content: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
      usageStats: aiResponse.usageStats
    });
  } catch (error) {
    console.error('[Chat] Analyze trends error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
