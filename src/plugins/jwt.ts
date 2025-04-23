import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { unauthorized } from '../utils/response';

interface JWTPayload {
  userId: number;
  email: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: () => void;
  }
  interface FastifyRequest {
    user: JWTPayload;
  }
}

const jwtPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-token',
    sign: {
      expiresIn: '1d'
    }
  });

  server.decorate('authenticate', async function(request: FastifyRequest, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return unauthorized(reply);
    }
  });
};

export default fp(jwtPlugin); 