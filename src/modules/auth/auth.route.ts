import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginInput, LoginResponse, RegisterInput, RegisterResponse } from './auth.schema';

export async function authRoutes(server: FastifyInstance) {
  // Create service and controller instances
  const authService = new AuthService(server);
  const authController = new AuthController(authService);

  // Use TypeBox for schema validation
  const fastifyTypebox = server.withTypeProvider<TypeBoxTypeProvider>();

  // Register routes
  fastifyTypebox.post(
    '/register',
    {
      schema: {
        body: RegisterInput,
        response: {
          201: RegisterResponse
        }
      }
    },
    authController.registerHandler.bind(authController)
  );

  fastifyTypebox.post(
    '/login',
    {
      schema: {
        body: LoginInput,
        response: {
          200: LoginResponse
        }
      }
    },
    authController.loginHandler.bind(authController)
  );
} 