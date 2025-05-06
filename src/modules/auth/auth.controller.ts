import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginInputType, RegisterInputType } from './auth.schema';
import { validateUser, generateJwt, registerUser } from './auth.service';
import { HttpStatus } from '../../utils/httpStatusCodes';
import { error, success } from '../../utils/response';
import { sanitizeUser } from '../users/user.service';

// Define error interface
interface AppError extends Error {
  code?: string;
  statusCode?: number;
}

/**
 * Handle user registration
 */
export async function registerHandler(
  request: FastifyRequest<{ Body: RegisterInputType }>,
  reply: FastifyReply
) {
  try {
    const user = await registerUser(request.server, request.body);
    
    // Sanitize user data (remove password)
    const sanitizedUser = sanitizeUser(user);
    
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

/**
 * Handle user login
 */
export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInputType }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;
    
    const user = await validateUser(request.server, email, password);
    
    if (!user) {
      return error(
        reply,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED
      );
    }
    
    const token = generateJwt(request.server, {
      userId: user.id,
      email: user.email
    });
    
    // Sanitize user data (remove password)
    const sanitizedUser = sanitizeUser(user);
    
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