import { User } from '@prisma/client';
import { Static } from '@sinclair/typebox';
import { RegisterInput } from './auth.schema';
import * as bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { prisma } from '../../utils/prisma';

export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  async registerUser(input: Static<typeof RegisterInput>): Promise<User> {
    const { email, password, name } = input;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });
    
    return user;
  }
  
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) return null;
    
    return user;
  }
  
  generateJwt(payload: { userId: number; email: string }): string {
    return this.fastify.jwt.sign(payload);
  }
} 