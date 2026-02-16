# Actions Guide: SessionAnalyze & FoodGenerate Health Plan

**Status:** ✅ FIXED AND OPERATIONAL  
**Date:** February 16, 2026

---

## Overview

This guide covers two key actions in WellSense AI:
1. **SessionAnalyze** - Analyze chat sessions and extract insights
2. **FoodGenerate Health Plan** - Generate personalized health and nutrition plans

Both actions are now fully functional with proper error handling and fallback mechanisms.

---

## 1. SessionAnalyze

### Description
Analyzes chat sessions to provide insights, identify patterns, extract key topics, and generate actionable recommendations.

### Endpoints

#### Analyze Session
```
POST /api/session-analysis/analyze/:sessionId
```

**Request Body:**
```json
{
  "includeRecommendations": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-id-here",
    "sessionMetrics": {
      "duration": 15,
      "totalMessages": 12,
      "userMessages": 6,
      "assistantMessages": 6,
      "avgMessageLength": 150,
      "sessionType": "COACHING",
      "isActive": true
    },
    "keyTopics": ["nutrition", "exercise", "sleep"],
    "aiAnalysis": "Detailed AI-generated analysis...",
    "provider": "openai",
    "model": "gpt-4",
    "timestamp": "2026-02-16T..."
  }
}
```

#### Get Session History
```
GET /api/session-analysis/history?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "...",
        "title": "Health Coaching Session",
        "sessionType": "COACHING",
        "messageCount": 12,
        "duration": 15,
        "preview": "User asked about nutrition..."
      }
    ],
    "total": 5
  }
}
```

#### Compare Sessions
```
POST /api/session-analysis/compare
```

**Request Body:**
```json
{
  "sessionIds": ["session-1", "session-2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison": [
      {
        "sessionId": "...",
        "messageCount": 12,
        "userEngagement": 6,
        "duration": 15,
        "topics": ["nutrition", "exercise"]
      }
    ],
    "insights": {
      "mostEngaged": {...},
      "longestSession": {...},
      "totalSessions": 2
    }
  }
}
```

### Frontend Usage

```javascript
import sessionAnalysisService from '../services/sessionAnalysis';

// Analyze a session
const result = await sessionAnalysisService.analyzeSession(sessionId);
if (result.success) {
  console.log('Analysis:', result.analysis);
  
  // Format for display
  const formatted = sessionAnalysisService.formatAnalysis(result.analysis);
  
  // Extract action items
  const actions = sessionAnalysisService.extractActionItems(
    result.analysis.aiAnalysis
  );
  
  // Calculate health score
  const score = sessionAnalysisService.calculateSessionHealthScore(
    result.analysis.sessionMetrics
  );
}

// Get history
const history = await sessionAnalysisService.getAnalysisHistory(10);

// Compare sessions
const comparison = await sessionAnalysisService.compareSessions([
  'session-1',
  'session-2'
]);
```

### Features

- **Session Metrics**: Duration, message count, engagement level
- **Topic Extraction**: Automatically identifies health topics discussed
- **AI Insights**: Comprehensive analysis with recommendations
- **Progress Tracking**: Compare sessions over time
- **Action Items**: Extracts specific next steps
- **Health Score**: Calculates session quality (0-100)

---

## 2. FoodGenerate Health Plan

### Description
Generates personalized health and nutrition plans based on user profile, health goals, and current health data.

### Endpoint

```
POST /api/chat/generate-plan
```

### Request Body

```json
{
  "userProfile": {
    "age": 30,
    "gender": "male",
    "weight": 75,
    "height": 175,
    "bmi": 24.5,
    "activityLevel": "moderately_active",
    "currentHealth": {
      "heartRate": 72,
      "bloodPressure": "120/80",
      "recentSymptoms": []
    }
  },
  "healthGoals": ["weight_loss", "fitness", "nutrition"],
  "preferences": {
    "dietType": "balanced",
    "exerciseType": "mixed"
  }
}
```

### Response

```json
{
  "success": true,
  "content": "# Personalized Health Plan\n\n## Nutrition Plan\n...",
  "provider": "openai",
  "model": "gpt-4",
  "usageStats": {...},
  "timestamp": "2026-02-16T..."
}
```

### Frontend Usage

```javascript
import openaiClient from '../services/openaiClient';

// Generate health plan
const result = await openaiClient.generateHealthPlan(
  userProfile,
  ['weight_loss', 'fitness'],
  { dietType: 'balanced', exerciseType: 'mixed' }
);

if (result.success) {
  console.log('Health Plan:', result.plan);
  
  // Get structured sections
  const structured = result.structured;
  console.log('Nutrition:', structured.nutrition);
  console.log('Exercise:', structured.exercise);
  console.log('Sleep:', structured.sleep);
}
```

### Plan Includes

1. **Nutrition Plan**
   - Meal suggestions
   - Calorie targets
   - Macronutrient breakdown
   - Dietary guidelines

2. **Exercise Plan**
   - Weekly workout schedule
   - Specific exercises
   - Sets and reps
   - Progression plan

