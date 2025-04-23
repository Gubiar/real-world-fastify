import { FastifyInstance, FastifyPluginAsync, FastifyRequest, RouteOptions } from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

// Define custom config interface for our rate limit settings
interface CustomRateLimitConfig {
  routeRateLimit?: {
    max: number;
    timeWindow: string;
  };
}

// Extend route config
declare module 'fastify' {
  interface FastifyContextConfig extends CustomRateLimitConfig {}
}

const rateLimitPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  await server.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
    // Use IP as the key for rate limiting
    keyGenerator: (request: FastifyRequest) => {
      return request.ip; // use client's IP as the key
    },
  });

  // Add stricter rate limits for authentication routes
  server.addHook('onRoute', (routeOptions: RouteOptions) => {
    if (routeOptions.url && 
        (routeOptions.url.includes('/api/auth/login') || 
         routeOptions.url.includes('/api/auth/register'))) {
      routeOptions.config = {
        ...routeOptions.config,
        routeRateLimit: {
          max: 5,
          timeWindow: '1 minute'
        }
      };
    }
  });
};

export default fp(rateLimitPlugin); 