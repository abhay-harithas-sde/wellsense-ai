// Comprehensive CRUD API Routes
// WellSense AI - All Database Operations

const express = require('express');
const router = express.Router();
const { DatabaseCRUD } = require('../lib/database-crud');
const { authenticateToken } = require('../lib/auth');

const db = new DatabaseCRUD();

// ==================== USER ROUTES ====================

router.post('/users', async (req, res) => {
  try {
    const user = await db.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id, req.query.include === 'true');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/users', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50, ...filters } = req.query;
    const users = await db.getAllUsers(parseInt(skip), parseInt(take), filters);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await db.updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/users/search/:term', authenticateToken, async (req, res) => {
  try {
    const users = await db.searchUsers(req.params.term);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== HEALTH RECORD ROUTES ====================

router.post('/health-records', authenticateToken, async (req, res) => {
  try {
    const record = await db.createHealthRecord(req.user.userId, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/health-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.getHealthRecordById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/health-records/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50 } = req.query;
    const records = await db.getHealthRecordsByUser(req.params.userId, parseInt(skip), parseInt(take));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/health-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.updateHealthRecord(req.params.id, req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/health-records/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteHealthRecord(req.params.id);
    res.json({ success: true, message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/health-records/user/:userId/range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const records = await db.getHealthRecordsByDateRange(req.params.userId, startDate, endDate);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== WEIGHT RECORD ROUTES ====================

router.post('/weight-records', authenticateToken, async (req, res) => {
  try {
    const record = await db.createWeightRecord(req.user.userId, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/weight-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.getWeightRecordById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/weight-records/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50 } = req.query;
    const records = await db.getWeightRecordsByUser(req.params.userId, parseInt(skip), parseInt(take));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/weight-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.updateWeightRecord(req.params.id, req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/weight-records/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteWeightRecord(req.params.id);
    res.json({ success: true, message: 'Weight record deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/weight-records/user/:userId/progress', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const progress = await db.getWeightProgress(req.params.userId, parseInt(days));
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== EXERCISE RECORD ROUTES ====================

router.post('/exercise-records', authenticateToken, async (req, res) => {
  try {
    const record = await db.createExerciseRecord(req.user.userId, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/exercise-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.getExerciseRecordById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/exercise-records/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50 } = req.query;
    const records = await db.getExerciseRecordsByUser(req.params.userId, parseInt(skip), parseInt(take));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/exercise-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.updateExerciseRecord(req.params.id, req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/exercise-records/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteExerciseRecord(req.params.id);
    res.json({ success: true, message: 'Exercise record deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/exercise-records/user/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await db.getExerciseStats(req.params.userId, parseInt(days));
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== NUTRITION RECORD ROUTES ====================

router.post('/nutrition-records', authenticateToken, async (req, res) => {
  try {
    const record = await db.createNutritionRecord(req.user.userId, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/nutrition-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.getNutritionRecordById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/nutrition-records/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50 } = req.query;
    const records = await db.getNutritionRecordsByUser(req.params.userId, parseInt(skip), parseInt(take));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/nutrition-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.updateNutritionRecord(req.params.id, req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/nutrition-records/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteNutritionRecord(req.params.id);
    res.json({ success: true, message: 'Nutrition record deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/nutrition-records/user/:userId/daily', authenticateToken, async (req, res) => {
  try {
    const { date = new Date() } = req.query;
    const summary = await db.getDailyNutritionSummary(req.params.userId, date);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== MENTAL HEALTH RECORD ROUTES ====================

router.post('/mental-health-records', authenticateToken, async (req, res) => {
  try {
    const record = await db.createMentalHealthRecord(req.user.userId, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/mental-health-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.getMentalHealthRecordById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/mental-health-records/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50 } = req.query;
    const records = await db.getMentalHealthRecordsByUser(req.params.userId, parseInt(skip), parseInt(take));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/mental-health-records/:id', authenticateToken, async (req, res) => {
  try {
    const record = await db.updateMentalHealthRecord(req.params.id, req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/mental-health-records/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteMentalHealthRecord(req.params.id);
    res.json({ success: true, message: 'Mental health record deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/mental-health-records/user/:userId/trends', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await db.getMentalHealthTrends(req.params.userId, parseInt(days));
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== GOAL ROUTES ====================

router.post('/goals', authenticateToken, async (req, res) => {
  try {
    const goal = await db.createGoal(req.user.userId, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/goals/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await db.getGoalById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/goals/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const goals = await db.getGoalsByUser(req.params.userId, status);
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/goals/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await db.updateGoal(req.params.id, req.body);
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/goals/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteGoal(req.params.id);
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/goals/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { currentValue } = req.body;
    const goal = await db.updateGoalProgress(req.params.id, currentValue);
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/goals/:id/complete', authenticateToken, async (req, res) => {
  try {
    const goal = await db.completeGoal(req.params.id);
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== CHAT SESSION ROUTES ====================

router.post('/chat-sessions', authenticateToken, async (req, res) => {
  try {
    const session = await db.createChatSession(req.user.userId, req.body);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/chat-sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await db.getChatSessionById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/chat-sessions/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50 } = req.query;
    const sessions = await db.getChatSessionsByUser(req.params.userId, parseInt(skip), parseInt(take));
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/chat-sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await db.updateChatSession(req.params.id, req.body);
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/chat-sessions/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteChatSession(req.params.id);
    res.json({ success: true, message: 'Chat session deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/chat-sessions/:id/messages', authenticateToken, async (req, res) => {
  try {
    const session = await db.addMessageToSession(req.params.id, req.body);
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== COMMUNITY POST ROUTES ====================

router.post('/community-posts', authenticateToken, async (req, res) => {
  try {
    const post = await db.createCommunityPost(req.user.userId, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/community-posts/:id', async (req, res) => {
  try {
    const post = await db.getCommunityPostById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/community-posts', async (req, res) => {
  try {
    const { skip = 0, take = 50, category } = req.query;
    const filters = category ? { category } : {};
    const posts = await db.getAllCommunityPosts(parseInt(skip), parseInt(take), filters);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/community-posts/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50 } = req.query;
    const posts = await db.getCommunityPostsByUser(req.params.userId, parseInt(skip), parseInt(take));
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/community-posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await db.updateCommunityPost(req.params.id, req.body);
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/community-posts/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteCommunityPost(req.params.id);
    res.json({ success: true, message: 'Community post deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/community-posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await db.likeCommunityPost(req.params.id);
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/community-posts/search/:term', async (req, res) => {
  try {
    const posts = await db.searchCommunityPosts(req.params.term);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== CONSULTATION ROUTES ====================

router.post('/consultations', authenticateToken, async (req, res) => {
  try {
    const consultation = await db.createConsultation(req.user.userId, req.body);
    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/consultations/:id', authenticateToken, async (req, res) => {
  try {
    const consultation = await db.getConsultationById(req.params.id);
    if (!consultation) return res.status(404).json({ success: false, error: 'Consultation not found' });
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/consultations/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { skip = 0, take = 50 } = req.query;
    const consultations = await db.getConsultationsByUser(req.params.userId, parseInt(skip), parseInt(take));
    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/consultations/:id', authenticateToken, async (req, res) => {
  try {
    const consultation = await db.updateConsultation(req.params.id, req.body);
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/consultations/:id', authenticateToken, async (req, res) => {
  try {
    await db.deleteConsultation(req.params.id);
    res.json({ success: true, message: 'Consultation deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/consultations/:id/start', authenticateToken, async (req, res) => {
  try {
    const consultation = await db.startConsultation(req.params.id);
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/consultations/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { notes, prescription } = req.body;
    const consultation = await db.completeConsultation(req.params.id, notes, prescription);
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/consultations/user/:userId/upcoming', authenticateToken, async (req, res) => {
  try {
    const consultations = await db.getUpcomingConsultations(req.params.userId);
    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== UTILITY ROUTES ====================

router.get('/health', async (req, res) => {
  try {
    const health = await db.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
