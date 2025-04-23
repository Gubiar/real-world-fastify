import { User } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import * as bcrypt from 'bcrypt';

export class UserService {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }
  
  /**
   * Find a user by ID
   */
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }
  
  /**
   * Create a new user
   */
  async create(data: { email: string; password: string; name: string }): Promise<User> {
    const { email, password, name } = data;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    return prisma.user.create({
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
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Remove sensitive fields from user object
   */
  sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
} 