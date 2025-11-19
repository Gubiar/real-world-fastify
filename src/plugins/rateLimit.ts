import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { rateLimitConfig } from '../config/security';

const rateLimitPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  await server.register(rateLimit, rateLimitConfig);
};

export default fp(rateLimitPlugin); 