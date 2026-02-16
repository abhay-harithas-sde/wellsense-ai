// Database Integrations Module
// Unified connection manager for PostgreSQL, MongoDB, and Redis

import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

class DatabaseIntegrations {
  constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });

    // MongoDB client
    this.mongoClient = null;
    this.mongodb = null;

    // Redis client
    this.redisClient = null;

    // Connection status
    this.connections = {
      postgresql: false,
      mongodb: false,
      redis: false
    };
  }

  /**
   * Initialize all database connections
   */
  async connectAll() {
    console.log('🔌 Connecting to all databases...\n');

    const results = {
      postgresql: await this.connectPostgreSQL(),
      mongodb: await this.connectMongoDB(),
      redis: await this.connectRedis()
    };

    return results;
  }

  /**
   * Connect to PostgreSQL via Prisma
   */
  async connectPostgreSQL() {
    try {
      await this.prisma.$connect();
      await this.prisma.$queryRaw`SELECT 1`;
      this.connections.postgresql = true;
      console.log('✅ PostgreSQL: Connected');
      return { status: 'connected', error: null };
    } catch (error) {
      console.error('❌ PostgreSQL: Failed -', error.message);
      this.connections.postgresql = false;
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * Connect to MongoDB
   */
  async connectMongoDB() {
    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      
      this.mongoClient = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });

      await this.mongoClient.connect();
      this.mongodb = this.mongoClient.db('wellsense_ai');
      
      // Test connection
      await this.mongodb.command({ ping: 1 });
      
      this.connections.mongodb = true;
      console.log('✅ MongoDB: Connected');
      return { status: 'connected', error: null };
    } catch (error) {
      console.log('⚠️  MongoDB: Not available -', error.message);
      this.connections.mongodb = false;
      return { status: 'unavailable', error: error.message };
    }
  }

  /**
   * Connect to Redis
   */
  async connectRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000
        }
      });

      this.redisClient.on('error', (err) => {
        console.log('Redis Client Error:', err.message);
      });

      await this.redisClient.connect();
      await this.redisClient.ping();
      
      this.connections.redis = true;
      console.log('✅ Redis: Connected');
      return { status: 'connected', error: null };
    } catch (error) {
      console.log('⚠️  Redis: Not available -', error.message);
      this.connections.redis = false;
      return { status: 'unavailable', error: error.message };
    }
  }

  /**
   * Get connection status for all databases
   */
  getConnectionStatus() {
    return {
      postgresql: {
        connected: this.connections.postgresql,
        type: 'Primary Database',
        port: 5432
      },
      mongodb: {
        connected: this.connections.mongodb,
        type: 'Document Store',
        port: 27017
      },
      redis: {
        connected: this.connections.redis,
        type: 'Cache & Sessions',
        port: 6379
      }
    };
  }

  /**
   * Health check for all databases
   */
  async healthCheckAll() {
    const health = {
      postgresql: { status: 'unknown', latency: 0 },
      mongodb: { status: 'unknown', latency: 0 },
      redis: { status: 'unknown', latency: 0 }
    };

    // PostgreSQL health
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      health.postgresql = {
        status: 'healthy',
        latency: Date.now() - start
      };
    } catch (error) {
      health.postgresql = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // MongoDB health
    if (this.mongodb) {
      try {
        const start = Date.now();
        await this.mongodb.command({ ping: 1 });
        health.mongodb = {
          status: 'healthy',
          latency: Date.now() - start
        };
      } catch (error) {
        health.mongodb = {
          status: 'unhealthy',
          error: error.message
        };
      }
    } else {
      health.mongodb = { status: 'disconnected' };
    }

    // Redis health
    if (this.redisClient && this.redisClient.isOpen) {
      try {
        const start = Date.now();
        await this.redisClient.ping();
        health.redis = {
          status: 'healthy',
          latency: Date.now() - start
        };
      } catch (error) {
        health.redis = {
          status: 'unhealthy',
          error: error.message
        };
      }
    } else {
      health.redis = { status: 'disconnected' };
    }

    return health;
  }

  /**
   * PostgreSQL Operations
   */
  async postgresQuery(query, params = []) {
    if (!this.connections.postgresql) {
      throw new Error('PostgreSQL not connected');
    }
    return await this.prisma.$queryRawUnsafe(query, ...params);
  }

  /**
   * MongoDB Operations
   */
  async mongoFind(collection, query = {}, options = {}) {
    if (!this.connections.mongodb) {
      throw new Error('MongoDB not connected');
    }
    return await this.mongodb.collection(collection).find(query, options).toArray();
  }

  async mongoInsert(collection, document) {
    if (!this.connections.mongodb) {
      throw new Error('MongoDB not connected');
    }
    return await this.mongodb.collection(collection).insertOne(document);
  }

  async mongoUpdate(collection, filter, update) {
    if (!this.connections.mongodb) {
      throw new Error('MongoDB not connected');
    }
    return await this.mongodb.collection(collection).updateOne(filter, { $set: update });
  }

  async mongoDelete(collection, filter) {
    if (!this.connections.mongodb) {
      throw new Error('MongoDB not connected');
    }
    return await this.mongodb.collection(collection).deleteOne(filter);
  }

  /**
   * Redis Operations
   */
  async redisGet(key) {
    if (!this.connections.redis) {
      throw new Error('Redis not connected');
    }
    return await this.redisClient.get(key);
  }

  async redisSet(key, value, expirySeconds = null) {
    if (!this.connections.redis) {
      throw new Error('Redis not connected');
    }
    if (expirySeconds) {
      return await this.redisClient.setEx(key, expirySeconds, value);
    }
    return await this.redisClient.set(key, value);
  }

  async redisDel(key) {
    if (!this.connections.redis) {
      throw new Error('Redis not connected');
    }
    return await this.redisClient.del(key);
  }

  async redisExists(key) {
    if (!this.connections.redis) {
      throw new Error('Redis not connected');
    }
    return await this.redisClient.exists(key);
  }

  /**
   * Clear all Redis keys (for logout all users)
   */
  async clearAllRedisKeys() {
    if (!this.connections.redis || !this.redisClient.isOpen) {
      return 0;
    }
    
    try {
      // Get all keys
      const keys = await this.redisClient.keys('*');
      
      if (keys.length === 0) {
        return 0;
      }
      
      // Delete all keys
      await this.redisClient.del(keys);
      
      return keys.length;
    } catch (error) {
      console.error('Error clearing Redis keys:', error.message);
      return 0;
    }
  }

  /**
   * Cache wrapper for PostgreSQL queries
   */
  async cachedQuery(cacheKey, queryFn, ttl = 300) {
    // Try Redis cache first
    if (this.connections.redis) {
      try {
        const cached = await this.redisGet(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.warn('Redis cache read failed:', error.message);
      }
    }

    // Execute query
    const result = await queryFn();

    // Cache result
    if (this.connections.redis) {
      try {
        await this.redisSet(cacheKey, JSON.stringify(result), ttl);
      } catch (error) {
        console.warn('Redis cache write failed:', error.message);
      }
    }

    return result;
  }

  /**
   * Sync data between PostgreSQL and MongoDB
   */
  async syncToMongo(tableName, data) {
    if (!this.connections.mongodb) {
      return { synced: false, reason: 'MongoDB not connected' };
    }

    try {
      await this.mongoInsert(tableName, {
        ...data,
        syncedAt: new Date(),
        source: 'postgresql'
      });
      return { synced: true };
    } catch (error) {
      return { synced: false, error: error.message };
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const stats = {
      postgresql: {},
      mongodb: {},
      redis: {}
    };

    // PostgreSQL stats
    if (this.connections.postgresql) {
      try {
        stats.postgresql = {
          users: await this.prisma.user.count(),
          healthRecords: await this.prisma.healthRecord.count(),
          weightRecords: await this.prisma.weightRecord.count(),
          goals: await this.prisma.goal.count(),
          chatSessions: await this.prisma.chatSession.count(),
          communityPosts: await this.prisma.communityPost.count()
        };
      } catch (error) {
        stats.postgresql.error = error.message;
      }
    }

    // MongoDB stats
    if (this.connections.mongodb) {
      try {
        const collections = await this.mongodb.listCollections().toArray();
        stats.mongodb.collections = collections.length;
        stats.mongodb.collectionNames = collections.map(c => c.name);
      } catch (error) {
        stats.mongodb.error = error.message;
      }
    }

    // Redis stats
    if (this.connections.redis && this.redisClient.isOpen) {
      try {
        const info = await this.redisClient.info();
        const dbSize = await this.redisClient.dbSize();
        stats.redis.keys = dbSize;
        stats.redis.connected = true;
      } catch (error) {
        stats.redis.error = error.message;
      }
    }

    return stats;
  }

  /**
   * Disconnect all databases
   */
  async disconnectAll() {
    console.log('\n🔌 Disconnecting from all databases...');

    // Disconnect PostgreSQL
    if (this.connections.postgresql) {
      try {
        await this.prisma.$disconnect();
        console.log('✅ PostgreSQL: Disconnected');
      } catch (error) {
        console.error('❌ PostgreSQL disconnect error:', error.message);
      }
    }

    // Disconnect MongoDB
    if (this.mongoClient) {
      try {
        await this.mongoClient.close();
        console.log('✅ MongoDB: Disconnected');
      } catch (error) {
        console.error('❌ MongoDB disconnect error:', error.message);
      }
    }

    // Disconnect Redis
    if (this.redisClient && this.redisClient.isOpen) {
      try {
        await this.redisClient.quit();
        console.log('✅ Redis: Disconnected');
      } catch (error) {
        console.error('❌ Redis disconnect error:', error.message);
      }
    }

    console.log('');
  }
}

export { DatabaseIntegrations };
