# Data Population for Demo Day

This document describes the data generation utilities created for populating the WellSense AI Platform with realistic demo data.

## Overview

The data population system generates realistic, non-placeholder data for all entities in the system to prepare for demo day presentation. It ensures:

- Minimum 10 records per entity type (as per requirements 2.1-2.7)
- Realistic values without placeholder text
- Consistent data relationships
- Time-series data for tracking and visualization

## Files

### Core Scripts

1. **`populate-data.js`** - Main data generation script
   - Generates user profiles with complete health information
   - Creates health metrics records with realistic vital signs
   - Orchestrates all data generation tasks
   - Generates population report

2. **`database/connection.js`** - Database connection manager
   - Unified connection management for PostgreSQL and MongoDB
   - Connection health checks
   - Database statistics
   - Singleton pattern for efficient resource usage

3. **`database/test-connection.js`** - Connection test utility
   - Verifies database connectivity
   - Displays database statistics
   - Useful for troubleshooting

### Configuration

4. **`config/data-generation.json`** - Data generation configuration
   - Customizable record counts
   - Realistic value ranges
   - Entity type distributions
   - Validation rules

## Usage

### Quick Start

```bash
# Test database connections
npm run demo:test-db

# Populate all demo data
npm run demo:populate
```

### Manual Execution

```bash
# Test connections first
node scripts/database/test-connection.js

# Run data population
node scripts/populate-data.js
```

## Data Generation Details

### User Profiles (Requirement 2.1)
- **Count:** 10 users minimum
- **Fields:** Complete profile with name, email, age, gender, physical measurements
- **Realistic Data:**
  - Names generated using Faker.js
  - Valid email addresses
  - Realistic height (150-195 cm) and weight (50-120 kg)
  - Calculated BMI and BMI category
  - Age range: 18-70 years
  - Profile images (avatars)
  - Location, timezone, preferences

### Health Metrics (Requirement 2.2)
- **Count:** 10 records per user minimum
- **Time Range:** Past 30 days
- **Metrics:**
  - Blood pressure (110-140 / 70-90 mmHg)
  - Heart rate (60-100 bpm)
  - Temperature (36.1-37.2°C)
  - Oxygen saturation (95-100%)
  - Blood sugar (70-120 mg/dL)
  - Body composition (body fat %, muscle mass)
  - Wellness metrics (mood, energy, sleep)

### Weight Records (Requirement 2.2)
- **Count:** 10 records per user minimum
- **Time Range:** Past 30 days
- **Data:** Weight tracking with body composition metrics

### Exercise Records (Requirement 2.2)
- **Count:** 10 records per user minimum
- **Types:** Cardio, strength, yoga, running, cycling, swimming
- **Data:** Duration, calories burned, distance, intensity, heart rate

### Nutrition Records (Requirement 2.3)
- **Count:** 10 records per user minimum
- **Meal Types:** Breakfast, lunch, dinner, snacks
- **Data:** Calories, macros (protein, carbs, fat), micronutrients, water intake

### Mental Health Records (Requirement 2.6)
- **Count:** 10 records per user minimum
- **Time Range:** Past 30 days
- **Metrics:** Mood, anxiety, stress, sleep quality, meditation, activities

### Goals (Requirement 2.1)
- **Count:** 3 goals per user
- **Categories:** Weight loss, fitness, nutrition, mental health, sleep, exercise
- **Data:** Target values, progress tracking, milestones

### Community Posts (Requirement 2.5)
- **Count:** 10 posts minimum
- **Categories:** General, fitness, nutrition, mental health, success stories, tips
- **Engagement:** Realistic likes, comments, shares counts

### Consultations (Requirement 2.7)
- **Count:** 5 records per user minimum
- **Types:** Video call, phone call, chat
- **Specializations:** General physician, nutritionist, fitness trainer, counselor
- **Data:** Duration, notes, prescriptions, follow-up dates

### Chat Sessions (Requirement 2.1)
- **Count:** 3 sessions per user
- **Types:** General, nutrition, fitness, mental health
- **Data:** Message history, AI provider, timestamps

## Configuration

Edit `scripts/config/data-generation.json` to customize:

```json
{
  "users": {
    "count": 10,
    "minAge": 18,
    "maxAge": 70
  },
  "healthMetrics": {
    "recordsPerUser": 10,
    "daysBack": 30
  }
  // ... more configuration
}
```

