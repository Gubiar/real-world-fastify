import { eq } from 'drizzle-orm';
import { users, User, NewUser } from '../db/schema';
import { DbConnection } from '../db/connection';
import { DatabaseError } from '../utils/errors';
import { UserWithoutPassword } from '../types/database';

export class UserRepository {
  constructor(private readonly db: DbConnection) {}

  async findById(id: number): Promise<User | undefined> {
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.id, id));
      return result[0];
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID', error as Error);
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()));
      return result[0];
    } catch (error) {
      throw new DatabaseError('Failed to find user by email', error as Error);
    }
  }

  async create(data: NewUser): Promise<User> {
    try {
      const result = await this.db
        .insert(users)
        .values({
          ...data,
          email: data.email.toLowerCase(),
        })
        .returning();
      
      const user = result[0];
      if (!user) {
        throw new DatabaseError('Failed to create user: no data returned');
      }
      
      return user;
    } catch (error) {
      throw new DatabaseError('Failed to create user', error as Error);
    }
  }

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    try {
      const result = await this.db
        .update(users)
        .set({
          ...data,
          email: data.email ? data.email.toLowerCase() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      throw new DatabaseError('Failed to update user', error as Error);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      throw new DatabaseError('Failed to delete user', error as Error);
    }
  }

  sanitizeUser(user: User): UserWithoutPassword {
    const { password: _, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

