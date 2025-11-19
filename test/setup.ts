import { afterAll, beforeAll } from '@jest/globals';
import { createDbConnection } from '../src/db/connection';
import { users } from '../src/db/schema';

const db = createDbConnection({ logger: false, url: process.env["DATABASE_URL"] });

beforeAll(async () => {
  if (process.env['NODE_ENV'] !== 'test') {
    throw new Error('Tests must be run with NODE_ENV=test');
  }

  try {
    await db.delete(users);
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

afterAll(async () => {
  await db.$client.end();
});
