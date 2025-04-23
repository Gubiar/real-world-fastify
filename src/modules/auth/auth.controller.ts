import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginInputType, RegisterInputType } from './auth.schema';
import { AuthService } from './auth.service';
import { HttpStatus } from '../../utils/httpStatusCodes';
import { error, success } from '../../utils/response';
import { UserService } from '../users/user.service';

// Define error interface
interface AppError extends Error {
  code?: string;
  statusCode?: number;
}

export class AuthController {
  private userService: UserService;
  
  constructor(private authService: AuthService) {
    this.userService = new UserService();
  }

  async registerHandler(
    request: FastifyRequest<{ Body: RegisterInputType }>,
    reply: FastifyReply
  ) {
    try {
      const user = await this.authService.registerUser(request.body);
      
      // Sanitize user data (remove password)
      const sanitizedUser = this.userService.sanitizeUser(user);
      
      return success(reply, sanitizedUser, HttpStatus.CREATED);
    } catch (err: unknown) {
      const error_msg = err instanceof Error ? err.message : 'Error registering user';
      const appError = err as AppError;
      
      return error(
        reply, 
        error_msg, 
        appError.statusCode || HttpStatus.BAD_REQUEST
      );
    }
  }

  async loginHandler(
    request: FastifyRequest<{ Body: LoginInputType }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password } = request.body;
      
      const user = await this.authService.validateUser(email, password);
      
      if (!user) {
        return error(
          reply,
          'Invalid email or password',
          HttpStatus.UNAUTHORIZED
        );
      }
      
      const token = this.authService.generateJwt({
        userId: user.id,
        email: user.email
      });
      
      // Sanitize user data (remove password)
      const sanitizedUser = this.userService.sanitizeUser(user);
      
      return success(reply, { 
        token,
        user: sanitizedUser
      });
    } catch (err: unknown) {
      const error_msg = err instanceof Error ? err.message : 'Error during login';
      
      return error(
        reply,
        error_msg,
        HttpStatus.INTERNAL_ERROR
      );
    }
  }
} 