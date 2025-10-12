# 🗄️ WellSense AI - Database Integration Guide

## 🌟 Overview

WellSense AI features comprehensive database integration supporting multiple database systems with intelligent fallbacks and seamless switching capabilities.

## 🎯 Supported Databases

### **Primary Databases**
- **MongoDB** (Recommended) - NoSQL, flexible schema, excellent for health data
- **MySQL** - Popular SQL database with excellent performance
- **PostgreSQL** - Advanced SQL database with JSON support
- **SQLite** - Lightweight, file-based database for development

### **Key Features**
- **Multi-Database Support** - Connect to multiple databases simultaneously
- **Intelligent Fallbacks** - Automatic failover between databases
- **Mock Data Mode** - Works without any database connection
- **Universal API** - Same interface regardless of database type
- **Real-time Monitoring** - Health checks and performance metrics

---

## 🚀 Quick Setup

### **Option 1: Automated Setup**
```bash
# Run the database setup wizard
setup-database.bat
```

### **Option 2: Manual Configuration**
```bash
# Copy environment template
copy .env.example .env

# Edit .env with your database credentials
# Install database dependencies
cd server && npm install

# Start server
npm start
```

---

## 🔧 Database Configuration

### **MongoDB Setup (Recommended)**
```env
# .env configuration
PRIMARY_DATABASE=mongodb
MONGODB_URI=mongodb://localhost:27017/wellsense-ai
```

**Installation:**
1. Download from: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Database and collections created automatically

**Features:**
- Flexible schema for health data
- Excellent performance with large datasets
- Built-in aggregation for analytics
- Automatic indexing

### **MySQL Setup**
```env
# .env configuration
PRIMARY_DATABASE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=wellsense_ai
```

**Installation:**
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Install and configure MySQL server
3. Create database: `CREATE DATABASE wellsense_ai;`

**Features:**
- ACID compliance
- Excellent performance
- Wide hosting support
- JSON column support

### **PostgreSQL Setup**
```env
# .env configuration
PRIMARY_DATABASE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=wellsense_ai
```

**Installation:**
1. Download from: https://www.postgresql.org/download/
2. Install and configure PostgreSQL server
3. Create database: `CREATE DATABASE wellsense_ai;`

**Features:**
- Advanced SQL features
- JSONB support for flexible data
- Excellent for complex queries
- Strong data integrity

### **SQLite Setup**
```env
# .env configuration
PRIMARY_DATABASE=sqlite
SQLITE_PATH=./data/wellsense-ai.db
ENABLE_SQLITE=true
```

**Installation:**
- No installation required
- Database file created automatically
- Perfect for development and testing

**Features:**
- Zero configuration
- File-based storage
- Excellent for development
- Easy backup and migration

---

## 🏗️ Database Schema

### **Universal Data Models**

#### **Users Table/Collection**
```sql
-- SQL Schema
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile JSON,
  health_goals JSON,
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```javascript
// MongoDB Schema (Mongoose)
{
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  profile: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    activityLevel: String
  },
  healthGoals: [String],
  preferences: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### **Health Records Table/Collection**
```sql
-- SQL Schema
CREATE TABLE health_records (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('weight', 'nutrition', 'exercise', 'mental_health', 'vitals'),
  data JSON NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **Chat Sessions Table/Collection**
```sql
-- SQL Schema
CREATE TABLE chat_sessions (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255),
  session_type VARCHAR(50) DEFAULT 'general_health',
  status ENUM('active', 'completed', 'archived'),
  messages JSON,
  context JSON,
  analytics JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **Community Posts Table/Collection**
```sql
-- SQL Schema
CREATE TABLE community_posts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type ENUM('achievement', 'question', 'tip', 'challenge'),
  tags JSON,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔄 Multi-Database Architecture

### **Database Manager**
```javascript
// Automatic connection to multiple databases
const databaseManager = new DatabaseManager();

// Connect to all configured databases
await databaseManager.connect();

// Switch between databases
databaseManager.switchDatabase('postgresql');

// Health check all connections
const status = await databaseManager.healthCheck();
```

### **Universal Database Service**
```javascript
// Same API regardless of database type
const databaseService = new DatabaseService();

// Works with MongoDB, MySQL, PostgreSQL, or SQLite
const user = await databaseService.createUser(userData);
const records = await databaseService.getHealthRecords(userId);
const analytics = await databaseService.getHealthAnalytics(userId, 'weight');
```

### **Intelligent Fallbacks**
```javascript
// Automatic fallback hierarchy
1. Primary Database (configured in PRIMARY_DATABASE)
2. Secondary Databases (if available)
3. Mock Data Mode (always available)

// Example: If MongoDB fails, automatically switch to MySQL
// If no databases available, use realistic mock data
```

---

## 📊 API Endpoints

### **Database Management**
```bash
# Health check
GET /api/database/health

# Database statistics
GET /api/database/stats

# Connection status
GET /api/database/connections

# Switch active database
POST /api/database/switch
{
  "database": "postgresql"
}

# Initialize schemas
POST /api/database/initialize

# Performance metrics
GET /api/database/performance

# Schema information
GET /api/database/schema
```

### **Example Responses**
```json
// Health Check Response
{
  "success": true,
  "data": {
    "service": "database",
    "initialized": true,
    "active_database": "mongodb",
    "database_status": {
      "connections": {
        "mongodb": { "status": "connected" },
        "mysql": { "status": "connected" },
        "postgresql": { "status": "not_configured" }
      },
      "overall_status": "healthy"
    }
  }
}

