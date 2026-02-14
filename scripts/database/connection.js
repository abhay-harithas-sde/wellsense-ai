/**
 * Database Connection Utilities
 * 
 * Provides unified connection management for PostgreSQL (Prisma) and MongoDB
 * Used by data population and validation scripts
 */

const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.prisma = null;
    this.mongoClient = null;
    this.mongodb = null;
  }

  /**
   * Initialize PostgreSQL connection via Prisma
   */
  async connectPostgres() {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
      });
      
      try {
        await this.prisma.$connect();
        console.log('✓ PostgreSQL connected via Prisma');
        return this.prisma;
      } catch (error) {
        console.error('✗ PostgreSQL connection failed:', error.message);
        throw error;
      }
    }
    return this.prisma;
  }

  /**
   * Initialize MongoDB connection
   */
  async connectMongo() {
    if (!this.mongodb) {
      const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/wellsense';
      
      try {
        this.mongoClient = new MongoClient(mongoUrl);
        await this.mongoClient.connect();
        this.mongodb = this.mongoClient.db();
        console.log('✓ MongoDB connected');
        return this.mongodb;
      } catch (error) {
        console.error('✗ MongoDB connection failed:', error.message);
        throw error;
      }
    }
    return this.mongodb;
  }

  /**
   * Initialize all database connections
   */
  async connectAll() {
    console.log('🔌 Connecting to databases...\n');
    
    try {
      await this.connectPostgres();
      await this.connectMongo();
      console.log('\n✅ All database connections established\n');
      return {
        prisma: this.prisma,
        mongodb: this.mongodb
      };
    } catch (error) {
      console.error('\n❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Test database connections
   */
  async testConnections() {
    const results = {
      postgres: { status: 'unknown', error: null },
      mongodb: { status: 'unknown', error: null }
    };

    // Test PostgreSQL
    try {
      if (!this.prisma) {
        await this.connectPostgres();
      }
      await this.prisma.$queryRaw`SELECT 1`;
      results.postgres.status = 'healthy';
    } catch (error) {
      results.postgres.status = 'unhealthy';
      results.postgres.error = error.message;
    }

    // Test MongoDB
    try {
      if (!this.mongodb) {
        await this.connectMongo();
      }
      await this.mongodb.admin().ping();
      results.mongodb.status = 'healthy';
    } catch (error) {
      results.mongodb.status = 'unhealthy';
      results.mongodb.error = error.message;
    }

    return results;
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const stats = {
      postgres: {},
      mongodb: {}
    };

    // PostgreSQL stats
    if (this.prisma) {
      try {
        stats.postgres = {
          users: await this.prisma.user.count(),
          healthRecords: await this.prisma.healthRecord.count(),
          weightRecords: await this.prisma.weightRecord.count(),
          exerciseRecords: await this.prisma.exerciseRecord.count(),
          nutritionRecords: await this.prisma.nutritionRecord.count(),
          mentalHealthRecords: await this.prisma.mentalHealthRecord.count(),
          goals: await this.prisma.goal.count(),
          chatSessions: await this.prisma.chatSession.count(),
          communityPosts: await this.prisma.communityPost.count(),
          consultations: await this.prisma.consultation.count()
        };
      } catch (error) {
        stats.postgres.error = error.message;
      }
    }

    // MongoDB stats
    if (this.mongodb) {
      try {
        const collections = await this.mongodb.listCollections().toArray();
        stats.mongodb.collections = collections.map(c => c.name);
        
        // Count documents in each collection
        for (const collection of collections) {
          const count = await this.mongodb.collection(collection.name).countDocuments();
          stats.mongodb[collection.name] = count;
        }
      } catch (error) {
        stats.mongodb.error = error.message;
      }
    }

    return stats;
  }

  /**
   * Disconnect from all databases
   */
  async disconnectAll() {
    console.log('\n🔌 Disconnecting from databases...');
    
    try {
      if (this.prisma) {
        await this.prisma.$disconnect();
        console.log('✓ PostgreSQL disconnected');
      }
      
      if (this.mongoClient) {
        await this.mongoClient.close();
        console.log('✓ MongoDB disconnected');
      }
      
      console.log('✅ All database connections closed\n');
    } catch (error) {
      console.error('❌ Error during disconnect:', error.message);
      throw error;
    }
  }

  /**
   * Get Prisma client instance
   */
  getPrisma() {
    if (!this.prisma) {
      throw new Error('PostgreSQL not connected. Call connectPostgres() first.');
    }
    return this.prisma;
  }

  /**
   * Get MongoDB instance
   */
  getMongo() {
    if (!this.mongodb) {
      throw new Error('MongoDB not connected. Call connectMongo() first.');
    }
    return this.mongodb;
  }
}

// Singleton instance
let instance = null;

/**
 * Get database connection instance (singleton)
 */
function getDatabaseConnection() {
  if (!instance) {
    instance = new DatabaseConnection();
  }
  return instance;
}

module.exports = {
  DatabaseConnection,
  getDatabaseConnection
};
