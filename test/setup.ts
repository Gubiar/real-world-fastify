import 'dotenv/config';
import { afterAll, beforeAll } from '@jest/globals';
import { createDbConnection } from '../src/db/connection';
import { users } from '../src/db/schema';

process.env['NODE_ENV'] = 'test';
process.env['LOG_LEVEL'] = 'error';

process.env['JWT_SECRET'] = 'test-jwt-secret-for-testing-only';

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const db = createDbConnection(databaseUrl, false);

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
