import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import rateLimit from '@fastify/rate-limit';
import { registerHandler, loginHandler } from './auth.controller';
import { LoginInput, LoginResponse, RegisterInput, RegisterResponse } from './auth.schema';
import { authRateLimitConfig } from '../../config/security';

export function registerAuthRoutes(server: FastifyInstance, prefix: string): void {
  server.register(async (instance) => {
    await instance.register(rateLimit, authRateLimitConfig);
    
    const fastifyTypebox = instance.withTypeProvider<TypeBoxTypeProvider>();

    fastifyTypebox.post(
      '/register',
      {
        schema: {
          body: RegisterInput,
          response: {
            201: RegisterResponse
          },
          description: 'Register a new user',
          tags: ['authentication']
        }
      },
      registerHandler
    );

    fastifyTypebox.post(
      '/login',
      {
        schema: {
          body: LoginInput,
          response: {
            200: LoginResponse
          },
          description: 'Login with email and password',
          tags: ['authentication']
        }
      },
      loginHandler
    );
  }, { prefix });
} 