import { test, expect, describe, beforeAll, afterAll } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { authRouter } from '../../src/modules/auth/auth.route';
import { prisma } from '../../src/utils/prisma';

describe('Auth Module', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    // Create test server
    app = fastify().withTypeProvider<TypeBoxTypeProvider>();
    
    // Register routes
    authRouter.registerWithPrefix(app, '/api/auth');
    
    // Clean test database
    await prisma.user.deleteMany();
    
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
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'Password123'
      }
    });
    
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
}); 