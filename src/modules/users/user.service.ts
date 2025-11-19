import { FastifyInstance } from 'fastify';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users, User } from '../../db/schema';

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
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  const result = await server.db.insert(users).values({
    email,
    password: hashedPassword,
    name
  }).returning();
  
  return result[0] as User;
}

export async function comparePassword(
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}
