import { test, expect, describe, beforeAll, afterAll } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.factory';

describe('App - Health Check', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    app = await buildApp({ 
      logger: false,
      disableRequestLogging: true 
    });
    await app.ready();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  test('should return ok status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
  
  test('should return valid timestamp format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });
    
    const body = JSON.parse(response.payload);
    const timestamp = new Date(body.timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});