// Statistics Response
{
  "success": true,
  "data": {
    "statistics": {
      "users": 150,
      "health_records": 2847,
      "chat_sessions": 89
    },
    "active_database": "mongodb",
    "initialized": true
  }
}
```

---

## 🚀 Advanced Features

### **Performance Optimization**
- **Connection Pooling** - Efficient database connections
- **Query Optimization** - Optimized queries for each database type
- **Indexing** - Automatic index creation for performance
- **Caching** - Query result caching for frequently accessed data

### **Data Migration**
```javascript
// Migrate data between databases
const migrationService = new MigrationService();

// MongoDB to PostgreSQL
await migrationService.migrate('mongodb', 'postgresql');

// Backup and restore
await migrationService.backup('mongodb', './backup.json');
await migrationService.restore('mysql', './backup.json');
```

### **Real-time Monitoring**
```javascript
// Monitor database performance
const monitor = new DatabaseMonitor();

monitor.on('slow_query', (query) => {
  console.log('Slow query detected:', query);
});

monitor.on('connection_lost', (database) => {
  console.log('Connection lost:', database);
  // Automatic failover triggered
});
```

---

## 🛡️ Security Features

### **Data Protection**
- **Encryption at Rest** - Database-level encryption
- **Secure Connections** - SSL/TLS for database connections
- **Access Control** - Role-based database permissions
- **Input Validation** - SQL injection prevention

### **Backup and Recovery**
- **Automated Backups** - Scheduled database backups
- **Point-in-Time Recovery** - Restore to specific timestamps
- **Cross-Database Replication** - Real-time data synchronization
- **Disaster Recovery** - Multi-region backup strategies

---

## 🧪 Testing and Development

### **Development Setup**
```bash
# Use SQLite for development (no setup required)
PRIMARY_DATABASE=sqlite
SQLITE_PATH=./data/dev-wellsense-ai.db

# Or use Docker for consistent environments
docker-compose up -d mongodb mysql postgresql
```

### **Testing**
```javascript
// Test with different databases
describe('Database Integration', () => {
  test('MongoDB operations', async () => {
    await databaseService.switchDatabase('mongodb');
    // Test operations
  });
  
  test('MySQL operations', async () => {
    await databaseService.switchDatabase('mysql');
    // Test operations
  });
});
```

---

## 🔮 Future Enhancements

### **Planned Features**
- **Sharding Support** - Horizontal database scaling
- **Read Replicas** - Separate read/write operations
- **Time-Series Optimization** - Specialized health data storage
- **GraphQL Integration** - Flexible query interface
- **Blockchain Integration** - Immutable health records

### **Cloud Database Support**
- **MongoDB Atlas** - Managed MongoDB service
- **Amazon RDS** - MySQL and PostgreSQL hosting
- **Google Cloud SQL** - Managed SQL databases
- **Azure Database** - Microsoft cloud databases

---

## 🎯 Best Practices

### **Database Selection Guide**
- **MongoDB**: Best for flexible health data, rapid development
- **PostgreSQL**: Best for complex analytics, data integrity
- **MySQL**: Best for traditional web applications, wide support
- **SQLite**: Best for development, small deployments

### **Performance Tips**
- Use appropriate indexes for your query patterns
- Implement connection pooling for high traffic
- Monitor query performance regularly
- Use database-specific optimizations

### **Security Guidelines**
- Always use parameterized queries
- Implement proper access controls
- Encrypt sensitive health data
- Regular security audits and updates

---

## 🏆 Production Deployment

### **High Availability Setup**
```env
# Primary database
PRIMARY_DATABASE=mongodb
MONGODB_URI=mongodb://cluster1.mongodb.net/wellsense-ai

# Backup databases
MYSQL_HOST=backup-mysql.example.com
POSTGRES_HOST=backup-postgres.example.com

# Automatic failover enabled
```

### **Monitoring and Alerts**
- Database connection monitoring
- Performance metric tracking
- Automatic failover notifications
- Backup verification alerts

### **Scaling Strategies**
- Vertical scaling for single databases
- Horizontal scaling with sharding
- Read replicas for query distribution
- Multi-region deployment for global access

---

## 📞 Support and Troubleshooting

### **Common Issues**
1. **Connection Failures**: Check network connectivity and credentials
2. **Performance Issues**: Review indexes and query optimization
3. **Data Consistency**: Verify transaction handling
4. **Migration Problems**: Use built-in migration tools

### **Debugging Tools**
- Database health check endpoints
- Performance monitoring dashboard
- Query execution analysis
- Connection pool statistics

### **Getting Help**
- Check database-specific documentation
- Review WellSense AI logs for error details
- Use built-in diagnostic tools
- Contact support with specific error messages

---

## 🎉 Conclusion

WellSense AI's database integration provides:

✅ **Multi-Database Support** - Use any database that fits your needs  
✅ **Intelligent Fallbacks** - Always operational, even without databases  
✅ **Universal API** - Consistent interface across all database types  
✅ **Production Ready** - Enterprise-grade reliability and performance  
✅ **Easy Migration** - Switch between databases seamlessly  
✅ **Comprehensive Monitoring** - Real-time health and performance tracking  

**Your health platform is ready to scale from development to enterprise with any database configuration!** 🚀

---

*Database integration by ARUWELL PRENEURS - Empowering healthier lives through intelligent technology*