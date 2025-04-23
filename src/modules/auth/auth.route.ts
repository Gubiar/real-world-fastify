import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginInput, LoginResponse, RegisterInput, RegisterResponse } from './auth.schema';
import { BaseRouter } from '../base.route';

export class AuthRouter extends BaseRouter {
  private authController: AuthController;
  
  constructor() {
    super();
    const authService = new AuthService(null as any); // Will be set in register method
    this.authController = new AuthController(authService);
  }
  
  async register(server: FastifyInstance): Promise<void> {
    // Re-initialize with proper server instance for JWT access
    const authService = new AuthService(server);
    this.authController = new AuthController(authService);
    
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
          },
          description: 'Register a new user',
          tags: ['authentication']
        }
      },
      this.authController.registerHandler.bind(this.authController)
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
      this.authController.loginHandler.bind(this.authController)
    );
  }
}

// Export a singleton instance
export const authRouter = new AuthRouter(); 