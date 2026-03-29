import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { registerHandler, loginHandler, meHandler } from './auth.controller';
import { LoginInput, LoginResponse, MeResponse, RegisterInput, RegisterResponse } from './auth.schema';

export function registerAuthRoutes(server: FastifyInstance, prefix: string): void {
  server.register(async (instance) => {
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

    fastifyTypebox.get(
      '/me',
      {
        preHandler: instance.authenticate,
        schema: {
          response: {
            200: MeResponse
          },
          description: 'Get authenticated user payload',
          tags: ['authentication'],
          security: [{ bearerAuth: [] }]
        }
      },
      meHandler
    );
  }, { prefix });
} 