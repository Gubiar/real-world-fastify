import { Static } from '@sinclair/typebox';
import { RegisterInput } from './auth.schema';
import { FastifyInstance } from 'fastify';
import { findByEmail, create, comparePassword } from '../users/user.service';
import { User } from '../../types/prisma';

/**
 * Register a new user
 */
export async function registerUser(
  server: FastifyInstance, 
  input: Static<typeof RegisterInput>
): Promise<User> {
  const { email } = input;
  
  // Check if user already exists
  const existingUser = await findByEmail(server, email);
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Create user using user service
  return await create(server, input);
}

/**
 * Validate user credentials
 */
export async function validateUser(
  server: FastifyInstance,
  email: string, 
  password: string
): Promise<User | null> {
  const user = await findByEmail(server, email);
  
  if (!user) return null;
  
  const isPasswordValid = await comparePassword(password, user.password);
  
  if (!isPasswordValid) return null;
  
  return user;
}

/**
 * Generate JWT token
 */
export function generateJwt(
  server: FastifyInstance,
  payload: { userId: number; email: string }
): string {
  return server.jwt.sign(payload);
} 