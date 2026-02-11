// Script to add health data to a user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addHealthData() {
  try {
    const email = 'abhayharithas.sde@gmail.com';
    
    console.log('🔍 Finding user:', email);
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.id);
    console.log('Current health data:', {
      weight: user.weight,
      height: user.height,
      bmi: user.bmi
    });
    
    // Add sample health data
    const weight = 70; // kg
    const height = 175; // cm
    const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
    
    console.log('\n📝 Updating user with health data...');
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        weight: weight,
        height: height,
        heightCm: height,
        bmi: parseFloat(bmi),
        bmiCategory: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese',
        age: 25
      }
    });
    
    console.log('✅ User updated successfully!');
    console.log('New health data:', {
      weight: updatedUser.weight,
      height: updatedUser.height,
      bmi: updatedUser.bmi,
      bmiCategory: updatedUser.bmiCategory
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addHealthData();
