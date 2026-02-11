// AAP Routes Module
// Consolidated API routes

const express = require('express');
const { DatabaseManager } = require('../lib/database');
const { AIManager } = require('../lib/ai');
const { authenticateToken } = require('../lib/auth');
const authRoutes = require('./auth');
const chatRoutes = require('./chat');
const nutritionRoutes = require('./nutrition');
const behaviorRoutes = require('./behavior');

const router = express.Router();
const db = new DatabaseManager();
const ai = new AIManager();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount chat routes
router.use('/chat', chatRoutes);

// Mount nutrition routes
router.use('/nutrition', nutritionRoutes);

// Mount behavior routes
router.use('/behavior', behaviorRoutes);

// Health Check Routes
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    const aiHealth = await ai.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        ai: aiHealth
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database Stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Profile Routes (legacy - auth routes handle /auth/me)
router.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/user/profile', authenticateToken, async (req, res) => {
  try {
    const updatedUser = await db.prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phoneNumber: true,
        profileImage: true,
        heightCm: true,
        preferredUnits: true,
        timezone: true,
        language: true,
        updatedAt: true
      }
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health Records Routes
router.post('/health/records', authenticateToken, async (req, res) => {
  try {
    console.log('[Health Record] Creating record for user:', req.user.id);
    console.log('[Health Record] Data:', req.body);
    
    const record = await db.createHealthRecord(req.user.id, req.body);
    
    console.log('[Health Record] Created successfully:', record.id);
    
    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: {
        record
      }
    });
  } catch (error) {
    console.error('[Health Record] Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.get('/health/records', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const records = await db.getHealthRecords(req.user.id, limit);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Weight Records Routes
router.post('/weight/records', authenticateToken, async (req, res) => {
  try {
    const record = await db.createWeightRecord(req.user.id, req.body);
    res.status(201).json({
      message: 'Weight record created successfully',
      record
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/weight/records', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const records = await db.getWeightRecords(req.user.id, limit);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Chat Routes
router.post('/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Get user profile for personalized responses
    const user = await db.getUserById(req.user.id);
    
    const response = await ai.generateHealthAdvice(user, message);
    
    // Save chat session
    await db.prisma.chatSession.create({
      data: {
        userId: req.user.id,
        messages: [
          { role: 'user', content: message, timestamp: new Date() },
          { role: 'assistant', content: response.content, timestamp: new Date() }
        ],
        aiProvider: response.provider.toUpperCase(),
        model: response.model
      }
    });
    
    res.json({
      response: response.content,
      provider: response.provider,
      model: response.model
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Goals Routes
router.post('/goals', authenticateToken, async (req, res) => {
  try {
    const goal = await db.prisma.goal.create({
      data: {
        userId: req.user.id,
        ...req.body
      }
    });
    
    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await db.prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Community Routes
router.post('/community/posts', authenticateToken, async (req, res) => {
  try {
    const post = await db.prisma.communityPost.create({
      data: {
        userId: req.user.id,
        ...req.body
      }
    });
    
    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/community/posts', async (req, res) => {
  try {
    const posts = await db.prisma.communityPost.findMany({
      where: { isPublished: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;