## Data Validation

The system ensures:

1. **No Placeholder Text** (Requirement 2.8)
   - No "Lorem Ipsum", "Test User", "TODO", etc.
   - All names, emails, and content are realistic

2. **Realistic Values**
   - Vital signs within normal ranges
   - Age-appropriate measurements
   - Consistent time series data

3. **Consistent Relationships**
   - All records linked to valid users
   - Proper foreign key relationships
   - Chronological ordering

## Output

### Console Output
- Progress indicators for each entity type
- Success/failure messages
- Summary statistics

### Report File
Generated at: `scripts/reports/population-report.json`

```json
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "status": "success",
  "entities": {
    "users": {
      "target": 10,
      "created": 10,
      "status": "success"
    },
    "healthMetrics": {
      "target": 100,
      "created": 100,
      "status": "success"
    }
    // ... more entities
  }
}
```

## Utilities

### Helper Functions

The script includes utility functions for:

- `calculateBMI(weightKg, heightCm)` - Calculate BMI
- `getBMICategory(bmi)` - Get BMI category (underweight, normal, overweight, obese)
- `kgToLbs(kg)` - Convert kilograms to pounds
- `cmToFeetInches(cm)` - Convert centimeters to feet and inches
- `randomDateInPast(daysBack)` - Generate random date within range

### Database Connection

```javascript
const { getDatabaseConnection } = require('./database/connection');

const db = getDatabaseConnection();
await db.connectAll();
const prisma = db.getPrisma();
// ... use prisma
await db.disconnectAll();
```

## Troubleshooting

### "Cannot connect to database"
1. Ensure Docker containers are running: `npm run docker:up`
2. Check environment variables in `.env`
3. Test connections: `npm run demo:test-db`

### "Faker is not defined"
1. Install dependencies: `npm install`
2. Verify `@faker-js/faker` is in `package.json`

### "Prisma Client not initialized"
1. Generate Prisma client: `npx prisma generate`
2. Run migrations: `npx prisma migrate dev`

### "Duplicate key error"
- The script may fail if data already exists
- Clear existing data or modify email generation to ensure uniqueness

## Best Practices

1. **Test connections first** - Always run `npm run demo:test-db` before populating
2. **Backup existing data** - If you have important data, back it up first
3. **Review configuration** - Adjust counts in `config/data-generation.json` as needed
4. **Check reports** - Review the generated report for any issues
5. **Verify data quality** - Spot-check generated data for realism

## Next Steps

After populating data:

1. Run feature validation: `npm run demo:validate`
2. Test user journey: Review the demo flow
3. Verify data visualization: Check charts and graphs display correctly
4. Test AI features: Ensure AI responses work with generated data

## Requirements Mapping

This implementation satisfies:

- ✅ Requirement 2.1: 10+ user profiles with complete health information
- ✅ Requirement 2.2: 10+ health metrics records per user type
- ✅ Requirement 2.3: 10+ nutrition records with realistic meal data
- ✅ Requirement 2.4: 10+ exercise records (fitness plans)
- ✅ Requirement 2.5: 10+ community posts with engagement data
- ✅ Requirement 2.6: 10+ mental wellness tracking entries
- ✅ Requirement 2.7: 5+ video consultation records
- ✅ Requirement 2.8: No placeholder text in any data

## Implementation Status

All data generation functions are now implemented:

- ✅ Task 2.1: Create data generation utilities (Framework, Faker.js, DB connections)
- ✅ Task 2.2: User profile generation
- ✅ Task 2.3: Health metrics generation (vitals, weight, exercise)
- ✅ Task 2.4: Nutrition records generation
- ✅ Task 2.5: Fitness plans generation (via exercise records)
- ✅ Task 2.6: Community posts generation
- ✅ Task 2.7: Mental wellness entries generation
- ✅ Task 2.8: Consultation records generation
- ✅ Task 2.9: Data population orchestration
- ⏳ Task 2.10: Placeholder text validation (To be implemented in testing)

## Future Enhancements

Planned for subsequent tasks:

- Property-based testing for data validation
- MongoDB integration for AI-generated plans
- Automated placeholder text detection
- Data quality metrics and reporting
