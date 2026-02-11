const express = require('express');
const router = express.Router();
const { DatabaseCRUD } = require('../lib/database-crud');
const { authenticateToken } = require('../lib/auth');

const db = new DatabaseCRUD();

// Log a behavior/mental health entry
router.post('/log', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const behaviorData = req.body;

    const record = await db.createMentalHealthRecord(userId, {
      ...behaviorData,
      recordedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Behavior logged successfully',
      data: record
    });
  } catch (error) {
    console.error('Error logging behavior:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log behavior',
      error: error.message
    });
  }
});

// Get behavior records for a user
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skip = 0, take = 50 } = req.query;

    const records = await db.getMentalHealthRecordsByUser(
      userId,
      parseInt(skip),
      parseInt(take)
    );

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error fetching behavior records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch behavior records',
      error: error.message
    });
  }
});

// Get behavior trends
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const trends = await db.getMentalHealthTrends(userId, parseInt(days));

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching behavior trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch behavior trends',
      error: error.message
    });
  }
});

// Update a behavior record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    const record = await db.getMentalHealthRecordById(id);
    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Behavior record not found'
      });
    }

    const updated = await db.updateMentalHealthRecord(id, updateData);

    res.json({
      success: true,
      message: 'Behavior record updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating behavior record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update behavior record',
      error: error.message
    });
  }
});

// Delete a behavior record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const record = await db.getMentalHealthRecordById(id);
    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Behavior record not found'
      });
    }

    await db.deleteMentalHealthRecord(id);

    res.json({
      success: true,
      message: 'Behavior record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting behavior record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete behavior record',
      error: error.message
    });
  }
});

module.exports = router;
