# 🗄️ WellSense AI Database Documentation

## Overview

WellSense AI uses MongoDB as its primary database, providing a flexible and scalable solution for storing health and wellness data. The database is designed to handle complex health records, user interactions, and AI-generated insights.

## 📊 Database Architecture

### Core Collections

1. **Users** - User profiles and authentication
2. **HealthRecords** - General health data and metrics
3. **WeightRecords** - Weight tracking and body composition
4. **MentalHealthRecords** - Mental wellness and mood tracking
5. **NutritionRecords** - Food intake and nutrition data
6. **ExerciseRecords** - Workout and fitness activities
7. **Goals** - User health and fitness goals
8. **ChatSessions** - AI chat conversations
9. **CommunityPosts** - Social features and community content

## 🏗️ Schema Design

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    height: Number, // cm
    weight: Number, // kg
    activityLevel: String,
    medicalConditions: [String],
    allergies: [String],
    medications: [String]
  },
  healthMetrics: {
    currentWeight: Number,
    targetWeight: Number,
    bmi: Number,
    bodyFatPercentage: Number,
    muscleMass: Number
  },
  goals: [GoalSchema],
  preferences: {
    dietType: String,
    exercisePreferences: [String],
    notifications: Object
  },
  healthScore: Number (0-100),
  streakDays: Number,
  totalPoints: Number,
  achievements: [AchievementSchema],
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### HealthRecords Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String, // 'vital_signs', 'symptoms', 'medication', etc.
  data: {
    // Vital Signs
    heartRate: Number,
    bloodPressure: { systolic: Number, diastolic: Number },
    temperature: Number,
    oxygenSaturation: Number,
    
    // Physical Metrics
    weight: Number,
    height: Number,
    bodyFatPercentage: Number,
    
    // Exercise Data
    exerciseType: String,
    duration: Number,
    intensity: String,
    caloriesBurned: Number,
    
    // Nutrition Data
    meals: [MealSchema],
    waterIntake: Number,
    
    // Sleep Data
    bedTime: Date,
    wakeTime: Date,
    sleepDuration: Number,
    sleepQuality: Number,
    
    // Mood & Mental Health
    moodScore: Number,
    stressLevel: Number,
    anxietyLevel: Number,
    energyLevel: Number,
    
    // Symptoms
    symptoms: [SymptomSchema],
    
    // Lab Results
    labResults: [LabResultSchema],
    
    // Medication
    medications: [MedicationSchema]
  },
  notes: String,
  attachments: [AttachmentSchema],
  aiAnalysis: {
    summary: String,
    insights: [String],
    recommendations: [String],
    riskFactors: [String],
    confidence: Number
  },
  recordedAt: Date,
  source: String, // 'manual', 'device', 'ai_analysis', etc.
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### WeightRecords Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  weight: Number, // kg
  unit: String, // 'kg' or 'lbs'
  bodyFatPercentage: Number,
  muscleMass: Number,
  waterPercentage: Number,
  bmi: Number,
  measurements: {
    waist: Number,
    chest: Number,
    hips: Number,
    thighs: Number,
    arms: Number,
    neck: Number
  },
  notes: String,
  mood: String,
  energyLevel: Number,
  source: String,
  deviceInfo: {
    deviceName: String,
    deviceModel: String,
    accuracy: Number
  },
  photo: {
    filename: String,
    url: String,
    isProgress: Boolean
  },
  recordedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### MentalHealthRecords Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  mood: {
    rating: Number (1-10),
    description: String,
    emotions: [String]
  },
  stress: {
    level: Number (1-10),
    triggers: [String],
    copingStrategies: [String]
  },
  anxiety: {
    level: Number (1-10),
    symptoms: [String],
    triggers: [String]
  },
  energy: {
    level: Number (1-10),
    factors: [String]
  },
  sleep: {
    quality: Number (1-10),
    duration: Number,
    bedTime: Date,
    wakeTime: Date,
    disturbances: [String]
  },
  activities: [ActivitySchema],
  symptoms: [SymptomSchema],
  medications: [MedicationSchema],
  therapy: {
    hadSession: Boolean,
    type: String,
    therapistRating: Number,
    sessionNotes: String,
    homework: String
  },
  journalEntry: {
    content: String,
    gratitude: [String],
    achievements: [String],
    challenges: [String],
    goals: [String]
  },
  socialInteraction: {
    quality: Number,
    duration: Number,
    type: [String],
    satisfaction: Number
  },
  environmentalFactors: {
    weather: String,
    location: String,
    noiseLevel: String
  },
  aiInsights: {
    moodPattern: String,
    recommendations: [String],
    riskFactors: [String],
    positiveFactors: [String],
    trendAnalysis: String
  },
  recordedAt: Date,
  source: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Goals Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  description: String,
  category: String, // 'weight_loss', 'fitness', 'nutrition', etc.
  type: String, // 'numeric', 'boolean', 'habit', 'milestone'
  target: {
    value: Number,
    unit: String,
    frequency: String,
    frequencyCount: Number,
    milestones: [MilestoneSchema]
  },
  current: {
    value: Number,
    lastUpdated: Date
  },
  startDate: Date,
  targetDate: Date,
  status: String, // 'active', 'completed', 'paused', etc.
  priority: String,
  difficulty: String,
  progress: {
    percentage: Number,
    streak: Number,
    longestStreak: Number,
    totalDays: Number,
    completedDays: Number
  },
  tracking: {
    method: String,
    frequency: String,
    reminders: [ReminderSchema]
  },
  rewards: [RewardSchema],
  obstacles: [ObstacleSchema],
  motivation: {
    why: String,
    benefits: [String],
    consequences: [String],
    visualizations: [String]
  },
  support: {
    accountabilityPartner: ObjectId (ref: User),
    supportGroup: String,
    coach: String,
    resources: [String]
  },
  history: [HistorySchema],
  analytics: {
    averageProgress: Number,
    bestStreak: Number,
    totalSetbacks: Number,
    recoveryTime: Number,
    consistencyScore: Number,
    predictionAccuracy: Number
  },
  aiInsights: {
    successProbability: Number,
    recommendedAdjustments: [String],
    similarGoalsSuccess: Number,
    riskFactors: [String],
    strengthFactors: [String]
  },
  tags: [String],
  isPublic: Boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 Database Indexes

