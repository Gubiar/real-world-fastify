import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../db/schema';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import { hashPassword, verifyPassword, sanitizeEmail } from '../../utils/security';
import { RegisterData, LoginCredentials, JwtPayload } from '../../types/auth';
import { FastifyInstance } from 'fastify';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(data: RegisterData): Promise<User> {
    const email = sanitizeEmail(data.email);
    
    const existingUser = await this.userRepository.findByEmail(email);
    
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
    
    const hashedPassword = await hashPassword(data.password);
    
    return await this.userRepository.create({
      email,
      password: hashedPassword,
      name: data.name,
    });
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const email = sanitizeEmail(credentials.email);
    
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    
    const isPasswordValid = await verifyPassword(credentials.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }
    
    return user;
  }

  generateToken(server: FastifyInstance, payload: JwtPayload): string {
    return server.jwt.sign(payload);
  }

  async verifyToken(server: FastifyInstance, token: string): Promise<JwtPayload> {
    try {
      return await server.jwt.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}
