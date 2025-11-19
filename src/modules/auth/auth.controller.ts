import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginInputType, RegisterInputType } from './auth.schema';
import { AuthService } from './auth.service';
import { UserRepository } from '../../repositories/user.repository';
import { HttpStatus } from '../../utils/httpStatusCodes';
import { success } from '../../utils/response';
import { LoginResponse } from '../../types/auth';
import { UserWithoutPassword } from '../../types/database';

export async function registerHandler(
  request: FastifyRequest<{ Body: RegisterInputType }>,
  reply: FastifyReply
): Promise<void> {
  const userRepository = new UserRepository(request.server.db);
  const authService = new AuthService(userRepository);
  
  const user = await authService.register(request.body);
  const sanitizedUser = userRepository.sanitizeUser(user);
  
  success<UserWithoutPassword>(reply, sanitizedUser, HttpStatus.CREATED);
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginInputType }>,
  reply: FastifyReply
): Promise<void> {
  const userRepository = new UserRepository(request.server.db);
  const authService = new AuthService(userRepository);
  
  const user = await authService.login(request.body);
  
  const token = authService.generateToken(request.server, {
    userId: user.id,
    email: user.email
  });
  
  const sanitizedUser = userRepository.sanitizeUser(user);
  
  const response: LoginResponse = {
    token,
    user: sanitizedUser
  };
  
  success<LoginResponse>(reply, response);
}