### Performance Indexes
```javascript
// Users
{ email: 1 } // unique
{ "profile.firstName": 1, "profile.lastName": 1 }
{ createdAt: -1 }

// HealthRecords
{ userId: 1, type: 1, recordedAt: -1 }
{ userId: 1, recordedAt: -1 }

// WeightRecords
{ userId: 1, recordedAt: -1 }

// MentalHealthRecords
{ userId: 1, recordedAt: -1 }
{ userId: 1, "mood.rating": -1 }

// NutritionRecords
{ userId: 1, date: -1 }

// ExerciseRecords
{ userId: 1, startTime: -1 }
{ userId: 1, type: 1 }
{ "exercises.name": 1, userId: 1, startTime: -1 }

// Goals
{ userId: 1, status: 1, createdAt: -1 }
{ userId: 1, category: 1 }
{ userId: 1, targetDate: 1 }

// ChatSessions
{ userId: 1, createdAt: -1 }
{ sessionId: 1 } // unique

// CommunityPosts
{ author: 1, createdAt: -1 }
{ category: 1, createdAt: -1 }
{ tags: 1 }
{ "engagement.engagementRate": -1 }
```

## 🚀 Database Operations

### Connection Management
```javascript
const { databaseManager } = require('./utils/database');

// Connect to database
await databaseManager.connect();

// Check connection status
const status = databaseManager.getConnectionStatus();

// Health check
const health = await databaseManager.healthCheck();

// Disconnect
await databaseManager.disconnect();
```

### Data Seeding
```javascript
const DataSeeder = require('./utils/seedData');

const seeder = new DataSeeder();
await seeder.seedAll({
  users: 10,
  clearExisting: false
});
```

### Analytics and Statistics
```javascript
// Get database analytics
const analytics = await databaseManager.getAnalytics();

// Get collection statistics
const collections = await databaseManager.getCollectionStats();

// Get user goal statistics
const goalStats = await Goal.getUserGoalStats(userId);

// Get weight statistics
const weightStats = await WeightRecord.getWeightStats(userId, 30);
```

## 🛠️ Database Utilities

