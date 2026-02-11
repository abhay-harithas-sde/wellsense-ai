// Initialize WellSense AI MongoDB Database
// This script runs when the container starts for the first time

// Switch to the wellsense_ai database
db = db.getSiblingDB('wellsense_ai');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// Create other collections
db.createCollection('healthRecords');
db.createCollection('weightRecords');
db.createCollection('exerciseRecords');
db.createCollection('nutritionRecords');
db.createCollection('mentalHealthRecords');
db.createCollection('goals');
db.createCollection('chatSessions');
db.createCollection('communityPosts');

// Create indexes for health records
db.healthRecords.createIndex({ userId: 1, recordedAt: -1 });
db.weightRecords.createIndex({ userId: 1, recordedAt: -1 });
db.exerciseRecords.createIndex({ userId: 1, recordedAt: -1 });
db.nutritionRecords.createIndex({ userId: 1, recordedAt: -1 });
db.mentalHealthRecords.createIndex({ userId: 1, recordedAt: -1 });
db.goals.createIndex({ userId: 1, status: 1 });
db.chatSessions.createIndex({ userId: 1, createdAt: -1 });
db.communityPosts.createIndex({ userId: 1, createdAt: -1 });

// Create a read-only user
db.createUser({
  user: 'wellsense_readonly',
  pwd: 'Abhay#1709',
  roles: [
    { role: 'read', db: 'wellsense_ai' }
  ]
});

print('WellSense AI MongoDB initialization completed successfully!');