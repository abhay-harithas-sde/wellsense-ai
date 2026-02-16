// ╔════════════════════════════════════════════════════════════════════════╗
// ║  GOD (Ghar O Dev) - Unified WellSense AI Platform Server              ║
// ║  Complete Integration: Frontend + Backend + JOD + All Features        ║
// ║  Port: 3000 (FIXED)                                                    ║
// ╚════════════════════════════════════════════════════════════════════════╝

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

import dotenv from 'dotenv';
import express from 'express';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

// Import core library components
import { DatabaseManager } from './lib/database.js';
import { DatabaseIntegrations } from './lib/database-integrations.js';
import { AIManager } from './lib/ai.js';
import { initializeFirebase, getFirebaseStatus } from './lib/firebase.js';

// Import security components
import EnvironmentValidator from './lib/security/environment-validator.js';
import CORSConfigurator from './lib/security/cors-configurator.js';
import SSLManager from './lib/security/ssl-manager.js';

// Import Automations Manager
import { AutomationsManager } from './automations/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/index.js';
import crudRoutes from './routes/crud-api.js';

// ES module equivalents for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Determine NODE_ENV first (before loading .env)
const NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment file based on NODE_ENV
const envFile = NODE_ENV === 'production' 
  ? '.env.production' 
  : NODE_ENV === 'test'
  ? '.env.test'
  : '.env';

dotenv.config({ path: envFile });

// Initialize Express app
const app = express();
const PORT = 3000; // FIXED PORT - GOD server ALWAYS runs on 3000

// Initialize core services
const prisma = new PrismaClient();
const db = new DatabaseManager();
const dbIntegrations = new DatabaseIntegrations();
const ai = new AIManager();

// Initialize Firebase (optional)
let firebase = null;

// Initialize Automations Manager (will be started after server starts)
let automations = null;

console.log('\n' + '═'.repeat(80));
console.log('║' + ' '.repeat(78) + '║');
console.log('║' + '  🌟 GOD (Ghar O Dev) - Unified WellSense AI Platform'.padEnd(78) + '║');
console.log('║' + ' '.repeat(78) + '║');
console.log('═'.repeat(80) + '\n');

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

console.log(`📋 Environment: ${NODE_ENV}`);
console.log(`📄 Config file: ${envFile}\n`);

// Validate environment configuration
const validator = new EnvironmentValidator();
const validationResult = validator.validateAll(process.env, NODE_ENV);

