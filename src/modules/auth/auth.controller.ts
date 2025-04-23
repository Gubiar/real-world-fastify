import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginInputType, RegisterInputType } from './auth.schema';
import { AuthService } from './auth.service';
import { HttpStatus } from '../../utils/httpStatusCodes';
import { error, success } from '../../utils/response';

export class AuthController {
  constructor(private authService: AuthService) {}

  async registerHandler(
    request: FastifyRequest<{ Body: RegisterInputType }>,
    reply: FastifyReply
  ) {
    try {
      const user = await this.authService.registerUser(request.body);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return success(reply, userWithoutPassword, HttpStatus.CREATED);
    } catch (err: any) {
      return error(
        reply, 
        err.message || 'Error registering user', 
        HttpStatus.BAD_REQUEST
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
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return success(reply, { 
        token,
        user: userWithoutPassword
      });
    } catch (err: any) {
      return error(
        reply,
        err.message || 'Error during login',
        HttpStatus.INTERNAL_ERROR
      );
    }
  }
} 