### Aggregation Helpers
```javascript
const { aggregationHelpers } = require('./utils/database');

// Match documents by user ID
const pipeline = [
  aggregationHelpers.matchUser(userId),
  aggregationHelpers.matchDateRange('recordedAt', startDate, endDate),
  aggregationHelpers.groupByDate('recordedAt', { count: { $sum: 1 } }),
  aggregationHelpers.sortByDateDesc(),
  aggregationHelpers.limit(30)
];
```

### Data Validation
```javascript
const { isValidObjectId, createObjectId } = require('./utils/database');

if (isValidObjectId(id)) {
  const objectId = createObjectId(id);
}
```

## 📋 API Endpoints

### Database Management
- `GET /api/database/health` - Database health check
- `GET /api/database/stats` - Database statistics
- `POST /api/database/seed` - Seed demo data
- `POST /api/database/backup` - Create backup
- `POST /api/database/cleanup` - Clean old data
- `POST /api/database/indexes` - Create indexes
- `GET /api/database/connection` - Connection status
- `GET /api/database/schema` - Schema information

### Data Export/Import
- `GET /api/database/export/:collection` - Export collection data

## 🔧 Setup and Initialization

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/wellsense-ai
NODE_ENV=development
```

### Initialize Database
```bash
# Basic initialization
node server/scripts/initDatabase.js

# Initialize with demo data
node server/scripts/initDatabase.js --seed

# Initialize with custom user count
node server/scripts/initDatabase.js --seed --users=50

# Clear existing data and reseed
node server/scripts/initDatabase.js --clear --seed
```

### Package.json Scripts
```json
{
  "scripts": {
    "db:init": "node server/scripts/initDatabase.js",
    "db:seed": "node server/scripts/initDatabase.js --seed",
    "db:reset": "node server/scripts/initDatabase.js --clear --seed"
  }
}
```

## 🔒 Security Considerations

### Data Protection
- Passwords are hashed using bcrypt with salt rounds of 12
- Sensitive health data is encrypted at rest
- API endpoints require authentication
- Rate limiting prevents abuse
- Input validation prevents injection attacks

### Privacy Compliance
- User data can be anonymized for analytics
- Data retention policies implemented
- User consent tracking
- GDPR compliance features

## 📈 Performance Optimization

### Query Optimization
- Proper indexing for common queries
- Aggregation pipelines for complex analytics
- Connection pooling for high concurrency
- Query result caching

### Data Archiving
- Old health records archived after 1 year
- Inactive user data cleanup
- Log rotation and cleanup
- Backup and restore procedures

## 🔄 Data Migration

### Schema Updates
- Version-controlled schema changes
- Migration scripts for data transformation
- Rollback procedures
- Testing on staging environment

### Backup and Recovery
- Daily automated backups
- Point-in-time recovery
- Disaster recovery procedures
- Data integrity checks

## 📊 Monitoring and Maintenance

### Health Monitoring
- Database connection monitoring
- Query performance tracking
- Storage usage alerts
- Index usage analysis

### Maintenance Tasks
- Regular index optimization
- Data cleanup and archiving
- Performance tuning
- Security updates

## 🧪 Testing

### Test Data
- Automated test data generation
- Isolated test database
- Data cleanup after tests
- Performance benchmarking

### Integration Tests
- API endpoint testing
- Database operation testing
- Data consistency validation
- Performance testing

## 📚 Best Practices

### Development
- Use transactions for multi-document operations
- Implement proper error handling
- Follow naming conventions
- Document schema changes

### Production
- Monitor query performance
- Implement proper logging
- Use connection pooling
- Regular backups and testing

### Security
- Regular security audits
- Access control implementation
- Data encryption
- Compliance monitoring

---

## 🆘 Troubleshooting

### Common Issues
1. **Connection Timeout**: Check network connectivity and MongoDB service
2. **Index Creation Failed**: Verify sufficient disk space and permissions
3. **Slow Queries**: Analyze query patterns and add appropriate indexes
4. **Memory Issues**: Monitor collection sizes and implement archiving

### Debug Commands
```bash
# Check database status
curl http://localhost:5000/api/database/health

# View collection statistics
curl http://localhost:5000/api/database/stats

# Test connection
node -e "require('./server/utils/database').databaseManager.connect().then(() => console.log('Connected')).catch(console.error)"
```

This comprehensive database system provides a robust foundation for the WellSense AI health platform, ensuring scalability, performance, and data integrity while maintaining user privacy and security.