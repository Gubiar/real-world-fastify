import { test, expect, describe, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { registerAuthRoutes } from '../../src/modules/auth/auth.route';
import drizzlePlugin from '../../src/plugins/drizzle';
import jwtPlugin from '../../src/plugins/jwt';
import { users } from '../../src/db/schema';

describe('Auth Module', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    app = fastify({
      logger: false
    }).withTypeProvider<TypeBoxTypeProvider>();
    
    await app.register(drizzlePlugin);
    await app.register(jwtPlugin);
    
    registerAuthRoutes(app, '/api/auth');
    
    app.get('/protected', {
      preHandler: app.authenticate,
    }, async (request) => {
      return { protected: true, user: request.user };
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
      
      expect(response.statusCode).toBe(400);
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
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
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
  });
  
  describe('Protected Routes', () => {
    let validToken: string;
    
    beforeEach(async () => {
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
    
    test('should access protected route with valid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
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
        url: '/protected'
      });
      
      expect(response.statusCode).toBe(401);
    });
    
    test('should reject access with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: {
          authorization: 'Bearer invalid-token-here'
        }
      });
      
      expect(response.statusCode).toBe(401);
    });
    
    test('should reject access with malformed authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: {
          authorization: 'InvalidFormat'
        }
      });
      
      expect(response.statusCode).toBe(401);
    });
  });
});