if (!validationResult.valid) {
  if (NODE_ENV === 'production') {
    console.error('❌ Configuration validation failed:\n');
    validationResult.errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n💡 Fix these issues before starting in production mode.');
    console.error('   Run: node scripts/generate-secrets.js to generate strong secrets\n');
    process.exit(1);
  } else {
    console.warn('⚠️  Configuration warnings:\n');
    validationResult.warnings.forEach(warn => console.warn(`   - ${warn}`));
    console.warn('\n💡 These warnings are non-critical in development mode.');
    console.warn('   For production, ensure all secrets are strong and properly configured.\n');
  }
} else if (validationResult.warnings.length > 0) {
  console.warn('⚠️  Configuration warnings:\n');
  validationResult.warnings.forEach(warn => console.warn(`   - ${warn}`));
  console.warn('');
} else {
  if (NODE_ENV === 'development') {
    console.log('✅ Configuration validation passed\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow frontend assets
  crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// CORS configuration
const corsConfigurator = new CORSConfigurator();
const corsOptions = corsConfigurator.getCORSOptions(process.env, NODE_ENV);

if (NODE_ENV === 'development') {
  console.log('🔓 CORS: Development mode - localhost origins allowed');
} else {
  const allowedOrigins = corsConfigurator.parseAllowedOrigins(process.env.CORS_ORIGIN || '');
  console.log(`🔒 CORS: Production mode - ${allowedOrigins.length} origin(s) whitelisted`);
}

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
// STATIC FILES - Serve Frontend
// ═══════════════════════════════════════════════════════════════════════════

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Health check endpoint (with alias)
const healthCheckHandler = async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    const aiHealth = await ai.healthCheck();
    const allDbHealth = await dbIntegrations.healthCheckAll();
    const dbConnections = dbIntegrations.getConnectionStatus();
    const firebaseStatus = getFirebaseStatus();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'GOD (Ghar O Dev) - Unified Platform',
      version: '1.0.0',
      port: PORT,
      environment: NODE_ENV,
      services: {
        database: dbHealth,
        ai: aiHealth,
        firebase: firebaseStatus
      },
      databases: {
        connections: dbConnections,
        health: allDbHealth
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

app.get('/api/health', healthCheckHandler);
app.get('/api/health-check', healthCheckHandler);

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Legacy auth route support (redirect /auth/* to /api/auth/*)
app.use('/auth', authRoutes);

// Admin endpoint to logout all users
app.post('/api/admin/logout-all', async (req, res) => {
  try {
    console.log('🔒 Logging out all users...');
    
    // Clear all Redis sessions/cache
    const redisCleared = await dbIntegrations.clearAllRedisKeys();
    
    // Update all users' lastLoginAt to null (invalidate sessions)
    const usersUpdated = await prisma.user.updateMany({
      data: {
        lastLoginAt: null
      }
    });
    
    console.log(`✅ Logged out ${usersUpdated.count} users`);
    console.log(`✅ Cleared ${redisCleared} Redis keys`);
    
    res.json({
      success: true,
      message: 'All users logged out successfully',
      usersAffected: usersUpdated.count,
      redisKeysCleared: redisCleared,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error logging out all users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin endpoint to delete all user data
app.post('/api/admin/delete-all-users', async (req, res) => {
  try {
    console.log('🗑️  Deleting all user data...');
    
    // Delete all related data first (due to foreign key constraints)
    const deletedChatSessions = await prisma.chatSession.deleteMany({});
    const deletedCommunityPosts = await prisma.communityPost.deleteMany({});
    const deletedConsultations = await prisma.consultation.deleteMany({});
    const deletedGoals = await prisma.goal.deleteMany({});
    const deletedMentalHealthRecords = await prisma.mentalHealthRecord.deleteMany({});
    const deletedNutritionRecords = await prisma.nutritionRecord.deleteMany({});
    const deletedExerciseRecords = await prisma.exerciseRecord.deleteMany({});
    const deletedWeightRecords = await prisma.weightRecord.deleteMany({});
    const deletedHealthRecords = await prisma.healthRecord.deleteMany({});
    
    // Finally delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    
    // Clear all Redis keys
    const redisCleared = await dbIntegrations.clearAllRedisKeys();
    
    // Clear MongoDB collections
    let mongoCleared = 0;
    if (dbIntegrations.connections.mongodb) {
      try {
        const collections = ['users', 'healthRecords', 'weightRecords', 'goals', 'chatSessions', 'communityPosts'];
        for (const collection of collections) {
          const result = await dbIntegrations.mongodb.collection(collection).deleteMany({});
          mongoCleared += result.deletedCount || 0;
        }
      } catch (mongoError) {
        console.warn('MongoDB cleanup warning:', mongoError.message);
      }
    }
    
    console.log('✅ All user data deleted successfully');
    console.log(`   - Users: ${deletedUsers.count}`);
    console.log(`   - Health Records: ${deletedHealthRecords.count}`);
    console.log(`   - Weight Records: ${deletedWeightRecords.count}`);
    console.log(`   - Goals: ${deletedGoals.count}`);
    console.log(`   - Chat Sessions: ${deletedChatSessions.count}`);
    console.log(`   - Community Posts: ${deletedCommunityPosts.count}`);
    console.log(`   - Redis Keys: ${redisCleared}`);
    console.log(`   - MongoDB Documents: ${mongoCleared}`);
    
    res.json({
      success: true,
      message: 'All user data deleted successfully',
      deleted: {
        users: deletedUsers.count,
        healthRecords: deletedHealthRecords.count,
        weightRecords: deletedWeightRecords.count,
        exerciseRecords: deletedExerciseRecords.count,
        nutritionRecords: deletedNutritionRecords.count,
        mentalHealthRecords: deletedMentalHealthRecords.count,
        goals: deletedGoals.count,
        chatSessions: deletedChatSessions.count,
        communityPosts: deletedCommunityPosts.count,
        consultations: deletedConsultations.count,
        redisKeys: redisCleared,
        mongoDocuments: mongoCleared
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mount AAP routes (health records, AI, goals, etc.)
app.use('/api', apiRoutes);

// Mount comprehensive CRUD API routes
app.use('/api/v1', crudRoutes);
import sessionAnalysisRoutes from './routes/session-analysis.js';
app.use('/api/session-analysis', sessionAnalysisRoutes);

// Legacy routes support (without /api prefix for backward compatibility)
app.use('/', apiRoutes);

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATED DATABASE API (formerly JOD)
// ═══════════════════════════════════════════════════════════════════════════

// Database status endpoint
app.get('/api/db/status', (req, res) => {
  const connections = dbIntegrations.getConnectionStatus();
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    connections
  });
});

// Database health check
app.get('/api/db/health', async (req, res) => {
  try {
    const health = await dbIntegrations.healthCheckAll();
    const connections = dbIntegrations.getConnectionStatus();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      connections,
      health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database statistics
app.get('/api/db/stats', async (req, res) => {
  try {
    const stats = await dbIntegrations.getStats();
    const connections = dbIntegrations.getConnectionStatus();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      connections,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Legacy database endpoints (redirect to /api/db/*)
app.get('/api/databases/status', (req, res) => res.redirect('/api/db/status'));
app.get('/api/databases/health', (req, res) => res.redirect('/api/db/health'));
app.get('/api/databases/stats', (req, res) => res.redirect('/api/db/stats'));

// Automations endpoints
app.get('/api/automations/status', (req, res) => {
  if (!automations) {
    return res.status(503).json({
      success: false,
      message: 'Automations not initialized'
    });
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    status: automations.getStatus()
  });
});

// Firebase endpoints
app.get('/api/firebase/status', (req, res) => {
  const status = getFirebaseStatus();
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    firebase: status
  });
});

app.post('/api/firebase/notification', async (req, res) => {
  try {
    const { sendPushNotification } = await import('./lib/firebase.js');
    const { token, title, body, imageUrl, data } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token, title, body'
      });
    }

    const result = await sendPushNotification(
      token,
      { title, body, imageUrl },
      data || {}
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Notification sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/automations/sync/database', async (req, res) => {
  try {
    if (!automations) {
      return res.status(503).json({
        success: false,
        message: 'Automations not initialized'
      });
    }

    const result = await automations.triggerDatabaseSync();
    res.json({
      success: true,
      message: 'Database sync triggered',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/automations/cleanup', async (req, res) => {
  try {
    if (!automations) {
      return res.status(503).json({
        success: false,
        message: 'Automations not initialized'
      });
    }

    const result = await automations.triggerCleanup();
    res.json({
      success: true,
      message: 'Cleanup triggered',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/automations/check-integrations', async (req, res) => {
  try {
    if (!automations) {
      return res.status(503).json({
        success: false,
        message: 'Automations not initialized'
      });
    }

    const result = await automations.triggerIntegrationCheck();
    res.json({
      success: true,
      message: 'Integration check triggered',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/automations/push-schema', async (req, res) => {
  try {
    if (!automations) {
      return res.status(503).json({
        success: false,
        message: 'Automations not initialized'
      });
    }

    console.log('📋 Manual schema push requested via API');
    const result = await automations.triggerSchemaPush();
    res.json({
      success: true,
      message: 'Schema push triggered',
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'GOD (Ghar O Dev) - Unified WellSense AI Platform',
    version: '1.0.0',
    port: PORT,
    environment: NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      database: {
        status: '/api/db/status',
        health: '/api/db/health',
        stats: '/api/db/stats'
      },
      automations: {
        status: '/api/automations/status',
        syncDatabase: 'POST /api/automations/sync/database',
        cleanup: 'POST /api/automations/cleanup',
        checkIntegrations: 'POST /api/automations/check-integrations',
        pushSchema: 'POST /api/automations/push-schema'
      },
      firebase: {
        status: '/api/firebase/status',
        sendNotification: 'POST /api/firebase/notification'
      },
      user: '/api/user/*',
      healthRecords: '/api/health/records',
      weightRecords: '/api/weight/records',
      ai: '/api/ai/*',
      goals: '/api/goals',
      community: '/api/community/*'
    },
    documentation: 'See /docs for API documentation'
  });
});

// Updates check endpoint (for auto-update service)
app.get('/api/updates/check', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    hasUpdate: false,
    latestVersion: '1.0.0',
    message: 'You are running the latest version'
  });
});

// Health check endpoint (simple version without /api prefix)
app.get('/health-check', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Missing health dashboard routes (for frontend compatibility)
app.get('/health/dashboard', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        summary: {
          totalRecords: 0,
          lastUpdated: new Date().toISOString()
        },
        recentActivity: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health/weight-data', async (req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FRONTEND ROUTING - SPA Support
// ═══════════════════════════════════════════════════════════════════════════

// Serve index.html for all non-API routes (SPA support)
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

// 404 handler for API routes
app.use('/api', (req, res, next) => {
  // If we reach here, no API route matched
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════════════════

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Stop automations first
    if (automations) {
      await automations.stopAll();
    }
    
    // Disconnect all database integrations
    await dbIntegrations.disconnectAll();
    
    // Disconnect Prisma
    await prisma.$disconnect();
    console.log('✅ Prisma disconnected');
    
    // Close servers
    const closePromises = [];
    
    if (global.server) {
      closePromises.push(new Promise((resolve) => {
        global.server.close(() => {
          console.log('✅ Main server closed');
          resolve();
        });
      }));
    }
    
    if (global.httpRedirectServer) {
      closePromises.push(new Promise((resolve) => {
        global.httpRedirectServer.close(() => {
          console.log('✅ HTTP redirect server closed');
          resolve();
        });
      }));
    }
    
    if (closePromises.length > 0) {
      await Promise.all(closePromises);
      process.exit(0);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log API endpoints and database connections
 * @param {number} port - Server port
 */
async function logEndpointsAndDatabases(port) {
  const protocol = global.server && global.server instanceof https.Server ? 'https' : 'http';
  
  console.log('📋 API Endpoints:');
  console.log(`   - Health Check:    ${protocol}://localhost:${port}/api/health`);
  console.log(`   - Authentication:  ${protocol}://localhost:${port}/api/auth/*`);
  console.log(`   - Database:        ${protocol}://localhost:${port}/api/db/*`);
  console.log(`   - Automations:     ${protocol}://localhost:${port}/api/automations/status`);
  console.log(`   - User Profile:    ${protocol}://localhost:${port}/api/user/*`);
  console.log(`   - Health Records:  ${protocol}://localhost:${port}/api/health/records`);
  console.log(`   - AI Chat:         ${protocol}://localhost:${port}/api/ai/chat`);
  console.log('');
  
  console.log('🗄️  Connected Databases:');
  const connections = dbIntegrations.getConnectionStatus();
  console.log(`   - PostgreSQL:      ${connections.postgresql.connected ? '✅ Connected' : '❌ Disconnected'} (Port ${connections.postgresql.port})`);
  console.log(`   - MongoDB:         ${connections.mongodb.connected ? '✅ Connected' : '❌ Disconnected'} (Port ${connections.mongodb.port})`);
  console.log(`   - Redis:           ${connections.redis.connected ? '✅ Connected' : '❌ Disconnected'} (Port ${connections.redis.port})`);
  console.log('');
  
  console.log('🔗 Database Management:');
  console.log('   - pgAdmin:         http://localhost:5050');
  console.log('   - Mongo Express:   http://localhost:8081');
  console.log('');
  
  // Initialize and start automations
  try {
    const godServer = {
      db,
      dbIntegrations,
      ai,
      prisma
    };

    automations = new AutomationsManager(godServer, {
      enabled: true, // Always enabled
      updateSync: {
        enabled: true, // Always enabled
        interval: 30000 // 30 seconds - continuous
      },
      databaseSync: {
        enabled: true, // Always enabled
        interval: 1000 // 1 SECOND - REAL-TIME SYNC
      },
      integrateAll: {
        enabled: true, // Always enabled
        checkInterval: 30000 // 30 seconds - continuous
      },
      cleanup: {
        enabled: true, // Always enabled
        interval: 30000 // 30 seconds - continuous
      },
      restart: {
        enabled: true, // Always enabled
        healthCheckInterval: 30000 // 30 seconds - continuous
      },
      watchdog: {
        enabled: true, // Always enabled - monitors database sync
        checkInterval: 5000, // Check every 5 seconds
        maxRestarts: 10,
        restartDelay: 2000
      }
    });

    await automations.startAll();
    console.log('✅ All automations running - Database sync: 1 second (REAL-TIME)\n');
    console.log('⚡ REAL-TIME MODE: Database syncing every 1 second');
    console.log('🔒 CONTINUOUS MODE: Sync will never auto turn off');
    console.log('🐕 WATCHDOG: Monitoring and auto-restarting if needed\n');
  } catch (error) {
    console.error('⚠️  Failed to start automations:', error.message);
  }
  
  console.log('💡 Press Ctrl+C to stop the server\n');
  console.log('═'.repeat(80) + '\n');
}

async function startGODServer() {
  try {
    console.log('🚀 Initializing GOD Server...\n');

    // Initialize all database connections
    console.log('🔌 Connecting to all databases...\n');
    const dbResults = await dbIntegrations.connectAll();
    console.log('');

    // Initialize Firebase (optional)
    console.log('🔥 Initializing Firebase...');
    const firebaseResult = initializeFirebase();
    firebase = firebaseResult.app;
    
    if (!firebaseResult.success && !firebaseResult.optional) {
      console.warn('⚠️  Firebase initialization failed, but server will continue');
      console.warn('   Push notifications and Firebase features will not be available\n');
    } else if (firebaseResult.success) {
      console.log('✅ Firebase initialized successfully\n');
    } else {
      console.log('');
    }

    // Get comprehensive database statistics
    try {
      console.log('📊 Database Statistics:\n');
      
      const stats = await dbIntegrations.getStats();
      const connections = dbIntegrations.getConnectionStatus();
      
      // PostgreSQL stats
      if (connections.postgresql.connected && stats.postgresql && !stats.postgresql.error) {
        console.log('   PostgreSQL (Primary Database):');
        console.log(`     - Users: ${stats.postgresql.users || 0}`);
        console.log(`     - Health Records: ${stats.postgresql.healthRecords || 0}`);
        console.log(`     - Weight Records: ${stats.postgresql.weightRecords || 0}`);
        console.log(`     - Goals: ${stats.postgresql.goals || 0}`);
        console.log(`     - Chat Sessions: ${stats.postgresql.chatSessions || 0}`);
        console.log(`     - Community Posts: ${stats.postgresql.communityPosts || 0}`);
      } else {
        console.log('   PostgreSQL: Not connected');
      }
      
      // MongoDB stats
      if (connections.mongodb.connected && stats.mongodb && !stats.mongodb.error) {
        console.log('   MongoDB (Document Store):');
        console.log(`     - Collections: ${stats.mongodb.collections || 0}`);
        if (stats.mongodb.collectionNames && stats.mongodb.collectionNames.length > 0) {
          console.log(`     - Names: ${stats.mongodb.collectionNames.join(', ')}`);
        }
      } else {
        console.log('   MongoDB: Not connected');
      }
      
      // Redis stats
      if (connections.redis.connected && stats.redis && !stats.redis.error) {
        console.log('   Redis (Cache & Sessions):');
        console.log(`     - Keys: ${stats.redis.keys || 0}`);
        console.log(`     - Status: Connected`);
      } else {
        console.log('   Redis: Not connected');
      }
      
      console.log('');
    } catch (error) {
      console.warn('⚠️  Could not fetch database statistics:', error.message);
      console.log('');
    }

    // Start Express server
    const sslManager = new SSLManager();
    const isSSLEnabled = sslManager.isSSLConfigured(process.env);
    
    if (isSSLEnabled) {
      // HTTPS mode
      try {
        const httpsOptions = sslManager.getHTTPSOptions(process.env);
        const HTTPS_PORT = parseInt(process.env.HTTPS_PORT) || 443;
        const HTTP_PORT = parseInt(process.env.HTTP_PORT) || 80;
        
        // Create HTTPS server
        const httpsServer = https.createServer(httpsOptions, app);
        httpsServer.listen(HTTPS_PORT, () => {
          console.log('\n' + '═'.repeat(80));
          console.log('║' + ' '.repeat(78) + '║');
          console.log('║' + '  ✅ GOD Server Started Successfully (HTTPS)'.padEnd(78) + '║');
          console.log('║' + ' '.repeat(78) + '║');
          console.log('═'.repeat(80) + '\n');
          
          console.log(`🔒 HTTPS URL:         https://localhost:${HTTPS_PORT}`);
          console.log(`📡 Environment:       ${NODE_ENV}`);
          console.log(`🔐 SSL:               Enabled`);
          console.log('');
          
          logEndpointsAndDatabases(HTTPS_PORT);
        });
        
        // Create HTTP redirect server
        const httpApp = express();
        httpApp.use((req, res) => {
          res.redirect(301, `https://${req.headers.host}${req.url}`);
        });
        const httpServer = httpApp.listen(HTTP_PORT, () => {
          console.log(`🔀 HTTP Redirect:     http://localhost:${HTTP_PORT} → https://localhost:${HTTPS_PORT}\n`);
        });
        
        // Store both servers for graceful shutdown
        global.server = httpsServer;
        global.httpRedirectServer = httpServer;
        
        return httpsServer;
      } catch (error) {
        console.error('❌ Failed to start HTTPS server:', error.message);
        console.error('   Falling back to HTTP mode...\n');
        // Fall through to HTTP mode
      }
    }
    
    // HTTP mode (default or fallback)
    const server = app.listen(PORT, async () => {
      console.log('\n' + '═'.repeat(80));
      console.log('║' + ' '.repeat(78) + '║');
      console.log('║' + '  ✅ GOD Server Started Successfully'.padEnd(78) + '║');
      console.log('║' + ' '.repeat(78) + '║');
      console.log('═'.repeat(80) + '\n');
      
      console.log(`🌐 Server URL:        http://localhost:${PORT}`);
      console.log(`📡 Environment:       ${NODE_ENV}`);
      console.log(`🔒 Port:              ${PORT} (FIXED)`);
      if (!isSSLEnabled && NODE_ENV === 'production') {
        console.warn(`⚠️  SSL:               Not configured (recommended for production)`);
      }
      console.log('');
      
      await logEndpointsAndDatabases(PORT);
    });

    // Store server reference for graceful shutdown
    global.server = server;

    return server;
  } catch (error) {
    console.error('❌ Failed to start GOD server:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Start the server
startGODServer();

export { app, startGODServer, db, dbIntegrations, ai, prisma, firebase, automations };
