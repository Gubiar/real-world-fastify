import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// For tests, we use an in-memory JWT secret
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

// Create a Prisma client for tests
const prisma = new PrismaClient({
  log: ['error'],
});

// Create a test database setup
beforeAll(async () => {
  // Confirm we're in a test environment to avoid accidentally affecting production data
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run with NODE_ENV=test');
  }

  // Connect to the database
  await prisma.$connect();

  // Clean up database before tests
  try {
    // Only truncate the users table for our auth tests
    await prisma.user.deleteMany();
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Clean up resources after all tests
afterAll(async () => {
  await prisma.$disconnect();
}); 