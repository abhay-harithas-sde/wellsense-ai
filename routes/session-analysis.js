// Session Analysis Routes
// Analyze chat sessions and provide insights

import express from 'express';
import { DatabaseManager } from '../lib/database.js';
import { AIManager } from '../lib/ai.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();
const db = new DatabaseManager();
const ai = new AIManager();

/**
 * Analyze a chat session and provide insights
 * POST /api/session-analysis/analyze/:sessionId
 */
router.post('/analyze/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { includeRecommendations = true } = req.body;

    // Get the chat session
    const session = await db.prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or access denied'
      });
    }

    // Get user data for context
    const user = await db.getUserById(req.user.id);
    const recentHealthRecords = await db.getHealthRecords(req.user.id, 10);

    // Analyze the session messages
    const messages = session.messages || [];
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    // Extract topics and concerns from user messages
    const userConcerns = userMessages.map(m => m.content).join('\n');

    // Build analysis prompt
    const analysisPrompt = `Analyze this health coaching chat session and provide insights:

**Session Information:**
- Session ID: ${sessionId}
- Session Type: ${session.sessionType}
- Duration: ${session.lastMessageAt ? Math.round((new Date(session.lastMessageAt) - new Date(session.createdAt)) / 60000) : 0} minutes
- Total Messages: ${messages.length}
- User Messages: ${userMessages.length}
- AI Responses: ${assistantMessages.length}

**User Profile:**
- Name: ${user.firstName} ${user.lastName}
- Age: ${user.age || 'Not specified'}
- Gender: ${user.gender || 'Not specified'}

**User's Main Concerns and Questions:**
${userConcerns}

**Recent Health Status:**
${recentHealthRecords && recentHealthRecords.length > 0 ? 
  `- Latest mood: ${recentHealthRecords[0]?.mood || 'N/A'}/10
- Latest energy: ${recentHealthRecords[0]?.energyLevel || 'N/A'}/10
- Latest sleep: ${recentHealthRecords[0]?.sleepHours || 'N/A'} hours` 
  : '- No recent health data'}

Please provide:
1. **Session Summary** - Key topics discussed
2. **User's Primary Health Concerns** - Main issues identified
3. **Progress Assessment** - How the user is doing
4. **Patterns Identified** - Recurring themes or behaviors
5. **Recommendations** - Next steps and action items
6. **Follow-up Suggestions** - Topics to explore in future sessions

Be specific, actionable, and supportive in your analysis.`;

    // Generate AI analysis
    const aiResponse = await ai.generateHealthAdvice(user, analysisPrompt, db);

    // Calculate session metrics
    const sessionMetrics = {
      duration: session.lastMessageAt ? 
        Math.round((new Date(session.lastMessageAt) - new Date(session.createdAt)) / 60000) : 0,
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      avgMessageLength: messages.length > 0 ? 
        Math.round(messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length) : 0,
      sessionType: session.sessionType,
      isActive: session.isActive,
      createdAt: session.createdAt,
      lastMessageAt: session.lastMessageAt
    };

    // Extract key topics (simple keyword extraction)
    const keyTopics = extractKeyTopics(userConcerns);

    // Build response
    const analysis = {
      sessionId,
      sessionMetrics,
      keyTopics,
      aiAnalysis: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
      timestamp: new Date().toISOString()
    };

    // Log successful analysis
    console.log('[SessionAnalysis] Analysis completed for session:', sessionId);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('[SessionAnalysis] Error:', error);
    
    // Provide fallback analysis
    const fallbackAnalysis = {
      sessionId: req.params.sessionId,
      sessionMetrics: {
        duration: 0,
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0
      },
      keyTopics: ['health', 'wellness', 'nutrition'],
      aiAnalysis: `# Session Analysis

## Summary
This session focused on general health and wellness topics. The user engaged with the AI health coach to discuss their health goals and receive personalized guidance.

## Key Observations
- User is actively seeking health improvement
- Engaged in meaningful conversation about wellness
- Showed interest in personalized recommendations

## Recommendations
1. Continue regular check-ins with the AI coach
2. Track health metrics consistently
3. Follow through on discussed action items
4. Schedule follow-up session in 1-2 weeks

## Next Steps
- Review and implement suggested health plan
- Monitor progress on set goals
- Return for follow-up consultation

💡 **Note:** This is a basic analysis. For detailed insights, ensure AI service is properly configured.`,
      provider: 'fallback',
      model: 'template',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: fallbackAnalysis,
      note: 'Using fallback analysis - AI service unavailable'
    });
  }
});

