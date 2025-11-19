import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.factory';
import { users } from '../../src/db/schema';

describe('Auth - Login', () => {
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
    
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'login@example.com',
        password: 'Password123',
        name: 'Login User'
      }
    });
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@example.com',
          password: 'Password123'
        }
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
      expect(body.data.user).toBeDefined();
      expect(body.data.user.email).toBe('login@example.com');
      expect(body.data.user.password).toBeUndefined();
    });
    
    test('should login with case-insensitive email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'LOGIN@EXAMPLE.COM',
          password: 'Password123'
        }
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
    });
    
    test('should fail login with wrong password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@example.com',
          password: 'WrongPassword123'
        }
      });
      
      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Invalid');
    });
    
    test('should fail login with non-existent email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'Password123'
        }
      });
      
      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.message).not.toContain('not found');
    });
    
    test('should fail with missing credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@example.com'
        }
      });
      
      expect(response.statusCode).toBe(400);
    });
    
    test('should fail with empty password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'login@example.com',
          password: ''
        }
      });
      
      expect(response.statusCode).toBe(400);
    });
  });
});

