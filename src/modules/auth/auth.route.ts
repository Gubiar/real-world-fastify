import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { registerHandler, loginHandler } from './auth.controller';
import { LoginInput, LoginResponse, RegisterInput, RegisterResponse } from './auth.schema';

/**
 * Register auth routes
 * 
 * @param server - Fastify server instance
 * @param prefix - Route prefix
 */
export function registerAuthRoutes(server: FastifyInstance, prefix: string): void {
  server.register(async (instance) => {
    // Use TypeBox for schema validation
    const fastifyTypebox = instance.withTypeProvider<TypeBoxTypeProvider>();

    // Register routes
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