3. **Lifestyle Recommendations**
   - Sleep optimization
   - Stress management
   - Hydration goals
   - Recovery strategies

4. **Progress Tracking**
   - Key metrics to monitor
   - Measurement frequency
   - Success indicators

5. **30-Day Timeline**
   - Week-by-week breakdown
   - Milestone targets
   - Adjustment points

### Trigger Methods

#### Method 1: Direct API Call
```javascript
const plan = await openaiClient.generateHealthPlan(profile, goals, prefs);
```

#### Method 2: Chat Message
User sends message containing:
- "create a health plan"
- "generate meal plan"
- "make fitness plan"
- "health plan for me"

#### Method 3: Quick Action Button
```javascript
<button onClick={() => handleSuggestionClick("Create a personalized health plan for me")}>
  Generate Health Plan
</button>
```

---

## Error Handling

Both actions include comprehensive error handling:

### Fallback Mechanisms

1. **AI Service Unavailable**: Returns template-based responses
2. **Missing Data**: Uses default values and notifies user
3. **Authentication Errors**: Clear error messages with guidance
4. **Network Issues**: Retry logic and offline support

### Example Error Response

```json
{
  "success": true,
  "content": "...",
  "provider": "fallback",
  "model": "template",
  "note": "AI service unavailable - using template plan"
}
```

---

## Testing

### Run Comprehensive Tests

```bash
# Set your auth token
export TEST_AUTH_TOKEN="your-token-here"

# Run tests
node scripts/test-actions.js
```

### Manual Testing

1. **Health Plan Generation:**
   - Open Nutritionist Chat
   - Type: "Create a health plan for me"
   - Wait for AI response
   - Verify plan includes all sections

2. **Session Analysis:**
   - Complete a chat session
   - Call analysis endpoint with session ID
   - Verify metrics and insights
   - Check action items extraction

---

## Integration Examples

### React Component Example

```jsx
import { useState } from 'react';
import openaiClient from '../services/openaiClient';
import sessionAnalysisService from '../services/sessionAnalysis';

function HealthActions() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const generatePlan = async () => {
    setLoading(true);
    const result = await openaiClient.generateHealthPlan(
      userProfile,
      ['fitness', 'nutrition'],
      { dietType: 'balanced' }
    );
    setPlan(result.plan);
    setLoading(false);
  };

  const analyzeSession = async (sessionId) => {
    setLoading(true);
    const result = await sessionAnalysisService.analyzeSession(sessionId);
    setAnalysis(result.analysis);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={generatePlan} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Health Plan'}
      </button>
      
      <button onClick={() => analyzeSession(currentSessionId)} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Session'}
      </button>

      {plan && <div className="health-plan">{plan}</div>}
      {analysis && <div className="analysis">{analysis.aiAnalysis}</div>}
    </div>
  );
}
```

---

## Troubleshooting

### Health Plan Not Generating

**Symptoms:**
- No response or error message
- Empty plan content
- Timeout errors

**Solutions:**
1. Check OpenAI API key is configured
2. Verify user authentication token
3. Ensure user profile has required fields
4. Check server logs for errors
5. Fallback plan should still work

### Session Analysis Failing

**Symptoms:**
- "Session not found" error
- Empty analysis
- Missing metrics

**Solutions:**
1. Verify session ID is correct
2. Check user owns the session
3. Ensure session has messages
4. Verify database connection
5. Check authentication token

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid token | Re-authenticate user |
| 404 Not Found | Invalid session ID | Verify session exists |
| 500 Server Error | AI service down | Check fallback response |
| Empty response | No data available | Ensure user has data |
| Timeout | Long processing | Increase timeout limit |

---

## Performance

### Response Times

- **Health Plan Generation**: 2-5 seconds (AI) / <1 second (fallback)
- **Session Analysis**: 1-3 seconds (AI) / <1 second (fallback)
- **Session History**: <500ms
- **Session Comparison**: <1 second

### Optimization Tips

1. Cache generated plans for 24 hours
2. Pre-load session history on dashboard
3. Use streaming for real-time plan generation
4. Batch analyze multiple sessions
5. Implement progressive loading

---

## Security

### Authentication Required

All endpoints require valid JWT token:
```
Authorization: Bearer <token>
```

### Data Privacy

- Sessions are user-specific
- No cross-user data access
- Analysis stored securely
- PII handled according to policy

### Rate Limiting

- Health Plan: 10 requests/hour per user
- Session Analysis: 20 requests/hour per user
- History: 100 requests/hour per user

---

## Future Enhancements

- [ ] Real-time streaming for plan generation
- [ ] Multi-language support
- [ ] Export plans as PDF
- [ ] Schedule automatic session analysis
- [ ] Integration with wearable devices
- [ ] Collaborative plans with healthcare providers
- [ ] AI-powered plan adjustments based on progress

---

## Support

For issues or questions:
1. Check server logs: `logs/combined.log`
2. Review error messages in browser console
3. Test with `scripts/test-actions.js`
4. Verify GOD server is running
5. Check database connections

---

**Last Updated:** February 16, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
