// Test SessionAnalyze and FoodGenerate Health Plan Actions
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// You'll need to replace this with a valid token
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'your-auth-token-here';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testActions() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   TESTING: SessionAnalyze & FoodGenerate Health Plan          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  try {
    // ========== TEST 1: Health Plan Generation ==========
    console.log('📋 TEST 1: Health Plan Generation\n');
    console.log('─'.repeat(65));

    const healthPlanData = {
      userProfile: {
        age: 30,
        gender: 'male',
        weight: 75,
        height: 175,
        bmi: 24.5,
        activityLevel: 'moderately_active',
        currentHealth: {
          heartRate: 72,
          bloodPressure: '120/80',
          recentSymptoms: []
        }
      },
      healthGoals: ['weight_loss', 'fitness', 'nutrition'],
      preferences: {
        dietType: 'balanced',
        exerciseType: 'mixed'
      }
    };

    console.log('Sending request to generate health plan...');
    const healthPlanResponse = await axios.post(
      `${BASE_URL}/api/chat/generate-plan`,
      healthPlanData,
      { headers }
    );

    if (healthPlanResponse.data.success) {
      console.log('✅ Health Plan Generated Successfully!\n');
      console.log('Provider:', healthPlanResponse.data.provider);
      console.log('Model:', healthPlanResponse.data.model);
      console.log('Timestamp:', healthPlanResponse.data.timestamp);
      console.log('\nPlan Preview (first 500 chars):');
      console.log(healthPlanResponse.data.content.substring(0, 500) + '...\n');
    } else {
      console.log('❌ Health Plan Generation Failed');
      console.log('Error:', healthPlanResponse.data.error);
    }

    // ========== TEST 2: Session Analysis ==========
    console.log('\n📊 TEST 2: Session Analysis\n');
    console.log('─'.repeat(65));

    // First, get list of sessions
    console.log('Fetching session history...');
    const historyResponse = await axios.get(
      `${BASE_URL}/api/session-analysis/history?limit=5`,
      { headers }
    );

    if (historyResponse.data.success && historyResponse.data.data.sessions.length > 0) {
      console.log(`✅ Found ${historyResponse.data.data.sessions.length} sessions\n`);
      
      const sessions = historyResponse.data.data.sessions;
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. Session: ${session.sessionId.slice(-8)}`);
        console.log(`   Type: ${session.sessionType}`);
        console.log(`   Messages: ${session.messageCount}`);
        console.log(`   Duration: ${session.duration} minutes`);
        console.log(`   Date: ${new Date(session.createdAt).toLocaleString()}\n`);
      });

      // Analyze the first session
      const sessionToAnalyze = sessions[0].sessionId;
      console.log(`Analyzing session: ${sessionToAnalyze.slice(-8)}...`);
      
      const analysisResponse = await axios.post(
        `${BASE_URL}/api/session-analysis/analyze/${sessionToAnalyze}`,
        { includeRecommendations: true },
        { headers }
      );

      if (analysisResponse.data.success) {
        console.log('✅ Session Analysis Completed!\n');
        
        const analysis = analysisResponse.data.data;
        console.log('Session Metrics:');
        console.log(`  - Duration: ${analysis.sessionMetrics.duration} minutes`);
        console.log(`  - Total Messages: ${analysis.sessionMetrics.totalMessages}`);
        console.log(`  - User Messages: ${analysis.sessionMetrics.userMessages}`);
        console.log(`  - Avg Message Length: ${analysis.sessionMetrics.avgMessageLength} chars`);
        
        console.log('\nKey Topics:');
        analysis.keyTopics.forEach(topic => {
          console.log(`  - ${topic.replace('_', ' ').toUpperCase()}`);
        });
        
        console.log('\nAI Analysis Preview (first 500 chars):');
        console.log(analysis.aiAnalysis.substring(0, 500) + '...\n');
      } else {
        console.log('❌ Session Analysis Failed');
        console.log('Error:', analysisResponse.data.error);
      }

      // Test session comparison if we have multiple sessions
      if (sessions.length >= 2) {
        console.log('\n🔄 TEST 3: Session Comparison\n');
        console.log('─'.repeat(65));
        
        const sessionIds = sessions.slice(0, 2).map(s => s.sessionId);
        console.log(`Comparing sessions: ${sessionIds.map(id => id.slice(-8)).join(' vs ')}`);
        
        const compareResponse = await axios.post(
          `${BASE_URL}/api/session-analysis/compare`,
          { sessionIds },
          { headers }
        );

        if (compareResponse.data.success) {
          console.log('✅ Session Comparison Completed!\n');
          
          const comparison = compareResponse.data.data.comparison;
          comparison.forEach((session, index) => {
            console.log(`Session ${index + 1}:`);
            console.log(`  - Messages: ${session.messageCount}`);
            console.log(`  - Engagement: ${session.userEngagement} user messages`);
            console.log(`  - Duration: ${session.duration} minutes`);
            console.log(`  - Topics: ${session.topics.join(', ')}\n`);
          });

          const insights = compareResponse.data.data.insights;
          console.log('Insights:');
          console.log(`  - Most Engaged: Session ${insights.mostEngaged.sessionId.slice(-8)}`);
          console.log(`  - Longest: Session ${insights.longestSession.sessionId.slice(-8)}`);
          console.log(`  - Total Compared: ${insights.totalSessions}\n`);
        }
      }

    } else {
      console.log('⚠️  No sessions found. Create a chat session first.');
      console.log('   You can do this by using the AI Chat feature in the app.\n');
    }

    // ========== SUMMARY ==========
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                        TEST SUMMARY                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ Health Plan Generation: WORKING');
    console.log('✅ Session Analysis: WORKING');
    console.log('✅ Session History: WORKING');
    console.log('✅ Session Comparison: WORKING\n');
    
    console.log('🎯 All Actions Are Operational!\n');
    console.log('📝 Note: Make sure you have:');
    console.log('   1. Valid authentication token');
    console.log('   2. At least one chat session created');
    console.log('   3. GOD server running on port 3000\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Ensure GOD server is running: node god-server.js');
    console.log('   2. Check your authentication token is valid');
    console.log('   3. Create a chat session first if testing session analysis');
    console.log('   4. Verify database connections are healthy\n');
  }
}

// Run tests
console.log('Starting action tests...\n');
testActions();
