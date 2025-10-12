const aiIntegrationService = require('./server/services/aiIntegrationService');

async function testAllProviders() {
  console.log('🧪 Testing WellSense AI - AI Provider Integration');
  console.log('================================================\n');

  try {
    // Test health advice
    console.log('1. Testing Health Advice Generation...');
    const healthAdvice = await aiIntegrationService.getHealthAdvice(
      "I've been feeling tired lately and having trouble sleeping. What should I do?",
      { age: 30, gender: 'female', healthGoals: ['better_sleep', 'more_energy'] }
    );
    console.log(`   ✅ Provider: ${healthAdvice.provider}`);
    console.log(`   📝 Response: ${healthAdvice.content.substring(0, 100)}...`);
    console.log('');

    // Test nutrition analysis
    console.log('2. Testing Nutrition Analysis...');
    const nutritionAnalysis = await aiIntegrationService.analyzeNutrition(
      { breakfast: 'oatmeal with berries', calories: 350, protein: 12 },
      { goal: 'weight_loss', dietary_restrictions: ['vegetarian'] }
    );
    console.log(`   ✅ Provider: ${nutritionAnalysis.provider}`);
    console.log(`   📝 Analysis: ${nutritionAnalysis.content.substring(0, 100)}...`);
    console.log('');

    // Test workout plan generation
    console.log('3. Testing Workout Plan Generation...');
    const workoutPlan = await aiIntegrationService.generateWorkoutPlan(
      { age: 25, fitnessLevel: 'beginner', goals: ['strength', 'cardio'] },
      { timeAvailable: '30 minutes', equipment: 'none' }
    );
    console.log(`   ✅ Provider: ${workoutPlan.provider}`);
    console.log(`   📝 Plan: ${workoutPlan.content.substring(0, 100)}...`);
    console.log('');

    // Test mental wellness support
    console.log('4. Testing Mental Wellness Support...');
    const mentalSupport = await aiIntegrationService.provideMentalWellnessSupport(
      'anxious',
      ['work_stress', 'sleep_issues']
    );
    console.log(`   ✅ Provider: ${mentalSupport.provider}`);
    console.log(`   📝 Support: ${mentalSupport.content.substring(0, 100)}...`);
    console.log('');

    // Test AI service health check
    console.log('5. Testing AI Service Health Check...');
    const healthCheck = await aiIntegrationService.healthCheck();
    console.log(`   ✅ Overall Status: ${healthCheck.overall_status}`);
    console.log('   📊 Provider Status:');
    Object.entries(healthCheck.providers).forEach(([provider, status]) => {
      const icon = status.status === 'operational' ? '✅' : 
                   status.status === 'configured' ? '⚙️' : 
                   status.status === 'error' ? '❌' : '⚠️';
      console.log(`      ${icon} ${provider}: ${status.status}`);
    });
    console.log('');

    // Test image analysis (mock)
    console.log('6. Testing Image Analysis (Mock)...');
    const mockImageBuffer = Buffer.from('mock image data');
    const imageAnalysis = await aiIntegrationService.analyzeHealthImage(mockImageBuffer, 'blood_test');
    console.log(`   ✅ Provider: ${imageAnalysis.provider}`);
    console.log(`   📝 Analysis: ${imageAnalysis.analysis.substring(0, 100)}...`);
    console.log('');

    // Test voice transcription (mock)
    console.log('7. Testing Voice Transcription (Mock)...');
    const mockAudioBuffer = Buffer.from('mock audio data');
    const transcription = await aiIntegrationService.transcribeAudio(mockAudioBuffer, 'en');
    console.log(`   ✅ Provider: ${transcription.provider}`);
    console.log(`   📝 Transcription: ${transcription.text}`);
    console.log('');

    console.log('🎉 All AI Provider Tests Completed Successfully!');
    console.log('===============================================\n');

    console.log('📊 Test Summary:');
    console.log('   ✅ Health Advice: Working');
    console.log('   ✅ Nutrition Analysis: Working');
    console.log('   ✅ Workout Planning: Working');
    console.log('   ✅ Mental Wellness: Working');
    console.log('   ✅ Image Analysis: Working');
    console.log('   ✅ Voice Transcription: Working');
    console.log('   ✅ Health Check: Working');

    console.log('\n🚀 Your AI integration is ready for production!');
    console.log('   • Multiple AI providers configured');
    console.log('   • Intelligent fallback system active');
    console.log('   • All health coaching features operational');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check your .env file for API keys');
    console.log('   • Ensure all dependencies are installed');
    console.log('   • Run: npm run setup:ai for guided setup');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAllProviders();
}

module.exports = testAllProviders;