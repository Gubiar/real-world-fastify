import { FastifyInstance } from 'fastify';
import * as bcrypt from 'bcrypt';
import { User } from '../../types/prisma';

/**
 * Find a user by email
 */
export async function findByEmail(
  server: FastifyInstance,
  email: string
): Promise<User | null> {
  return await server.prisma.user.findUnique({
    where: { email }
  });
}

/**
 * Find a user by ID
 */
export async function findById(
  server: FastifyInstance,
  id: number
): Promise<User | null> {
  return await server.prisma.user.findUnique({
    where: { id }
  });
}

/**
 * Create a new user
 */
export async function create(
  server: FastifyInstance,
  data: { email: string; password: string; name: string }
): Promise<User> {
  const { email, password, name } = data;
  
  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Create user
  return await server.prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  });
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Remove sensitive fields from user object
 */
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
} 