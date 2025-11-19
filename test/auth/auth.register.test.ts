import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.factory';
import { users } from '../../src/db/schema';

describe('Auth - Register', () => {
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
  
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'Password123',
          name: 'Test User'
        }
      });
      
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.email).toBe('test@example.com');
      expect(body.data.name).toBe('Test User');
      expect(body.data.password).toBeUndefined();
      expect(body.data.id).toBeDefined();
    });
    
    test('should normalize email to lowercase', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'Test.User@EXAMPLE.COM',
          password: 'Password123',
          name: 'Test User'
        }
      });
      
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.data.email).toBe('test.user@example.com');
    });
    
    test('should fail to register user with duplicate email', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'duplicate@example.com',
          password: 'Password123',
          name: 'First User'
        }
      });
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'duplicate@example.com',
          password: 'Password456',
          name: 'Second User'
        }
      });
      
      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.message).toContain('already exists');
    });
    
    test('should fail with missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'incomplete@example.com'
        }
      });
      
      expect(response.statusCode).toBe(400);
    });
    
    test('should fail with invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'not-an-email',
          password: 'Password123',
          name: 'Test User'
        }
      });
      
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });
    
    test('should fail with weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      });
      
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });
    
    test('should fail with short password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'Pass1',
          name: 'Test User'
        }
      });
      
      expect(response.statusCode).toBe(400);
    });
    
    test('should fail with too long email', async () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: longEmail,
          password: 'Password123',
          name: 'Test User'
        }
      });
      
      expect(response.statusCode).toBe(400);
    });
  });
});

