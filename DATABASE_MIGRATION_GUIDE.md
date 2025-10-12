# Database Migration System Guide

## Overview

WellSense AI includes a comprehensive database migration system that supports both MongoDB and SQL databases (MySQL/PostgreSQL). The system provides version control for your database schema, automated migrations, rollbacks, and data seeding capabilities.

## Quick Start

### 1. Initial Database Setup
```bash
# Complete database setup (migrations + sample data)
npm run db:setup
```

### 2. Check Database Status
```bash
# View migration status and data summary
npm run db:status
```

### 3. Run Health Check
```bash
# Verify database connectivity and performance
npm run db:health
```

## Migration Commands

### Running Migrations
```bash
# Run all pending migrations
npm run db:migrate

# Run migrations up to a specific version
cd server && node scripts/migrate.js up 002

# Check migration status
npm run db:migrate:status
```

### Creating New Migrations
```bash
# Create a new migration file
npm run db:migrate:create add_user_preferences "Add user preference settings"

# This creates: server/scripts/migrations/004_add_user_preferences.js
```

### Rolling Back Migrations
```bash
# Rollback a specific migration
cd server && node scripts/migrate.js down 003

# Rollback to a specific version (rolls back multiple migrations)
cd server && node scripts/migrate.js rollback 001
```

## Data Management

### Seeding Data
```bash
# Seed database with sample data (safe - won't overwrite existing data)
npm run db:seed

# Force seed (overwrites existing data)
npm run db:seed:force
```

### Database Reset
```bash
# Complete database reset (WARNING: deletes all data)
npm run db:reset
```

### Backup and Restore
```bash
# Create backup
npm run db:backup my_backup_name

# Restore from backup
npm run db:restore my_backup_name
```

## Migration File Structure

Each migration file follows this structure:

```javascript
const mongoose = require('mongoose');
const databaseManager = require('../../config/database');

class MyMigration {
  constructor() {
    this.version = '004';
    this.description = 'Add user preferences';
    this.timestamp = new Date();
  }

  async up() {
    // Forward migration logic
    if (databaseManager.activeDatabase === 'mongodb') {
      await this.runMongoDBMigration();
    } else {
      await this.runSQLMigration();
    }
  }

  async down() {
    // Rollback logic
    if (databaseManager.activeDatabase === 'mongodb') {
      await this.rollbackMongoDBMigration();
    } else {
      await this.rollbackSQLMigration();
    }
  }

  async validate() {
    // Optional validation logic
    return true;
  }
}
```

## Current Migrations

### 001_initial_schema.js
- Creates core database schema
- Sets up users, health_records, chat_sessions tables/collections
- Establishes foreign key relationships (SQL)
- Creates basic indexes

### 002_add_indexes.js
- Adds performance indexes for common queries
- Creates compound indexes for health records
- Adds text search capabilities
- Optimizes chat session queries

### 003_add_community_features.js
- Adds community and social features
- Creates post_likes, post_comments, user_follows tables
- Adds achievements and activity feed
- Extends user model with community fields

## Database Schema

### Core Tables/Collections

#### Users
- Basic user information and authentication
- Health goals and preferences
- Community profile data (followers, posts count, etc.)

#### Health Records
- Weight, nutrition, exercise, mental health data
- Flexible JSON/document structure for different record types
- Indexed by user, type, and date for fast queries

#### Chat Sessions
- AI conversation history
- Session context and analytics
- Support for different session types

#### Community Posts
- User-generated content
- Support for achievements, questions, tips, challenges
- Like and comment functionality

#### Goals
- User health and fitness goals
- Progress tracking with percentage completion
- Category-based organization

### Indexes and Performance

The migration system automatically creates optimized indexes:

- **Compound indexes** for common query patterns
- **Text search indexes** for user and content search
- **Foreign key indexes** for relationship queries
- **Date-based indexes** for time-series data

## Environment Configuration

Set these environment variables in your `.env` file:

```bash
# Database Type
DB_TYPE=mongodb          # or mysql, postgresql

# MongoDB Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=wellsense_ai

# SQL Database Configuration (MySQL/PostgreSQL)
DB_HOST=localhost
DB_PORT=3306             # or 5432 for PostgreSQL
DB_NAME=wellsense_ai
DB_USER=your_username
DB_PASS=your_password
```

## Best Practices

### 1. Migration Development
- Always test migrations on a copy of production data
- Include both `up()` and `down()` methods
- Add validation logic when possible
- Use descriptive migration names and descriptions

### 2. Schema Changes
- Make migrations backward compatible when possible
- Use separate migrations for data transformations
- Test rollback procedures before deploying

### 3. Performance
- Add indexes for new query patterns
- Consider the impact of large data migrations
- Use batch processing for large datasets

### 4. Data Safety
- Always backup before running migrations in production
- Test migrations thoroughly in staging environment
- Monitor migration execution time and resource usage

## Troubleshooting

### Common Issues

#### Migration Fails
```bash
# Check migration status
npm run db:migrate:status

# View detailed error logs
cd server && node scripts/migrate.js up --verbose
```

#### Database Connection Issues
```bash
# Run health check
npm run db:health

# Verify environment variables
echo $DB_TYPE $DB_HOST $DB_PORT $DB_NAME
```

#### Rollback Issues
```bash
# Check which migrations are applied
npm run db:migrate:status

# Rollback step by step
cd server && node scripts/migrate.js down 003
cd server && node scripts/migrate.js down 002
```

### Recovery Procedures

#### Corrupted Migration State
1. Backup current database
2. Manually fix migration tracking table/collection
3. Re-run migrations from known good state

#### Failed Migration Cleanup
1. Rollback the failed migration
2. Fix the migration code
3. Re-run the corrected migration

## Advanced Usage

### Custom Migration Logic

You can extend migrations with custom logic:

```javascript
async up() {
  // Custom pre-migration logic
  await this.backupCriticalData();
  
  // Run standard migration
  await this.runStandardMigration();
  
  // Custom post-migration logic
  await this.updateDerivedData();
}

async backupCriticalData() {
  // Implementation specific to your needs
}
```

### Conditional Migrations

Handle different environments or configurations:

```javascript
async up() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production-specific migration logic
    await this.runProductionMigration();
  } else {
    // Development/staging migration logic
    await this.runDevelopmentMigration();
  }
}
```

### Data Transformation Migrations

For complex data transformations:

```javascript
async up() {
  console.log('Starting data transformation...');
  
  // Process data in batches to avoid memory issues
  const batchSize = 1000;
  let offset = 0;
  
  while (true) {
    const batch = await this.getBatch(offset, batchSize);
    if (batch.length === 0) break;
    
    await this.transformBatch(batch);
    offset += batchSize;
    
    console.log(`Processed ${offset} records...`);
  }
  
  console.log('Data transformation completed');
}
```

## Integration with Application

### Using Migrations in CI/CD

```yaml
# Example GitHub Actions workflow
- name: Run Database Migrations
  run: |
    npm install
    cd server && npm install
    npm run db:migrate
```

### Application Startup

```javascript
// server/app.js
const databaseManager = require('./config/database');
const MigrationRunner = require('./scripts/migrations/migrationRunner');

async function startServer() {
  // Connect to database
  await databaseManager.connect();
  
  // Check if migrations are needed
  const runner = new MigrationRunner();
  await runner.initialize();
  
  const status = await runner.getStatus();
  if (status.pendingMigrations > 0) {
    console.log('⚠️  Pending migrations detected. Run: npm run db:migrate');
  }
  
  // Start server
  app.listen(PORT);
}
```

## Support

For issues or questions about the migration system:

1. Check the troubleshooting section above
2. Review migration logs in `server/logs/`
3. Run `npm run db:health` to diagnose connection issues
4. Create an issue in the project repository

## Contributing

When adding new migrations:

1. Follow the naming convention: `XXX_descriptive_name.js`
2. Include both MongoDB and SQL implementations
3. Add comprehensive validation logic
4. Test both forward and rollback operations
5. Update this documentation if needed