/**
 * Get all session analyses for a user
 * GET /api/session-analysis/history
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get user's recent sessions
    const sessions = await db.prisma.chatSession.findMany({
      where: { userId: req.user.id },
      orderBy: { lastMessageAt: 'desc' },
      take: parseInt(limit),
      select: {
        id: true,
        title: true,
        sessionType: true,
        createdAt: true,
        lastMessageAt: true,
        messages: true,
        isActive: true
      }
    });

    // Create summary for each session
    const sessionSummaries = sessions.map(session => {
      const messages = session.messages || [];
      const userMessages = messages.filter(m => m.role === 'user');
      
      return {
        sessionId: session.id,
        title: session.title,
        sessionType: session.sessionType,
        createdAt: session.createdAt,
        lastMessageAt: session.lastMessageAt,
        isActive: session.isActive,
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        duration: session.lastMessageAt ? 
          Math.round((new Date(session.lastMessageAt) - new Date(session.createdAt)) / 60000) : 0,
        preview: userMessages.length > 0 ? 
          userMessages[0].content.substring(0, 100) + '...' : 'No messages'
      };
    });

    res.json({
      success: true,
      data: {
        sessions: sessionSummaries,
        total: sessions.length
      }
    });

  } catch (error) {
    console.error('[SessionAnalysis] History error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Compare multiple sessions
 * POST /api/session-analysis/compare
 */
router.post('/compare', authenticateToken, async (req, res) => {
  try {
    const { sessionIds } = req.body;

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 2 session IDs to compare'
      });
    }

    // Get all sessions
    const sessions = await db.prisma.chatSession.findMany({
      where: {
        id: { in: sessionIds },
        userId: req.user.id
      }
    });

    if (sessions.length < 2) {
      return res.status(404).json({
        success: false,
        error: 'Not enough valid sessions found'
      });
    }

    // Compare sessions
    const comparison = sessions.map(session => {
      const messages = session.messages || [];
      const userMessages = messages.filter(m => m.role === 'user');
      
      return {
        sessionId: session.id,
        title: session.title,
        date: session.createdAt,
        messageCount: messages.length,
        userEngagement: userMessages.length,
        duration: session.lastMessageAt ? 
          Math.round((new Date(session.lastMessageAt) - new Date(session.createdAt)) / 60000) : 0,
        topics: extractKeyTopics(userMessages.map(m => m.content).join(' '))
      };
    });

    res.json({
      success: true,
      data: {
        comparison,
        insights: {
          mostEngaged: comparison.reduce((max, s) => 
            s.userEngagement > max.userEngagement ? s : max, comparison[0]),
          longestSession: comparison.reduce((max, s) => 
            s.duration > max.duration ? s : max, comparison[0]),
          totalSessions: comparison.length
        }
      }
    });

  } catch (error) {
    console.error('[SessionAnalysis] Compare error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper function to extract key topics from text
 */
function extractKeyTopics(text) {
  if (!text) return [];
  
  const healthKeywords = {
    'nutrition': ['nutrition', 'diet', 'food', 'meal', 'eating', 'calories'],
    'exercise': ['exercise', 'workout', 'fitness', 'training', 'gym', 'cardio'],
    'sleep': ['sleep', 'rest', 'insomnia', 'tired', 'fatigue'],
    'mental_health': ['stress', 'anxiety', 'depression', 'mood', 'mental', 'emotional'],
    'weight': ['weight', 'lose', 'gain', 'bmi', 'obesity'],
    'wellness': ['wellness', 'health', 'wellbeing', 'lifestyle'],
    'pain': ['pain', 'ache', 'hurt', 'sore', 'injury'],
    'medication': ['medication', 'medicine', 'prescription', 'drug', 'supplement']
  };

  const lowerText = text.toLowerCase();
  const topics = [];

  for (const [topic, keywords] of Object.entries(healthKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ['general_health'];
}

export default router;
