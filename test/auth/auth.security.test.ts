import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.factory';
import { users } from '../../src/db/schema';

describe('Auth - Security', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    app = await buildApp({ 
      logger: false,
      disableRequestLogging: true 
    });
    await app.ready();
  });
  
  beforeEach(async () => {
    await app.db.delete(users);
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  test('should hash passwords securely', async () => {
    const password = 'Password123';
    
    const response1 = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'hash1@example.com',
        password,
        name: 'Hash Test 1'
      }
    });
    
    const response2 = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'hash2@example.com',
        password,
        name: 'Hash Test 2'
      }
    });
    
    expect(response1.statusCode).toBe(201);
    expect(response2.statusCode).toBe(201);
    
    const users_result = await app.db.select().from(users);
    const user1 = users_result.find(u => u.email === 'hash1@example.com');
    const user2 = users_result.find(u => u.email === 'hash2@example.com');
    
    expect(user1?.password).not.toBe(password);
    expect(user2?.password).not.toBe(password);
    expect(user1?.password).not.toBe(user2?.password);
  });
  
  test('should not expose sensitive data in responses', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'sensitive@example.com',
        password: 'Password123',
        name: 'Sensitive User'
      }
    });
    
    const body = JSON.parse(response.payload);
    expect(body.data.password).toBeUndefined();
    expect(response.payload).not.toContain('Password123');
  });
});

