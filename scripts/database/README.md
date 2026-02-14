# Database Utilities

This directory contains database connection and utility scripts for the WellSense AI Platform demo day preparation.

## Files

### `connection.js`
Unified database connection manager for PostgreSQL (via Prisma) and MongoDB.

**Features:**
- Singleton pattern for connection management
- Connection health checks
- Database statistics
- Graceful connection/disconnection

**Usage:**
```javascript
const { getDatabaseConnection } = require('./database/connection');

const db = getDatabaseConnection();
await db.connectAll();

// Use Prisma
const prisma = db.getPrisma();
const users = await prisma.user.findMany();

// Use MongoDB
const mongodb = db.getMongo();
const collection = mongodb.collection('nutrition_plans');

// Cleanup
await db.disconnectAll();
```

### `test-connection.js`
Test script to verify database connections and display statistics.

**Usage:**
```bash
node scripts/database/test-connection.js
```

## Environment Variables

Ensure these environment variables are set in your `.env` file:

```env
# PostgreSQL (Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/wellsense"

# MongoDB
MONGODB_URI="mongodb://localhost:27017/wellsense"
```

## Connection Management

The `DatabaseConnection` class provides:

1. **Connection Methods:**
   - `connectPostgres()` - Connect to PostgreSQL via Prisma
   - `connectMongo()` - Connect to MongoDB
   - `connectAll()` - Connect to all databases

2. **Health Checks:**
   - `testConnections()` - Test all database connections
   - `getStats()` - Get record counts and statistics

3. **Cleanup:**
   - `disconnectAll()` - Close all database connections

4. **Getters:**
   - `getPrisma()` - Get Prisma client instance
   - `getMongo()` - Get MongoDB database instance

## Best Practices

1. Always use the singleton instance via `getDatabaseConnection()`
2. Call `connectAll()` or specific connect methods before using databases
3. Always call `disconnectAll()` in finally blocks to ensure cleanup
4. Use try-catch blocks for error handling
5. Check connection health before running critical operations

## Example: Data Population Script

```javascript
const { getDatabaseConnection } = require('./database/connection');

async function populateData() {
  const db = getDatabaseConnection();
  
  try {
    await db.connectAll();
    const prisma = db.getPrisma();
    
    // Generate data
    const user = await prisma.user.create({
      data: { /* user data */ }
    });
    
    console.log('Data populated successfully');
  } catch (error) {
    console.error('Population failed:', error);
  } finally {
    await db.disconnectAll();
  }
}
```

## Troubleshooting

### PostgreSQL Connection Issues
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running (check Docker containers)
- Run `npx prisma generate` to update Prisma client
- Check database migrations: `npx prisma migrate status`

### MongoDB Connection Issues
- Verify `MONGODB_URI` in `.env`
- Ensure MongoDB is running (check Docker containers)
- Test connection: `mongosh <MONGODB_URI>`
- Check network connectivity and firewall settings

### Common Errors

**"Prisma Client not initialized"**
- Run `npx prisma generate`
- Restart your application

**"Connection timeout"**
- Check if database services are running
- Verify connection strings
- Check network/firewall settings

**"Authentication failed"**
- Verify credentials in connection strings
- Check user permissions in databases
