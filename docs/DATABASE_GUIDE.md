# WellSense AI - Complete Database Guide

## 🎯 Overview

This guide covers the complete database system for WellSense AI, including schema, CRUD operations, API endpoints, and best practices.

## 📊 Database Schema

### Models

1. **User** - User accounts and profiles
2. **HealthRecord** - Vital signs and health metrics
3. **WeightRecord** - Weight tracking with body composition
4. **ExerciseRecord** - Exercise and fitness activities
5. **NutritionRecord** - Food intake and nutrition tracking
6. **MentalHealthRecord** - Mental health and mood tracking
7. **Goal** - User goals and progress tracking
8. **ChatSession** - AI chat conversations
9. **CommunityPost** - Community posts and engagement
10. **Consultation** - Professional consultations

### Key Features

- ✅ Prisma 7 with TypeScript config
- ✅ PostgreSQL database
- ✅ Cascade deletes for data integrity
- ✅ Comprehensive enums for type safety
- ✅ Timestamps on all records
- ✅ Flexible unit system (Metric/Imperial)
- ✅ Privacy controls
- ✅ Multi-provider authentication

## 🚀 Quick Start

### 1. Setup Database

```bash
# Install dependencies
npm install

# Setup database (generates client, runs migrations, validates)
npm run db:setup
```

### 2. Test CRUD Operations

```bash
# Run comprehensive CRUD test suite
npm run db:test
```

### 3. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📝 Database Scripts

### Available Commands

```bash
# Setup and validate database
npm run db:setup

# Test all CRUD operations
npm run db:test

# Generate Prisma client
npm run db:generate

# Create new migration
npm run db:migrate

# Validate schema
npm run db:validate

# Open Prisma Studio (GUI)
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:reset
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wellsense"
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Prisma Configuration

The database uses Prisma 7 with the new configuration format:

**prisma/schema.prisma**
```prisma
datasource db {
  provider = "postgresql"
}
```

**prisma/prisma.config.ts**
```typescript
import { defineConfig } from '@prisma/client'

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})
```

## 💻 Using the Database

### Option 1: DatabaseCRUD Class (Recommended)

```javascript
const { DatabaseCRUD } = require('./lib/database-crud');
const db = new DatabaseCRUD();

// Create user
const user = await db.createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe'
});

// Get user with all relations
const userWithData = await db.getUserById(user.id, true);

// Create health record
const healthRecord = await db.createHealthRecord(user.id, {
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  heartRate: 72
});

// Get exercise stats
const stats = await db.getExerciseStats(user.id, 30);
```

### Option 2: Direct Prisma Client

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Use Prisma directly
const users = await prisma.user.findMany();
```

### Option 3: REST API

```bash
# Create health record
curl -X POST http://localhost:3000/api/v1/health-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bloodPressureSystolic": 120,
    "bloodPressureDiastolic": 80,
    "heartRate": 72
  }'

# Get user's health records
curl http://localhost:3000/api/v1/health-records/user/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 API Documentation

Complete API documentation is available in `docs/API_DOCUMENTATION.md`

### API Endpoints Summary

- **Users**: `/api/v1/users`
- **Health Records**: `/api/v1/health-records`
- **Weight Records**: `/api/v1/weight-records`
- **Exercise Records**: `/api/v1/exercise-records`
- **Nutrition Records**: `/api/v1/nutrition-records`
- **Mental Health**: `/api/v1/mental-health-records`
- **Goals**: `/api/v1/goals`
- **Chat Sessions**: `/api/v1/chat-sessions`
- **Community Posts**: `/api/v1/community-posts`
- **Consultations**: `/api/v1/consultations`

## 🔍 Advanced Features

### Pagination

All list endpoints support pagination:

```javascript
// Get records with pagination
const records = await db.getHealthRecordsByUser(userId, skip=0, take=50);
```

### Date Range Queries

```javascript
// Get health records for date range
const records = await db.getHealthRecordsByDateRange(
  userId,
  '2026-01-01',
  '2026-02-09'
);
```

### Statistics and Analytics

```javascript
// Exercise statistics
const exerciseStats = await db.getExerciseStats(userId, days=30);
// Returns: totalWorkouts, totalDuration, totalCalories, totalDistance

