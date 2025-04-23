import { User } from '@prisma/client';
import { Static } from '@sinclair/typebox';
import { RegisterInput } from './auth.schema';
import { FastifyInstance } from 'fastify';
import { UserService } from '../users/user.service';

export class AuthService {
  private userService: UserService;
  
  constructor(private fastify: FastifyInstance) {
    this.userService = new UserService();
  }

  async registerUser(input: Static<typeof RegisterInput>): Promise<User> {
    const { email } = input;
    
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create user using user service
    return this.userService.create(input);
  }
  
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) return null;
    
    const isPasswordValid = await this.userService.comparePassword(password, user.password);
    
    if (!isPasswordValid) return null;
    
    return user;
  }
  
  generateJwt(payload: { userId: number; email: string }): string {
    return this.fastify.jwt.sign(payload);
  }
} 