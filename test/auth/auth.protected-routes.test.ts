import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.factory';
import { users } from '../../src/db/schema';

describe('Auth - Protected Routes', () => {
  let app: FastifyInstance;
  let validToken: string;
  
  beforeAll(async () => {
    app = await buildApp({ 
      logger: false,
      disableRequestLogging: true 
    });
    
    app.get('/test-protected', {
      preHandler: app.authenticate,
    }, async (request) => {
      return { protected: true, user: request.user };
    });
    
    app.get('/test-no-token', {
      preHandler: app.authenticate,
    }, async () => {
      return { protected: true };
    });
    
    app.get('/test-invalid-token', {
      preHandler: app.authenticate,
    }, async () => {
      return { protected: true };
    });
    
    app.get('/test-malformed', {
      preHandler: app.authenticate,
    }, async () => {
      return { protected: true };
    });
    
    await app.ready();
  });
  
  beforeEach(async () => {
    await app.db.delete(users);
    
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'protected@example.com',
        password: 'Password123',
        name: 'Protected User'
      }
    });
    
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'protected@example.com',
        password: 'Password123'
      }
    });
    
    const loginBody = JSON.parse(loginResponse.payload);
    validToken = loginBody.data.token;
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  test('should access protected route with valid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-protected',
      headers: {
        authorization: `Bearer ${validToken}`
      }
    });
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.protected).toBe(true);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe('protected@example.com');
  });
  
  test('should reject access without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-no-token'
    });
    
    expect(response.statusCode).toBe(401);
  });
  
  test('should reject access with invalid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-invalid-token',
      headers: {
        authorization: 'Bearer invalid-token-here'
      }
    });
    
    expect(response.statusCode).toBe(401);
  });
  
  test('should reject access with malformed authorization header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-malformed',
      headers: {
        authorization: 'InvalidFormat'
      }
    });
    
    expect(response.statusCode).toBe(401);
  });
});

