import { PrismaClient } from '../prisma/generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clean the database
    await prisma.user.deleteMany();

    // Hash password
    console.log('Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    console.log('Password hashed successfully');

    // Create a test user
    console.log('Creating test user...');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword
      }
    });

    console.log('Created test user:', { 
      id: testUser.id,
      email: testUser.email,
      name: testUser.name
    });
    
    console.log('Test user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error in seed script:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 