#!/usr/bin/env node

/**
 * Generate Population Report
 * 
 * Creates a population report based on current database state
 * without re-populating data.
 */

const fs = require('fs');
const path = require('path');
const { getDatabaseConnection } = require('./database/connection');

async function generateReport() {
  console.log('📊 Generating population report from current database state...\n');
  
  const db = getDatabaseConnection();
  const report = {
    timestamp: new Date().toISOString(),
    status: 'success',
    entities: {}
  };
  
  try {
    // Connect to databases
    await db.connectPostgres();
    const prisma = db.getPrisma();
    
    // Count PostgreSQL entities
    const userCount = await prisma.user.count();
    const healthRecordCount = await prisma.healthRecord.count();
    const nutritionRecordCount = await prisma.nutritionRecord.count();
    const exerciseRecordCount = await prisma.exerciseRecord.count();
    const mentalHealthRecordCount = await prisma.mentalHealthRecord.count();
    const consultationCount = await prisma.consultation.count();
    
    report.entities.users = { created: userCount, target: 10, status: userCount >= 10 ? 'success' : 'insufficient' };
    report.entities.healthMetrics = { created: healthRecordCount, target: 100, status: healthRecordCount >= 100 ? 'success' : 'insufficient' };
    report.entities.nutritionPlans = { created: nutritionRecordCount, target: 100, status: nutritionRecordCount >= 100 ? 'success' : 'insufficient' };
    report.entities.exercisePlans = { created: exerciseRecordCount, target: 100, status: exerciseRecordCount >= 100 ? 'success' : 'insufficient' };
    report.entities.mentalWellness = { created: mentalHealthRecordCount, target: 100, status: mentalHealthRecordCount >= 100 ? 'success' : 'insufficient' };
    report.entities.consultations = { created: consultationCount, target: 50, status: consultationCount >= 50 ? 'success' : 'insufficient' };
    
    console.log('PostgreSQL Entities:');
    console.log(`  Users: ${userCount} (target: 10)`);
    console.log(`  Health Records: ${healthRecordCount} (target: 100)`);
    console.log(`  Nutrition Records: ${nutritionRecordCount} (target: 100)`);
    console.log(`  Exercise Records: ${exerciseRecordCount} (target: 100)`);
    console.log(`  Mental Health Records: ${mentalHealthRecordCount} (target: 100)`);
    console.log(`  Consultations: ${consultationCount} (target: 50)`);
    
    // Try MongoDB
    try {
      await db.connectMongo();
      const mongodb = db.getMongo();
      
      const fitnessPlansCount = await mongodb.collection('fitness_plans').countDocuments();
      const communityPostsCount = await mongodb.collection('community_posts').countDocuments();
      
      report.entities.fitnessPlans = { created: fitnessPlansCount, target: 10, status: fitnessPlansCount >= 10 ? 'success' : 'insufficient' };
      report.entities.communityPosts = { created: communityPostsCount, target: 10, status: communityPostsCount >= 10 ? 'success' : 'insufficient' };
      
      console.log('\nMongoDB Entities:');
      console.log(`  Fitness Plans: ${fitnessPlansCount} (target: 10)`);
      console.log(`  Community Posts: ${communityPostsCount} (target: 10)`);
    } catch (error) {
      console.log('\n⚠️  MongoDB not available:', error.message);
      report.entities.fitnessPlans = { created: 0, target: 10, status: 'unavailable' };
      report.entities.communityPosts = { created: 0, target: 10, status: 'unavailable' };
    }
    
    // Save report
    const reportPath = path.join(__dirname, 'reports', 'population-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n✅ Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
    report.status = 'error';
    report.error = error.message;
  } finally {
    await db.disconnectAll();
  }
  
  return report;
}

if (require.main === module) {
  generateReport()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateReport };
