// Comprehensive CRUD Operations for All Models
// WellSense AI Database Module

import { PrismaClient } from '@prisma/client';

class DatabaseCRUD {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // ==================== USER CRUD ====================
  
  async createUser(data) {
    return await this.prisma.user.create({ data });
  }

  async getUserById(id, includeRelations = false) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: includeRelations ? {
        healthRecords: true,
        weightRecords: true,
        exerciseRecords: true,
        nutritionRecords: true,
        mentalHealthRecords: true,
        goals: true,
        chatSessions: true,
        communityPosts: true,
        consultations: true
      } : undefined
    });
  }

  async getUserByEmail(email) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async getUserByGoogleId(googleId) {
    return await this.prisma.user.findUnique({ where: { googleId } });
  }

  async getUserByMicrosoftId(microsoftId) {
    return await this.prisma.user.findUnique({ where: { microsoftId } });
  }

  async getAllUsers(skip = 0, take = 50, filters = {}) {
    return await this.prisma.user.findMany({
      where: filters,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateUser(id, data) {
    return await this.prisma.user.update({
      where: { id },
      data
    });
  }

  async deleteUser(id) {
    return await this.prisma.user.delete({ where: { id } });
  }

  async searchUsers(searchTerm) {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 20
    });
  }

  // ==================== HEALTH RECORD CRUD ====================
  
  async createHealthRecord(userId, data) {
    return await this.prisma.healthRecord.create({
      data: { userId, ...data }
    });
  }

  async getHealthRecordById(id) {
    return await this.prisma.healthRecord.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getHealthRecordsByUser(userId, skip = 0, take = 50) {
    return await this.prisma.healthRecord.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { recordedAt: 'desc' }
    });
  }

  async updateHealthRecord(id, data) {
    return await this.prisma.healthRecord.update({
      where: { id },
      data
    });
  }

  async deleteHealthRecord(id) {
    return await this.prisma.healthRecord.delete({ where: { id } });
  }

  async getHealthRecordsByDateRange(userId, startDate, endDate) {
    return await this.prisma.healthRecord.findMany({
      where: {
        userId,
        recordedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { recordedAt: 'desc' }
    });
  }

  // ==================== WEIGHT RECORD CRUD ====================
  
  async createWeightRecord(userId, data) {
    return await this.prisma.weightRecord.create({
      data: { userId, ...data }
    });
  }

  async getWeightRecordById(id) {
    return await this.prisma.weightRecord.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getWeightRecordsByUser(userId, skip = 0, take = 50) {
    return await this.prisma.weightRecord.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { recordedAt: 'desc' }
    });
  }

  async updateWeightRecord(id, data) {
    return await this.prisma.weightRecord.update({
      where: { id },
      data
    });
  }

  async deleteWeightRecord(id) {
    return await this.prisma.weightRecord.delete({ where: { id } });
  }

  async getWeightProgress(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.prisma.weightRecord.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate }
      },
      orderBy: { recordedAt: 'asc' }
    });
  }

  // ==================== EXERCISE RECORD CRUD ====================
  
  async createExerciseRecord(userId, data) {
    return await this.prisma.exerciseRecord.create({
      data: { userId, ...data }
    });
  }

  async getExerciseRecordById(id) {
    return await this.prisma.exerciseRecord.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getExerciseRecordsByUser(userId, skip = 0, take = 50) {
    return await this.prisma.exerciseRecord.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { recordedAt: 'desc' }
    });
  }

  async updateExerciseRecord(id, data) {
    return await this.prisma.exerciseRecord.update({
      where: { id },
      data
    });
  }

  async deleteExerciseRecord(id) {
    return await this.prisma.exerciseRecord.delete({ where: { id } });
  }

  async getExerciseByType(userId, exerciseType) {
    return await this.prisma.exerciseRecord.findMany({
      where: { userId, exerciseType },
      orderBy: { recordedAt: 'desc' }
    });
  }

  async getExerciseStats(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const records = await this.prisma.exerciseRecord.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate }
      }
    });

    const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
    const totalCalories = records.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0);
    const totalDistance = records.reduce((sum, r) => sum + (r.distance || 0), 0);

    return {
      totalWorkouts: records.length,
      totalDuration,
      totalCalories,
      totalDistance,
      averageDuration: records.length > 0 ? totalDuration / records.length : 0
    };
  }

  // ==================== NUTRITION RECORD CRUD ====================
  
  async createNutritionRecord(userId, data) {
    return await this.prisma.nutritionRecord.create({
      data: { userId, ...data }
    });
  }

  async getNutritionRecordById(id) {
    return await this.prisma.nutritionRecord.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getNutritionRecordsByUser(userId, skip = 0, take = 50) {
    return await this.prisma.nutritionRecord.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { recordedAt: 'desc' }
    });
  }

  async updateNutritionRecord(id, data) {
    return await this.prisma.nutritionRecord.update({
      where: { id },
      data
    });
  }

  async deleteNutritionRecord(id) {
    return await this.prisma.nutritionRecord.delete({ where: { id } });
  }

  async getNutritionByMealType(userId, mealType, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.prisma.nutritionRecord.findMany({
      where: {
        userId,
        mealType,
        recordedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  }

  async getDailyNutritionSummary(userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.prisma.nutritionRecord.findMany({
      where: {
        userId,
        recordedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    return {
      totalCalories: records.reduce((sum, r) => sum + r.calories, 0),
      totalProtein: records.reduce((sum, r) => sum + r.protein, 0),
      totalCarbs: records.reduce((sum, r) => sum + r.carbohydrates, 0),
      totalFat: records.reduce((sum, r) => sum + r.fat, 0),
      totalFiber: records.reduce((sum, r) => sum + (r.fiber || 0), 0),
      totalWater: records.reduce((sum, r) => sum + (r.waterIntakeMl || 0), 0),
      mealCount: records.length
    };
  }

  // ==================== MENTAL HEALTH RECORD CRUD ====================
  
  async createMentalHealthRecord(userId, data) {
    return await this.prisma.mentalHealthRecord.create({
      data: { userId, ...data }
    });
  }

  async getMentalHealthRecordById(id) {
    return await this.prisma.mentalHealthRecord.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getMentalHealthRecordsByUser(userId, skip = 0, take = 50) {
    return await this.prisma.mentalHealthRecord.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { recordedAt: 'desc' }
    });
  }

  async updateMentalHealthRecord(id, data) {
    return await this.prisma.mentalHealthRecord.update({
      where: { id },
      data
    });
  }

  async deleteMentalHealthRecord(id) {
    return await this.prisma.mentalHealthRecord.delete({ where: { id } });
  }

  async getMentalHealthTrends(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.prisma.mentalHealthRecord.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate }
      },
      orderBy: { recordedAt: 'asc' }
    });
  }

  // ==================== GOAL CRUD ====================
  
  async createGoal(userId, data) {
    return await this.prisma.goal.create({
      data: { userId, ...data }
    });
  }

  async getGoalById(id) {
    return await this.prisma.goal.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getGoalsByUser(userId, status = null) {
    const where = { userId };
    if (status) where.status = status;

    return await this.prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateGoal(id, data) {
    return await this.prisma.goal.update({
      where: { id },
      data
    });
  }

  async deleteGoal(id) {
    return await this.prisma.goal.delete({ where: { id } });
  }

  async updateGoalProgress(id, currentValue) {
    return await this.prisma.goal.update({
      where: { id },
      data: { currentValue }
    });
  }

  async completeGoal(id) {
    return await this.prisma.goal.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
  }

  // ==================== CHAT SESSION CRUD ====================
  
  async createChatSession(userId, data) {
    return await this.prisma.chatSession.create({
      data: { userId, ...data }
    });
  }

  async getChatSessionById(id) {
    return await this.prisma.chatSession.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getChatSessionsByUser(userId, skip = 0, take = 50) {
    return await this.prisma.chatSession.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { lastMessageAt: 'desc' }
    });
  }

  async updateChatSession(id, data) {
    return await this.prisma.chatSession.update({
      where: { id },
      data: {
        ...data,
        lastMessageAt: new Date()
      }
    });
  }

  async deleteChatSession(id) {
    return await this.prisma.chatSession.delete({ where: { id } });
  }

  async addMessageToSession(id, message) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id }
    });

    const messages = session.messages;
    messages.push(message);

    return await this.prisma.chatSession.update({
      where: { id },
      data: {
        messages,
        lastMessageAt: new Date()
      }
    });
  }

  async deactivateChatSession(id) {
    return await this.prisma.chatSession.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // ==================== COMMUNITY POST CRUD ====================
  
  async createCommunityPost(userId, data) {
    return await this.prisma.communityPost.create({
      data: { userId, ...data }
    });
  }

  async getCommunityPostById(id) {
    return await this.prisma.communityPost.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getAllCommunityPosts(skip = 0, take = 50, filters = {}) {
    return await this.prisma.communityPost.findMany({
      where: {
        isPublished: true,
        moderationStatus: 'APPROVED',
        ...filters
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
          }
        }
      }
    });
  }

  async getCommunityPostsByUser(userId, skip = 0, take = 50) {
    return await this.prisma.communityPost.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateCommunityPost(id, data) {
    return await this.prisma.communityPost.update({
      where: { id },
      data
    });
  }

  async deleteCommunityPost(id) {
    return await this.prisma.communityPost.delete({ where: { id } });
  }

  async likeCommunityPost(id) {
    return await this.prisma.communityPost.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });
  }

  async searchCommunityPosts(searchTerm) {
    return await this.prisma.communityPost.findMany({
      where: {
        isPublished: true,
        moderationStatus: 'APPROVED',
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { has: searchTerm } }
        ]
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
  }

  // ==================== CONSULTATION CRUD ====================
  
  async createConsultation(userId, data) {
    return await this.prisma.consultation.create({
      data: { userId, ...data }
    });
  }

  async getConsultationById(id) {
    return await this.prisma.consultation.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async getConsultationsByUser(userId, skip = 0, take = 50) {
    return await this.prisma.consultation.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { scheduledAt: 'desc' }
    });
  }

  async updateConsultation(id, data) {
    return await this.prisma.consultation.update({
      where: { id },
      data
    });
  }

  async deleteConsultation(id) {
    return await this.prisma.consultation.delete({ where: { id } });
  }

  async startConsultation(id) {
    return await this.prisma.consultation.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });
  }

  async completeConsultation(id, notes, prescription = null) {
    return await this.prisma.consultation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        notes,
        prescription
      }
    });
  }

  async getUpcomingConsultations(userId) {
    return await this.prisma.consultation.findMany({
      where: {
        userId,
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  // ==================== UTILITY METHODS ====================
  
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async getStats() {
    const [
      users,
      healthRecords,
      weightRecords,
      exerciseRecords,
      nutritionRecords,
      mentalHealthRecords,
      goals,
      chatSessions,
      communityPosts,
      consultations
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.healthRecord.count(),
      this.prisma.weightRecord.count(),
      this.prisma.exerciseRecord.count(),
      this.prisma.nutritionRecord.count(),
      this.prisma.mentalHealthRecord.count(),
      this.prisma.goal.count(),
      this.prisma.chatSession.count(),
      this.prisma.communityPost.count(),
      this.prisma.consultation.count()
    ]);

    return {
      users,
      healthRecords,
      weightRecords,
      exerciseRecords,
      nutritionRecords,
      mentalHealthRecords,
      goals,
      chatSessions,
      communityPosts,
      consultations,
      total: users + healthRecords + weightRecords + exerciseRecords + 
             nutritionRecords + mentalHealthRecords + goals + chatSessions + 
             communityPosts + consultations
    };
  }

  async cleanup(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const deleted = await this.prisma.chatSession.deleteMany({
      where: {
        lastMessageAt: { lt: cutoffDate },
        isActive: false
      }
    });

    return { 
      message: 'Cleanup completed',
      deletedSessions: deleted.count
    };
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export { DatabaseCRUD };
