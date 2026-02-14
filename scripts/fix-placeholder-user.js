require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function fixPlaceholderUser() {
  console.log('🔧 Fixing placeholder user email...\n');
  
  try {
    // Find the user with example.com email
    const user = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'example.com'
        }
      }
    });
    
    if (!user) {
      console.log('✓ No placeholder users found!');
      return;
    }
    
    console.log(`Found user: ${user.email}`);
    
    // Generate a realistic email
    const newEmail = faker.internet.email({
      firstName: user.firstName || faker.person.firstName(),
      lastName: user.lastName || faker.person.lastName(),
      provider: faker.helpers.arrayElement(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'])
    }).toLowerCase();
    
    // Update the user
    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail }
    });
    
    console.log(`✓ Updated email to: ${newEmail}\n`);
    console.log('✅ Placeholder user fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing placeholder user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixPlaceholderUser();
