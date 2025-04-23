import 'dotenv/config';
import { disconnectPrisma } from '../src/utils/prisma';
import { afterAll } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Clean up resources after all tests
afterAll(async () => {
  await disconnectPrisma();
}); 