import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users, User } from '../../db/schema';
import { config } from '../../config/env';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../utils/httpStatusCodes';

export async function findByEmail(
  server: FastifyInstance,
  email: string
): Promise<User | undefined> {
  const result = await server.db.select().from(users).where(eq(users.email, email));
  return result[0];
}

export async function findById(
  server: FastifyInstance,
  id: number
): Promise<User | undefined> {
  const result = await server.db.select().from(users).where(eq(users.id, id));
  return result[0];
}

export async function create(
  server: FastifyInstance,
  data: { email: string; password: string; name: string }
): Promise<User> {
  const { email, password, name } = data;

  const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

  const [createdUser] = await server.db.insert(users).values({
    email,
    password: hashedPassword,
    name
  }).returning();

  if (!createdUser) {
    throw new AppError('Could not create user', HttpStatus.INTERNAL_ERROR);
  }

  return createdUser;
}

export async function comparePassword(
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password: _password, ...sanitizedUser } = user;
  return sanitizedUser;
}
