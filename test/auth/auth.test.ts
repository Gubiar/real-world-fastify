import { test, expect, describe, beforeAll, afterAll } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { registerAuthRoutes } from '../../src/modules/auth/auth.route';
import drizzlePlugin from '../../src/plugins/drizzle';
import jwtPlugin from '../../src/plugins/jwt';
import { users } from '../../src/db/schema';

describe('Auth Module', () => {
  let app: FastifyInstance;
  let authToken: string;
  
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
    
    await app.db.delete(users);
    
    await app.ready();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  test('should register a new user', async () => {
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
  });
  
  test('should login with valid credentials', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      }
    });
    
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'Password123'
      }
    });
    
    if (response.statusCode !== 200) {
      console.error('Login response:', response.payload);
    }
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user).toBeDefined();
    expect(body.data.user.email).toBe('test@example.com');
    expect(body.data.user.password).toBeUndefined();
  });
  
  test('should fail login with invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'WrongPassword123'
      }
    });
    
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
  });
  
  test('should access protected route with valid token', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'Password123'
      }
    });
    
    expect(loginResponse.statusCode).toBe(200);
    const loginBody = JSON.parse(loginResponse.payload);
    authToken = loginBody.data.token;
    
    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: {
        authorization: `Bearer ${authToken}`
      }
    });
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.protected).toBe(true);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe('test@example.com');
  });
  
  test('should reject access to protected route without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/protected'
    });
    
    expect(response.statusCode).toBe(401);
  });
});
