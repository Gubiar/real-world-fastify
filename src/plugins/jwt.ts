import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { unauthorized } from '../utils/response';

interface JWTPayload {
  userId: number;
  email: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const jwtPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  // Make sure JWT_SECRET is provided in production
  const secret = process.env['JWT_SECRET'];
  if (!secret && process.env['NODE_ENV'] === 'production') {
    throw new Error('JWT_SECRET must be provided in production environment');
  }

  server.register(fastifyJwt, {
    secret: secret || 'super-secret-jwt-token',
    sign: {
      expiresIn: process.env['JWT_EXPIRES_IN'] || '1d'
    }
  });

  server.decorate(
    'authenticate', 
    async function(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        return unauthorized(reply, 'Invalid or expired token');
      }
    }
  );
};

export default fp(jwtPlugin); 