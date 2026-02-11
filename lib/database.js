// AAP Database Module
// Consolidated database operations and utilities

const { PrismaClient } = require('@prisma/client');

class DatabaseManager {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Health Check
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  // Get Database Statistics
  async getStats() {
    try {
      const stats = {};
      
      // Count records in each table
      stats.users = await this.prisma.user.count();
      stats.healthRecords = await this.prisma.healthRecord.count();
      stats.weightRecords = await this.prisma.weightRecord.count();
      stats.exerciseRecords = await this.prisma.exerciseRecord.count();
      stats.nutritionRecords = await this.prisma.nutritionRecord.count();
      stats.mentalHealthRecords = await this.prisma.mentalHealthRecord.count();
      stats.goals = await this.prisma.goal.count();
      stats.chatSessions = await this.prisma.chatSession.count();
      stats.communityPosts = await this.prisma.communityPost.count();
      stats.consultations = await this.prisma.consultation.count();
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error.message}`);
    }
  }

  // User Operations
  async createUser(userData) {
    return await this.prisma.user.create({
      data: userData
    });
  }

  async getUserById(id) {
    return await this.prisma.user.findUnique({
      where: { id },
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
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    });
  }

  async getUserByEmail(email) {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  }

  // Health Records Operations
  async createHealthRecord(userId, data) {
    // Extract only valid fields
    const {
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      oxygenSaturation,
      bloodSugar,
      bmi,
      bodyFatPercentage,
      muscleMass,
      symptoms,
      notes,
      mood,
      energyLevel,
      sleepHours,
      sleepQuality,
      recordedAt
    } = data;
    
    // Build record data with only provided fields
    const recordData = { userId };
    
    if (bloodPressureSystolic !== undefined) recordData.bloodPressureSystolic = parseInt(bloodPressureSystolic);
    if (bloodPressureDiastolic !== undefined) recordData.bloodPressureDiastolic = parseInt(bloodPressureDiastolic);
    if (heartRate !== undefined) recordData.heartRate = parseInt(heartRate);
    if (temperature !== undefined) recordData.temperature = parseFloat(temperature);
    if (oxygenSaturation !== undefined) recordData.oxygenSaturation = parseFloat(oxygenSaturation);
    if (bloodSugar !== undefined) recordData.bloodSugar = parseFloat(bloodSugar);
    if (bmi !== undefined) recordData.bmi = parseFloat(bmi);
    if (bodyFatPercentage !== undefined) recordData.bodyFatPercentage = parseFloat(bodyFatPercentage);
    if (muscleMass !== undefined) recordData.muscleMass = parseFloat(muscleMass);
    if (symptoms !== undefined) recordData.symptoms = Array.isArray(symptoms) ? symptoms : [];
    if (notes !== undefined) recordData.notes = String(notes);
    if (mood !== undefined) recordData.mood = parseInt(mood);
    if (energyLevel !== undefined) recordData.energyLevel = parseInt(energyLevel);
    if (sleepHours !== undefined) recordData.sleepHours = parseFloat(sleepHours);
    if (sleepQuality !== undefined) recordData.sleepQuality = parseInt(sleepQuality);
    if (recordedAt !== undefined) recordData.recordedAt = new Date(recordedAt);
    
    return await this.prisma.healthRecord.create({
      data: recordData
    });
  }

  async getHealthRecords(userId, limit = 50) {
    return await this.prisma.healthRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: limit
    });
  }

  // Weight Records Operations
  async createWeightRecord(userId, data) {
    return await this.prisma.weightRecord.create({
      data: {
        userId,
        ...data
      }
    });
  }

  async getWeightRecords(userId, limit = 50) {
    return await this.prisma.weightRecord.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: limit
    });
  }

  // Cleanup and Maintenance
  async cleanup() {
    // Clean up old sessions, temporary data, etc.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Example cleanup operations
    await this.prisma.chatSession.deleteMany({
      where: {
        lastMessageAt: {
          lt: thirtyDaysAgo
        },
        isActive: false
      }
    });
    
    return { message: 'Cleanup completed' };
  }

  // Disconnect
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = { DatabaseManager };