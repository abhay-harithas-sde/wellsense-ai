import express from 'express';
const router = express.Router();
import { DatabaseCRUD } from '../lib/database-crud.js';
import { authenticateToken } from '../lib/auth.js';

const db = new DatabaseCRUD();

// Log a meal/nutrition entry
router.post('/log', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const nutritionData = req.body;

    const record = await db.createNutritionRecord(userId, {
      ...nutritionData,
      recordedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Meal logged successfully',
      data: record
    });
  } catch (error) {
    console.error('Error logging nutrition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log meal',
      error: error.message
    });
  }
});

// Get nutrition records for a user
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skip = 0, take = 50 } = req.query;

    const records = await db.getNutritionRecordsByUser(
      userId,
      parseInt(skip),
      parseInt(take)
    );

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error fetching nutrition records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nutrition records',
      error: error.message
    });
  }
});

// Get daily nutrition summary
router.get('/daily-summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date = new Date().toISOString() } = req.query;

    const summary = await db.getDailyNutritionSummary(userId, new Date(date));

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily summary',
      error: error.message
    });
  }
});

// Get nutrition by meal type
router.get('/by-meal-type', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { mealType, date = new Date().toISOString() } = req.query;

    if (!mealType) {
      return res.status(400).json({
        success: false,
        message: 'Meal type is required'
      });
    }

    const records = await db.getNutritionByMealType(userId, mealType, new Date(date));

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error fetching nutrition by meal type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nutrition records',
      error: error.message
    });
  }
});

// Update a nutrition record
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    const record = await db.getNutritionRecordById(id);
    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition record not found'
      });
    }

    const updated = await db.updateNutritionRecord(id, updateData);

    res.json({
      success: true,
      message: 'Nutrition record updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating nutrition record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update nutrition record',
      error: error.message
    });
  }
});

// Delete a nutrition record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const record = await db.getNutritionRecordById(id);
    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition record not found'
      });
    }

    await db.deleteNutritionRecord(id);

    res.json({
      success: true,
      message: 'Nutrition record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting nutrition record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete nutrition record',
      error: error.message
    });
  }
});

export default router;
