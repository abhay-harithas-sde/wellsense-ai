#!/usr/bin/env node

// Database CRUD Operations Test Script
// Tests all CRUD operations for all models

require('dotenv').config();
const { DatabaseCRUD } = require('../lib/database-crud');

const db = new DatabaseCRUD();

console.log('\n' + '═'.repeat(80));
console.log('║  WellSense AI - Database CRUD Test Suite');
console.log('═'.repeat(80) + '\n');

let testUserId = null;
let testRecordIds = {};

async function runTests() {
  try {
    // Test 1: Health Check
    console.log('Test 1: Database Health Check');
    const health = await db.healthCheck();
    console.log(`✅ Status: ${health.status}`);
    console.log('');

    // Test 2: Get Stats
    console.log('Test 2: Get Database Statistics');
    const stats = await db.getStats();
    console.log(`✅ Total records: ${stats.total}`);
    console.log(`   - Users: ${stats.users}`);
    console.log(`   - Health Records: ${stats.healthRecords}`);
    console.log(`   - Weight Records: ${stats.weightRecords}`);
    console.log('');

    // Test 3: Create User
    console.log('Test 3: Create Test User');
    const testUser = await db.createUser({
      email: `test_${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      gender: 'MALE',
      preferredUnits: 'METRIC'
    });
    testUserId = testUser.id;
    console.log(`✅ User created: ${testUser.email} (ID: ${testUserId})`);
    console.log('');

    // Test 4: Get User
    console.log('Test 4: Get User by ID');
    const fetchedUser = await db.getUserById(testUserId);
    console.log(`✅ User fetched: ${fetchedUser.email}`);
    console.log('');

    // Test 5: Update User
    console.log('Test 5: Update User');
    const updatedUser = await db.updateUser(testUserId, {
      location: 'Test City',
      bio: 'Test bio for CRUD testing'
    });
    console.log(`✅ User updated: ${updatedUser.location}`);
    console.log('');

    // Test 6: Create Health Record
    console.log('Test 6: Create Health Record');
    const healthRecord = await db.createHealthRecord(testUserId, {
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      temperature: 36.6,
      mood: 8,
      energyLevel: 7,
      symptoms: ['test symptom']
    });
    testRecordIds.healthRecord = healthRecord.id;
    console.log(`✅ Health record created (ID: ${healthRecord.id})`);
    console.log('');

    // Test 7: Create Weight Record
    console.log('Test 7: Create Weight Record');
    const weightRecord = await db.createWeightRecord(testUserId, {
      weightKg: 70.5,
      bodyFatPercentage: 18.5
    });
    testRecordIds.weightRecord = weightRecord.id;
    console.log(`✅ Weight record created (ID: ${weightRecord.id})`);
    console.log('');

    // Test 8: Create Exercise Record
    console.log('Test 8: Create Exercise Record');
    const exerciseRecord = await db.createExerciseRecord(testUserId, {
      exerciseType: 'RUNNING',
      name: 'Morning Run',
      duration: 30,
      caloriesBurned: 300,
      intensity: 'MODERATE'
    });
    testRecordIds.exerciseRecord = exerciseRecord.id;
    console.log(`✅ Exercise record created (ID: ${exerciseRecord.id})`);
    console.log('');

    // Test 9: Create Nutrition Record
    console.log('Test 9: Create Nutrition Record');
    const nutritionRecord = await db.createNutritionRecord(testUserId, {
      mealType: 'BREAKFAST',
      foodName: 'Oatmeal',
      servingSize: 1,
      servingUnit: 'bowl',
      calories: 350,
      protein: 12,
      carbohydrates: 55,
      fat: 8
    });
    testRecordIds.nutritionRecord = nutritionRecord.id;
    console.log(`✅ Nutrition record created (ID: ${nutritionRecord.id})`);
    console.log('');

    // Test 10: Create Mental Health Record
    console.log('Test 10: Create Mental Health Record');
    const mentalHealthRecord = await db.createMentalHealthRecord(testUserId, {
      mood: 8,
      anxiety: 3,
      stress: 4,
      energy: 7,
      symptoms: ['test'],
      triggers: ['test trigger'],
      copingStrategies: ['meditation']
    });
    testRecordIds.mentalHealthRecord = mentalHealthRecord.id;
    console.log(`✅ Mental health record created (ID: ${mentalHealthRecord.id})`);
    console.log('');

    // Test 11: Create Goal
    console.log('Test 11: Create Goal');
    const goal = await db.createGoal(testUserId, {
      title: 'Test Goal',
      description: 'Test goal description',
      category: 'FITNESS',
      targetValue: 100,
      targetUnit: 'workouts',
      status: 'ACTIVE',
      priority: 'MEDIUM'
    });
    testRecordIds.goal = goal.id;
    console.log(`✅ Goal created (ID: ${goal.id})`);
    console.log('');

    // Test 12: Create Chat Session
    console.log('Test 12: Create Chat Session');
    const chatSession = await db.createChatSession(testUserId, {
      title: 'Test Chat',
      sessionType: 'GENERAL',
      aiProvider: 'OPENAI',
      messages: []
    });
    testRecordIds.chatSession = chatSession.id;
    console.log(`✅ Chat session created (ID: ${chatSession.id})`);
    console.log('');

    // Test 13: Create Community Post
    console.log('Test 13: Create Community Post');
    const communityPost = await db.createCommunityPost(testUserId, {
      title: 'Test Post',
      content: 'Test content',
      category: 'GENERAL',
      tags: ['test']
    });
    testRecordIds.communityPost = communityPost.id;
    console.log(`✅ Community post created (ID: ${communityPost.id})`);
    console.log('');

    // Test 14: Create Consultation
    console.log('Test 14: Create Consultation');
    const consultation = await db.createConsultation(testUserId, {
      type: 'VIDEO_CALL',
      specialization: 'Nutritionist',
      duration: 30,
      scheduledAt: new Date(Date.now() + 86400000) // Tomorrow
    });
    testRecordIds.consultation = consultation.id;
    console.log(`✅ Consultation created (ID: ${consultation.id})`);
    console.log('');

    // Test 15: Get User with Relations
    console.log('Test 15: Get User with All Relations');
    const userWithRelations = await db.getUserById(testUserId, true);
    console.log(`✅ User fetched with relations:`);
    console.log(`   - Health Records: ${userWithRelations.healthRecords.length}`);
    console.log(`   - Weight Records: ${userWithRelations.weightRecords.length}`);
    console.log(`   - Exercise Records: ${userWithRelations.exerciseRecords.length}`);
    console.log(`   - Nutrition Records: ${userWithRelations.nutritionRecords.length}`);
    console.log(`   - Mental Health Records: ${userWithRelations.mentalHealthRecords.length}`);
    console.log(`   - Goals: ${userWithRelations.goals.length}`);
    console.log(`   - Chat Sessions: ${userWithRelations.chatSessions.length}`);
    console.log(`   - Community Posts: ${userWithRelations.communityPosts.length}`);
    console.log(`   - Consultations: ${userWithRelations.consultations.length}`);
    console.log('');

    // Test 16: Update Records
    console.log('Test 16: Update Records');
    await db.updateHealthRecord(testRecordIds.healthRecord, { heartRate: 75 });
    await db.updateWeightRecord(testRecordIds.weightRecord, { weightKg: 71.0 });
    await db.updateGoalProgress(testRecordIds.goal, 50);
    console.log('✅ Records updated successfully');
    console.log('');

    // Test 17: Get Exercise Stats
    console.log('Test 17: Get Exercise Statistics');
    const exerciseStats = await db.getExerciseStats(testUserId, 30);
    console.log(`✅ Exercise stats:`);
    console.log(`   - Total workouts: ${exerciseStats.totalWorkouts}`);
    console.log(`   - Total duration: ${exerciseStats.totalDuration} minutes`);
    console.log(`   - Total calories: ${exerciseStats.totalCalories}`);
    console.log('');

    // Test 18: Get Daily Nutrition Summary
    console.log('Test 18: Get Daily Nutrition Summary');
    const nutritionSummary = await db.getDailyNutritionSummary(testUserId, new Date());
    console.log(`✅ Nutrition summary:`);
    console.log(`   - Total calories: ${nutritionSummary.totalCalories}`);
    console.log(`   - Total protein: ${nutritionSummary.totalProtein}g`);
    console.log(`   - Meal count: ${nutritionSummary.mealCount}`);
    console.log('');

    // Cleanup: Delete all test data
    console.log('Cleanup: Deleting test data...');
    await db.deleteHealthRecord(testRecordIds.healthRecord);
    await db.deleteWeightRecord(testRecordIds.weightRecord);
    await db.deleteExerciseRecord(testRecordIds.exerciseRecord);
    await db.deleteNutritionRecord(testRecordIds.nutritionRecord);
    await db.deleteMentalHealthRecord(testRecordIds.mentalHealthRecord);
    await db.deleteGoal(testRecordIds.goal);
    await db.deleteChatSession(testRecordIds.chatSession);
    await db.deleteCommunityPost(testRecordIds.communityPost);
    await db.deleteConsultation(testRecordIds.consultation);
    await db.deleteUser(testUserId);
    console.log('✅ All test data deleted');
    console.log('');

    console.log('═'.repeat(80));
    console.log('║  ✅ All Tests Passed!');
    console.log('═'.repeat(80));
    console.log('\nDatabase CRUD operations are working correctly.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    
    // Attempt cleanup on error
    if (testUserId) {
      try {
        console.log('\nAttempting cleanup...');
        await db.deleteUser(testUserId);
        console.log('✅ Cleanup completed');
      } catch (cleanupError) {
        console.error('❌ Cleanup failed:', cleanupError.message);
      }
    }
    
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

// Run tests
runTests();