// Daily nutrition summary
const nutritionSummary = await db.getDailyNutritionSummary(userId, date);
// Returns: totalCalories, totalProtein, totalCarbs, totalFat, mealCount

// Weight progress
const weightProgress = await db.getWeightProgress(userId, days=30);

// Mental health trends
const mentalHealthTrends = await db.getMentalHealthTrends(userId, days=30);
```

### Search Functionality

```javascript
// Search users
const users = await db.searchUsers('john');

// Search community posts
const posts = await db.searchCommunityPosts('fitness');
```

## 🛡️ Data Integrity

### Cascade Deletes

When a user is deleted, all related records are automatically deleted:
- Health records
- Weight records
- Exercise records
- Nutrition records
- Mental health records
- Goals
- Chat sessions
- Community posts
- Consultations

### Validation

All data is validated at multiple levels:
1. Prisma schema validation
2. Database constraints
3. Application-level validation
4. API input validation

## 🔐 Security

### Authentication

All API endpoints (except public ones) require JWT authentication:

```javascript
const { authenticateToken } = require('./lib/auth');

// Protected route
router.get('/protected', authenticateToken, async (req, res) => {
  // req.user.userId is available
});
```

### Privacy Controls

Users have privacy settings:
- `profileVisibility`: PUBLIC, FRIENDS, PRIVATE
- `shareHealthData`: Boolean flag
- Individual record permissions

## 📊 Database Monitoring

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

### Statistics

```bash
curl http://localhost:3000/api/v1/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Prisma Studio

Visual database browser:

```bash
npm run db:studio
```

Opens at `http://localhost:5555`

## 🔄 Migrations

### Create Migration

```bash
npm run db:migrate
```

### Migration Files

Located in `prisma/migrations/`

### Reset Database

⚠️ **WARNING**: This deletes all data!

```bash
npm run db:reset
```

## 🧪 Testing

### Run CRUD Tests

```bash
npm run db:test
```

This tests:
- ✅ Database connection
- ✅ Create operations for all models
- ✅ Read operations with relations
- ✅ Update operations
- ✅ Delete operations
- ✅ Statistics and analytics
- ✅ Cleanup

### Manual Testing

Use Prisma Studio or the API endpoints to manually test operations.

## 🐛 Troubleshooting

### Connection Issues

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npm run db:validate

# Regenerate client
npm run db:generate
```

### Migration Issues

```bash
# Reset and recreate
npm run db:reset

# Or manually
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Prisma Client Issues

```bash
# Regenerate client
npm run db:generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 📈 Performance Tips

1. **Use Pagination**: Always paginate large result sets
2. **Select Specific Fields**: Don't fetch unnecessary data
3. **Use Indexes**: Database indexes are configured in schema
4. **Batch Operations**: Use transactions for multiple operations
5. **Connection Pooling**: Prisma handles this automatically

## 🔗 Related Files

- `prisma/schema.prisma` - Database schema
- `prisma/prisma.config.ts` - Prisma 7 configuration
- `lib/database-crud.js` - CRUD operations class
- `routes/crud-api.js` - REST API routes
- `docs/API_DOCUMENTATION.md` - Complete API docs
- `scripts/setup-database.js` - Setup script
- `scripts/test-database-crud.js` - Test script

## 📞 Support

For issues or questions:
1. Check this guide
2. Review API documentation
3. Run test suite
4. Check Prisma logs
5. Validate schema

## 🎉 Summary

You now have:
- ✅ Complete database schema with 10 models
- ✅ Full CRUD operations for all models
- ✅ REST API with 100+ endpoints
- ✅ Comprehensive test suite
- ✅ Setup and migration scripts
- ✅ Complete documentation
- ✅ Prisma 7 with latest features
- ✅ Security and validation
- ✅ Analytics and statistics
- ✅ Search functionality

Start building amazing health and wellness features! 🚀
